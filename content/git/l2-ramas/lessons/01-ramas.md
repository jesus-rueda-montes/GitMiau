---
title: Qué es una rama y cómo moverse entre ellas
minutes: 10
---

## Qué problema resuelve

Estás a mitad de una funcionalidad nueva cuando surge un error urgente en producción. Si todo está en la misma línea de historia, tienes que mezclar el arreglo con código a medio hacer. Las **ramas** permiten tener **varias líneas de trabajo en paralelo** en el mismo repositorio: una para la funcionalidad, otra para el arreglo, y la principal (`main`) siempre estable.

## Analogía

Piensa en un **marcapáginas**. El libro (la historia de commits) es uno solo, pero puedes tener varios marcapáginas, cada uno en una página distinta. Crear una rama es poner un marcapáginas nuevo: no copia el libro. Y **HEAD** es tu dedo: señala el marcapáginas por el que estás leyendo.

## Concepto

Una **rama** (*branch*) es solo un **puntero con nombre a un commit**. Cuando haces un commit estando en una rama, el puntero avanza al commit nuevo. Por eso crear ramas en Git es instantáneo y barato: no se copia ningún fichero.

**HEAD** apunta a la rama en la que estás. Así Git sabe qué rama debe avanzar en el próximo commit.

```
            main
             ↓
A ── B ── C ── D
          \
           E ── F
                ↑
          feature/login  ← HEAD
```

Comandos básicos:

| Comando | Qué hace |
|---|---|
| `git branch` | Lista las ramas locales; la actual va marcada con `*` |
| `git branch feature/login` | **Crea** la rama en el commit actual, pero **no cambia** a ella |
| `git switch feature/login` | Cambia a la rama: HEAD pasa a apuntar a ella y el working tree se actualiza |
| `git switch -c feature/login` | Crea la rama **y** cambia a ella (`-c` = `--create`) |
| `git switch -` | Vuelve a la rama anterior |
| `git branch -m viejo nuevo` | Renombra una rama |
| `git branch -d feature/login` | Borra una rama **ya fusionada** |
| `git branch -D experimento` | Borra una rama **aunque no esté fusionada** (atajo de `--delete --force`) |
| `git branch -v` | Muestra el último commit de cada rama |

**`git checkout`**: en tutoriales antiguos verás `git checkout rama` y `git checkout -b rama`. Funcionan, pero `checkout` hace demasiadas cosas (cambiar de rama y restaurar ficheros). Desde Git 2.23 existen `git switch` (ramas) y `git restore` (ficheros), más claros.

**Detached HEAD.** Si cambias a un commit concreto en vez de a una rama (`git switch --detach 3f2a9c1`), HEAD apunta directamente a un commit: estás en *detached HEAD*. Sirve para inspeccionar el pasado. Si haces commits ahí y te vas, no quedan en ninguna rama. Para conservarlos, crea una rama antes: `git switch -c rescate`.

**Cambios sin guardar.** Si tienes cambios sin commit que chocarían con la rama de destino, Git se niega a cambiar para no perderlos. Haz commit antes (o guárdalos con `git stash`, que verás más adelante).

## Ejemplo

```bash
git switch -c feature/iva        # Crea la rama y cambia a ella
# ... editas y guardas ...
git commit -am "Actualiza el IVA al 21 %"
git switch main                  # Vuelves a main: el cambio no está aquí
git switch -                     # Y de vuelta a feature/iva
git branch -v                    # Lista de ramas con su último commit
#   main         9b1e4d2 Añade el README
# * feature/iva  c5d8a31 Actualiza el IVA al 21 %
```

## Errores comunes

- **Creer que `git branch nombre` te cambia a la rama nueva.** Solo la crea. Usa `git switch -c nombre`.
- **Trabajar siempre en `main`.** Cualquier experimento deja la rama principal a medias. Una rama por tarea.
- **Hacer commits en detached HEAD y cambiar de rama.** Esos commits no pertenecen a ninguna rama. Crea una rama antes de irte.
- **Borrar con `-D` sin pensar.** `-d` se niega si la rama tiene trabajo sin fusionar; `-D` lo borra igualmente.

## En la entrevista

**«¿Qué es una rama en Git?»**
Un puntero móvil con nombre a un commit. Al hacer commit en ella, avanza. Por eso crear ramas es barato: no copia ficheros.

**«¿Qué es HEAD y qué es un detached HEAD?»**
HEAD indica dónde estás: normalmente apunta a una rama. En detached HEAD apunta directamente a un commit, y los commits nuevos no quedan en ninguna rama salvo que crees una.

**«¿`git switch` o `git checkout`?»**
`switch` solo cambia de rama y `restore` solo restaura ficheros; `checkout` hacía ambas cosas. Los dos siguen funcionando.

## Resumen

- Una rama es un **puntero** a un commit; avanza con cada commit.
- **HEAD** apunta a la rama actual.
- `git switch -c nombre` crea y cambia; `git branch nombre` solo crea.
- `git branch -d` borra ramas fusionadas; `-D` fuerza.
- Detached HEAD: estás en un commit, no en una rama.
