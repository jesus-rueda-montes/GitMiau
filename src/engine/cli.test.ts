import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'vitest'
import { loadRawContent } from '../content/rawContent'
import { CliSpecSchema, type CliSpec, type CommandExercise } from '../content/schema'
import { applyCompletion, commonPrefix, complete, parseCommand, sameCommand, tokenize } from './cli'
import { gradeCommand } from './grade'

// Specs heredadas de Kubernetete (kubectl, terraform, ansible) como fixtures: prueban
// funciones del motor que git aún no usa (valueSets, TIPO/NOMBRE, single-dash, CLI sin
// subcomandos). Se validan con el esquema real cambiando el nombre de la CLI.
function fixture(name: string): CliSpec {
  const json = JSON.parse(readFileSync(`src/engine/__fixtures__/${name}.json`, 'utf8')) as { cli: string }
  return { ...CliSpecSchema.parse({ ...json, cli: 'git' }), cli: json.cli } as unknown as CliSpec
}

const kubectl = fixture('kubectl')

const parse = (line: string) => {
  const r = parseCommand(kubectl, line)
  if (!r.ok) throw new Error(r.errors.join('; '))
  return r.command
}
const errorsOf = (line: string) => {
  const r = parseCommand(kubectl, line)
  return r.ok ? [] : r.errors
}
const same = (a: string, b: string) => sameCommand(parse(a), parse(b))

describe('tokenize', () => {
  test('respeta comillas y posiciones', () => {
    expect(tokenize('kubectl  run x --labels="app=web, tier=fe"').map((t) => t.value)).toEqual([
      'kubectl',
      'run',
      'x',
      '--labels=app=web, tier=fe',
    ])
    expect(tokenize('a  bc').map((t) => [t.start, t.end])).toEqual([
      [0, 1],
      [3, 5],
    ])
  })
})

describe('parseCommand', () => {
  test('normaliza alias de recursos y formas de flags', () => {
    expect(parse('kubectl get po -n dev -o wide')).toEqual({
      path: ['kubectl', 'get'],
      positionals: ['pods'],
      flags: { namespace: 'dev', output: 'wide' },
      trailing: [],
    })
  })

  test('equivalencias: orden de flags, corto/largo, =, flags agrupados', () => {
    expect(same('kubectl get pods -n dev -o yaml', 'kubectl get pod --output=yaml --namespace dev')).toBe(true)
    expect(same('kubectl -n dev get pods', 'kubectl get pods -n dev')).toBe(true)
    expect(same('kubectl get pods -ojson', 'kubectl get pods -o json')).toBe(true)
    expect(same('kubectl run t --image=busybox -it', 'kubectl run t -i -t --image busybox')).toBe(true)
    expect(same('kubectl scale deploy web --replicas=5', 'kubectl scale deployment web --replicas 5')).toBe(true)
  })

  test('diferencias reales no son equivalentes', () => {
    expect(same('kubectl get pods', 'kubectl get services')).toBe(false)
    expect(same('kubectl get pods -n dev', 'kubectl get pods -n prod')).toBe(false)
    expect(same('kubectl get pods web', 'kubectl get pods')).toBe(false)
  })

  test('lo que va tras -- se conserva aparte', () => {
    const c = parse('kubectl exec web -it -- sh -c "ls -l"')
    expect(c.positionals).toEqual(['web'])
    expect(c.flags).toEqual({ stdin: 'true', tty: 'true' })
    expect(c.trailing).toEqual(['sh', '-c', 'ls -l'])
  })

  test('errores útiles', () => {
    expect(errorsOf('kubectl gte pods')[0]).toBe('comando desconocido para kubectl: "gte"')
    expect(errorsOf('kubectl run web --imagen=nginx')).toEqual(['flag desconocido: --imagen'])
    expect(errorsOf('kubectl get pdos')).toEqual(['tipo desconocido: "pdos"'])
    expect(errorsOf('kubectl run web --restart=Sometimes')[0]).toMatch(/valor no válido para --restart/)
    expect(errorsOf('kubectl get pods -o')).toEqual(['el flag --output necesita un valor'])
    expect(errorsOf('kubectl')).toEqual([expect.stringMatching(/falta el subcomando/)])
    expect(errorsOf('kubeclt get pods')[0]).toMatch(/debe empezar por "kubectl"/)
  })

  test('el mismo flag corto significa cosas distintas según el subcomando', () => {
    // -f en logs es --follow (booleano); en get es --filename (con valor)
    expect(parse('kubectl logs web -f').flags).toEqual({ follow: 'true' })
    expect(parse('kubectl get -f pod.yaml').flags).toEqual({ filename: 'pod.yaml' })
  })
})

