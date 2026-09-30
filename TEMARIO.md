# Temario de Miau

Plan completo del contenido: qué módulos hay en cada itinerario y nivel, y qué cubre cada uno. Estado: ✅ escrito · ⬜ pendiente.

- **Orden dentro de un itinerario:** nivel y después `order`. Cada módulo se desbloquea al aprobar el anterior del mismo itinerario.
- **Requisitos cruzados:** módulos de otros itinerarios que hay que aprobar antes; se indican con «requiere».
- **Tamaño orientativo:** de 1 a 3 lecciones, de 4 a 8 ejercicios y de 4 a 8 flashcards por módulo.
- **Referencia de nivel:**
  - Git: documentación oficial (git-scm.com) y el libro *Pro Git*.
  - GitHub: certificaciones GitHub Foundations y GitHub Actions, y la documentación oficial (docs.github.com).

## Nivel 0 · Fundamentos (opcional)

| Módulo | Contenido |
|---|---|
| ✅ `f0-terminal-linux` | Terminal y sistema de ficheros, rutas, permisos (`chmod`), procesos, variables de entorno y tuberías. |
| ✅ `f0-yaml` | Sintaxis YAML: mapas, listas, tipos, indentación, strings multilínea y errores típicos. JSON como subconjunto. |

## Git (el motor local)

| Nivel | Módulo | Contenido |
|---|---|---|
| 1 | ✅ `l1-que-es-git` | Control de versiones, Git frente a GitHub, working tree, staging area y repositorio, commit y hash; `config`, `init`, `status`, `add`, `commit`, `log`. |
| 1 | ✅ `l1-historial` | `diff` (y `--staged`), `show`, `.gitignore`, deshacer cambios: `restore`, `restore --staged`, `reset` (soft, mixed, hard) y `revert`. |
| 2 | ✅ `l2-ramas` | Qué es una rama (un puntero), HEAD, `branch`, `switch`, merge fast-forward y de tres vías, conflictos y cómo resolverlos. |
| 2 | ✅ `l2-remotos` | `clone`, `remote`, `fetch` frente a `pull`, `push`, ramas de seguimiento (upstream), SSH frente a HTTPS. |
| 3 | ✅ `l3-rebase` | `rebase`, rebase interactivo (squash, reword, fixup), reescribir la historia y la regla de no reescribir lo publicado; `push --force-with-lease`. |
| 3 | ✅ `l3-herramientas` | `stash`, `cherry-pick`, `tag` (ligeros y anotados), `reflog` para recuperar commits y `bisect` para encontrar el commit que rompió algo. |

## GitHub (la plataforma)

| Nivel | Módulo | Contenido |
|---|---|---|
| 1 | ✅ `l1-repos-cuenta` | Repositorios públicos y privados, README, licencias, forks y stars; autenticación (SSH, tokens) y la CLI `gh`. Requiere `git/l2-remotos`. |
| 2 | ✅ `l2-pull-requests` | Flujo de un Pull Request, draft, reviews y comentarios, estrategias de merge (merge commit, squash, rebase), `gh pr`. |
| 2 | ✅ `l2-issues-projects` | Issues, labels, milestones, plantillas, GitHub Projects y cerrar issues desde commits o PRs. |
| 2 | ✅ `l2-flujos-trabajo` | GitHub Flow, Git Flow, trunk-based development y fork & PR en proyectos open source. |
| 3 | ✅ `l3-actions-basico` | Workflows, events, jobs, steps, runners, actions del Marketplace y `GITHUB_TOKEN`. |
| 3 | ✅ `l3-actions-avanzado` | Matrix, cache, artifacts, secrets y variables, environments, reusable workflows y OIDC hacia la nube. |
| 3 | ✅ `l3-proteccion` | Branch protection y rulesets, CODEOWNERS, required reviews y required status checks. |
| 4 | ✅ `l4-seguridad` | Dependabot, code scanning, secret scanning y push protection, tokens fine-grained y GitHub Apps. |
| 4 | ⬜ `l4-releases-packages` | Tags y releases, SemVer, changelogs, GitHub Packages y GitHub Container Registry (GHCR). |
| 4 | ⬜ `l4-organizaciones` | Organizaciones, teams, roles y permisos; nociones de la API REST/GraphQL y webhooks. |
| 5 | ⬜ `l5-troubleshooting` | Detached HEAD, push rechazado, historia «perdida» (reflog), secretos subidos por error y workflows que fallan. |
| 5 | ⬜ `l5-entrevista` | Preguntas de entrevista de ambos itinerarios (merge frente a rebase, estrategias de ramas, CI/CD) y escenarios. |

> Los contenidos de cada módulo pendiente son orientativos. Antes de escribirlo se comprueba en la documentación oficial qué comandos y opciones existen (y cuáles están obsoletos).
