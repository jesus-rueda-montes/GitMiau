# Decisiones de diseño

Registro de decisiones con su motivo. Las más recientes van al final de cada tabla.

## Decisiones de Miau

| # | Decisión | Motivo |
|---|---|---|
| M1 | Miau es una **app nueva copiada de Kubernetete y adaptada**, no un monorepo con motor compartido | Elegido por el usuario (sept. 2026). Arranque rápido; como contrapartida, las mejoras del motor hay que portarlas a mano entre las dos apps. |
| M2 | Temario completo: 6 módulos de Git + 12 de GitHub, más 2 de fundamentos opcionales (terminal y YAML) | Elegido por el usuario. Git va primero porque sin él no se entienden los Pull Requests ni Actions. |
| M3 | **Simulador de repositorio Git** (grafo de commits que cambia con commit, branch, merge, rebase) en una fase posterior | Elegido por el usuario. Primero la app con la terminal que valida comandos; el simulador es la pieza más compleja. |
| M4 | Sin repositorio real ni cuenta de GitHub: teoría, quizzes, comandos, rellenar huecos y editor YAML (workflows de Actions) con validación estática | Heredado del planteamiento de Kubernetete (SPA sin backend). |
| M5 | Se elimina el editor HCL (tree-sitter, `web-tree-sitter`, gramática vendorizada) | Miau no tiene contenido de Terraform. El editor queda solo para YAML. |
| M6 | Las specs de `kubectl`, `terraform` y `ansible` se conservan como **fixtures de test** (`src/engine/__fixtures__/`), no como contenido | Prueban funciones del motor que git todavía no usa (valueSets, forma TIPO/NOMBRE, `single-dash`, CLI sin subcomandos). Se validan con el esquema real cambiando el nombre de la CLI. |
| M7 | `CLIS = ['git', 'gh']`. Spec de `git` transcrita de git-scm.com (sept. 2026), solo con lo que usa el contenido | Regla de no inventar. `gh` se añadirá cuando llegue su contenido. |
| M8 | `git config` se enseña con los subcomandos modernos (`set`, `get`, `list`, `unset`, `edit`); la forma clásica (`git config --global clave valor`) se menciona como obsoleta | La documentación oficial marca la forma clásica como *deprecated*. La spec solo modela los subcomandos, así que los ejercicios usan la forma moderna. |
| M9 | Flags cortos agrupados con valor al final, como en getopt: `-am "msg"` = `-a -m "msg"` | `git commit -am` es habitual. Antes el motor lo rechazaba («no puede ir agrupado»). |
| M10 | La rama inicial se explica como «`master` o `main` según tu versión y configuración» y se practica con `git init -b main` | El valor por defecto depende de la versión de Git y de `init.defaultBranch`; no se afirma una versión concreta. |
| M11 | Progreso guardado en IndexedDB con la clave `miau-progress` y copias con `app: "miau"` | Separado de Kubernetete: una copia de una app no se puede importar en la otra. |
| M12 | El e2e aprueba `git/l1-que-es-git` y comprueba que se desbloquea `git/l1-historial` (antes usaba Fundamentos, mientras Git tenía un solo módulo) | El e2e necesita un módulo siguiente que se desbloquee; así prueba el itinerario principal. |
| M13 | `git/l1-historial` enseña `git restore` (y `restore --staged`) para deshacer cambios sin commit, no `git checkout -- fichero` | `restore` es el comando específico y documentado para esto; `checkout` mezcla ramas y ficheros. Se mencionará `checkout` al hablar de ramas. |
| M14 | `.gitignore` se enseña en el nivel 1, junto a deshacer cambios | Los secretos subidos por error son el fallo más grave de un principiante; conviene verlo antes de trabajar con remotos. |
| M15 | Campo `shortOnly` en los flags de las specs, en lugar de inventar un nombre largo o aceptar mayúsculas en `name` | `git branch -D` y `git rm -r` no tienen forma larga. Con un nombre largo inventado, el motor aceptaría `--delete-force`, que no existe; la regla es no inventar. |
| M16 | Sobre `git pull` con ramas divergidas se explica que falla y hay que elegir `--rebase` o `--no-rebase` (o configurar `pull.rebase`), sin citar versiones | La documentación actual dice que el modo por defecto es `--ff-only`; versiones anteriores daban un error pidiendo configurar `pull.rebase`/`pull.ff`. En ambos casos el alumno tiene que elegir, así que la explicación vale para las dos. |

