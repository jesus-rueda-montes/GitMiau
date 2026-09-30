---
title: Guardar trabajo a medias con stash
minutes: 8
---

## Qué problema resuelve

Estás a mitad de algo, con cambios sin terminar, y te piden arreglar un error urgente en otra rama. No quieres hacer un commit con código a medias, y Git no te deja cambiar de rama si tus cambios chocan con ella. **`git stash`** aparta tus cambios a un lado, deja el working tree limpio y te permite recuperarlos después.

## Analogía

Es el **cajón del escritorio**: barres todos los papeles de la mesa al cajón para atender una visita y, cuando se va, los vuelves a sacar tal como estaban.

## Concepto

`git stash` (equivale a `git stash push`) guarda los cambios de los ficheros **con seguimiento**, tanto preparados como sin preparar, en una pila, y deja el working tree como en HEAD.

| Comando | Qué hace |
|---|---|
| `git stash` / `git stash push -m "mensaje"` | Guarda los cambios (con una descripción opcional) |
| `git stash -u` (`--include-untracked`) | Incluye también los ficheros **untracked**, que por defecto **no** se guardan |
| `git stash list` | Lista las entradas: `stash@{0}` es la más reciente, `stash@{1}` la anterior… |
| `git stash show -p stash@{1}` | Muestra el diff de una entrada |
| `git stash pop` | Aplica la entrada más reciente **y la borra** de la pila |
| `git stash apply stash@{1}` | Aplica una entrada **sin borrarla** |
| `git stash drop stash@{1}` | Borra una entrada |
| `git stash clear` | Borra todas las entradas |
| `git stash branch rama` | Crea una rama en el commit donde hiciste el stash y aplica ahí los cambios |

**Si `pop` tiene conflictos**, la entrada **no** se borra de la pila: resuelves los conflictos y luego la borras tú con `git stash drop`.

Por defecto, al aplicar un stash los cambios que estaban preparados vuelven sin preparar; con `--index` (`git stash pop --index`) se restaura también lo preparado.

## Ejemplo

```bash
# Estás en feature/login con cambios a medias
git stash push -u -m "login a medias"
git switch main
git switch -c hotfix/iva
# ... arreglas, commit, push ...
git switch feature/login
git stash list
# stash@{0}: On feature/login: login a medias
git stash pop                          # Vuelven tus cambios y la entrada desaparece
```

## Errores comunes

- **Olvidar que los ficheros nuevos no entran en el stash** si no usas `-u`: se quedan en el working tree.
- **Usar el stash como almacén a largo plazo.** Las entradas no tienen rama ni contexto y se acumulan. Para algo duradero, una rama con un commit «WIP».
- **Asumir que `pop` siempre borra la entrada.** Si hay conflictos, no lo hace.
- **`git stash clear` sin mirar.** Borra todas las entradas.

## En la entrevista

**«Estás a medias y tienes que cambiar de rama urgentemente. ¿Qué haces?»**
`git stash push -u -m "descripción"`, cambio de rama, hago lo urgente y al volver `git stash pop`. Otra opción es un commit temporal en mi rama que luego rehago.

**«¿Diferencia entre `stash pop` y `stash apply`?»**
Los dos aplican los cambios; `pop` además borra la entrada de la pila (si no hay conflictos) y `apply` la conserva.

## Resumen

- `git stash` guarda los cambios sin commit y limpia el working tree.
- Los untracked solo entran con `-u`.
- `stash@{0}` es la entrada más reciente; `git stash list` las muestra.
- `pop` aplica y borra; `apply` aplica y conserva.
- Para trabajo duradero, mejor una rama.
