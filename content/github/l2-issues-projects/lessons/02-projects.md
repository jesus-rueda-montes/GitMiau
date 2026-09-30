---
title: GitHub Projects y de la issue al PR
minutes: 8
---

## Qué problema resuelve

Con decenas de issues y PRs repartidos por uno o varios repositorios, hace falta una **vista de conjunto**: qué está pendiente, qué está en curso, qué se entrega cuándo y quién lleva cada cosa. **GitHub Projects** es esa vista, conectada con las issues reales.

## Analogía

Es la **pizarra con pósits** de la oficina, pero cada pósit está enlazado a la ficha real (la issue). Si cierras la ficha, el pósit se mueve solo. Y la misma pizarra se puede ver como lista, como tablero por columnas o como calendario.

## Concepto

Un **Project** es una tabla, un tablero y un roadmap integrados con las issues y los PRs. Vive a nivel de **usuario** o de **organización**, así que puede reunir trabajo de **varios repositorios**.

- **Elementos (items):** issues, Pull Requests y **draft issues** (ideas que aún no son issues de ningún repo). Los cambios se sincronizan en los dos sentidos: si cierras la issue, el project lo refleja.
- **Vistas (layouts):** **table** (tabla densa, como una hoja de cálculo), **board** (tablero kanban por columnas, p. ej. *Todo / In progress / Done*) y **roadmap** (línea temporal).
- **Campos personalizados:** texto, número, fecha, **single select** (p. ej. prioridad) e **iteration** (sprints de una o varias semanas).
- **Automatización:** flujos integrados que, por ejemplo, ponen el estado en *Done* al cerrar una issue o añaden automáticamente los elementos que cumplen un filtro. Para más, la API GraphQL o GitHub Actions.

**Milestone o Project:** un milestone agrupa issues y PRs de **un** repositorio para un objetivo con fecha. Un Project organiza trabajo de uno o varios repositorios con los campos y vistas que quieras. Se complementan.

**De la issue al PR.** El recorrido habitual en un equipo:

1. Se crea la issue (con plantilla) y se añade al Project.
2. Alguien se la asigna y crea una rama enlazada. En la web, el enlace *Create a branch* de la issue; con `gh`: `gh issue develop 42 --checkout`.
3. Commits y push a esa rama.
4. PR con `Closes #42` en la descripción.
5. Revisión y merge: la issue se cierra y en el tablero pasa a *Done*.

## Ejemplo

```bash
gh issue list --assignee @me            # ¿Qué tengo asignado?
gh issue develop 42 --checkout          # Rama enlazada a la issue 42 y cambio a ella
# ... commits ...
git push -u origin HEAD
gh pr create --title "Normaliza el email en el login" --body "Closes #42"
```

## Errores comunes

- **Mantener el tablero a mano** cuando las automatizaciones pueden mover los elementos solos.
- **Crear un Project por repositorio** cuando el equipo trabaja en varios: uno de organización los reúne.
- **Tareas solo en el Project, como draft issues, para siempre.** Si hay que trabajar en ellas, conviértelas en issues de su repositorio.
- **Crear la rama a mano sin enlazarla ni mencionar la issue en el PR.** Se pierde la trazabilidad.

## En la entrevista

**«¿Diferencia entre un milestone y un Project?»**
Un milestone agrupa issues y PRs de un repositorio para un objetivo con fecha y porcentaje de progreso. Un Project es un tablero configurable (tabla, board, roadmap, campos propios) que puede abarcar varios repositorios.

**«¿Cómo mantienes la trazabilidad entre tarea y código?»**
Issue → rama enlazada → PR con `Closes #n` → merge. Así cada cambio de `main` lleva a su PR y el PR a su issue.

## Resumen

- GitHub Projects: tabla, board y roadmap sobre issues, PRs y draft issues, a nivel de usuario u organización.
- Campos personalizados (single select, iteration, fecha…) y automatizaciones integradas.
- Milestone = objetivo con fecha en un repo; Project = vista de trabajo, también multirrepo.
- Flujo: issue → `gh issue develop` → commits → PR con `Closes #n` → merge.
