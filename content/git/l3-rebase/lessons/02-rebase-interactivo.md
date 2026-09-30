---
title: Rebase interactivo
minutes: 11
---

## Qué problema resuelve

Mientras desarrollas haces commits como «wip», «arreglo typo» u «otra vez el test». Antes de abrir un Pull Request querrías entregar una historia **limpia**: pocos commits, cada uno con sentido y buen mensaje. El **rebase interactivo** te deja reordenar, juntar, renombrar o eliminar commits antes de compartirlos.

## Analogía

Es **editar el borrador** antes de entregar un trabajo: juntas párrafos repetidos, corriges títulos y quitas lo que sobra. El profesor solo ve la versión final, no todos tus borradores.

## Concepto

`git rebase -i <base>` (`--interactive`) abre un editor con la **lista de tareas** (*todo list*): los commits posteriores a `<base>`, **del más antiguo (arriba) al más reciente (abajo)**, cada uno precedido de una orden:

```text
pick 3f2a9c1 Añade el formulario de login
pick 9b1e4d2 wip
pick c5d8a31 Arregla typo en el formulario
pick 7e0b6f4 Valida el email
```

Cambias las órdenes (o el orden de las líneas), guardas y cierras. Git ejecuta la lista de arriba abajo:

| Orden | Letra | Qué hace |
|---|---|---|
| `pick` | `p` | Usa el commit tal cual |
| `reword` | `r` | Usa el commit, pero te deja cambiar el mensaje |
| `edit` | `e` | Se detiene en ese commit para que lo modifiques (`git commit --amend`) |
| `squash` | `s` | Lo funde con el commit anterior y te deja combinar los mensajes |
| `fixup` | `f` | Lo funde con el anterior y **descarta su mensaje** |
| `drop` | `d` | Elimina el commit |
| `exec` | `x` | Ejecuta un comando de shell |

Borrar una línea también elimina el commit. Reordenar las líneas reordena los commits.

Para limpiar los ejemplos de arriba:

```text
pick 3f2a9c1 Añade el formulario de login
fixup c5d8a31 Arregla typo en el formulario
drop 9b1e4d2 wip
pick 7e0b6f4 Valida el email
```

**`--autosquash`.** Si al corregir algo ya sabes a qué commit pertenece, créalo con `git commit --fixup=<commit>`. Git lo llama `fixup! <mensaje original>`. Después, `git rebase -i --autosquash <base>` lo coloca solo debajo de su commit y lo marca como `fixup`. (`git commit --squash=<commit>` hace lo mismo con `squash`.)

**Cómo elegir la base:**

- `git rebase -i HEAD~3`: los 3 últimos commits;
- `git rebase -i main`: todos los commits de tu rama que no están en `main`.

Es un rebase, así que la **regla de oro** sigue en pie: solo con commits que no hayas compartido o de ramas solo tuyas. Y si algo sale mal, `git rebase --abort`.

## Ejemplo

```bash
git log --oneline
# 7e0b6f4 Valida el email
# c5d8a31 Arregla typo en el formulario
# 9b1e4d2 wip
# 3f2a9c1 Añade el formulario de login

git rebase -i HEAD~4             # Editas la lista como arriba, guardas y cierras
git log --oneline
# a81d3c0 Valida el email
# 5b27e19 Añade el formulario de login

# La próxima vez, con autosquash:
git commit --fixup=5b27e19       # Crea "fixup! Añade el formulario de login"
git rebase -i --autosquash main  # Lo funde solo en su commit
```

## Errores comunes

- **Leer la lista al revés.** En la todo list el commit más **antiguo** está arriba, al contrario que en `git log`.
- **Usar `squash` o `fixup` en la primera línea.** No hay commit anterior con el que fundirlo.
- **Hacer rebase interactivo de commits ya publicados en una rama compartida.** Misma regla de oro.
- **Confundir `squash` con `fixup`.** Los dos funden el commit; `fixup` además tira su mensaje.

## En la entrevista

**«¿Cómo juntarías tus 5 últimos commits en uno?»**
Con `git rebase -i HEAD~5`, dejando `pick` en el primero y `squash` (o `fixup`) en los demás. Otra opción es `git reset --soft HEAD~5` y un solo commit nuevo.

**«¿Diferencia entre squash y fixup?»**
Los dos funden el commit con el anterior. `squash` te deja combinar los mensajes y `fixup` descarta el del commit fundido.

**«¿Para qué sirve `--autosquash`?»**
Coloca y marca automáticamente los commits creados con `git commit --fixup` o `--squash` al hacer un rebase interactivo.

## Resumen

- `git rebase -i <base>` abre la lista de commits (el más antiguo arriba) para editarla.
- Órdenes: `pick`, `reword`, `edit`, `squash`, `fixup`, `drop`; reordenar líneas reordena commits.
- `git commit --fixup=<commit>` + `git rebase -i --autosquash`: correcciones que se colocan solas.
- Úsalo para limpiar tu rama **antes** de compartirla.
