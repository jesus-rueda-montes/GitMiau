import { Rating } from 'ts-fsrs'
import { describe, expect, test } from 'vitest'
import { buildCatalog } from '../content/loader'
import { loadRawContent } from '../content/rawContent'
import { computeBadges, earnedIds } from './badges'
import { initialProgress, markLessonRead, recordAttempt, recordExam, touchStreak } from './progress'
import { exportProgress, importProgress } from './progressFile'
import { reviewCard } from './srs'

const catalog = buildCatalog(loadRawContent())
const pilot = catalog.modules.find((m) => m.ref === 'git/l1-que-es-git')!
const yaml = catalog.modules.find((m) => m.ref === 'fundamentos/f0-yaml')!
const day = '2026-09-27'

describe('insignias', () => {
  test('sin progreso no hay ninguna; muestran avance parcial', () => {
    const badges = computeBadges(catalog, initialProgress())
    expect(earnedIds(badges).size).toBe(0)
    expect(badges.find((b) => b.id === 'racha-7')).toMatchObject({ current: 0, target: 7, earned: false })
  })

  test('se ganan con la actividad', () => {
    let s = markLessonRead(initialProgress(), pilot.ref, '01-que-es-git', day)
    s = recordAttempt(s, `${pilot.ref}#init-main`, true, day)
    s = recordExam(s, yaml, 1, day)
    const earned = earnedIds(computeBadges(catalog, s))
    expect([...earned].sort()).toEqual(['nota-perfecta', 'primer-ejercicio', 'primer-examen', 'primera-leccion'])
  })

  test('la insignia de itinerario exige aprobar todos sus módulos', () => {
    const mods = catalog.modules.filter((m) => m.trackId === 'fundamentos')
    let s = initialProgress()
    expect(mods.length).toBeGreaterThan(1)
    for (const m of mods.slice(0, -1)) s = recordExam(s, m, 1, day)
    expect(earnedIds(computeBadges(catalog, s)).has('itinerario-fundamentos')).toBe(false)
    s = recordExam(s, mods[mods.length - 1], 1, day)
    expect(earnedIds(computeBadges(catalog, s)).has('itinerario-fundamentos')).toBe(true)
  })

  test('todoterreno exige los 4 tipos de ejercicio', () => {
    let s = initialProgress()
    for (const id of ['tres-areas', 'init-main', 'config-email']) s = recordAttempt(s, `${pilot.ref}#${id}`, true, day)
    expect(computeBadges(catalog, s).find((b) => b.id === 'todoterreno')).toMatchObject({ current: 3, earned: false })
    s = recordAttempt(s, `${yaml.ref}#config-app`, true, day)
    expect(earnedIds(computeBadges(catalog, s)).has('todoterreno')).toBe(true)
  })

  test('racha: cuenta la mejor racha, aunque la actual se haya roto', () => {
    let s = initialProgress()
    for (const d of ['2026-09-01', '2026-09-02', '2026-09-03', '2026-09-10']) s = touchStreak(s, d)
    expect(s.streak.current).toBe(1)
    expect(earnedIds(computeBadges(catalog, s)).has('racha-3')).toBe(true)
  })

  test('las pistas no influyen en ninguna insignia', () => {
    const key = `${pilot.ref}#init-main`
    const sin = recordAttempt(initialProgress(), key, true, day)
    const con = { ...sin, exercises: { [key]: { ...sin.exercises[key], hintsUsed: 3 } } }
    expect(computeBadges(catalog, con)).toEqual(computeBadges(catalog, sin))
  })
})

describe('exportar / importar', () => {
  const now = new Date('2026-09-27T10:00:00Z')

  test('ida y vuelta conserva todo el progreso', () => {
    let s = markLessonRead(initialProgress(), pilot.ref, '01-que-es-git', day)
    s = recordExam(s, pilot, 0.8, day)
    s = { ...s, cards: { [`${pilot.ref}#head`]: reviewCard(undefined, Rating.Good, now) } }
    const r = importProgress(exportProgress(s, now))
    expect(r).toEqual({ ok: true, progress: s, exportedAt: now })
  })

  test('migra copias antiguas (v1, sin tarjetas)', () => {
    const v1 = { app: 'miau', exportedAt: now.toISOString(), progress: { version: 1, xp: 40, lessonsRead: {}, exercises: {}, exams: {}, streak: { current: 1, best: 2, lastDay: day } } }
    const r = importProgress(JSON.stringify(v1))
    expect(r.ok && r.progress).toMatchObject({ version: 2, xp: 40, cards: {} })
  })

  test('rechaza archivos inválidos con un mensaje claro', () => {
    const err = (t: string) => {
      const r = importProgress(t)
      return r.ok ? '' : r.error
    }
    expect(err('no es json')).toMatch(/no es un JSON válido/)
    expect(err('{"foo": 1}')).toMatch(/no es una copia de progreso de Miau/)
    expect(err(JSON.stringify({ app: 'miau', exportedAt: now.toISOString(), progress: { version: 2, xp: -5 } }))).toMatch(/dañado o incompleto/)
    const future = { app: 'miau', exportedAt: now.toISOString(), progress: { ...initialProgress(), version: 9 } }
    expect(err(JSON.stringify(future))).toMatch(/versión más nueva/)
  })
})
