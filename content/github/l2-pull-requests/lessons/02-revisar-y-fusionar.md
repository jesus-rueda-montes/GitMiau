---
title: Revisar y fusionar un Pull Request
minutes: 11
---

## Qué problema resuelve

Abrir el PR es la mitad del trabajo. La otra mitad es **revisarlo** bien, para cazar errores, compartir conocimiento y mantener la calidad, y **fusionarlo** eligiendo cómo quedará la historia de `main`.

## Analogía

La revisión es la **inspección técnica de un coche**: el inspector no lo ha fabricado, pero sabe dónde mirar. Puede dejar notas, pedir que arregles algo antes de dar el visto bueno o aprobarlo. Y fusionar es decidir **cómo se archiva** el expediente: con todas las páginas, resumido en una sola o reescrito en orden.

## Concepto

**Tipos de revisión.** Al terminar de revisar se envía una de estas tres:

| Tipo | Significado |
|---|---|
| **Comment** | Opiniones generales, sin aprobar ni pedir cambios |
| **Approve** | Los cambios están listos para fusionarse |
| **Request changes** | Hay que resolver algo antes de fusionar |

Los comentarios se pueden dejar **en líneas concretas** del diff y proponer **suggested changes**: un cambio exacto que el autor aplica con un clic. El autor de un PR **no puede aprobar su propio PR**.

**Buenas prácticas al revisar:** entender el objetivo (lee la descripción y la issue), probarlo si hace falta (`gh pr checkout`), comentar sobre el código y no sobre la persona, y distinguir lo obligatorio de lo opcional («nit:» para detalles menores).

**Métodos de merge.** GitHub ofrece tres formas de fusionar un PR (el repositorio puede tener alguna desactivada):

| Método | Qué hace con la historia |
|---|---|
| **Create a merge commit** (por defecto) | Añade todos los commits de la rama y un commit de merge (como `git merge --no-ff`). Historia completa. |
| **Squash and merge** | Junta todos los commits del PR en **un solo commit** en la rama base. Historia limpia, pero se pierde el detalle de cada commit. |
| **Rebase and merge** | Reaplica los commits uno a uno sobre la base, sin commit de merge. Historia lineal, con **commits nuevos (otros SHA)**. |

Muchos equipos usan **squash and merge**: cada PR queda como un único commit en `main`, fácil de revertir.

Tras fusionar, **borra la rama** (GitHub ofrece el botón *Delete branch*): su trabajo ya está en `main`.

**Con `gh`:**

```bash
gh pr review 57 --approve
gh pr review 57 --request-changes --body "Falta validar el email vacío"
gh pr review 57 --comment --body "Buena idea lo del regex"
gh pr merge 57 --squash --delete-branch
gh pr merge 57 --auto --squash     # Se fusionará solo cuando se cumplan los requisitos (checks, aprobaciones)
```

## Ejemplo

Flujo completo desde el punto de vista del revisor:

```bash
gh pr status                       # PRs que esperan mi revisión
gh pr checkout 57                  # Me traigo la rama
npm test                           # La pruebo
gh pr diff 57                      # Reviso los cambios
gh pr review 57 --approve --body "Probado en local, todo bien"
```

Y el autor, una vez aprobado:

```bash
gh pr merge 57 --squash --delete-branch
git switch main
git pull
```

## Errores comunes

- **Aprobar sin leer** («LGTM» automático). La revisión deja de servir para algo.
- **Comentarios personales o vagos** («esto está mal»). Explica el porqué y propón una alternativa.
- **No borrar las ramas fusionadas.** Se acumulan decenas de ramas muertas.
- **Hacer squash de un PR con varios cambios independientes.** Quedan fundidos en un commit imposible de separar: mejor varios PRs.

## En la entrevista

**«¿Qué diferencia hay entre merge commit, squash and merge y rebase and merge?»**
Merge commit conserva todos los commits más un commit de merge. Squash los junta en uno solo. Rebase los reaplica sobre la base sin commit de merge, con SHA nuevos. Squash deja un commit por PR; rebase, historia lineal; merge commit, la historia completa.

**«¿Qué buscas cuando revisas un PR?»**
Que haga lo que dice la issue, que sea correcto y legible, que tenga tests, que no introduzca problemas de seguridad o rendimiento, y que el tamaño sea razonable.

**«¿Qué es el auto-merge?»**
Una opción para que el PR se fusione solo en cuanto cumpla los requisitos de la rama, como las aprobaciones y los checks en verde.

## Resumen

- Revisiones: **Comment**, **Approve** o **Request changes**; comentarios por línea y suggested changes.
- El autor no puede aprobar su propio PR.
- Métodos: **merge commit** (todo + merge), **squash** (uno solo), **rebase** (lineal, SHA nuevos).
- Borra la rama después de fusionar.
- `gh pr review --approve | --request-changes | --comment` y `gh pr merge --squash --delete-branch`.