## Heredadas de Kubernetete

Numeración original. Se han quitado las que solo aplicaban a Kubernetes, Terraform, Ansible o Cloud (editor HCL, specs de esas CLIs, temario de Kubernetete…).

| # | Decisión | Motivo |
|---|---|---|
| 1 | Web SPA estática, uso personal, sin IA | Elegido por el usuario: coste cero y sin backend. |
| 3 | React 19 + Vite 8 + TypeScript | Elección técnica: ecosistema maduro y build estático simple. |
| 4 | React Router con `HashRouter` | GitHub Pages no reescribe rutas; con hash no hace falta un 404.html como truco. |
| 5 | Tailwind CSS v4 (plugin `@tailwindcss/vite`) | Estilo rápido y consistente sin CSS a medida. |
| 6 | oxlint en lugar de ESLint | Es el linter que trae por defecto la plantilla actual de Vite. Es más rápido y basta para el proyecto. |
| 7 | Zustand + `idb-keyval` (IndexedDB) para el progreso, con exportar/importar JSON | Uso personal y sin backend. El JSON sirve de copia de seguridad y para cambiar de dispositivo. |
| 8 | Contenido en `content/` (Markdown + JSON) validado con zod | Revisable en git. Un error de contenido hace fallar los tests y el build. |
| 9 | Frontmatter parseado con `js-yaml` (no `gray-matter`) | `gray-matter` depende de APIs de Node (Buffer) y no funciona bien en el navegador. |
| 10 | Flashcards con `ts-fsrs` | FSRS es el algoritmo actual de Anki. |
| 11 | Progresión por módulos desbloqueables (examen ≥ 80%) con XP, rachas e insignias | Elegido por el usuario. |
| 12 | Pistas progresivas (1-3) sin penalización; solución explicada tras fallar | Petición del usuario. |
| 15 | Despliegue en GitHub Pages con GitHub Actions (`BASE_PATH=/<repo>/`) | Elegido por el usuario. |
| 16 | La ref de un módulo se deriva de su carpeta, no de un campo `id` | Evita que el id y la carpeta se desincronicen. |
| 17 | Validación con `z.strictObject` | Un campo mal escrito (p. ej. `hint` en vez de `hints`) es un error, no se ignora en silencio. |
| 19 | Lógica de progreso como funciones puras en `src/engine/progress.ts`; el store solo las envuelve | Se testea sin React ni IndexedDB. |
| 20 | Si IndexedDB falla, el progreso vive en memoria sin romper la app | Modo privado de algunos navegadores y tests en jsdom. |
| 21 | Glosario: se marca solo la primera aparición de cada término por lección, con plural simple | Marcar todas las apariciones satura la lectura. |
| 22 | Módulos bloqueados: se ve su página con el motivo, pero no se accede a lecciones, ejercicios ni examen | Da contexto de qué viene sin saltarse la progresión. |
| 23 | Examen sin límite de intentos, guarda la mejor nota | Aprendizaje sin castigo, coherente con las pistas gratuitas. |
| 25 | Corrección de comandos semántica (parseo + comparación), no por texto | Así se aceptan `-n`/`--namespace`, `po`/`pods`, `-it`/`-i -t` y cualquier orden de flags, como en la realidad. |
| 26 | Tab como en bash: completa lo inequívoco; si no avanza, muestra la lista; con la lista abierta, Tab elige | Es el comportamiento que el usuario encontrará en una terminal real y en la CKA. |
| 27 | Botón "Tab" visible en la terminal | Los teclados de móvil no tienen tecla Tab. |
| 29 | **CodeMirror 6 en lugar de Monaco** (cambio respecto al plan) | Monaco no soporta oficialmente navegadores móviles y pesa varios MB; CodeMirror funciona en táctil, tiene modo YAML y pesa ~25 kB gzip cargado bajo demanda. |
| 30 | Resaltado de las lecciones con los parsers de CodeMirror (`@lezer/highlight`), no shiki | Mismo aspecto que el editor y sin otra dependencia pesada. |
| 31 | Validación YAML por aserciones, sin JSON Schema de Kubernetes (ajv) por ahora | Las aserciones dan mensajes pedagógicos concretos; el esquema completo puede añadirse después si hace falta. |
| 32 | Un solo documento YAML por ejercicio | Simplicidad; los multi-documento (`---`) se añadirán cuando un ejercicio lo necesite. |
| 33 | Errores de js-yaml traducidos al español (los más frecuentes) | Explicaciones claras; si aparece uno no traducido se muestra el original. |
| 39 | FSRS con los parámetros por defecto de ts-fsrs y sin fuzz | Probados y estándar; sin fuzz los intervalos son predecibles y testeables. Se pueden ajustar más adelante. |
| 40 | Las tarjetas entran en el repaso al terminar todas las lecciones del módulo | Primero se aprende, luego se repasa (del plan). |
| 41 | Sin límite diario de tarjetas nuevas por ahora | Los mazos son pequeños; si crecen, añadir un tope (como Anki) será un cambio pequeño. |
| 42 | Migración de progreso versionada (`migrateProgress`) | Cambiar el formato no debe borrar el progreso del usuario. |
| 43 | Insignias calculadas a partir del progreso, no almacenadas | No pueden desincronizarse y no requieren migraciones. |
| 44 | Ninguna insignia premia no usar pistas | Sería una penalización encubierta; contradice "pistas sin coste". |
| 45 | Copia de progreso en JSON con `app`, `exportedAt` y `progress` versionado | Validable, migrable y legible; permite pasar el progreso entre dispositivos sin backend. |
| 49 | Operador `hasKeys` y claves entre comillas en las rutas | Ejercicios reales los necesitan (inventarios YAML, annotations, módulos FQCN) sin comprobaciones ambiguas. |
| 51 | El dev server usa `PORT` si existe (`autoPort` en `.claude/launch.json`) | Otra sesión ocupaba el 5173; la app no depende de un puerto concreto. |
| 52 | Cuerpos de las lecciones bajo demanda (plugin `?lesson-meta` + `import.meta.glob` perezoso); el resto del contenido sigue en el bundle inicial | Las lecciones son lo que más crece con el temario. Módulos, ejercicios y flashcards hacen falta al arrancar (desbloqueo, repaso, insignias). Tras el cambio, el bundle principal pasó de 704 a 598 kB. |
| 53 | Ejercicios completos y especificaciones de CLI también bajo demanda, aprobado por el usuario (plugin `?exercise-meta`: el índice solo lleva id y tipo; `loadExercises`/`loadCliSpec`) | Con el temario completo el chunk principal llegó a 1,12 MB (313 kB gzip). Las listas, contadores, insignias y el desbloqueo solo necesitan id y tipo. Tras el cambio: 616 kB (188 kB gzip). Las flashcards siguen en el bundle inicial porque el contador de repaso de la barra de navegación las necesita. |
| 55 | Test e2e con Playwright (solo Chromium) sobre el build de producción, en CI antes del build de Pages | Prueba los chunks bajo demanda reales y la persistencia en IndexedDB; un solo navegador mantiene el CI rápido. |

## Pendiente de decidir
- **Versiones de las GitHub Actions** del workflow (`checkout@v4`, `upload-pages-artifact@v3`, `deploy-pages@v4`): comprobar si hay versiones mayores nuevas al crear el repo en GitHub.
- **Simulador de repositorio Git** (decisión M3): modelo de datos, qué comandos simula y cómo se dibuja el grafo. Se decidirá con el usuario al empezar esa fase.
