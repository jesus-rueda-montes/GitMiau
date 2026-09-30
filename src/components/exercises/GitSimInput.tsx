import type { GitSimExercise } from '../../content/schema'
import { getCliSpec } from '../../content/loader'
import type { GradeResult } from '../../engine/grade'
import { GitSim } from '../gitsim/GitSim'

interface Props {
  ex: GitSimExercise
  commands: string[]
  onChange: (commands: string[]) => void
  result?: GradeResult
}

/**
 * Ejercicio de simulador: el alumno ejecuta comandos (Enter ejecuta, no corrige)
 * y «Comprobar» evalúa el estado final. Tras un fallo, «Intentar de nuevo» sigue
 * desde donde estaba; «Empezar de nuevo» vuelve al estado inicial.
 */
export function GitSimInput({ ex, commands, onChange, result }: Props) {
  const spec = getCliSpec('git')
  if (!spec) return <p className="text-red-300">No se pudo cargar la especificación de git.</p>
  return (
    <div className="space-y-3">
      <GitSim
        spec={spec}
        setup={ex.setup}
        commands={commands}
        onRun={(line) => onChange([...commands, line])}
        onReset={() => onChange([])}
        disabled={!!result}
      />
      {result?.checks && result.checks.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm">
          {result.checks.map((c, i) => (
            <li key={i} className={`flex gap-2 ${c.ok ? 'text-emerald-300' : 'text-red-300'}`}>
              <span aria-hidden>{c.ok ? '✓' : '✗'}</span>
              <span>{c.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
