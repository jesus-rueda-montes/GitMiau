---
title: Remotos, clone, fetch y pull
minutes: 11
---

## Qué problema resuelve

Hasta ahora todo vivía en tu ordenador. Para trabajar en equipo (o simplemente tener una copia a salvo) necesitas conectar tu repositorio con **otro repositorio** en un servidor, por ejemplo en GitHub, y sincronizarlos: descargar lo que han subido los demás y subir lo tuyo.

## Analogía

Piensa en una **biblioteca** y tu **libreta de notas**. El remoto es la biblioteca: la copia de referencia que consulta todo el mundo. `fetch` es ir a la biblioteca a **fotocopiar** las páginas nuevas, sin tocar tu libreta. `pull` es fotocopiarlas **y pasarlas a limpio** en tu libreta.

## Concepto

Un **remoto** (*remote*) es otro repositorio con el que tu repositorio se sincroniza, identificado por un **nombre** y una **URL**. Por convención, el remoto principal se llama **`origin`**.

**Clonar.** `git clone <url>` descarga un repositorio completo (con toda su historia), crea el remoto `origin` apuntando a esa URL y deja activa una rama local (normalmente `main`) lista para trabajar.

**Gestionar remotos:**

| Comando | Qué hace |
|---|---|
| `git remote -v` | Lista los remotos con sus URL |
| `git remote add origin <url>` | Conecta un repositorio local con uno remoto |
| `git remote set-url origin <url>` | Cambia la URL (p. ej. de HTTPS a SSH) |
| `git remote rename origin github` | Renombra un remoto |
| `git remote remove origin` (o `rm`) | Lo elimina |

**Ramas de seguimiento remoto.** Tras clonar o descargar, verás ramas como **`origin/main`**. Son la foto de cómo estaba la rama `main` **del remoto** la última vez que hablaste con él. No trabajas sobre ellas: se actualizan solas al sincronizar. `git branch -a` las muestra junto a las locales.

**`git fetch`** descarga del remoto los commits nuevos y **actualiza `origin/*`**, pero **no toca tus ramas ni tus ficheros**. Es seguro: puedes mirar qué ha cambiado antes de integrarlo.

```bash
git fetch origin
git log --oneline main..origin/main   # Commits del remoto que aún no tienes
```

**`git pull`** = `git fetch` + integrar `origin/<rama>` en tu rama actual. Cómo integra depende de la situación:

- si tu rama no tiene commits propios, basta un **fast-forward**;
- si tu rama y la remota **han divergido** (las dos tienen commits nuevos), la documentación actual indica que por defecto `git pull` solo hace fast-forward y **falla**. Tienes que elegir cómo integrar: `git pull --rebase` (pone tus commits encima de los del remoto) o `git pull --no-rebase` (hace un merge). También puedes fijar tu preferencia con la configuración `pull.rebase`.

**`--prune`** (`git fetch -p`) borra las ramas `origin/*` que ya no existen en el remoto: sin ella se acumulan ramas fantasma.

## Ejemplo

```bash
git clone https://github.com/ada/tienda.git   # Crea la carpeta tienda con origin configurado
cd tienda
git remote -v
# origin  https://github.com/ada/tienda.git (fetch)
# origin  https://github.com/ada/tienda.git (push)

git fetch                          # Actualiza origin/main sin tocar main
git status                         # "Your branch is behind 'origin/main' by 2 commits"
git pull                           # Trae esos 2 commits a main (fast-forward)
```

## Errores comunes

- **Pensar que `git fetch` actualiza tus ficheros.** Solo actualiza `origin/*`. Para integrar hace falta `merge`, `rebase` o `pull`.
- **Hacer `git pull` con cambios sin commit a medias.** Si chocan, Git se niega. Haz commit antes (o usa `--autostash`).
- **Confundir `origin/main` con `main`.** `origin/main` es la foto del remoto; `main` es tu rama local.
- **No hacer nunca `fetch --prune`** y acabar con decenas de ramas remotas que ya no existen.

## En la entrevista

**«¿Qué diferencia hay entre `git fetch` y `git pull`?»**
`fetch` descarga los commits y actualiza las ramas de seguimiento (`origin/main`) sin tocar tu trabajo. `pull` hace un `fetch` y además integra los cambios en tu rama actual, con merge o rebase.

**«¿Qué es `origin`?»**
El nombre por defecto del remoto que se crea al clonar. Es solo una convención: se puede renombrar.

**«¿Qué es `origin/main`?»**
Una rama de seguimiento remoto: la última posición conocida de `main` en el remoto `origin`. Se actualiza al hacer fetch o pull.

## Resumen

- Un remoto es otro repositorio con nombre y URL; el principal se llama `origin`.
- `git clone` descarga todo y configura `origin`.
- `origin/main` es la foto de la rama del remoto; se actualiza con `fetch`.
- `git fetch` descarga sin tocar tu trabajo; `git pull` descarga e integra.
- Si las ramas han divergido, elige `git pull --rebase` o `git pull --no-rebase`.
