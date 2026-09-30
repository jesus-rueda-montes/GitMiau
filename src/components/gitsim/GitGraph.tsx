import type { GraphLayout, RefLabel } from '../../engine/gitgraph'

// Grafo de commits (decisión M26): SVG a la izquierda con las columnas y las
// líneas; a la derecha, una fila HTML por commit con sus etiquetas y el mensaje.

const ROW = 34
const LANE = 18
const PAD = 12
const R = 6
const COLORS = ['#38bdf8', '#f472b6', '#a3e635', '#fbbf24', '#c084fc', '#2dd4bf', '#fb923c']

const x = (lane: number) => PAD + lane * LANE
const y = (row: number) => ROW / 2 + row * ROW
const color = (lane: number) => COLORS[lane % COLORS.length]

function edgePath(e: GraphLayout['edges'][number]): string {
  const x0 = x(e.fromLane)
  const y0 = y(e.fromRow)
  const xv = x(e.viaLane)
  const x1 = x(e.toLane)
  const y1 = y(e.toRow)
  const h = ROW / 2
  // Una sola fila de distancia: curva directa.
  if (e.toRow - e.fromRow === 1 && (x0 !== xv || xv !== x1)) return `M${x0} ${y0} C${x0} ${y0 + h} ${x1} ${y1 - h} ${x1} ${y1}`
  let d = `M${x0} ${y0}`
  let cy = y0
  if (xv !== x0) {
    d += ` C${x0} ${y0 + h} ${xv} ${y0 + h} ${xv} ${y0 + ROW}`
    cy = y0 + ROW
  }
  if (xv !== x1) {
    if (y1 - ROW > cy) d += ` L${xv} ${y1 - ROW}`
    d += ` C${xv} ${y1 - h} ${x1} ${y1 - h} ${x1} ${y1}`
  } else d += ` L${x1} ${y1}`
  return d
}

function Badge({ r }: { r: RefLabel }) {
  const style = {
    head: 'border-amber-500 bg-amber-950 text-amber-200',
    branch: r.current ? 'border-emerald-400 bg-emerald-900 text-emerald-100' : 'border-emerald-700 bg-emerald-950 text-emerald-300',
    remote: 'border-rose-700 bg-rose-950 text-rose-300',
    tag: 'border-yellow-700 bg-yellow-950 text-yellow-200',
  }[r.kind]
  const text = r.kind === 'tag' ? `🏷 ${r.name}` : r.current ? `HEAD → ${r.name}` : r.name
  return <span className={`shrink-0 rounded border px-1.5 font-mono text-xs leading-5 ${style}`}>{text}</span>
}

interface Props {
  layout: GraphLayout
  /** Texto si no hay commits. */
  empty: string
  label: string
}

export function GitGraph({ layout, empty, label }: Props) {
  if (layout.rows.length === 0) return <p className="px-3 py-4 text-sm text-slate-500">{empty}</p>
  const width = PAD * 2 + (layout.lanes - 1) * LANE
  const height = layout.rows.length * ROW
  return (
    <div className="flex overflow-x-auto" role="img" aria-label={label}>
      <svg width={width} height={height} className="shrink-0" aria-hidden>
        {layout.edges.map((e, i) => (
          <path key={i} d={edgePath(e)} fill="none" stroke={color(e.viaLane)} strokeWidth={2} />
        ))}
        {layout.rows.map((r, i) => (
          <circle
            key={r.id}
            cx={x(r.lane)}
            cy={y(i)}
            r={r.merge ? R + 1 : R}
            fill={r.refs.some((l) => l.current || l.kind === 'head') ? color(r.lane) : '#0f172a'}
            stroke={color(r.lane)}
            strokeWidth={2}
          />
        ))}
      </svg>
      <ol className="min-w-0 flex-1">
        {layout.rows.map((r) => (
          <li key={r.id} className="flex items-center gap-1.5 overflow-hidden pr-2 text-sm whitespace-nowrap" style={{ height: ROW }}>
            <span className="shrink-0 font-mono text-xs text-slate-500">{r.id}</span>
            {r.refs.map((l) => (
              <Badge key={`${l.kind}:${l.name}`} r={l} />
            ))}
            <span className="truncate text-slate-200">{r.message}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
