import { describe, expect, test } from 'vitest'
import { loadRawContent } from '../content/rawContent'
import { CliSpecSchema, type SimAssertion } from '../content/schema'
import { ancestors, checkSim, gradeSim, headCommit, history, initialState, resolveRev, run, runAll, type SimState } from './gitsim'

const git = CliSpecSchema.parse(loadRawContent().cliSpecs['/content/cli-specs/git.json'])

/** Ejecuta los comandos y falla si alguno da error. */
function sim(lines: string[], from?: SimState): SimState {
  const { state, outputs } = runAll(git, lines, from)
  outputs.forEach((o, i) => {
    if (!o.ok) throw new Error(`«${lines[i]}»: ${o.lines.map((l) => l.text).join(' ')}`)
  })
  return state
}
const errorOf = (state: SimState, line: string) => {
  const r = run(git, state, line)
  expect(r.ok).toBe(false)
  expect(r.state).toBe(state)
  return r.lines.map((l) => l.text).join('\n')
}
const msgs = (s: SimState, rev = 'HEAD') => history(s, resolveRev(s, s.local, rev)).map((c) => c.message)
const ok = (s: SimState, a: Omit<SimAssertion, 'message'>) => checkSim(s, { ...a, message: '' } as SimAssertion)

describe('commits y ramas', () => {
  test('commit, branch, switch y log', () => {
    const s = sim(['git commit -m "A"', 'git commit -m B', 'git switch -c feature', 'git commit -m C'])
    expect(msgs(s)).toEqual(['C', 'B', 'A'])
    expect(msgs(s, 'main')).toEqual(['B', 'A'])
    expect(s.local.head).toEqual({ branch: 'feature' })
    const log = run(git, s, 'git log --oneline --all').lines.map((l) => l.text)
    expect(log[0]).toMatch(/^[0-9a-f]{7} \(HEAD -> feature\) C$/)
    expect(log[1]).toMatch(/\(main\) B$/)
  })

  test('los ids son deterministas', () => {
    const lines = ['git commit -m A', 'git commit -m B']
    expect(Object.keys(sim(lines).commits)).toEqual(Object.keys(sim(lines).commits))
  })

  test('commit sin -m y errores de sintaxis no cambian el estado', () => {
    expect(errorOf(initialState(), 'git commit')).toMatch(/-m/)
    expect(errorOf(initialState(), 'git commit --nope')).toMatch(/flag desconocido/)
  })

  test('amend sustituye el último commit', () => {
    const s = sim(['git commit -m A', 'git commit -m Bb', 'git commit --amend -m B'])
    expect(msgs(s)).toEqual(['B', 'A'])
  })

  test('branch -d se niega con trabajo sin fusionar; -D no', () => {
    const s = sim(['git commit -m A', 'git switch -c x', 'git commit -m X', 'git switch main'])
    expect(errorOf(s, 'git branch -d x')).toMatch(/-D/)
    expect(sim(['git branch -D x'], s).local.branches.x).toBeUndefined()
    expect(errorOf(sim(['git switch x'], s), 'git branch -d x')).toMatch(/estás/)
  })

  test('branch -m renombra la rama actual', () => {
    const s = sim(['git commit -m A', 'git branch -m trunk'])
    expect(s.local.head).toEqual({ branch: 'trunk' })
    expect(s.local.branches.main).toBeUndefined()
  })

  test('detached HEAD: los commits se pierden al irse, salvo con reflog', () => {
    const s = sim(['git commit -m A', 'git commit -m B', 'git switch --detach HEAD~1', 'git commit -m D', 'git switch main'])
    expect(s.local.head).toEqual({ branch: 'main' })
    const lost = s.local.reflog.find((e) => s.commits[e.id].message === 'D')!.id
    expect(Object.values(s.local.branches)).not.toContain(lost)
    const r = sim([`git branch rescate ${lost}`], s)
    expect(msgs(r, 'rescate')).toEqual(['D', 'A'])
    expect(errorOf(s, 'git switch HEAD~1')).toMatch(/--detach/)
  })

  test('HEAD@{n} lee el reflog', () => {
    const s = sim(['git commit -m A', 'git commit -m B', 'git reset --hard HEAD~1'])
    expect(s.commits[resolveRev(s, s.local, 'HEAD@{0}')!].message).toBe('A')
    expect(s.commits[resolveRev(s, s.local, 'HEAD@{1}')!].message).toBe('B')
    expect(msgs(sim(['git branch rescate HEAD@{1}'], s), 'rescate')).toEqual(['B', 'A'])
  })
})