describe('complete', () => {
  const values = (line: string) => complete(kubectl, line).candidates.map((c) => c.value)

  test('nombre de la CLI y subcomandos', () => {
    expect(values('kub')).toEqual(['kubectl'])
    expect(values('kubectl sc')).toEqual(['scale'])
    expect(values('kubectl s')).toEqual(['scale', 'set'])
    expect(values('kubectl ')).toContain('describe')
  })

  test('recursos por nombre o alias', () => {
    expect(values('kubectl get po')).toEqual(['pods', 'poddisruptionbudgets']) // como en kubectl: varios empiezan por "po"
    expect(values('kubectl get conf')).toEqual(['configmaps'])
    expect(values('kubectl get deploy')).toEqual(['deployments'])
    expect(values('kubectl scale ')).toEqual(['deployments', 'replicasets', 'statefulsets'])
    expect(values('kubectl get pods ')).toEqual([]) // el nombre es libre
  })

  test('flags del subcomando + globales, sin repetir los ya usados', () => {
    expect(values('kubectl run web --im')).toEqual(['--image'])
    expect(values('kubectl get pods --n')).toEqual(['--namespace'])
    expect(values('kubectl get pods -n dev --n')).toEqual([])
    const shorts = values('kubectl get pods -')
    expect(shorts).toContain('-A')
    expect(shorts).toContain('--all-namespaces')
  })

  test('valores de flags', () => {
    expect(values('kubectl get pods -o ')).toEqual(['json', 'yaml', 'wide', 'name', 'jsonpath', 'custom-columns'])
    expect(values('kubectl get pods -o y')).toEqual(['yaml'])
    expect(values('kubectl run x --restart=N')).toEqual(['--restart=Never'])
  })

  test('applyCompletion: único candidato, prefijo común o nada', () => {
    const tab = (line: string) => applyCompletion(line, complete(kubectl, line))
    expect(tab('kubectl ge')).toEqual({ line: 'kubectl get ', changed: true })
    expect(tab('kubectl get pods --all')).toEqual({ line: 'kubectl get pods --all-namespaces ', changed: true })
    expect(tab('kubectl de')).toEqual({ line: 'kubectl de', changed: false }) // delete / describe: sin prefijo común más largo
    expect(tab('kubectl rollout re')).toEqual({ line: 'kubectl rollout res', changed: true }) // restart / resume
    expect(commonPrefix(['delete', 'describe'])).toBe('de')
  })
})

describe('gradeCommand', () => {
  const ex: CommandExercise = {
    id: 'x',
    type: 'command',
    cli: 'git',
    prompt: 'p',
    hints: ['h'],
    solution: { explanation: 'e' },
    accepted: ['kubectl scale deployment web --replicas=5'],
    patterns: [],
  }

  test('acepta variantes equivalentes', () => {
    expect(gradeCommand(ex, 'kubectl scale deploy web --replicas 5', kubectl).correct).toBe(true)
    expect(gradeCommand(ex, '  kubectl   scale deployments web --replicas=5 ', kubectl).correct).toBe(true)
  })

  test('explica por qué falla', () => {
    expect(gradeCommand(ex, 'kubectl scale deploy web --replicas=3', kubectl)).toEqual({
      correct: false,
      feedback: 'El comando es válido, pero no hace lo que pide el enunciado.',
    })
    expect(gradeCommand(ex, 'kubectl scale deploy web --replica=5', kubectl).feedback).toBe('flag desconocido: --replica')
  })

  test('patrones regex como respaldo', () => {
    const withPattern = { ...ex, patterns: ['kubectl scale deploy(ment)?/web --replicas=5'] }
    expect(gradeCommand(withPattern, 'kubectl scale deploy/web --replicas=5', kubectl).correct).toBe(true)
  })
})

describe('estilo single-dash (terraform)', () => {
  const terraform = fixture('terraform')
  const tf = (line: string) => parseCommand(terraform, line)

  test('-flag, -flag=valor, -flag valor y --flag son equivalentes', () => {
    const a = tf('terraform apply -auto-approve -var-file=prod.tfvars')
    const b = tf('terraform apply --var-file prod.tfvars -auto-approve')
    expect(a.ok && b.ok && sameCommand(a.command, b.command)).toBe(true)
    expect(a.ok && a.command.flags).toEqual({ 'auto-approve': 'true', 'var-file': 'prod.tfvars' })
  })

  test('los booleanos con =false y los errores usan un guion', () => {
    expect(tf('terraform plan -input=false -out=tfplan').ok).toBe(true)
    expect(tf('terraform plan -autoapprove')).toEqual({ ok: false, errors: ['flag desconocido: -autoapprove'] })
    expect(tf('terraform plan -out')).toEqual({ ok: false, errors: ['el flag -out necesita un valor'] })
  })

  test('autocompleta con un guion', () => {
    expect(applyCompletion('terraform apply -auto', complete(terraform, 'terraform apply -auto')).line).toBe(
      'terraform apply -auto-approve ',
    )
    expect(complete(terraform, 'terraform init -backend=').candidates.map((c) => c.value)).toEqual([
      '-backend=true',
      '-backend=false',
    ])
    expect(complete(terraform, 'terraform state ').candidates.map((c) => c.value)).toContain('list')
  })
})

