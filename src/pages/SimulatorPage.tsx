import { use, useState } from 'react'
import { GitSim } from '../components/gitsim/GitSim'
import { LoadBoundary } from '../components/LoadBoundary'
import { loadCliSpec } from '../content/loader'

// Página libre del simulador (decisión M25): se experimenta sin objetivos ni progreso.

const SCENARIOS = [
  { id: 'vacio', label: 'Repositorio vacío', setup: [] as string[] },
  {
    id: 'historia',
    label: 'Con algunos commits',
    setup: ['git commit -m "Primer commit"', 'git commit -m "Añade la portada"', 'git commit -m "Añade el formulario de contacto"'],
  },
  {
    id: 'clonado',
    label: 'Clonado de GitHub',
    setup: ['origin: git commit -m "Primer commit"', 'origin: git commit -m "Añade la portada"', 'git fetch', 'git switch main'],
  },
  {
    id: 'companero',
    label: 'Alguien ha subido cambios',
    setup: [
      'origin: git commit -m "Primer commit"',
      'origin: git commit -m "Añade la portada"',
      'git fetch',
      'git switch main',
      'origin: git commit -m "Corrige el menú (Ana)"',
    ],
  },
]

const CHEATSHEET = [
  ['git commit -m "…"', 'nuevo commit (también --amend)'],
  ['git branch / git switch', 'crear, listar, borrar y cambiar de rama (switch -c, --detach)'],
  ['git merge / git rebase', 'integrar ramas (--no-ff, --ff-only)'],
  ['git reset / git revert', 'deshacer moviendo la rama o con un commit nuevo'],
  ['git cherry-pick / git tag', 'copiar un commit o marcarlo'],
  ['git log --oneline --all', 'ver la historia; también status y reflog'],
  ['git fetch / pull / push', 'trabajar con origin (pull --rebase, push -u, --force-with-lease)'],
]

export function SimulatorPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold">Simulador de Git</h1>
      <p className="mt-2 max-w-3xl text-slate-400">
        Escribe comandos de Git y mira cómo cambia el grafo de commits. Aquí no hay objetivos ni se guarda nada: es para experimentar sin miedo a
        romper nada.
      </p>
      <LoadBoundary what="el simulador">
        <Playground />
      </LoadBoundary>
    </section>
  )
}

function Playground() {
  const spec = use(loadCliSpec('git'))
  const [scenario, setScenario] = useState(SCENARIOS[1])
  const [commands, setCommands] = useState<string[]>([])
  if (!spec) return <p className="mt-6 text-red-300">No se encontró la especificación de git.</p>

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-400">Escenario:</span>
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={s.id === scenario.id}
            onClick={() => {
              setScenario(s)
              setCommands([])
            }}
            className={`rounded-full border px-3 py-1 ${s.id === scenario.id ? 'border-sky-500 bg-sky-950 text-sky-200' : 'border-slate-700 text-slate-400 hover:bg-slate-800'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <GitSim spec={spec} setup={scenario.setup} commands={commands} onRun={(l) => setCommands((c) => [...c, l])} onReset={() => setCommands([])} />

      <details className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm">
        <summary className="cursor-pointer text-slate-300">Qué comandos entiende</summary>
        <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
          {CHEATSHEET.map(([cmd, what]) => (
            <div key={cmd} className="contents">
              <dt className="font-mono text-sky-300">{cmd}</dt>
              <dd className="text-slate-400">{what}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-slate-500">
          Los mensajes explican lo que haría Git, en español; no son la salida literal. El resto de comandos (add, diff…) solo muestran una nota,
          porque el simulador no tiene ficheros.
        </p>
      </details>
    </div>
  )
}
