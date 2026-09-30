import { headCommit, REMOTE, type Repo, type SimState } from './gitsim'

// Disposición del grafo de commits (decisión M26): vertical, lo más nuevo arriba,
// como `git log --graph --all`. Cada commit ocupa una fila y una columna (lane).
// Solo se dibujan los commits alcanzables desde alguna referencia: lo demás, como
// en Git, no aparece en el log (aunque siga en el reflog).

export interface RefLabel {
  kind: 'head' | 'branch' | 'remote' | 'tag'
  name: string
  /** Rama a la que apunta HEAD. */
  current?: boolean
}

export interface GraphRow {
  id: string
  message: string
  lane: number
  refs: RefLabel[]
  merge: boolean
}

export interface GraphEdge {
  fromRow: number
  toRow: number
  fromLane: number
  toLane: number
  /** Columna por la que baja la línea entre las dos filas. */
  viaLane: number
}

export interface GraphLayout {
  rows: GraphRow[]
  edges: GraphEdge[]
  lanes: number
}

function labels(repo: Repo, remote: boolean): Map<string, RefLabel[]> {
  const map = new Map<string, RefLabel[]>()
  const add = (id: string | undefined, l: RefLabel) => {
    if (!id) return
    map.set(id, [...(map.get(id) ?? []), l])
  }
  // En el remoto no se marca HEAD: lo que importa son sus ramas.
  const cur = remote ? undefined : 'branch' in repo.head ? repo.head.branch : undefined
  if (!remote && !cur) add(headCommit(repo), { kind: 'head', name: 'HEAD' })
  for (const [b, id] of Object.entries(repo.branches).sort(([a], [b]) => Number(b === cur) - Number(a === cur) || a.localeCompare(b)))
    add(id, { kind: 'branch', name: b, current: b === cur })
  if (!remote) for (const [b, id] of Object.entries(repo.remoteTracking).sort()) add(id, { kind: 'remote', name: `${REMOTE}/${b}` })
  for (const [t, id] of Object.entries(repo.tags).sort()) add(id, { kind: 'tag', name: t })
  return map
}

/** `remote`: el grafo de origin (sin HEAD ni ramas remotas). */
export function layoutGraph(state: SimState, repo: Repo, { remote = false } = {}): GraphLayout {
  const refs = labels(repo, remote)
  // Commits alcanzables desde las referencias, del más nuevo al más antiguo.
  const seen = new Set<string>()
  const stack = [...refs.keys()]
  while (stack.length) {
    const id = stack.pop()!
    if (seen.has(id) || !state.commits[id]) continue
    seen.add(id)
    stack.push(...state.commits[id].parents)
  }
  const order = [...seen].map((id) => state.commits[id]).sort((a, b) => b.seq - a.seq)
  const rowOf = new Map(order.map((c, i) => [c.id, i]))

  // lanes[i] = commit que se espera en la columna i (el padre pendiente de dibujar).
  const lanes: (string | null)[] = []
  const rows: GraphRow[] = []
  const pending: { from: string; to: string; via: number }[] = []
  const free = () => {
    const i = lanes.indexOf(null)
    return i === -1 ? lanes.push(null) - 1 : i
  }

  for (const c of order) {
    let lane = lanes.indexOf(c.id)
    if (lane === -1) lane = free()
    // Si otras columnas también esperaban este commit, convergen aquí.
    for (let i = 0; i < lanes.length; i++) if (lanes[i] === c.id && i !== lane) lanes[i] = null
    lanes[lane] = null
    rows.push({ id: c.id, message: c.message, lane, refs: refs.get(c.id) ?? [], merge: c.parents.length > 1 })

    c.parents.forEach((p, k) => {
      if (!rowOf.has(p)) return
      const waiting = lanes.indexOf(p)
      if (k === 0 && waiting === -1) {
        lanes[lane] = p
        pending.push({ from: c.id, to: p, via: lane })
      } else if (waiting !== -1) {
        // El padre ya lo espera otra columna: la línea baja por la nuestra y converge.
        pending.push({ from: c.id, to: p, via: k === 0 ? lane : waiting })
        if (k === 0) lanes[lane] = p
      } else {
        const via = free()
        lanes[via] = p
        pending.push({ from: c.id, to: p, via })
      }
    })
  }

  const laneOf = new Map(rows.map((r) => [r.id, r.lane]))
  const edges = pending.map((e) => ({
    fromRow: rowOf.get(e.from)!,
    toRow: rowOf.get(e.to)!,
    fromLane: laneOf.get(e.from)!,
    toLane: laneOf.get(e.to)!,
    viaLane: e.via,
  }))
  const lanesUsed = Math.max(1, ...rows.map((r) => r.lane + 1), ...edges.map((e) => e.viaLane + 1))
  return { rows, edges, lanes: lanesUsed }
}