describe('CLI sin subcomandos (ansible)', () => {
  const ansible = fixture('ansible')

  test('el primer posicional es el patrón y los flags se normalizan', () => {
    const a = parseCommand(ansible, 'ansible web -m ping -i inventario.ini')
    const b = parseCommand(ansible, 'ansible --inventory=inventario.ini web --module-name ping')
    expect(a.ok && b.ok && sameCommand(a.command, b.command)).toBe(true)
    expect(a.ok && a.command.positionals).toEqual(['web'])
  })

  test('autocompleta flags y valores de módulo', () => {
    expect(complete(ansible, 'ansible all -m pi').candidates.map((c) => c.value)).toEqual(['ping'])
  })
})

describe('forma TIPO/NOMBRE de kubectl', () => {
  test('deploy/web equivale a deployment web', () => {
    expect(same('kubectl rollout undo deploy/web', 'kubectl rollout undo deployment web')).toBe(true)
    expect(same('kubectl scale deployment/web --replicas=2', 'kubectl scale deploy web --replicas=2')).toBe(true)
    expect(errorsOf('kubectl rollout undo cosa/web')).toEqual(['tipo desconocido: "cosa/web"'])
  })
})

describe('gh (contenido real)', () => {
  const gh = CliSpecSchema.parse(loadRawContent().cliSpecs['/content/cli-specs/gh.json'])
  const p = (line: string) => parseCommand(gh, line)
  const sameGh = (a: string, b: string) => {
    const x = p(a)
    const y = p(b)
    return x.ok && y.ok && sameCommand(x.command, y.command)
  }

  test('subcomandos de repo y auth, con valores estrictos', () => {
    expect(sameGh('gh repo create miau --public --clone', 'gh repo create miau -c --public')).toBe(true)
    expect(sameGh('gh auth login -p ssh --web', 'gh auth login --git-protocol=ssh -w')).toBe(true)
    expect(p('gh auth login -p ftp')).toEqual({ ok: false, errors: [expect.stringMatching(/valor no válido para --git-protocol/)] })
    expect(sameGh('gh repo fork cli/cli --clone=false', 'gh repo fork cli/cli')).toBe(true)
  })

  test('issues: valores estrictos con espacios, alias y develop', () => {
    expect(sameGh('gh issue close 12 --reason "not planned"', "gh issue close 12 -r 'not planned'")).toBe(true)
    expect(p('gh issue close 12 --reason wontfix')).toEqual({ ok: false, errors: [expect.stringMatching(/valor no válido para --reason/)] })
    expect(sameGh('gh issue new -t "Falla el login"', 'gh issue create --title "Falla el login"')).toBe(true)
    expect(sameGh('gh issue develop 42 -c', 'gh issue develop 42 --checkout')).toBe(true)
  })

  test('secrets: alias, --env y --app estricto', () => {
    expect(sameGh('gh secret set DEPLOY_KEY -e production', 'gh secret set DEPLOY_KEY --env production')).toBe(true)
    expect(sameGh('gh secret ls', 'gh secret list')).toBe(true)
    expect(sameGh('gh secret remove NPM_TOKEN', 'gh secret delete NPM_TOKEN')).toBe(true)
    expect(p('gh secret set NPM_TOKEN --app npm')).toEqual({ ok: false, errors: [expect.stringMatching(/valor no válido para --app/)] })
  })

  test('releases: alias, ficheros como argumentos y valores estrictos', () => {
    expect(sameGh('gh release new v2.0.0-rc.1 -p -F notas.md', 'gh release create v2.0.0-rc.1 --prerelease --notes-file notas.md')).toBe(true)
    expect(sameGh('gh release download v1.5.0 -p "*.zip"', "gh release download v1.5.0 --pattern '*.zip'")).toBe(true)
    expect(p('gh release create v1.2.0 ./dist/app.tgz --generate-notes').ok).toBe(true)
    expect(p('gh release download -A rar')).toEqual({ ok: false, errors: [expect.stringMatching(/valor no válido para --archive/)] })
  })

  test('api: endpoint como argumento, sin subcomandos', () => {
    expect(sameGh("gh api repos/{owner}/{repo}/issues --paginate -q '.[].title'", 'gh api repos/{owner}/{repo}/issues --paginate --jq ".[].title"')).toBe(true)
    expect(sameGh("gh api -X GET search/issues -f q='is:open'", "gh api search/issues --method GET --raw-field q='is:open'")).toBe(true)
    expect(p('gh api graphql -f query="query { viewer { login } }"').ok).toBe(true)
  })
})

