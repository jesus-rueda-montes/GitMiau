# Arquitectura de Miau

Miau es una copia adaptada de Kubernetete (decisión M1 de [DECISIONS.md](DECISIONS.md)): comparte el motor y cambia el contenido. Esta página describe el estado de Miau; las decisiones heredadas siguen en DECISIONS.md.

## Estado actual
- **Fase 0 (base adaptada): completada.**
  - Copia de Kubernetete sin su contenido (Cloud, Kubernetes, Terraform, Ansible y los fundamentos de redes y Docker).
  - Eliminado el editor HCL: `src/engine/hcl.ts`, `src/lib/hclLoader.ts`, `src/components/code/hclMode.ts`, `src/vendor/tree-sitter-hcl/` y la dependencia `web-tree-sitter`. `grade()` corrige los ejercicios de editor solo con `gradeYaml`.
  - Marca Miau: título, cabecera, favicon, clave de IndexedDB `miau-progress`, copias de progreso con `app: "miau"`.
  - Itinerarios: `fundamentos` (opcional: terminal y YAML), `git` y `github` (`content/tracks.json`).
  - `CLIS = ['git', 'gh']`. Spec de `git` (`content/cli-specs/git.json`), transcrita de git-scm.com. Comandos: `init`, `config` (`list`, `get`, `set`, `unset`, `edit`), `status`, `add`, `commit`, `log`, `diff`, `show`, `restore`, `reset`, `revert`, `rm`, `check-ignore`, `branch`, `switch`, `merge`.
  - Motor: flags cortos agrupados con valor al final (`-am "msg"`), como en getopt. Flags `shortOnly` para los que solo existen en forma corta (`git branch -D`, `git rm -r`).
  - Specs de `kubectl`, `terraform` y `ansible` como fixtures de test en `src/engine/__fixtures__/` (decisión M6).
  - Contenido piloto: `git/l1-que-es-git` (2 lecciones, 9 ejercicios: quiz, command y fill; 5 flashcards).
  - Tests (Vitest), lint, build y e2e (Playwright) en verde.
- **Fase 1 de contenido (Git nivel 1): completada.** `git/l1-historial` (3 lecciones, 11 ejercicios, 7 flashcards). El e2e ya usa el itinerario de Git (decisión M12). Glosario de Git: commit, staging area, working tree, hash, HEAD, secreto, diff.
- **Siguiente:** resto del temario según [TEMARIO.md](TEMARIO.md); la spec de `gh` al llegar al itinerario de GitHub.
- **Fase posterior:** simulador de repositorio Git con grafo de commits (decisión M3).

## Registro de avances
Un paso por entrada, del más antiguo al más reciente. Cada paso termina con los tests en verde y un commit.

| Fecha | Paso | Detalle |
|---|---|---|
| 2026-09-30 | Base de Miau | Copia adaptada de Kubernetete, piloto `git/l1-que-es-git`, documentación inicial. Commit `88d1a54`. |
| 2026-09-30 | Spec de git para `l1-historial` | Añadidos `diff`, `show`, `restore`, `reset`, `revert`, `rm` y `check-ignore`, consultados en git-scm.com (también `gitrevisions` para `HEAD~1`, `HEAD^` y `HEAD:ruta`). Script de formato compacto de specs: una línea por flag. |
| 2026-09-30 | Módulo `git/l1-historial` | Lecciones «Ver qué ha cambiado» (`diff`, `show`, `HEAD~n`), «Ignorar ficheros con .gitignore» y «Deshacer cambios» (`restore`, `reset`, `revert`, `commit --amend`). 11 ejercicios y 7 flashcards. Glosario de Git (7 términos). e2e pasado a `git/l1-que-es-git` → `git/l1-historial`. Tests del motor para `restore -S`, `reset --hard HEAD~1` y `rm -r`. Error detectado: un título de lección con `:` sin comillas rompe el frontmatter YAML (lo avisa el test de contenido). |
| 2026-09-30 | Motor: flags `shortOnly` + spec de ramas | Campo `shortOnly` en `CliFlagSchema` (exige `short`): el parser no acepta `--name`, el autocompletado solo ofrece `-X` y los errores lo muestran como `-X`. `git rm -r` pasa a `recursive` + `shortOnly`. Spec: `branch` (con `-D` y `-M`), `switch`, `merge`, consultados en git-scm.com. Tests del motor. |

