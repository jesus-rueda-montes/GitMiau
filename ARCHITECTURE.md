# Arquitectura de Miau

Miau es una copia adaptada de Kubernetete (decisión M1 de [DECISIONS.md](DECISIONS.md)): comparte el motor y cambia el contenido. Esta página describe el estado de Miau; las decisiones heredadas siguen en DECISIONS.md.

## Estado actual
- **Fase 0 (base adaptada): completada.**
  - Copia de Kubernetete sin su contenido (Cloud, Kubernetes, Terraform, Ansible y los fundamentos de redes y Docker).
  - Eliminado el editor HCL: `src/engine/hcl.ts`, `src/lib/hclLoader.ts`, `src/components/code/hclMode.ts`, `src/vendor/tree-sitter-hcl/` y la dependencia `web-tree-sitter`. `grade()` corrige los ejercicios de editor solo con `gradeYaml`.
  - Marca Miau: título, cabecera, favicon, clave de IndexedDB `miau-progress`, copias de progreso con `app: "miau"`.
  - Itinerarios: `fundamentos` (opcional: terminal y YAML), `git` y `github` (`content/tracks.json`).
  - `CLIS = ['git', 'gh']`. Spec de `git` (`content/cli-specs/git.json`), transcrita de git-scm.com. Comandos: `init`, `config` (`list`, `get`, `set`, `unset`, `edit`), `status`, `add`, `commit`, `log`, `diff`, `show`, `restore`, `reset`, `revert`, `rm`, `check-ignore`, `branch`, `switch`, `merge`, `clone`, `remote` (`add`, `rename`, `remove`/`rm`, `set-url`, `get-url`, `show`, `prune`), `fetch`, `pull`, `push`, `rebase`, `stash` (con y sin subcomando), `cherry-pick`, `tag`, `reflog`, `bisect`.
  - Motor: flags cortos agrupados con valor al final (`-am "msg"`), como en getopt. Flags `shortOnly` para los que solo existen en forma corta (`git branch -D`, `git rm -r`).
  - Specs de `kubectl`, `terraform` y `ansible` como fixtures de test en `src/engine/__fixtures__/` (decisión M6).
  - Contenido piloto: `git/l1-que-es-git` (2 lecciones, 9 ejercicios: quiz, command y fill; 5 flashcards).
  - Tests (Vitest), lint, build y e2e (Playwright) en verde.
