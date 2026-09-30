import { useMemo, useState } from 'react'
import type { CliSpec } from '../../content/schema'
import { layoutGraph } from '../../engine/gitgraph'
import { runAll } from '../../engine/gitsim'
import { Terminal, type TermLine } from '../Terminal'
import { GitGraph } from './GitGraph'

interface Props {
  spec: CliSpec
  /** Estado inicial (no se muestra en la terminal). */
  setup: string[]
  /** Comandos que ha escrito el alumno, en orden. */
  commands: string[]
  onRun: (line: string) => void
  onReset: () => void
  disabled?: boolean
}

/**
 * Simulador de Git: terminal (con autocompletado de la spec de git) y el grafo de
 * commits del repositorio local y, si existe, del remoto origin. El estado se
 * recalcula siempre desde el setup y los comandos, así que es reproducible.
 */
export function GitSim({ spec, setup, commands, onRun, onReset, disabled }: Props) {
  const [value, setValue] = useState('')
  const { state, lines } = useMemo(() => {
    const start = runAll(spec, setup).state
    const run = runAll(spec, commands, start)
    const lines: TermLine[] = commands.flatMap((c, i) => [
      { kind: 'cmd' as const, text: c },
      ...run.outputs[i].lines.map((l) => ({ kind: l.kind, text: l.text })),
    ])
    return { state: run.state, lines }
  }, [spec, setup, commands])

  const local = useMemo(() => layoutGraph(state, state.local), [state])
  const origin = useMemo(() => (state.origin ? layoutGraph(state, state.origin, { remote: true }) : null), [state])
  const head = 'branch' in state.local.head ? `rama ${state.local.head.branch}` : `detached HEAD (${state.local.head.detached})`

  return (
    <div className="space-y-3">
      <div className={`grid gap-3 ${origin ? 'md:grid-cols-2' : ''}`}>
        <section className="rounded-lg border border-slate-700 bg-slate-950">
          <h3 className="flex justify-between gap-2 border-b border-slate-800 px-3 py-1.5 text-xs text-slate-400">
            <span>Tu repositorio</span>
            <span>HEAD: {head}</span>
          </h3>
          <div className="max-h-96 overflow-y-auto py-1">
            <GitGraph layout={local} label="Grafo de commits del repositorio local" empty="Todavía no hay commits. Empieza con git commit -m &quot;mensaje&quot;." />
          </div>
        </section>
        {origin && (
          <section className="rounded-lg border border-slate-700 bg-slate-950">
            <h3 className="border-b border-slate-800 px-3 py-1.5 text-xs text-slate-400">Remoto origin (GitHub)</h3>
            <div className="max-h-96 overflow-y-auto py-1">
              <GitGraph layout={origin} label="Grafo de commits del remoto origin" empty="El remoto todavía no tiene commits." />
            </div>
          </section>
        )}
      </div>

      <Terminal
        spec={disabled ? undefined : spec}
        value={value}
        onChange={setValue}
        onSubmit={() => {
          onRun(value.trim())
          setValue('')
        }}
        lines={lines}
        disabled={disabled}
        scroll
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Solo se simula el grafo de commits: no hay ficheros, staging area ni conflictos.</span>
        {!disabled && commands.length > 0 && (
          <button type="button" onClick={onReset} className="hover:text-slate-300">
            ↺ Empezar de nuevo
          </button>
        )}
      </div>
    </div>
  )
}
