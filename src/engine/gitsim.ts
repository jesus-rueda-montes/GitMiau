import type { CliSpec, SimAssertion } from '../content/schema'
import { parseCommand, type ParsedCommand } from './cli'

// Simulador de repositorio Git (decisiones M22–M24): solo el grafo de commits.
// Sin ficheros, staging area ni conflictos. Todo puro: cada comando devuelve un
// estado nuevo y las líneas de salida. Los mensajes están en español y explican
// lo que haría Git; no imitan su salida literal.

export interface Commit {
  id: string
  message: string
  parents: string[]
  /** Orden de creación: sirve para ordenar el log y el grafo. */
  seq: number
}

export type Head = { branch: string } | { detached: string }

export interface Repo {
  branches: Record<string, string>
  tags: Record<string, string>
  head: Head
  /** Solo en el repo local: ramas remotas (origin/main -> "main"). */
  remoteTracking: Record<string, string>
  /** Solo en el repo local: rama local -> rama de origin que sigue. */
  upstream: Record<string, string>
  reflog: { id: string; action: string }[]
}

export interface SimState {
  commits: Record<string, Commit>
  local: Repo
  origin: Repo | null
  seq: number
}

export interface SimLine {
  kind: 'out' | 'err'
  text: string
}

export interface RunResult {
  state: SimState
  lines: SimLine[]
  /** false si el comando no se pudo ejecutar (error de sintaxis o de Git). */
  ok: boolean
}

export const REMOTE = 'origin'

const emptyRepo = (): Repo => ({ branches: {}, tags: {}, head: { branch: 'main' }, remoteTracking: {}, upstream: {}, reflog: [] })

export function initialState(): SimState {
  return { commits: {}, local: emptyRepo(), origin: null, seq: 0 }
}

// --- Utilidades del grafo ------------------------------------------------------