- **Fase 1 de contenido (Git nivel 1): completada.** `git/l1-historial` (3 lecciones, 11 ejercicios, 7 flashcards). El e2e ya usa el itinerario de Git (decisión M12). Glosario de Git: commit, staging area, working tree, hash, HEAD, secreto, diff.
- **Git nivel 2: completado.** `git/l2-ramas` (2 lecciones, 10 ejercicios, 6 flashcards) y `git/l2-remotos` (2 lecciones, 10 ejercicios, 6 flashcards).
- **Itinerario de Git: completado** (6 módulos). Nivel 3: `git/l3-rebase` (2 lecciones, 10 ejercicios, 6 flashcards) y `git/l3-herramientas` (3 lecciones, 11 ejercicios, 6 flashcards).
- **Itinerario de GitHub: completado** (12 módulos). `github/l1-repos-cuenta` ✅ (2 lecciones, 11 ejercicios, 6 flashcards; requiere `git/l2-remotos`). `github/l2-pull-requests` ✅ (2 lecciones, 11 ejercicios, 6 flashcards). `github/l2-issues-projects` ✅ (2 lecciones, 10 ejercicios con el primer editor YAML de GitHub, 6 flashcards). `github/l2-flujos-trabajo` ✅ (2 lecciones, 10 ejercicios, 6 flashcards). **Nivel 2 de GitHub completado.** `github/l3-actions-basico` ✅ (2 lecciones, 12 ejercicios con 2 editores de workflow, 6 flashcards). `github/l3-actions-avanzado` ✅ (3 lecciones, 12 ejercicios con 2 editores, 6 flashcards). `github/l3-proteccion` ✅ (2 lecciones, 11 ejercicios, 6 flashcards). **Nivel 3 de GitHub completado.** `github/l4-seguridad` ✅ (3 lecciones, 14 ejercicios con un editor de `dependabot.yml`, 8 flashcards). `github/l4-releases-packages` ✅ (2 lecciones, 13 ejercicios con 2 editores: `release.yml` y workflow de publicación, 7 flashcards). `github/l4-organizaciones` ✅ (2 lecciones, 13 ejercicios, 7 flashcards). **Nivel 4 de GitHub completado.** `github/l5-troubleshooting` ✅ (2 lecciones, 14 ejercicios de escenarios y comandos de git y gh, 7 flashcards). `github/l5-entrevista` ✅ (2 lecciones, 12 ejercicios con un editor de CI, 7 flashcards). **Temario completo: 18 módulos + 2 de fundamentos.** Siguiente fase: simulador de repositorio Git (decisión M3), pendiente de diseñar con el usuario.
- **Repositorio:** https://github.com/jesus-rueda-montes/GitMiau (público). Cada paso se sube con `git push` al terminar.
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
| 2026-09-30 | Módulo `git/l2-ramas` | Lecciones «Qué es una rama y cómo moverse entre ellas» (`branch`, `switch`, `-c`, `-`, `-d`/`-D`, detached HEAD, `checkout` como forma clásica) y «Merge y conflictos» (fast-forward, tres vías, `--no-ff`, `--ff-only`, `--squash`, marcas de conflicto, `--continue`, `--abort`). 10 ejercicios (uno multi), 6 flashcards. Glosario: rama, merge, fast-forward, conflicto, detached HEAD. Error detectado por el validador: los ids de flashcards no admiten mayúsculas. |
| 2026-09-30 | Módulo `git/l2-remotos` | Spec: `clone`, `remote` (con subcomandos y alias `rm`), `fetch`, `pull`, `push`, consultados en git-scm.com. Lecciones «Remotos, clone, fetch y pull» y «Subir cambios con push» (upstream, push rechazado, `--force-with-lease`, HTTPS frente a SSH). 10 ejercicios, 6 flashcards. Glosario: remoto, upstream, token. Decisión M16 sobre el comportamiento por defecto de `git pull`. |
| 2026-09-30 | Publicación en GitHub | Remoto `origin` = `https://github.com/jesus-rueda-montes/GitMiau.git` (repo público creado por el usuario). Primer `git push -u origin main`. El workflow de Pages se ejecuta en cada push; hay que activar *Settings → Pages → Source: GitHub Actions* para que el despliegue funcione. |
| 2026-09-30 | Spec de git para el nivel 3 | `rebase`, `stash`, `cherry-pick`, `tag`, `reflog`, `bisect`, consultados en git-scm.com. `stash` tiene flags propios y subcomandos (`git stash -u` y `git stash push -u` valen). `reflog` sin `args` en la raíz para que `show`, `list`… se reconozcan como subcomandos. Flags solo cortos: `cherry-pick -x`, `tag -n`. Alias: `bisect new`/`old`, `bisect view`. |
| 2026-09-30 | Módulo `git/l3-rebase` | Spec: `git commit --fixup` y `--squash`. Lecciones «Rebase frente a merge» (reaplicar, hashes nuevos, conflictos, ours/theirs invertidos, regla de oro, `--force-with-lease`) y «Rebase interactivo» (todo list, órdenes, `--autosquash`). 10 ejercicios, 6 flashcards. Glosario: rebase (presentado en `l2-remotos`, donde aparece por primera vez), todo list. En CI, el run de un push anterior aparece como *cancelled* por `cancel-in-progress`: es lo esperado. |
| 2026-09-30 | Módulo `git/l3-herramientas` | Lecciones «Guardar trabajo a medias con stash», «Cherry-pick y tags» y «Recuperar con reflog y encontrar errores con bisect». 11 ejercicios, 6 flashcards. Glosario: stash (presentado en `l2-ramas`), tag (en `l2-remotos`), reflog, búsqueda binaria. |
| 2026-09-30 | Estado de CI en GitHub | En el run de `3ad8b14`, el job `build` (lint, tests, e2e, build) pasa; el job `deploy` falla con 404 porque **GitHub Pages no está activado** en el repo. Aviso: `actions/*@v4` usan Node.js 20, que GitHub ha declarado obsoleto (ver «Pendiente de decidir» en DECISIONS.md). |
| 2026-09-30 | Spec de `gh` | `content/cli-specs/gh.json`, transcrita de cli.github.com/manual: `auth` (`login`, `status`, `logout`, `refresh`, `setup-git`, `switch`, `token`) y `repo` (`create`, `clone`, `fork`, `view`). `--git-protocol` con valores estrictos `ssh`/`https`. Decisión M18: el itinerario de GitHub combina interfaz web (quizzes) y `gh` (comandos). Limitación conocida: el motor solo exige subcomando en la raíz (`gh repo` a secas se acepta como sintaxis, aunque nunca coincide con una respuesta). |
| 2026-09-30 | Módulo `github/l1-repos-cuenta` | Lecciones «Repositorios en GitHub» (visibilidad, README, licencias, fork, origin/upstream) y «Autenticación y la CLI gh» (tokens fine-grained/classic, SSH con ed25519, `gh auth`, `gh repo`). Datos comprobados en docs.github.com (licencias, tokens, SSH, forks). 11 ejercicios: primeros con `cli: "gh"`; `ssh-keygen` se practica como fill (no es una CLI con spec). Glosario: fork, README, licencia, clave SSH. |
| 2026-09-30 | Módulo `github/l2-pull-requests` | Spec de `gh pr`: `create`, `list` (`ls`, `--state` estricto), `view`, `checkout` (`co`), `diff`, `status`, `checks`, `review`, `merge` (incl. `--auto`), `ready`, `close`, `reopen`, `comment`, todos con `-R/--repo`; de cli.github.com/manual. Datos de docs.github.com: métodos de merge, tipos de revisión, palabras clave para cerrar issues (solo hacia la rama por defecto). Lecciones «Abrir un Pull Request» y «Revisar y fusionar un Pull Request». 11 ejercicios, 6 flashcards. Glosario: Pull Request (presentado en `l1-repos-cuenta`), draft, squash, auto-merge. |
| 2026-09-30 | Módulo `github/l2-issues-projects` | Spec de `gh issue`: `create` (`new`), `list` (`ls`, `--state` estricto), `view`, `status`, `close` (`--reason` estricto: completed, «not planned», duplicate; `--duplicate-of`), `reopen`, `comment`, `edit`, `develop`. Datos de docs.github.com: etiquetas por defecto, milestones, issue forms (`name`, `description`, `body`), Projects (layouts, campos, automatizaciones). Lecciones «Issues, labels, milestones y plantillas» y «GitHub Projects y de la issue al PR». 10 ejercicios, entre ellos un **editor YAML de issue form**. Glosario: issue (presentado en `l2-pull-requests`), label, milestone, issue form. Limitación detectada: un flag repetido (`--label a --label b`) se queda con el último valor en el motor; los ejercicios no usan flags repetidos. |
| 2026-09-30 | Módulo `github/l2-flujos-trabajo` | Spec: `gh repo sync` (`--branch`, `--source`, `--force`). Fuentes: docs.github.com (GitHub flow), artículo original de Git Flow en nvie.com (incluida la nota de 2020 del autor recomendando flujos simples para la entrega continua) y trunkbaseddevelopment.com. Lecciones «GitHub Flow, Git Flow y trunk-based» y «Contribuir a open source con fork y PR». 10 ejercicios, 6 flashcards. Glosario: feature flag, entrega continua, trunk. |
| 2026-09-30 | Módulo `github/l3-actions-basico` | Spec: `gh run` (`list`/`ls`, `view` con `--log-failed`, `watch`, `rerun --failed`, `cancel`, `download`, `delete`) y `gh workflow` (`list`, `view`, `enable`, `disable`, `run` con `--ref` y `-f/-F`). Datos de docs.github.com: sintaxis de workflows, cron en UTC con mínimo de 5 minutos, timeout por defecto de 360 minutos, runners gratuitos en repos públicos, `GITHUB_TOKEN` (permisos y que sus eventos no disparan workflows), fijar actions a SHA e inyección de scripts. Los ejemplos usan `actions/checkout@v7` y `actions/setup-node@v7` (versiones de sus README a fecha de hoy); las aserciones de los editores aceptan cualquier versión (`matches ^actions/checkout@`). Decisión: sin requisito de `fundamentos/f0-yaml`; la lección lo recomienda (M19). Glosario: workflow (presentado en `l1-repos-cuenta`), runner, job, step, CI/CD, cron. |
| 2026-09-30 | Módulo `github/l3-actions-avanzado` | Datos de docs.github.com: matrix (un job por combinación, máx. 256, `fail-fast` true por defecto: confirmado buscando en el HTML de la página de sintaxis, que es demasiado larga para leerla de una vez), cache (10 GB por repo, 7 días sin uso, `restore-keys`), artifacts (90 días por defecto), secrets (no llegan a PRs desde forks salvo el GITHUB_TOKEN, no se usan en `if:`), `vars`, environments (revisores, wait timer, ramas), `concurrency`, reusable workflows (`workflow_call`, `secrets: inherit`, 10 niveles) y OIDC (`id-token: write`, política de confianza por `sub`). Versiones de los README: `cache@v6`, `upload-artifact@v7`, `download-artifact@v8`. La action de AWS aparece fijada a `<sha>` en vez de inventar una versión. Lecciones «Matrix, cache y artifacts», «Secrets, variables y environments» y «Reusable workflows y OIDC». 12 ejercicios (editores: matrix y environment + secret + concurrency). Glosario: matrix, artifact (presentado en `l3-actions-basico`), environment, OIDC, JWT. |
| 2026-09-30 | Módulo `github/l3-proteccion` | Spec: `gh ruleset` (alias `rs`: `list`/`ls`, `view`, `check`). Datos de docs.github.com: ajustes de branch protection (force push y borrado bloqueados por defecto), rulesets (se agregan y gana lo más restrictivo, Active/Disabled, bypass list), merge queue (evento `merge_group`) y CODEOWNERS (`.github/` → raíz → `docs/`, gana la última coincidencia, basta un propietario). Lecciones «Branch protection rules y rulesets» y «CODEOWNERS». 11 ejercicios (editor: añadir `merge_group`). Glosario: status check, ruleset, merge queue, CODEOWNERS. Se quitó la salida simulada de `gh ruleset check` porque no se pudo verificar su formato. |
| 2026-09-30 | Aviso de tamaño del bundle | Con el contenido de 13 módulos, el chunk principal pasa a 502 kB (154 kB gzip) y Vite avisa de que supera 500 kB. No es un error: Kubernetete tiene el mismo aviso con 639 kB. Crece porque módulos, flashcards y glosario van en el bundle inicial (decisión heredada 53). El usuario decide aceptarlo (M21). |
| 2026-09-30 | Módulo `github/l4-seguridad` | Spec: `gh secret` (`set`, `list`/`ls`, `delete`/`remove`; `--app` estricto: actions, agents, codespaces, dependabot). Datos de docs.github.com: las tres funciones de Dependabot y `dependabot.yml` (`version: 2`, claves obligatorias, un PR por dependencia, límite de 5 PRs de version updates), code scanning (CodeQL, default/advanced setup, SARIF), secret scanning (toda la historia, issues, PRs, wikis, gists), push protection (niveles de usuario y repo, 3 motivos de bypass; el ejemplo de salida es el de la documentación), tokens fine-grained frente a classic y sus limitaciones, GitHub Apps (tokens de instalación de 1 hora). Lecciones «Dependencias seguras con Dependabot», «Code scanning, secret scanning y push protection» y «Tokens, GitHub Apps y secrets». Glosario: Dependabot, dependency graph, CodeQL, SARIF, push protection, GitHub App (desde `l3-proteccion`) y mínimo privilegio (desde `l1-repos-cuenta`). Test nuevo del motor para `gh secret`. |
| 2026-09-30 | Módulo `github/l4-releases-packages` | Spec: `gh release` (`create`/`new`, `list`/`ls`, `view`, `download` con `--archive` estricto zip/tar.gz, `upload`, `delete`; `--order` estricto asc/desc). Datos de semver.org (MAJOR.MINOR.PATCH, reinicio a 0, `0.y.z`, pre-release con guion y precedencia, metadatos con `+`, el prefijo `v` no es SemVer) y de docs.github.com: releases (tag + notas + assets + zip/tar.gz automáticos, permiso de escritura), notas generadas y `.github/release.yml`, GitHub Packages (registros, gratis para paquetes públicos, solo tokens classic fuera de Actions, `GITHUB_TOKEN` con `packages: write`), `ghcr.io` (formato del nombre, privado por defecto, `org.opencontainers.image.source`). El workflow de ejemplo usa `docker login`/`build`/`push` en `run`; la lección cita que la documentación usa las actions de Docker fijadas a un SHA. Glosario: SemVer, pre-release, changelog, GitHub Packages, Container registry (el término «release» se descartó porque ya aparecía en módulos anteriores con otro sentido). |
| 2026-09-30 | Módulo `github/l4-organizaciones` | Spec: `gh api` (endpoint como argumento, sin subcomandos; `-X`, `-f`, `-F`, `--paginate`, `--jq`…). Datos de docs.github.com: roles de organización (al menos dos owners), roles de repo Read/Triage/Write/Maintain/Admin con su uso recomendado, permisos base, teams (visibles/secretos, anidados heredan permisos), REST frente a GraphQL, rate limits (60/h, 5.000/h, 1.000/h por repo con `GITHUB_TOKEN`; 403 o 429), webhooks (dónde se crean, frente a polling, secret y `X-Hub-Signature-256` con comparación en tiempo constante, 2XX en 10 s, `X-GitHub-Delivery`). Primer ejercicio `fill` de GitHub (orden de los roles). Glosario: team, outside collaborator, API REST, rate limit; «organización» y GraphQL se presentan en `l2-issues-projects` y «webhook» en `l4-seguridad`, donde se usan por primera vez. |
| 2026-09-30 | Módulo `github/l5-troubleshooting` | Sin cambios en las specs: reúne rescates ya enseñados (detached HEAD, push rechazado, reflog, commit en la rama equivocada, revert, `--abort`, stash) en una tabla de síntomas. Datos nuevos de docs.github.com: `ACTIONS_STEP_DEBUG`/`ACTIONS_RUNNER_DEBUG` (secret o variable; depuración en un re-run sin tocar ajustes), eventos del `GITHUB_TOKEN` que no lanzan workflows, `workflow_dispatch` solo desde la rama por defecto, `schedule` desactivado tras 60 días sin actividad en repos públicos, forks sin secrets y con `GITHUB_TOKEN` de solo lectura, fin de la autenticación con contraseña para Git. Sin términos nuevos de glosario. |
| 2026-09-30 | Módulo `github/l5-entrevista` | Mismo formato que las entrevistas de Kubernetete: «Las preguntas que siempre salen» (Git, GitHub y colaboración, CI/CD y seguridad, con la estructura definición → para qué → cómo → matiz) y «Escenarios prácticos» (método de 5 pasos y 5 escenarios: `main` roto, secreto filtrado, de la issue a producción, monorepo lento, releases de una librería). Todo el contenido reutiliza datos ya verificados en módulos anteriores; sin cambios en las specs ni en el glosario. Editor: workflow de CI con `merge_group`, `permissions` y `concurrency`. **Con este módulo se completa el temario.** |

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
- El campo `output` de los ejercicios `command` es una salida **ilustrativa**. Solo se incluye cuando se conoce el formato real del comando; si no, se omite.
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
- Flags: `takesValue`, `values` (sugerencias) y `strict` (solo esos valores son válidos). El motor no modela flags con valor **opcional** (`--decorate[=short]`, `-u[<modo>]`, `--rebase[=merges]`, `--force-with-lease[=ref:hash]`): se declaran como booleanos (la forma con `=valor` da error) o se omiten.
- Un comando con `args` en su raíz **no** reconoce subcomandos (el primer token se toma como posicional). Si un comando tiene subcomandos y también se usa sin ellos (`git stash`, `git reflog`), no se le ponen `args` en la raíz.
- Flags repetibles (`gh issue create --label a --label b`): el motor guarda solo el último valor, así que los ejercicios no deben depender de repetirlos.
- Estilo `gnu`: `--largo` y `-c` corto; cortos agrupables (`-it`) y, como en getopt, el último del grupo puede llevar valor (`-am "msg"`).
- Para una CLI nueva: añadirla a `CLIS` en `schema.ts` y crear su JSON.
- Sinónimos que la documentación declara como tales (`git diff --staged` = `--cached`) son dos flags distintos para el motor: los ejercicios aceptan ambas formas en `accepted`.
- Flags que solo existen en forma corta (`git branch -D`, `git rm -r`): `"shortOnly": true`, con `short` y un `name` descriptivo que solo sirve de identificador interno. Los atajos como `-D` (= `--delete --force`) son un flag distinto para el motor: si un ejercicio debe aceptar ambas formas, van las dos en `accepted`.

## Notas para tests
- Los tests de interfaz usan el contenido piloto `git/l1-que-es-git` (`PILOT` en `components.test.tsx`) y aprueban antes los módulos anteriores del itinerario (`resetAndUnlockPilot`).
- Las acciones del store devuelven una Promise (por `persist`). Dentro de `act`, usar cuerpo con llaves: `act(() => { store.accion() })`.
- La corrección es asíncrona: tras "Comprobar", usar `await screen.findBy...`.