## Heredado de Kubernetete (sin cambios)
- Motor de contenido: esquemas zod (`src/content/schema.ts`), parser de lecciones con las 7 secciones obligatorias (`lesson.ts`), `buildCatalog()` que acumula errores con la ruta del archivo (`loader.ts`).
- Carga bajo demanda: el catálogo lleva solo el frontmatter de las lecciones (`?lesson-meta`) y `{ id, type }` de los ejercicios (`?exercise-meta`); cuerpos, ejercicios completos y specs de CLI se descargan al abrirlos (`loadLessonBody`, `loadExercises`, `getCliSpec`), con `LoadBoundary` (Suspense + error boundary).
- Quizzes, exámenes (máx. 10 preguntas, sin pistas, mejor nota), desbloqueo por examen ≥ 80 %, XP y rachas (`src/engine/progress.ts`, `exam.ts`).
- Terminal simulada (`src/engine/cli.ts`, `Terminal.tsx`): tokenizador, corrección semántica de comandos, autocompletado con Tab, salida simulada. Rellenar huecos con Tab contextual.
- Editor YAML (CodeMirror 6, carga diferida) con aserciones (`src/engine/yamlAssert.ts`).
- Flashcards FSRS (`src/engine/srs.ts`) y página de repaso.
- Insignias calculadas (`src/engine/badges.ts`), exportar/importar progreso (`progressFile.ts`), glosario con tooltip (`glossaryPlugin.ts`).
- Persistencia: Zustand + `idb-keyval`, con respaldo en memoria si IndexedDB falla.

## Estructura
```
content/
  tracks.json                   # itinerarios
  glossary.json                 # término -> definición, módulo donde se introduce
  cli-specs/<cli>.json          # subcomandos, flags, descripción y URL de origen
  <itinerario>/<módulo>/
    module.json                 # título, resumen, nivel, orden, xp, prereqs
    lessons/NN-slug.md          # frontmatter + secciones obligatorias
    exercises.json              # quiz | command | fill | editor (con hints[] y solution)
    flashcards.json
src/
  content/                      # schema.ts (zod), loader.ts, lesson.ts, glossaryPlugin.ts
  engine/                       # lógica pura y testeable (cli, grade, yamlAssert, srs, progress, badges…)
  engine/__fixtures__/          # specs de CLI solo para tests del motor
  lib/                          # gradeExercise (carga specs y corrige)
  store/                        # Zustand + persist (IndexedDB)
  pages/                        # Dashboard, TrackMap, Module, Lesson, Exercise, Exam, Review, Settings
  components/                   # Layout, MarkdownView, Terminal, CodeEditor, ejercicios…
e2e/                            # Playwright sobre el build de producción
```

## Principios
- **La lógica vive en `src/engine/`** como funciones puras sin React, para testearla con Vitest.
- **El contenido es datos**: añadir un módulo no requiere tocar código.
- **Todo el contenido se valida** en los tests, que se ejecutan en CI antes de publicar.

## Rutas
| Ruta | Página |
|---|---|
| `/#/` | Dashboard: XP, racha, repaso de hoy, "Continúa por aquí" e insignias |
| `/#/itinerarios` | Mapa de itinerarios por nivel |
| `/#/modulo/:trackId/:slug` | Módulo: lecciones, nº de ejercicios y flashcards |
| `/#/modulo/:trackId/:slug/leccion/:lessonId` | Lector de lección con glosario |
| `/#/modulo/:trackId/:slug/ejercicio/:exerciseId` | Práctica con pistas y solución explicada |
| `/#/modulo/:trackId/:slug/examen` | Examen del módulo |
| `/#/repaso` | Repaso de flashcards (FSRS) |
| `/#/ajustes` | Exportar, importar y borrar progreso |

