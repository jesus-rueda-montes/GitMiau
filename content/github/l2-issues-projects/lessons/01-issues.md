---
title: Issues, labels, milestones y plantillas
minutes: 11
---

## Qué problema resuelve

Errores que alguien encuentra, ideas de mejora, tareas pendientes… Si viven en correos, chats o en la cabeza de alguien, se pierden. Las **issues** son el sitio común para **registrar y discutir el trabajo** de un repositorio, enlazado con el código que lo resuelve.

## Analogía

Las issues son el **tablón de incidencias de un taller**: cada ficha describe un problema, lleva etiquetas de colores (urgente, eléctrico, chapa), tiene un mecánico asignado y se agrupa por entregas («coches para el viernes»). Cuando el arreglo está hecho, la ficha se cierra con referencia a la reparación.

## Concepto

Una **issue** tiene título, descripción (en Markdown), comentarios y metadatos:

- **Assignees**: quién se encarga.
- **Labels**: etiquetas para clasificar. Cada repositorio nuevo trae unas por defecto: `bug`, `documentation`, `duplicate`, `enhancement`, `good first issue`, `help wanted`, `invalid`, `question`, `wontfix` y `accessibility`. Las issues con `good first issue` aparecen en la página *contribute* del repositorio, pensada para quien quiere empezar a colaborar.
- **Milestones**: agrupan issues y PRs de un objetivo (por ejemplo, «v2.0»), con fecha límite y porcentaje de progreso.

**Referencias.** En cualquier texto de GitHub, `#42` enlaza la issue o el PR 42 y `@ana` menciona a una persona (le llega una notificación). Como viste en los PRs, `Closes #42` en la descripción de un PR hacia la rama por defecto cierra la issue al fusionarlo.

**Cerrar una issue** tiene un motivo: *completed* (hecha), *not planned* (no se hará) o *duplicate* (duplicada de otra).

**Plantillas.** Para que las issues lleguen con la información necesaria, se definen plantillas en **`.github/ISSUE_TEMPLATE/`**:

- ficheros `.md` con frontmatter YAML (plantillas de texto);
- ficheros `.yml` de **issue forms**: formularios con campos, algunos obligatorios.

Un issue form necesita `name`, `description` y `body` (la lista de campos). Opcionalmente, `title`, `labels`, `assignees`… Con `config.yml` en la misma carpeta se puede desactivar la issue en blanco (`blank_issues_enabled: false`) y añadir enlaces de contacto. Para los PRs existe `pull_request_template.md`.

```yaml
# .github/ISSUE_TEMPLATE/bug.yml
name: Informe de error
description: Algo no funciona como debería
title: "[Bug]: "
labels: ["bug"]
body:
  - type: textarea
    id: que-paso
    attributes:
      label: ¿Qué ha pasado?
      placeholder: Describe el error y cómo reproducirlo
    validations:
      required: true
```

**Con `gh`:**

| Comando | Qué hace |
|---|---|
| `gh issue create --title "…" --label bug` | Crea una issue (alias `new`) |
| `gh issue list --label bug --state all` | Lista (alias `ls`); `--state` open, closed o all |
| `gh issue list --assignee @me` | Mis issues |
| `gh issue view 42 --web` | Abre la issue en el navegador |
| `gh issue close 42 --reason "not planned"` | Cierra con motivo |
| `gh issue status` | Tus issues: asignadas, menciones y abiertas por ti |

## Ejemplo

```bash
gh issue create --title "El login falla con emails en mayúsculas" \
  --body "Pasos: 1) … 2) …" --label bug --assignee @me
# https://github.com/ada/tienda/issues/42

gh issue list --label bug
gh issue close 17 --reason duplicate --comment "Es la misma que la #12"
```

## Errores comunes

- **Issues sin pasos para reproducir** («no funciona»). Usa plantillas o issue forms con campos obligatorios.
- **Una issue que mezcla varios problemas.** No se puede cerrar hasta que se resuelven todos: una issue, un problema.
- **Cerrar sin motivo ni referencia.** Nadie sabe si se arregló o se descartó: usa el motivo y enlaza el PR.
- **Etiquetas inventadas por cada persona.** Pactad un conjunto pequeño y usadlo siempre.

## En la entrevista

**«¿Cómo organizarías las tareas de un equipo en GitHub?»**
Con issues bien descritas y etiquetadas, milestones para cada entrega y un Project para ver el estado; cada PR enlaza su issue con `Closes #n`.

**«¿Qué son los issue forms?»**
Plantillas en YAML dentro de `.github/ISSUE_TEMPLATE/` que convierten la issue en un formulario con campos, algunos obligatorios, para recibir la información necesaria.

## Resumen

- Issue = tarea, error o idea, con assignees, labels y milestone.
- `#42` enlaza, `@ana` menciona y `Closes #42` en un PR cierra al fusionar.
- Motivos de cierre: completed, not planned, duplicate.
- Plantillas en `.github/ISSUE_TEMPLATE/`; los issue forms (`.yml`) necesitan `name`, `description` y `body`.
- `gh issue create | list | view | close | status`.