describe('merge, rebase y deshacer', () => {
  const base = ['git commit -m A', 'git switch -c feature', 'git commit -m F1', 'git commit -m F2', 'git switch main']

  test('fast-forward y --no-ff', () => {
    const ff = sim([...base, 'git merge feature'])
    expect(ff.local.branches.main).toBe(ff.local.branches.feature)
    const noff = sim([...base, 'git merge --no-ff feature'])
    expect(ok(noff, { ref: 'main', op: 'isMerge' })).toBe(true)
    expect(noff.commits[noff.local.branches.main].message).toBe("Merge branch 'feature'")
  })

  test('ramas divergidas: merge con dos padres, --ff-only falla', () => {
    const s = sim([...base, 'git commit -m M'])
    expect(errorOf(s, 'git merge --ff-only feature')).toMatch(/fast-forward/)
    const m = sim(['git merge feature'], s)
    expect(m.commits[m.local.branches.main].parents).toHaveLength(2)
    expect(ok(m, { ref: 'main', op: 'linear' })).toBe(false)
  })

  test('rebase reaplica los commits con hash nuevo y deja historia lineal', () => {
    const s = sim([...base, 'git commit -m M'])
    const oldF2 = s.local.branches.feature
    const r = sim(['git switch feature', 'git rebase main'], s)
    expect(msgs(r)).toEqual(['F2', 'F1', 'M', 'A'])
    expect(r.local.branches.feature).not.toBe(oldF2)
    expect(ok(r, { ref: 'feature', op: 'linear' })).toBe(true)
    expect(run(git, r, 'git rebase main').lines[0].text).toMatch(/encima|al día/)
    // Y ahora main puede avanzar en fast-forward.
    const ff = sim(['git switch main', 'git merge feature'], r)
    expect(ff.local.branches.main).toBe(ff.local.branches.feature)
  })

  test('reset mueve la rama; revert crea un commit nuevo', () => {
    const s = sim(['git commit -m A', 'git commit -m B', 'git commit -m C'])
    expect(msgs(sim(['git reset --hard HEAD~2'], s))).toEqual(['A'])
    expect(msgs(sim(['git revert HEAD'], s))).toEqual(['Revert "C"', 'C', 'B', 'A'])
  })

  test('revert de un merge exige -m', () => {
    const s = sim([...base, 'git commit -m M', 'git merge feature'])
    expect(errorOf(s, 'git revert HEAD')).toMatch(/-m/)
    expect(msgs(sim(['git revert -m 1 HEAD'], s))[0]).toMatch(/^Revert/)
  })

  test('cherry-pick copia un commit', () => {
    const s = sim([...base, 'git cherry-pick feature~1'])
    expect(msgs(s)).toEqual(['F1', 'A'])
  })

  test('tags y revisiones', () => {
    const s = sim(['git commit -m A', 'git commit -m B', 'git tag -a v1.0.0 -m "Versión 1" HEAD~1'])
    expect(resolveRev(s, s.local, 'v1.0.0')).toBe(resolveRev(s, s.local, 'main^'))
    expect(errorOf(s, 'git tag v1.0.0')).toMatch(/ya existe/)
    const id = headCommit(s.local)!
    expect(resolveRev(s, s.local, id.slice(0, 5))).toBe(id)
  })
})