## Plantilla de lección (obligatoria)
1. Qué problema resuelve
2. Analogía
3. Concepto
4. Ejemplo (mínimo y comentado)
5. Errores comunes
6. En la entrevista
7. Resumen (3-5 viñetas)

## Convenciones del contenido
- La identidad de un módulo sale de su ruta: `content/<itinerario>/<módulo>/` → ref `"<itinerario>/<módulo>"`. `module.json` no lleva id.
- Las lecciones se ordenan por nombre de archivo (`01-…`, `02-…`); el id es el nombre sin `.md`.
- Los huecos de los ejercicios `fill` se escriben `{{id}}` en la plantilla y deben declararse en `blanks`. Si la plantilla empieza por una CLI con spec (`git …`), el loader comprueba que `solution.answer` sea un comando válido.
- Comandos y flags: solo los transcritos en `content/cli-specs/`, con la URL de origen en cada comando. Datos de producto (valores por defecto, versiones, límites de GitHub…): comprobados en la documentación oficial antes de escribirlos.
- En los ejercicios `command`, `sameCommand` compara los valores de los flags tal cual: el enunciado debe fijar el texto exacto (p. ej. el mensaje del commit). Las comillas simples y dobles son equivalentes.
- Glosario: el término se usa por primera vez en el módulo `introducedIn` de su itinerario (hay test). `trackOnly` limita el tooltip a su itinerario.
- Frontmatter de las lecciones: si el título lleva `:`, va entre comillas (`title: "Deshacer cambios: restore…"`).
- Bloques de código ```diff y ```gitignore: no tienen resaltado (se muestran como texto plano).

## Reglas de progreso
- XP: lección leída +5, ejercicio resuelto por primera vez +10, examen aprobado por primera vez + el `xp` del módulo (Fundamentos 50, el resto 100).
- Pistas y "ver solución" solo se cuentan como estadística; nunca cambian XP, nota, racha ni desbloqueo (hay test).
- Racha: cualquier actividad en un día local cuenta; saltarse un día la reinicia a 1.
- Desbloqueo: examen aprobado (≥ 80 %) del módulo anterior del mismo itinerario + prerequisitos explícitos. El primer módulo de cada itinerario está abierto.
- Flashcards: entran en el repaso cuando el módulo está desbloqueado y se han leído todas sus lecciones.
- Cambios de formato del progreso: subir `version` y añadir el paso en `migrateProgress` (con test).

## Especificaciones de CLI (`content/cli-specs/<cli>.json`)
- Solo lo que usa el temario, **transcrito de la documentación oficial**; cada comando lleva su `source`.
- Flags: `takesValue`, `values` (sugerencias) y `strict` (solo esos valores son válidos). El motor no modela flags con valor **opcional** (`--decorate[=short]`, `-u[<modo>]`): se declaran como booleanos o se omiten.
- Estilo `gnu`: `--largo` y `-c` corto; cortos agrupables (`-it`) y, como en getopt, el último del grupo puede llevar valor (`-am "msg"`).
- Para una CLI nueva: añadirla a `CLIS` en `schema.ts` y crear su JSON.
- Sinónimos que la documentación declara como tales (`git diff --staged` = `--cached`) son dos flags distintos para el motor: los ejercicios aceptan ambas formas en `accepted`.
- Flags que solo existen en forma corta (`git branch -D`, `git rm -r`): `"shortOnly": true`, con `short` y un `name` descriptivo que solo sirve de identificador interno. Los atajos como `-D` (= `--delete --force`) son un flag distinto para el motor: si un ejercicio debe aceptar ambas formas, van las dos en `accepted`.

## Notas para tests
- Los tests de interfaz usan el contenido piloto `git/l1-que-es-git` (`PILOT` en `components.test.tsx`) y aprueban antes los módulos anteriores del itinerario (`resetAndUnlockPilot`).
- Las acciones del store devuelven una Promise (por `persist`). Dentro de `act`, usar cuerpo con llaves: `act(() => { store.accion() })`.
- La corrección es asíncrona: tras "Comprobar", usar `await screen.findBy...`.