describe('git (contenido real)', () => {
  const git = CliSpecSchema.parse(loadRawContent().cliSpecs['/content/cli-specs/git.json'])
  const g = (line: string) => parseCommand(git, line)
  const sameGit = (a: string, b: string) => {
    const x = g(a)
    const y = g(b)
    return x.ok && y.ok && sameCommand(x.command, y.command)
  }

  test('equivalencias de flags y comillas en el mensaje', () => {
    expect(sameGit('git commit -m "Añade el README"', "git commit --message='Añade el README'")).toBe(true)
    expect(sameGit('git commit -am "fix"', 'git commit -a -m fix')).toBe(true)
    expect(sameGit('git init -b main', 'git init --initial-branch=main')).toBe(true)
    expect(sameGit('git log -n 5 --oneline', 'git log --oneline --max-count=5')).toBe(true)
  })

  test('mayúsculas distintas son flags distintos', () => {
    expect(sameGit('git add -A', 'git add --all')).toBe(true)
    expect(g('git add -a')).toEqual({ ok: false, errors: ['flag desconocido: -a'] })
  })

  test('subcomandos de git config', () => {
    const r = g('git config set --global user.email ada@example.com')
    expect(r.ok && r.command).toEqual({
      path: ['git', 'config', 'set'],
      positionals: ['user.email', 'ada@example.com'],
      flags: { global: 'true' },
      trailing: [],
    })
    expect(complete(git, 'git config se').candidates.map((c) => c.value)).toEqual(['set'])
  })

  test('restore, reset y rm: cortos en mayúscula, revisiones y flags solo cortos', () => {
    expect(sameGit('git restore -S notas.txt', 'git restore --staged notas.txt')).toBe(true)
    expect(sameGit('git restore -s HEAD~1 app.py', 'git restore --source=HEAD~1 app.py')).toBe(true)
    const reset = g('git reset --hard HEAD~1')
    expect(reset.ok && reset.command).toMatchObject({ positionals: ['HEAD~1'], flags: { hard: 'true' } })
    expect(sameGit('git rm -r --cached logs', 'git rm --cached -r logs')).toBe(true)
  })

  test('flags solo cortos (shortOnly): -D vale, --force-delete no existe', () => {
    const r = g('git branch -D experimento')
    expect(r.ok && r.command).toMatchObject({ positionals: ['experimento'], flags: { 'force-delete': 'true' } })
    expect(g('git branch --force-delete experimento')).toEqual({ ok: false, errors: ['flag desconocido: --force-delete'] })
    const shorts = complete(git, 'git branch -').candidates.map((c) => c.value)
    expect(shorts).toContain('-D')
    expect(shorts).not.toContain('--force-delete')
    expect(complete(git, 'git branch --fo').candidates.map((c) => c.value)).toEqual(['--force'])
  })

  test('ramas: switch -c y switch - (volver a la anterior)', () => {
    expect(sameGit('git switch -c feature/login', 'git switch --create=feature/login')).toBe(true)
    const back = g('git switch -')
    expect(back.ok && back.command.positionals).toEqual(['-'])
    expect(sameGit('git merge --no-ff feature/login', 'git merge feature/login --no-ff')).toBe(true)
  })

  test('remotos: remote -v sin subcomando, alias rm y push -u', () => {
    const v = g('git remote -v')
    expect(v.ok && v.command).toMatchObject({ path: ['git', 'remote'], flags: { verbose: 'true' } })
    expect(sameGit('git remote rm origin', 'git remote remove origin')).toBe(true)
    expect(sameGit('git push -u origin main', 'git push --set-upstream origin main')).toBe(true)
    expect(sameGit('git fetch -p', 'git fetch --prune')).toBe(true)
  })

  test('nivel 3: stash con y sin subcomando, reflog, bisect y cherry-pick -x', () => {
    const bare = g('git stash -u')
    expect(bare.ok && bare.command).toMatchObject({ path: ['git', 'stash'], flags: { 'include-untracked': 'true' } })
    expect(sameGit('git stash push -m "wip login"', "git stash push --message='wip login'")).toBe(true)
    const pop = g('git stash pop stash@{1}')
    expect(pop.ok && pop.command).toMatchObject({ path: ['git', 'stash', 'pop'], positionals: ['stash@{1}'] })
    const reflog = g('git reflog show')
    expect(reflog.ok && reflog.command.path).toEqual(['git', 'reflog', 'show'])
    expect(sameGit('git bisect old v1.2', 'git bisect good v1.2')).toBe(true)
    expect(sameGit('git cherry-pick -x 3f2a9c1', 'git cherry-pick 3f2a9c1 -x')).toBe(true)
    expect(sameGit('git rebase -i HEAD~3', 'git rebase --interactive HEAD~3')).toBe(true)
  })
})