describe('remoto origin', () => {
  // Escenario clonado: origin tiene main con A; el repo local lo trae y sigue a origin/main.
  const cloned = ['origin: git commit -m A', 'git fetch', 'git switch main']

  test('switch crea la rama local a partir de origin/<rama> con upstream', () => {
    const s = sim(cloned)
    expect(s.local.upstream.main).toBe('main')
    expect(ok(s, { ref: 'main', op: 'sameAs', value: 'origin/main' })).toBe(true)
  })

  test('push publica y actualiza origin/main', () => {
    const s = sim([...cloned, 'git commit -m B', 'git push'])
    expect(ok(s, { ref: 'origin:main', op: 'tipMessage', value: 'B' })).toBe(true)
    expect(ok(s, { ref: 'origin/main', op: 'sameAs', value: 'main' })).toBe(true)
  })

  test('push rechazado (fetch first); pull --rebase y push', () => {
    const s = sim([...cloned, 'origin: git commit -m "De Ana"', 'git commit -m Mio'])
    expect(errorOf(s, 'git push')).toMatch(/\[rejected\].*fetch first/)
    expect(errorOf(s, 'git pull')).toMatch(/--rebase/)
    const r = sim(['git pull --rebase', 'git push'], s)
    expect(msgs(r)).toEqual(['Mio', 'De Ana', 'A'])
    expect(ok(r, { ref: 'origin:main', op: 'linear' })).toBe(true)
  })

  test('pull --no-rebase crea un merge', () => {
    const s = sim([...cloned, 'origin: git commit -m "De Ana"', 'git commit -m Mio', 'git pull --no-rebase'])
    expect(ok(s, { ref: 'main', op: 'isMerge' })).toBe(true)
  })

  test('tras un rebase de una rama publicada: non-fast-forward y --force-with-lease', () => {
    const s = sim([
      ...cloned,
      'git switch -c feature',
      'git commit -m F',
      'git push -u origin feature',
      'git switch main',
      'git commit -m M',
      'git switch feature',
      'git rebase main',
    ])
    expect(errorOf(s, 'git push')).toMatch(/non-fast-forward/)
    const f = sim(['git push --force-with-lease'], s)
    expect(ok(f, { ref: 'origin:feature', op: 'sameAs', value: 'feature' })).toBe(true)
    // Si alguien sube algo a origin/feature que no hemos visto, --force-with-lease se niega.
    const stale = sim(['origin: git switch feature', 'origin: git commit -m Otro'], s)
    expect(errorOf(stale, 'git push --force-with-lease')).toMatch(/stale/)
  })

  test('push sin upstream sugiere -u', () => {
    const s = sim([...cloned, 'git switch -c nueva', 'git commit -m N'])
    expect(errorOf(s, 'git push')).toMatch(/-u origin nueva/)
    expect(sim(['git push -u origin nueva'], s).local.upstream.nueva).toBe('nueva')
  })

  test('sin remoto, push y fetch fallan', () => {
    const s = sim(['git commit -m A'])
    expect(errorOf(s, 'git push')).toMatch(/remoto/)
  })
})

describe('comandos no modelados y comprobaciones', () => {
  test('add muestra una nota y no cambia nada', () => {
    const s = sim(['git commit -m A'])
    const r = run(git, s, 'git add .')
    expect(r.ok).toBe(true)
    expect(r.lines[0].text).toMatch(/no modela ficheros/)
  })

  test('gradeSim evalúa las comprobaciones sobre el estado final', () => {
    const setup = ['git commit -m A']
    const asserts: SimAssertion[] = [
      { ref: 'HEAD', op: 'head', value: 'main', message: 'en main' },
      { ref: 'feature', op: 'exists', message: 'existe feature' },
      { ref: 'main', op: 'contains', value: 'F', message: 'main contiene F' },
      { ref: 'main', op: 'commits', value: 3, message: 'main tiene 3 commits' },
    ]
    const bad = gradeSim(git, setup, ['git switch -c feature', 'git commit -m F'], asserts)
    expect(bad.correct).toBe(false)
    expect(bad.checks.map((c) => c.ok)).toEqual([false, true, false, false])
    const good = gradeSim(git, setup, ['git switch -c feature', 'git commit -m F', 'git switch main', 'git merge --no-ff feature'], asserts)
    expect(good.correct).toBe(true)
  })

  test('ancestors incluye el propio commit', () => {
    const s = sim(['git commit -m A', 'git commit -m B'])
    expect(ancestors(s, headCommit(s.local)).size).toBe(2)
  })
})
