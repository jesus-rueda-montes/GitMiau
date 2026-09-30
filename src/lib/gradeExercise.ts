import { cliOf, getCliSpec, loadCliSpecsFor } from '../content/loader'
import type { Exercise } from '../content/schema'
import { grade, type Answer, type CliSpecLookup, type GradeResult } from '../engine/grade'

/** Corrige uno o varios ejercicios cargando antes las especificaciones de CLI que hagan falta. */
export async function gradeAll(items: { ex: Exercise; answer: Answer }[]): Promise<GradeResult[]> {
  await loadCliSpecsFor(items.map((i) => i.ex))
  const specs: CliSpecLookup = {}
  for (const { ex } of items) {
    const spec = getCliSpec(cliOf(ex) ?? '')
    if (spec) specs[spec.cli] = spec
  }
  return items.map(({ ex, answer }) => grade(ex, answer, { specs }))
}

export async function gradeExercise(ex: Exercise, answer: Answer): Promise<GradeResult> {
  return (await gradeAll([{ ex, answer }]))[0]
}
