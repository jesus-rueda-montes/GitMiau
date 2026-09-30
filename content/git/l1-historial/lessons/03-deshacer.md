---
title: "Deshacer cambios: restore, reset y revert"
minutes: 12
---

## Qué problema resuelve

Te equivocas: editas un fichero que no debías, preparas algo que no quería ir en el commit o haces un commit con un error. Git tiene una herramienta para deshacer cada situación, y elegir la equivocada puede **borrar trabajo** o **romper la historia** de tus compañeros.

## Analogía

- `git restore` es la **goma de borrar**: limpia lo que has escrito en la hoja actual.
- `git reset` es **arrancar las últimas páginas** del cuaderno: como si nunca se hubieran escrito.
- `git revert` es escribir una **fe de erratas**: la página equivocada sigue ahí, pero añades otra que la corrige.

## Concepto

**1. `git restore`: deshacer cambios que aún no están en un commit.**

| Comando | Qué hace |
|---|---|
| `git restore app.py` | Descarta los cambios del working tree: `app.py` vuelve a como está en la staging area. **Los cambios se pierden.** |
| `git restore --staged app.py` (`-S`) | Saca `app.py` de la staging area (lo contrario de `git add`). Tus cambios siguen en el fichero. |
| `git restore --source=HEAD~1 app.py` | Recupera `app.py` tal como estaba un commit atrás. |

**2. `git reset <commit>`: mover la rama a un commit anterior.** Todos los modos mueven HEAD (y la rama actual); se diferencian en qué hacen con la staging area y el working tree:

| Modo | Staging area | Working tree | Uso típico |
|---|---|---|---|
| `--soft` | Sin cambios | Sin cambios | Rehacer el último commit: los cambios quedan preparados |
| `--mixed` (por defecto) | Se iguala al commit | Sin cambios | Deshacer commits dejando los cambios sin preparar |
| `--hard` | Se iguala al commit | **Se sobrescribe** | Tirar todo a la basura y volver a ese commit |

`git reset --hard` **destruye los cambios que no estaban en ningún commit**: no hay forma de recuperarlos.

Con una ruta y sin modo, `git reset app.py` solo saca el fichero de la staging area (equivale a `git restore --staged app.py`).

**3. `git revert <commit>`: deshacer un commit creando otro nuevo** que aplica los cambios contrarios. La historia no se reescribe: solo crece. Es la forma segura de deshacer algo que **ya has compartido** (hecho push).

**La regla de oro:** no reescribas (`reset`) commits que otros ya tienen. Para esos, `revert`.

**Bonus: `git commit --amend`** sustituye el último commit por uno nuevo, con lo que haya en la staging area y (si quieres) otro mensaje. Útil para un fallo recién cometido. También reescribe la historia: solo antes de compartir el commit.

## Ejemplo

```bash
# He estropeado config.py y quiero volver a la última versión guardada
git restore config.py

# He preparado un fichero que no tocaba
git restore --staged notas.txt

# El último commit tenía un error en el mensaje (aún no hecho push)
git commit --amend -m "Corrige el cálculo del IVA"

# Deshacer el último commit pero conservar los cambios para rehacerlo
git reset --soft HEAD~1

# Un commit ya publicado rompió producción: se deshace con un commit nuevo
git revert 3f2a9c1 --no-edit
```

## Errores comunes

- **Usar `git reset --hard` para "limpiar" sin pensar.** Si había cambios sin commit, se pierden para siempre.
- **Hacer `reset` de commits ya publicados y forzar el push.** Tus compañeros tienen esos commits: su historia y la tuya divergen. Usa `revert`.
- **Creer que `git restore app.py` es reversible.** Sobrescribe el fichero: lo no guardado desaparece.
- **Confundir `git restore --staged` con descartar cambios.** Solo los saca de la staging area; el fichero sigue modificado.

## En la entrevista

**«¿Qué diferencia hay entre `git reset` y `git revert`?»**
`reset` mueve la rama a un commit anterior y los posteriores dejan de estar en ella: reescribe la historia. `revert` crea un commit nuevo que invierte los cambios de otro: la historia se conserva. Para commits ya compartidos, `revert`.

**«¿Qué hacen `--soft`, `--mixed` y `--hard`?»**
Los tres mueven HEAD. `--soft` deja la staging area y el working tree igual (los cambios quedan preparados); `--mixed`, el modo por defecto, resetea la staging area pero no el working tree; `--hard` resetea ambos y descarta los cambios.

**«¿Cómo sacas un fichero del staging sin perder los cambios?»**
`git restore --staged fichero` (o `git reset fichero`).

## Resumen

- `git restore fichero`: descarta cambios del working tree (se pierden).
- `git restore --staged fichero`: lo saca de la staging area sin tocar el fichero.
- `git reset --soft | --mixed | --hard <commit>`: mueve la rama; `--hard` también descarta tus cambios.
- `git revert <commit>`: crea un commit que deshace otro; es lo seguro para commits compartidos.
- No reescribas historia que otros ya tienen.
