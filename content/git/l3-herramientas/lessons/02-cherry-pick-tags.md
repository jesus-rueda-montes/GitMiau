---
title: Cherry-pick y tags
minutes: 9
---

## Qué problema resuelve

Dos situaciones muy habituales:

- Arreglaste un error en `main` y necesitas **ese mismo arreglo** en la rama de la versión anterior (`release/1.4`), pero **sin** traer todo lo demás de `main`.
- Vas a publicar una versión y quieres **marcar** para siempre el commit exacto que se publicó como `v1.5.0`.

Para lo primero está **`git cherry-pick`**; para lo segundo, **`git tag`**.

## Analogía

**Cherry-pick** es coger **una sola cereza** del árbol en vez de la rama entera. Un **tag** es la **placa conmemorativa** de un edificio: señala un sitio concreto y no se mueve, al contrario que una rama, que avanza con cada commit.

## Concepto

**`git cherry-pick <commit>`** aplica los cambios que introdujo ese commit en la rama actual y crea un **commit nuevo** (con otro hash, porque tiene otro padre).

- `-x`: añade al mensaje una línea `(cherry picked from commit …)`, útil al llevar arreglos entre ramas públicas;
- `-n` (`--no-commit`): aplica los cambios sin hacer el commit;
- varios commits: `git cherry-pick A B C`;
- conflictos: como siempre, resolver, `git add` y `git cherry-pick --continue` (o `--skip`, `--abort`).

Úsalo con moderación: si copias muchos commits entre ramas, la misma modificación queda duplicada con hashes distintos. Para integrar ramas enteras está `merge`.

**Tags.** Un tag es un nombre fijo para un commit. Hay dos tipos:

| Tipo | Cómo se crea | Qué guarda | Para qué |
|---|---|---|---|
| **Ligero** (*lightweight*) | `git tag v1.5.0` | Solo el nombre y el commit | Marcas privadas o temporales |
| **Anotado** (*annotated*) | `git tag -a v1.5.0 -m "Versión 1.5.0"` | Autor, fecha, mensaje (y firma opcional) | **Versiones publicadas** |

La documentación recomienda los **anotados para las releases**: algunos comandos, como `git describe`, ignoran los ligeros por defecto.

Otras operaciones: `git tag` o `git tag -l "v1.*"` lista tags, `git tag -a v1.4.1 3f2a9c1` etiqueta un commit anterior y `git tag -d v1.5.0` borra un tag local.

**Los tags no se suben con un `git push` normal.** Hay que subirlos explícitamente:

```bash
git push origin v1.5.0    # Un tag
git push --tags           # Todos
```

## Ejemplo

```bash
# Llevar un arreglo de main a la rama de mantenimiento
git switch release/1.4
git cherry-pick -x 9c0e2d7
# [release/1.4 4d1a8f3] Corrige el redondeo del IVA

# Publicar una versión
git switch main
git tag -a v1.5.0 -m "Versión 1.5.0: login con email"
git push origin v1.5.0
```

## Errores comunes

- **Usar cherry-pick para integrar ramas enteras.** Duplica commits; usa merge o rebase.
- **Crear tags ligeros para las releases.** No guardan quién ni cuándo; usa `-a`.
- **Pensar que `git push` sube los tags.** Hay que subirlos aparte.
- **Mover un tag ya publicado** (`-f`). Quien ya lo descargó sigue teniendo el antiguo. Si una versión salió mal, publica otra (`v1.5.1`).

## En la entrevista

**«¿Qué hace `git cherry-pick`?»**
Aplica los cambios de un commit concreto en la rama actual como un commit nuevo. Se usa sobre todo para llevar arreglos a ramas de mantenimiento.

**«¿Diferencia entre un tag ligero y uno anotado?»**
El ligero es solo un nombre para un commit. El anotado es un objeto con autor, fecha y mensaje (y puede firmarse); es el recomendado para las versiones.

**«¿Diferencia entre un tag y una rama?»**
Los dos apuntan a un commit, pero la rama avanza con cada commit nuevo y el tag se queda fijo.

## Resumen

- `git cherry-pick <commit>` copia los cambios de un commit como un commit nuevo; `-x` deja constancia del original.
- Tags: ligeros para uso personal, **anotados** (`-a -m`) para las releases.
- Un tag no se mueve; una rama sí.
- Los tags se suben aparte: `git push origin <tag>` o `git push --tags`.
