---
title: Merge y conflictos
minutes: 12
---

## Qué problema resuelve

Las ramas separan el trabajo, pero en algún momento hay que **juntarlo**: la funcionalidad terminada tiene que llegar a `main`. `git merge` une la historia de otra rama con la actual. Casi siempre Git lo hace solo; cuando dos ramas han cambiado las mismas líneas, te pide que decidas tú: es un **conflicto**.

## Analogía

Dos personas editan copias del mismo documento. Si cada una cambió párrafos distintos, juntar las versiones es mecánico. Si las dos reescribieron **el mismo párrafo**, alguien tiene que leer ambas versiones y decidir cuál queda (o combinarlas). Git hace la parte mecánica y te deja la decisión.

## Concepto

`git merge otra-rama` trae los cambios de `otra-rama` **a la rama en la que estás**. Primero te colocas en la rama que recibe (`git switch main`) y luego fusionas la otra (`git merge feature/iva`).

Hay dos formas de merge:

**1. Fast-forward.** Si `main` no ha avanzado desde que creaste la rama, no hay nada que combinar: Git simplemente **mueve el puntero** de `main` hasta el último commit de la rama. No se crea ningún commit nuevo.

```
Antes:  A ── B          ← main
              \
               C ── D   ← feature
Después: A ── B ── C ── D   ← main, feature
```

**2. Merge de tres vías (commit de merge).** Si las dos ramas han avanzado por separado, Git compara las dos puntas con su **antecesor común** y crea un **commit de merge** con dos padres.

```
A ── B ── E ────── M   ← main (M tiene dos padres: E y D)
      \           /
       C ─────── D     ← feature
```

Opciones de `git merge`:

- `--no-ff`: crea siempre un commit de merge, aunque fuera posible el fast-forward (deja constancia de que hubo una rama);
- `--ff-only`: solo acepta fast-forward; si no es posible, se niega;
- `--squash`: junta todos los cambios de la rama en tu working tree, sin crear el commit (lo haces tú después).

**Conflictos.** Si las dos ramas cambiaron las mismas líneas de un fichero, Git se detiene y marca el fichero así:

```text
<<<<<<< HEAD
IVA = 0.16
=======
IVA = 0.21
>>>>>>> feature/iva
```

- Entre `<<<<<<<` y `=======`: tu versión (la de la rama actual, HEAD).
- Entre `=======` y `>>>>>>>`: la versión de la rama que estás fusionando.

Para resolverlo:

1. `git status` te dice qué ficheros tienen conflictos (*both modified*).
2. Edita cada fichero: deja el contenido correcto y **borra las marcas**.
3. `git add fichero` para marcarlo como resuelto.
4. `git commit` (o `git merge --continue`) para terminar el merge.

Si te lías, `git merge --abort` cancela el merge y vuelve al estado anterior.

## Ejemplo

```bash
git switch main
git merge feature/iva
# Auto-merging precios.py
# CONFLICT (content): Merge conflict in precios.py
# Automatic merge failed; fix conflicts and then commit the result.

git status                       # both modified: precios.py
# ... editas precios.py, dejas IVA = 0.21 y borras las marcas ...
git add precios.py
git merge --continue             # o git commit
git branch -d feature/iva        # La rama ya está fusionada: se puede borrar
```

## Errores comunes

- **Hacer el merge al revés.** `git merge main` estando en `feature` trae `main` a tu rama, no al revés. Mira siempre en qué rama estás.
- **Dejar marcas `<<<<<<<` en el código.** Hacer `git add` no comprueba nada: si las marcas se quedan, se guardan en el commit.
- **Empezar un merge con cambios sin commit.** Si algo va mal, `--abort` puede no recuperarlos. Haz commit (o stash) antes.
- **Resolver un conflicto quedándote siempre con "lo mío".** Hay que entender qué hacía cada versión; a veces la solución combina ambas.

## En la entrevista

**«¿Qué es un fast-forward?»**
Un merge en el que la rama de destino no ha avanzado desde que se creó la otra. Git solo mueve el puntero; no hay commit de merge. Con `--no-ff` se fuerza el commit de merge.

**«¿Cómo resuelves un conflicto de merge?»**
Miro con `git status` qué ficheros tienen conflicto, edito cada uno para dejar la versión correcta y quitar las marcas, lo marco como resuelto con `git add` y termino con `git commit` o `git merge --continue`. Si hace falta, `git merge --abort` cancela todo.

**«¿Qué tiene de especial un commit de merge?»**
Tiene dos padres: la punta de cada rama fusionada.

## Resumen

- `git merge rama` trae `rama` a la rama **actual**.
- **Fast-forward**: solo se mueve el puntero. **Tres vías**: commit de merge con dos padres.
- `--no-ff` fuerza el commit de merge; `--ff-only` solo acepta fast-forward.
- Conflicto: editar, quitar las marcas, `git add`, `git commit` (o `--continue`).
- `git merge --abort` deshace un merge a medias.