/** Hash corto determinista (FNV-1a) para que los ids no cambien al repetir los comandos. */
function makeId(seq: number, message: string): string {
  let h = 0x811c9dc5
  for (const ch of `${seq}\u0000${message}`) {
    h ^= ch.codePointAt(0)!
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0').slice(0, 7)
}

export function headCommit(repo: Repo): string | undefined {
  return 'branch' in repo.head ? repo.branches[repo.head.branch] : repo.head.detached
}

/** Todos los commits alcanzables desde `id` (incluido). */
export function ancestors(state: SimState, id: string | undefined): Set<string> {
  const seen = new Set<string>()
  const stack = id ? [id] : []
  while (stack.length) {
    const c = stack.pop()!
    if (seen.has(c)) continue
    seen.add(c)
    stack.push(...(state.commits[c]?.parents ?? []))
  }
  return seen
}

const isAncestor = (state: SimState, a: string, b: string) => ancestors(state, b).has(a)

/** Commits de `id` hacia atrás, del más nuevo al más antiguo. */
export function history(state: SimState, id: string | undefined): Commit[] {
  return [...ancestors(state, id)].map((c) => state.commits[c]).sort((x, y) => y.seq - x.seq)
}

const short = (state: SimState, id: string) => `${id} ${state.commits[id]?.message ?? ''}`.trim()

/** Resuelve una revisión: HEAD, rama, tag, origin/rama, hash (o prefijo) y sufijos ~n, ^ y ^n. */
export function resolveRev(state: SimState, repo: Repo, rev: string): string | undefined {
  const m = /^(.+?)((?:[~^]\d*)*)$/.exec(rev)
  if (!m) return undefined
  const [, base, suffix] = m
  let id: string | undefined
  const reflogRef = /^(?:HEAD)?@\{(\d+)\}$/.exec(base)
  if (reflogRef) id = repo.reflog[Number(reflogRef[1])]?.id
  else if (base === 'HEAD' || base === '@') id = headCommit(repo)
  else if (base in repo.branches) id = repo.branches[base]
  else if (base in repo.tags) id = repo.tags[base]
  else if (base.startsWith(`${REMOTE}/`) && base.slice(REMOTE.length + 1) in repo.remoteTracking)
    id = repo.remoteTracking[base.slice(REMOTE.length + 1)]
  else if (/^[0-9a-f]{4,}$/.test(base)) {
    const found = Object.keys(state.commits).filter((c) => c.startsWith(base))
    if (found.length === 1) id = found[0]
  }
  for (const s of suffix.matchAll(/([~^])(\d*)/g)) {
    if (!id) return undefined
    const n = s[2] === '' ? 1 : Number(s[2])
    if (s[1] === '~') for (let i = 0; i < n && id; i++) id = state.commits[id]?.parents[0]
    else id = n === 0 ? id : state.commits[id]?.parents[n - 1]
  }
  return id
}

// --- Ejecución -------------------------------------------------------------------

class SimError extends Error {}
const fail = (msg: string): never => {
  throw new SimError(msg)
}

interface Ctx {
  state: SimState
  repo: Repo
  /** true si el comando se ejecuta en origin (líneas "origin:" del setup). */
  onOrigin: boolean
  out: SimLine[]
}

const say = (ctx: Ctx, text: string) => ctx.out.push({ kind: 'out', text })

function newCommit(ctx: Ctx, message: string, parents: string[]): string {
  const seq = ++ctx.state.seq
  const id = makeId(seq, message)
  ctx.state.commits[id] = { id, message, parents, seq }
  return id
}

/** Mueve HEAD (la rama actual, o el propio HEAD si está detached) y lo anota en el reflog. */
function moveHead(ctx: Ctx, id: string, action: string) {
  const { repo } = ctx
  if ('branch' in repo.head) repo.branches[repo.head.branch] = id
  else repo.head = { detached: id }
  repo.reflog.unshift({ id, action })
}

function setHead(ctx: Ctx, head: Head, action: string) {
  ctx.repo.head = head
  const id = headCommit(ctx.repo)
  if (id) ctx.repo.reflog.unshift({ id, action })
}

const rev = (ctx: Ctx, r: string) => resolveRev(ctx.state, ctx.repo, r) ?? fail(`«${r}» no es una rama, tag ni commit conocido.`)
const currentBranch = (repo: Repo) => ('branch' in repo.head ? repo.head.branch : undefined)
const needCommit = (ctx: Ctx) => headCommit(ctx.repo) ?? fail('Todavía no hay ningún commit en esta rama. Haz primero git commit -m "…".')
const flag = (cmd: ParsedCommand, name: string) => cmd.flags[name] !== undefined
const needOrigin = (ctx: Ctx): Repo =>
  ctx.state.origin ?? fail(`No hay ningún remoto «${REMOTE}» en este escenario.`)

function checkBranchName(name: string) {
  if (!/^[A-Za-z0-9._/-]+$/.test(name) || name.startsWith('-') || name.endsWith('/') || name.includes('..'))
    fail(`«${name}» no es un nombre de rama válido.`)
}

function cmdCommit(ctx: Ctx, cmd: ParsedCommand) {
  const { repo } = ctx
  const message = cmd.flags.message
  if (flag(cmd, 'amend')) {
    const old = needCommit(ctx)
    const c = ctx.state.commits[old]
    const id = newCommit(ctx, message ?? c.message, c.parents)
    moveHead(ctx, id, 'commit (amend)')
    say(ctx, `Commit ${old} sustituido por ${id} («${message ?? c.message}»). El anterior deja de estar en la rama.`)
    return
  }
  if (!message) fail('En el simulador no hay editor: escribe el mensaje con -m "mensaje".')
  const parent = headCommit(repo)
  const id = newCommit(ctx, message!, parent ? [parent] : [])
  moveHead(ctx, id, parent ? 'commit' : 'commit (initial)')
  const where = currentBranch(repo) ?? 'HEAD detached'
  say(ctx, `[${where} ${id}] ${message}`)
}

function listBranches(ctx: Ctx, cmd: ParsedCommand) {
  const { repo } = ctx
  const cur = currentBranch(repo)
  if (!flag(cmd, 'remotes')) {
    if ('detached' in repo.head) say(ctx, `* (HEAD detached at ${repo.head.detached})`)
    for (const b of Object.keys(repo.branches).sort()) say(ctx, `${b === cur ? '*' : ' '} ${b}`)
  }
  if (flag(cmd, 'remotes') || flag(cmd, 'all'))
    for (const b of Object.keys(repo.remoteTracking).sort()) say(ctx, `  ${flag(cmd, 'all') ? 'remotes/' : ''}${REMOTE}/${b}`)
  if (ctx.out.length === 0) say(ctx, '(no hay ramas todavía: se crea main con el primer commit)')
}

function cmdBranch(ctx: Ctx, cmd: ParsedCommand) {
  const { repo, state } = ctx
  const [name, start] = cmd.positionals
  if (flag(cmd, 'show-current')) return say(ctx, currentBranch(repo) ?? '')
  if (flag(cmd, 'delete') || flag(cmd, 'force-delete')) {
    if (!name) fail('Indica qué rama borrar.')
    for (const b of cmd.positionals) {
      if (!(b in repo.branches)) fail(`La rama «${b}» no existe.`)
      if (b === currentBranch(repo)) fail(`No puedes borrar «${b}» porque es la rama en la que estás. Cámbiate antes a otra.`)
      const head = headCommit(repo)
      if (!flag(cmd, 'force-delete') && !(head && isAncestor(state, repo.branches[b], head)))
        fail(`La rama «${b}» tiene commits que no están fusionados en la rama actual. Si de verdad quieres perderlos, usa -D.`)
      say(ctx, `Rama «${b}» borrada (apuntaba a ${repo.branches[b]}).`)
      delete repo.branches[b]
      delete repo.upstream[b]
    }
    return
  }
  if (flag(cmd, 'move') || flag(cmd, 'force-move')) {
    const [from, to] = start ? [name, start] : [currentBranch(repo) ?? fail('Estás en detached HEAD: indica la rama que quieres renombrar.'), name]
    if (!to) fail('Indica el nombre nuevo.')
    checkBranchName(to)
    const exists = from in repo.branches || (from === currentBranch(repo) && !repo.branches[from])
    if (!exists) fail(`La rama «${from}» no existe.`)
    if (to in repo.branches && !flag(cmd, 'force-move')) fail(`Ya existe una rama «${to}».`)
    if (from in repo.branches) {
      repo.branches[to] = repo.branches[from]
      delete repo.branches[from]
    }
    if (from in repo.upstream) {
      repo.upstream[to] = repo.upstream[from]
      delete repo.upstream[from]
    }
    if (currentBranch(repo) === from) repo.head = { branch: to }
    return say(ctx, `Rama «${from}» renombrada a «${to}».`)
  }
  if (!name || flag(cmd, 'list')) return listBranches(ctx, cmd)
  checkBranchName(name)
  if (name in repo.branches && !flag(cmd, 'force')) fail(`Ya existe una rama «${name}».`)
  if (name === currentBranch(repo) && flag(cmd, 'force')) fail(`No puedes mover con -f la rama en la que estás.`)
  const at = start ? rev(ctx, start) : needCommit(ctx)
  repo.branches[name] = at
  if (start?.startsWith(`${REMOTE}/`)) repo.upstream[name] = start.slice(REMOTE.length + 1)
  say(ctx, `Rama «${name}» creada en ${short(state, at)}. Sigues en ${currentBranch(repo) ?? 'detached HEAD'}.`)
}

function cmdSwitch(ctx: Ctx, cmd: ParsedCommand) {
  const { repo, state } = ctx
  const create = cmd.flags.create ?? cmd.flags['force-create']
  if (create) {
    checkBranchName(create)
    if (create in repo.branches && cmd.flags.create) fail(`Ya existe una rama «${create}». Para cambiarte a ella: git switch ${create}`)
    const start = cmd.positionals[0]
    const at = start ? rev(ctx, start) : headCommit(repo)
    if (at) repo.branches[create] = at
    if (start?.startsWith(`${REMOTE}/`)) repo.upstream[create] = start.slice(REMOTE.length + 1)
    setHead(ctx, { branch: create }, `checkout: moving to ${create}`)
    return say(ctx, `Rama «${create}» creada${at ? ` en ${at}` : ''}; ahora estás en ella.`)
  }
  const target = cmd.positionals[0] ?? fail('Indica a qué rama cambiar.')
  if (flag(cmd, 'detach')) {
    const at = rev(ctx, target)
    setHead(ctx, { detached: at }, `checkout: moving to ${target}`)
    return say(ctx, `HEAD apunta ahora a ${short(state, at)} (detached HEAD). Si haces commits aquí, crea una rama para no perderlos: git switch -c <nombre>.`)
  }
  if (target in repo.branches) {
    if (target === currentBranch(repo)) return say(ctx, `Ya estás en «${target}».`)
    setHead(ctx, { branch: target }, `checkout: moving to ${target}`)
    return say(ctx, `Ahora estás en «${target}».`)
  }
  // Como Git (--guess, activo por defecto): si existe origin/<rama>, crea la rama local que la sigue.
  if (target in repo.remoteTracking && !flag(cmd, 'no-guess')) {
    repo.branches[target] = repo.remoteTracking[target]
    repo.upstream[target] = target
    setHead(ctx, { branch: target }, `checkout: moving to ${target}`)
    return say(ctx, `Rama «${target}» creada a partir de ${REMOTE}/${target}, que queda como su upstream. Ahora estás en ella.`)
  }
  if (resolveRev(state, repo, target)) fail(`«${target}» no es una rama. Para ir a un commit concreto usa git switch --detach ${target}.`)
  fail(`La rama «${target}» no existe. Para crearla: git switch -c ${target}`)
}

function mergeInto(ctx: Ctx, targetRev: string, opts: { noFf?: boolean; ffOnly?: boolean; message?: string }, label: string) {
  const { state } = ctx
  const head = needCommit(ctx)
  const other = rev(ctx, targetRev)
  if (isAncestor(state, other, head)) return say(ctx, `Ya está al día: ${label} no tiene commits que no tengas.`)
  if (isAncestor(state, head, other) && !opts.noFf) {
    moveHead(ctx, other, `merge ${label}: Fast-forward`)
    return say(ctx, `Fast-forward: ${currentBranch(ctx.repo) ?? 'HEAD'} avanza hasta ${short(state, other)}. No hace falta commit de merge.`)
  }
  if (opts.ffOnly) fail(`No se puede hacer fast-forward: las ramas han divergido. Hace falta un merge o un rebase.`)
  const message = opts.message ?? (targetRev.startsWith(`${REMOTE}/`) ? `Merge remote-tracking branch '${targetRev}'` : `Merge branch '${targetRev}'`)
  const id = newCommit(ctx, message, [head, other])
  moveHead(ctx, id, `merge ${label}`)
  say(ctx, `Commit de merge ${id} («${message}») con dos padres: ${head} y ${other}.`)
}

function cmdMerge(ctx: Ctx, cmd: ParsedCommand) {
  if (flag(cmd, 'abort') || flag(cmd, 'continue') || flag(cmd, 'quit'))
    fail('No hay ningún merge a medias (el simulador no genera conflictos).')
  if (flag(cmd, 'squash') || flag(cmd, 'no-commit')) fail('El simulador no modela --squash ni --no-commit.')
  const target = cmd.positionals[0] ?? fail('Indica qué rama fusionar.')
  mergeInto(ctx, target, { noFf: flag(cmd, 'no-ff'), ffOnly: flag(cmd, 'ff-only'), message: cmd.flags.message }, target)
}

/** Reaplica sobre `onto` los commits de HEAD que no están en `upstream`. */
function rebaseOnto(ctx: Ctx, upstreamRev: string) {
  const { state, repo } = ctx
  const head = needCommit(ctx)
  const upstream = rev(ctx, upstreamRev)
  const base = ancestors(state, upstream)
  if (base.has(head)) {
    if (head === upstream) return say(ctx, `La rama ya está al día con ${upstreamRev}.`)
    moveHead(ctx, upstream, `rebase: fast-forward`)
    return say(ctx, `No había commits propios que reaplicar: ${currentBranch(repo) ?? 'HEAD'} avanza hasta ${short(state, upstream)}.`)
  }
  const own = history(state, head).filter((c) => !base.has(c.id))
  // Como Git sin --rebase-merges: los commits de merge se descartan.
  const mine = own.filter((c) => c.parents.length <= 1).reverse()
  if (isAncestor(state, upstream, head) && mine.length === own.length)
    return say(ctx, `La rama ya está encima de ${upstreamRev}: no hay nada que reaplicar.`)
  let tip = upstream
  const copies: string[] = []
  for (const c of mine) {
    tip = newCommit(ctx, c.message, [tip])
    copies.push(`${c.id} → ${tip} ${c.message}`)
  }
  moveHead(ctx, tip, `rebase (finish): onto ${upstream}`)
  say(ctx, `Rebase sobre ${short(state, upstream)}: ${mine.length} commit(s) reaplicados con hash nuevo:`)
  for (const l of copies) say(ctx, `  ${l}`)
}

function cmdRebase(ctx: Ctx, cmd: ParsedCommand) {
  if (flag(cmd, 'abort') || flag(cmd, 'continue') || flag(cmd, 'skip') || flag(cmd, 'quit'))
    fail('No hay ningún rebase a medias (el simulador no genera conflictos).')
  if (flag(cmd, 'interactive')) fail('El simulador no modela el rebase interactivo (-i).')
  if (cmd.flags.onto || flag(cmd, 'root') || flag(cmd, 'rebase-merges')) fail('El simulador solo modela git rebase <rama>.')
  const [upstream, branch] = cmd.positionals
  if (branch) {
    if (!(branch in ctx.repo.branches)) fail(`La rama «${branch}» no existe.`)
    setHead(ctx, { branch }, `checkout: moving to ${branch}`)
  }
  const target = upstream ?? upstreamOf(ctx)
  rebaseOnto(ctx, target)
}

function upstreamOf(ctx: Ctx): string {
  const b = currentBranch(ctx.repo) ?? fail('Estás en detached HEAD: indica la rama.')
  const up = ctx.repo.upstream[b] ?? fail(`La rama «${b}» no tiene upstream: indica la rama.`)
  return `${REMOTE}/${up}`
}

function cmdReset(ctx: Ctx, cmd: ParsedCommand) {
  if (flag(cmd, 'patch') || flag(cmd, 'keep') || flag(cmd, 'merge')) fail('El simulador solo modela --soft, --mixed y --hard.')
  if (cmd.positionals.length > 1) fail('El simulador no modela ficheros: git reset <commit> sin rutas.')
  const target = rev(ctx, cmd.positionals[0] ?? 'HEAD')
  const before = needCommit(ctx)
  moveHead(ctx, target, `reset: moving to ${cmd.positionals[0] ?? 'HEAD'}`)
  const mode = flag(cmd, 'hard') ? '--hard' : flag(cmd, 'soft') ? '--soft' : '--mixed'
  const extra = {
    '--soft': 'los cambios de los commits deshechos quedarían en la staging area',
    '--mixed': 'los cambios de los commits deshechos quedarían en el working tree, sin preparar',
    '--hard': 'los cambios se descartan también del working tree',
  }[mode]
  say(ctx, `HEAD está ahora en ${short(ctx.state, target)} (antes en ${before}). Con ${mode}, ${extra}.`)
}

function cmdRevert(ctx: Ctx, cmd: ParsedCommand) {
  if (flag(cmd, 'no-commit') || flag(cmd, 'continue') || flag(cmd, 'abort') || flag(cmd, 'skip') || flag(cmd, 'quit'))
    fail('El simulador solo modela git revert <commit>.')
  const head = needCommit(ctx)
  const targets = cmd.positionals.length ? cmd.positionals : fail('Indica qué commit deshacer.')
  let tip = head
  for (const t of targets) {
    const c = ctx.state.commits[rev(ctx, t)]
    if (c.parents.length > 1 && !cmd.flags.mainline) fail(`${c.id} es un commit de merge: hay que indicar con -m qué padre se conserva (normalmente -m 1).`)
    tip = newCommit(ctx, `Revert "${c.message}"`, [tip])
    moveHead(ctx, tip, `revert: Revert "${c.message}"`)
    say(ctx, `Nuevo commit ${tip} («Revert "${c.message}"») que deshace ${c.id}. La historia no se reescribe.`)
  }
}

function cmdCherryPick(ctx: Ctx, cmd: ParsedCommand) {
  if (flag(cmd, 'no-commit') || flag(cmd, 'continue') || flag(cmd, 'abort') || flag(cmd, 'skip') || flag(cmd, 'quit'))
    fail('El simulador solo modela git cherry-pick <commit>.')
  const head = needCommit(ctx)
  const targets = cmd.positionals.length ? cmd.positionals : fail('Indica qué commit copiar.')
  let tip = head
  for (const t of targets) {
    const c = ctx.state.commits[rev(ctx, t)]
    if (c.parents.length > 1 && !cmd.flags.mainline) fail(`${c.id} es un commit de merge: hay que indicar con -m qué padre usar.`)
    tip = newCommit(ctx, c.message, [tip])
    moveHead(ctx, tip, `cherry-pick: ${c.message}`)
    say(ctx, `Copia de ${c.id} aplicada como ${tip} («${c.message}»): mismo cambio, hash nuevo.`)
  }
}

function cmdTag(ctx: Ctx, cmd: ParsedCommand) {
  const { repo } = ctx
  const [name, target] = cmd.positionals
  if (flag(cmd, 'delete')) {
    for (const t of cmd.positionals) {
      if (!(t in repo.tags)) fail(`El tag «${t}» no existe.`)
      delete repo.tags[t]
      say(ctx, `Tag «${t}» borrado.`)
    }
    return
  }
  if (!name || flag(cmd, 'list')) {
    const tags = Object.keys(repo.tags).sort()
    if (!tags.length) say(ctx, '(no hay tags)')
    for (const t of tags) say(ctx, t)
    return
  }
  if (name in repo.tags && !flag(cmd, 'force')) fail(`El tag «${name}» ya existe. Un tag publicado no se mueve: crea otro.`)
  if (flag(cmd, 'annotate') && !cmd.flags.message) fail('En el simulador no hay editor: añade el mensaje del tag con -m.')
  const at = target ? rev(ctx, target) : needCommit(ctx)
  repo.tags[name] = at
  say(ctx, `Tag ${flag(cmd, 'annotate') ? 'anotado' : 'ligero'} «${name}» en ${short(ctx.state, at)}.`)
}

function decorations(ctx: Ctx, id: string): string {
  const { repo } = ctx
  const refs: string[] = []
  const cur = currentBranch(repo)
  if ('detached' in repo.head && repo.head.detached === id) refs.push('HEAD')
  for (const [b, c] of Object.entries(repo.branches)) if (c === id) refs.push(b === cur ? `HEAD -> ${b}` : b)
  refs.sort((a, b) => Number(b.startsWith('HEAD')) - Number(a.startsWith('HEAD')))
  for (const [b, c] of Object.entries(repo.remoteTracking)) if (c === id) refs.push(`${REMOTE}/${b}`)
  for (const [t, c] of Object.entries(repo.tags)) if (c === id) refs.push(`tag: ${t}`)
  return refs.length ? ` (${refs.join(', ')})` : ''
}

function cmdLog(ctx: Ctx, cmd: ParsedCommand) {
  const { state, repo } = ctx
  let tips: (string | undefined)[]
  if (flag(cmd, 'all')) tips = [headCommit(repo), ...Object.values(repo.branches), ...Object.values(repo.remoteTracking), ...Object.values(repo.tags)]
  else if (cmd.positionals.length) tips = cmd.positionals.map((r) => rev(ctx, r))
  else tips = [needCommit(ctx)]
  const all = new Set<string>()
  for (const t of tips) for (const c of ancestors(state, t)) all.add(c)
  let list = [...all].map((c) => state.commits[c]).sort((a, b) => b.seq - a.seq)
  if (cmd.flags['max-count']) list = list.slice(0, Number(cmd.flags['max-count']) || 0)
  if (flag(cmd, 'reverse')) list.reverse()
  for (const c of list) {
    if (flag(cmd, 'oneline')) say(ctx, `${c.id}${decorations(ctx, c.id)} ${c.message}`)
    else {
      say(ctx, `commit ${c.id}${decorations(ctx, c.id)}${c.parents.length > 1 ? `\nMerge: ${c.parents.join(' ')}` : ''}`)
      say(ctx, `    ${c.message}\n`)
    }
  }
}

function aheadBehind(state: SimState, a: string, b: string): [number, number] {
  const A = ancestors(state, a)
  const B = ancestors(state, b)
  return [[...A].filter((x) => !B.has(x)).length, [...B].filter((x) => !A.has(x)).length]
}

function cmdStatus(ctx: Ctx) {
  const { repo, state } = ctx
  const cur = currentBranch(repo)
  if (!cur) say(ctx, `HEAD detached at ${headCommit(repo)}`)
  else {
    say(ctx, `On branch ${cur}`)
    if (!repo.branches[cur]) say(ctx, 'Todavía no hay commits.')
    const up = repo.upstream[cur]
    const upId = up ? repo.remoteTracking[up] : undefined
    if (up && upId && repo.branches[cur]) {
      const [ahead, behind] = aheadBehind(state, repo.branches[cur], upId)
      const name = `${REMOTE}/${up}`
      if (!ahead && !behind) say(ctx, `Al día con ${name}.`)
      else if (ahead && !behind) say(ctx, `Vas ${ahead} commit(s) por delante de ${name}: git push para publicarlos.`)
      else if (!ahead && behind) say(ctx, `Vas ${behind} commit(s) por detrás de ${name}: se puede hacer fast-forward con git pull.`)
      else say(ctx, `Tu rama y ${name} han divergido: ${ahead} commit(s) tuyos y ${behind} del remoto.`)
    } else if (up) say(ctx, `Sigue a ${REMOTE}/${up}, que ya no existe.`)
  }
  say(ctx, '(El simulador no modela ficheros: no hay cambios sin commit.)')
}

function cmdReflog(ctx: Ctx, cmd: ParsedCommand) {
  if (cmd.path.length > 2 && cmd.path[2] !== 'show') fail(`El simulador solo modela git reflog y git reflog show.`)
  const entries = ctx.repo.reflog
  if (!entries.length) return say(ctx, '(el reflog está vacío)')
  entries.forEach((e, i) => say(ctx, `${e.id} HEAD@{${i}}: ${e.action}`))
}

function cmdFetch(ctx: Ctx, cmd: ParsedCommand) {
  const origin = needOrigin(ctx)
  const remote = cmd.positionals[0]
  if (remote && remote !== REMOTE) fail(`No existe el remoto «${remote}» (solo «${REMOTE}»).`)
  const { repo, state } = ctx
  let changes = 0
  for (const [b, id] of Object.entries(origin.branches)) {
    const old = repo.remoteTracking[b]
    if (old === id) continue
    changes++
    if (!old) say(ctx, ` * [nueva rama]  ${b} -> ${REMOTE}/${b}`)
    else say(ctx, `   ${old}..${id}  ${b} -> ${REMOTE}/${b}${isAncestor(state, old, id) ? '' : '  (forced update)'}`)
    repo.remoteTracking[b] = id
  }
  if (flag(cmd, 'prune'))
    for (const b of Object.keys(repo.remoteTracking))
      if (!(b in origin.branches)) {
        changes++
        say(ctx, ` - [borrada]  ${REMOTE}/${b}`)
        delete repo.remoteTracking[b]
      }
  for (const [t, id] of Object.entries(origin.tags)) if (!(t in repo.tags)) repo.tags[t] = id
  if (!changes) say(ctx, `Nada nuevo en ${REMOTE}.`)
}

function cmdPull(ctx: Ctx, cmd: ParsedCommand) {
  const [remote, branch] = cmd.positionals
  if (remote && remote !== REMOTE) fail(`No existe el remoto «${remote}» (solo «${REMOTE}»).`)
  const cur = currentBranch(ctx.repo) ?? fail('Estás en detached HEAD: cámbiate a una rama antes de hacer pull.')
  const up = branch ?? ctx.repo.upstream[cur] ?? fail(`La rama «${cur}» no tiene upstream. Indica de dónde: git pull ${REMOTE} <rama>.`)
  cmdFetch(ctx, { ...cmd, positionals: [] })
  if (!(up in ctx.repo.remoteTracking)) fail(`${REMOTE} no tiene la rama «${up}».`)
  const target = `${REMOTE}/${up}`
  const head = headCommit(ctx.repo)
  if (!head) {
    moveHead(ctx, ctx.repo.remoteTracking[up], `pull: Fast-forward`)
    return say(ctx, `Rama «${cur}» creada con el contenido de ${target}.`)
  }
  const other = ctx.repo.remoteTracking[up]
  const diverged = !isAncestor(ctx.state, other, head) && !isAncestor(ctx.state, head, other)
  if (flag(cmd, 'rebase')) return rebaseOnto(ctx, target)
  if (diverged && !flag(cmd, 'no-rebase') && !flag(cmd, 'no-ff') && !flag(cmd, 'ff'))
    fail(
      `Tu rama y ${target} han divergido y git pull no sabe cómo integrarlas. Elige: git pull --rebase (reaplica tus commits encima) o git pull --no-rebase (commit de merge).`,
    )
  mergeInto(ctx, target, { noFf: flag(cmd, 'no-ff'), ffOnly: flag(cmd, 'ff-only') }, target)
}

function cmdPush(ctx: Ctx, cmd: ParsedCommand) {
  const origin = needOrigin(ctx)
  const { repo, state } = ctx
  const [remote, spec] = cmd.positionals
  if (remote && remote !== REMOTE) fail(`No existe el remoto «${remote}» (solo «${REMOTE}»).`)
  if (flag(cmd, 'tags')) {
    let n = 0
    for (const [t, id] of Object.entries(repo.tags))
      if (!(t in origin.tags)) {
        origin.tags[t] = id
        n++
        say(ctx, ` * [nuevo tag]  ${t} -> ${t}`)
      }
    if (!n) say(ctx, 'Todos los tags ya están en origin.')
    return
  }
  if (flag(cmd, 'delete')) {
    const b = spec ?? fail('Indica qué rama borrar en el remoto.')
    if (!(b in origin.branches)) fail(`${REMOTE} no tiene la rama «${b}».`)
    delete origin.branches[b]
    delete repo.remoteTracking[b]
    return say(ctx, ` - [borrada]  ${b} (en ${REMOTE})`)
  }
  const cur = currentBranch(repo)
  let local: string
  let dest: string
  if (spec) {
    ;[local, dest] = spec.includes(':') ? (spec.split(':') as [string, string]) : [spec, spec]
    if (local in repo.tags && !(local in repo.branches)) {
      origin.tags[dest] = repo.tags[local]
      return say(ctx, ` * [nuevo tag]  ${local} -> ${dest}`)
    }
  } else {
    local = cur ?? fail('Estás en detached HEAD: indica qué publicar.')
    dest = repo.upstream[local] ?? fail(`La rama «${local}» no tiene upstream. Para publicarla y enlazarla: git push -u ${REMOTE} ${local}`)
  }
  const id = repo.branches[local] ?? fail(`La rama «${local}» no existe o no tiene commits.`)
  const remoteId = origin.branches[dest]
  if (remoteId === id) {
    if (flag(cmd, 'set-upstream')) repo.upstream[local] = dest
    repo.remoteTracking[dest] = id
    return say(ctx, 'Todo al día: el remoto ya tiene estos commits.')
  }
  if (remoteId && !isAncestor(state, remoteId, id)) {
    const known = repo.remoteTracking[dest]
    if (flag(cmd, 'force-with-lease') && known !== remoteId)
      fail(`! [rejected]        ${local} -> ${dest} (stale info)\n--force-with-lease rechaza el push: ${REMOTE}/${dest} ha cambiado desde tu último fetch y lo sobrescribirías sin haberlo visto.`)
    if (!flag(cmd, 'force') && !flag(cmd, 'force-with-lease')) {
      const known2 = ancestors(state, repo.branches[local]).has(remoteId) || Object.values(repo.remoteTracking).some((t) => ancestors(state, t).has(remoteId))
      fail(
        `! [rejected]        ${local} -> ${dest} (${known2 ? 'non-fast-forward' : 'fetch first'})\n` +
          (known2
            ? `El remoto tiene commits que tu rama no incluye (p. ej. tras un rebase). Si la rama es solo tuya: git push --force-with-lease.`
            : `El remoto tiene commits que tú no tienes. Intégralos primero (git pull) y vuelve a hacer push.`),
      )
    }
    say(ctx, ` + ${remoteId}...${id} ${local} -> ${dest} (forced update)`)
  } else say(ctx, `${remoteId ? `   ${remoteId}..${id}` : ' * [nueva rama]'}  ${local} -> ${dest}`)
  origin.branches[dest] = id
  repo.remoteTracking[dest] = id
  if (flag(cmd, 'set-upstream')) {
    repo.upstream[local] = dest
    say(ctx, `La rama «${local}» sigue ahora a ${REMOTE}/${dest}.`)
  }
}

const NOTES: Record<string, string> = {
  add: 'El simulador no modela ficheros: no hace falta git add, cada git commit guarda los cambios directamente.',
  restore: 'El simulador no modela ficheros: git restore no cambia el grafo.',
  diff: 'El simulador no modela ficheros: no hay diferencias que mostrar.',
  rm: 'El simulador no modela ficheros.',
  stash: 'El simulador no modela ficheros, así que no hay nada que guardar con git stash.',
  'check-ignore': 'El simulador no modela ficheros.',
  show: 'El simulador no guarda el contenido de los commits; usa git log para ver la historia.',
  init: 'El simulador ya parte de un repositorio inicializado.',
  config: 'El simulador no modela la configuración.',
  clone: 'El simulador no modela git clone: los escenarios con remoto ya empiezan clonados o con origin configurado.',
  remote: `El único remoto del simulador es «${REMOTE}», ya configurado.`,
  bisect: 'El simulador no modela git bisect.',
}

type Handler = (ctx: Ctx, cmd: ParsedCommand) => void
const HANDLERS: Record<string, Handler> = {
  commit: cmdCommit,
  branch: cmdBranch,
  switch: cmdSwitch,
  merge: cmdMerge,
  rebase: cmdRebase,
  reset: cmdReset,
  revert: cmdRevert,
  'cherry-pick': cmdCherryPick,
  tag: cmdTag,
  log: cmdLog,
  status: cmdStatus,
  reflog: cmdReflog,
  fetch: cmdFetch,
  pull: cmdPull,
  push: cmdPush,
}
/** Comandos que el simulador no puede ejecutar en origin (no tienen sentido en el remoto). */
const LOCAL_ONLY = new Set(['fetch', 'pull', 'push'])

const ORIGIN_PREFIX = /^origin:\s*/

/**
 * Ejecuta una línea. Las líneas que empiezan por "origin:" (solo en el setup de
 * los ejercicios) se ejecutan en el remoto, como si otra persona hiciera push.
 */
export function run(spec: CliSpec, state: SimState, line: string): RunResult {
  const next = structuredClone(state)
  const onOrigin = ORIGIN_PREFIX.test(line)
  const text = line.replace(ORIGIN_PREFIX, '').trim()
  if (onOrigin && !next.origin) next.origin = emptyRepo()
  const repo = onOrigin ? next.origin! : next.local
  const ctx: Ctx = { state: next, repo, onOrigin, out: [] }
  const parsed = parseCommand(spec, text)
  if (!parsed.ok) return { state, lines: parsed.errors.map((e) => ({ kind: 'err', text: e })), ok: false }
  const name = parsed.command.path[1]
  const handler = HANDLERS[name]
  if (!handler || (onOrigin && LOCAL_ONLY.has(name)))
    return { state, lines: [{ kind: 'out', text: NOTES[name] ?? `El simulador no modela git ${name}.` }], ok: true }
  try {
    handler(ctx, parsed.command)
  } catch (e) {
    if (e instanceof SimError) return { state, lines: [...ctx.out, { kind: 'err', text: e.message }], ok: false }
    throw e
  }
  return { state: next, lines: ctx.out, ok: true }
}

/** Ejecuta varias líneas seguidas y devuelve el estado final y la salida de cada una. */
export function runAll(spec: CliSpec, lines: string[], from: SimState = initialState()): { state: SimState; outputs: RunResult[] } {
  let state = from
  const outputs: RunResult[] = []
  for (const l of lines) {
    const r = run(spec, state, l)
    outputs.push(r)
    state = r.state
  }
  return { state, outputs }
}

// --- Comprobaciones de los ejercicios (decisión M25) ----------------------------

/** Commit al que apunta una referencia de una comprobación. */
function refTarget(state: SimState, ref: string): string | undefined {
  if (ref.startsWith(`${REMOTE}:`)) return state.origin?.branches[ref.slice(REMOTE.length + 1)]
  return resolveRev(state, state.local, ref)
}

export function checkSim(state: SimState, a: SimAssertion): boolean {
  if (a.op === 'head') return a.value === 'detached' ? 'detached' in state.local.head : currentBranch(state.local) === a.value
  if (a.op === 'upstream') return state.local.upstream[a.ref] === a.value
  const id = refTarget(state, a.ref)
  if (a.op === 'absent') return id === undefined
  if (id === undefined) return false
  const hist = history(state, id)
  switch (a.op) {
    case 'exists':
      return true
    case 'contains':
      return hist.some((c) => c.message === a.value)
    case 'notContains':
      return !hist.some((c) => c.message === a.value)
    case 'tipMessage':
      return state.commits[id].message === a.value
    case 'commits':
      return hist.length === a.value
    case 'sameAs':
      return refTarget(state, String(a.value)) === id
    case 'linear':
      return hist.every((c) => c.parents.length <= 1)
    case 'isMerge':
      return state.commits[id].parents.length > 1
  }
}

export interface SimGrade {
  correct: boolean
  checks: { message: string; ok: boolean }[]
}

export function gradeSim(spec: CliSpec, setup: string[], commands: string[], assertions: SimAssertion[]): SimGrade {
  const start = runAll(spec, setup).state
  const { state } = runAll(spec, commands, start)
  const checks = assertions.map((a) => ({ message: a.message, ok: checkSim(state, a) }))
  return { correct: checks.every((c) => c.ok), checks }
}

/** Separa una solución de ejercicio (un comando por línea) en comandos. */
export const simLines = (text: string): string[] =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
