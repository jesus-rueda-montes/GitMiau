import { describe, expect, test } from 'vitest'
import { loadRawContent } from '../content/rawContent'
import { CliSpecSchema } from '../content/schema'
import { layoutGraph } from './gitgraph'
import { runAll } from './gitsim'

const git = CliSpecSchema.parse(loadRawContent().cliSpecs['/content/cli-specs/git.json'])
const sim = (lines: string[]) => runAll(git, lines).state

describe('layoutGraph', () => {
  test('historia lineal: una sola columna, lo más nuevo arriba', () => {
    const s = sim(['git commit -m A', 'git commit -m B', 'git commit -m C'])
    const g = layoutGraph(s, s.local)
    expect(g.rows.map((r) => r.message)).toEqual(['C', 'B', 'A'])
    expect(g.lanes).toBe(1)
    expect(g.edges).toHaveLength(2)
    expect(g.rows[0].refs).toEqual([{ kind: 'branch', name: 'main', current: true }])
  })

  test('rama y merge: dos columnas y un commit de merge con dos aristas', () => {
    const s = sim(['git commit -m A', 'git switch -c f', 'git commit -m F', 'git switch main', 'git commit -m M', 'git merge f'])
    const g = layoutGraph(s, s.local)
    expect(g.lanes).toBe(2)
    const merge = g.rows[0]
    expect(merge.merge).toBe(true)
    expect(g.edges.filter((e) => e.fromRow === 0)).toHaveLength(2)
    // Cada arista va de una fila a otra posterior.
    for (const e of g.edges) expect(e.toRow).toBeGreaterThan(e.fromRow)
  })

  test('los commits inalcanzables no se dibujan; detached HEAD sí', () => {
    const s = sim(['git commit -m A', 'git commit -m B', 'git reset --hard HEAD~1'])
    expect(layoutGraph(s, s.local).rows.map((r) => r.message)).toEqual(['A'])
    const d = sim(['git commit -m A', 'git commit -m B', 'git switch --detach HEAD~1'])
    const labels = layoutGraph(d, d.local).rows.find((r) => r.message === 'A')!.refs
    expect(labels).toContainEqual({ kind: 'head', name: 'HEAD' })
  })

  test('ramas remotas en el grafo local; el remoto sin HEAD', () => {
    const s = sim(['origin: git commit -m A', 'git fetch', 'git switch main'])
    expect(layoutGraph(s, s.local).rows[0].refs.map((r) => r.name)).toEqual(['main', 'origin/main'])
    expect(layoutGraph(s, s.origin!, { remote: true }).rows[0].refs).toEqual([{ kind: 'branch', name: 'main', current: false }])
  })
})
