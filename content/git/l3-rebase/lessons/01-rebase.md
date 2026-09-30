---
title: Rebase frente a merge
minutes: 11
---

## Qué problema resuelve

Mientras trabajas en tu rama, `main` sigue avanzando. Para ponerte al día puedes hacer un merge, pero en un equipo activo la historia se llena de commits de merge y líneas cruzadas difíciles de leer. **`git rebase`** ofrece otra forma de integrar: mueve tus commits para que parezca que empezaste la rama **a partir del último `main`**, y deja una historia **lineal**.

## Analogía

Estás escribiendo el capítulo 5 de un libro a partir del capítulo 4. Mientras tanto, la editorial añade un capítulo 4bis. **Merge** es grapar tu capítulo al final con una nota: «esto se escribió en paralelo». **Rebase** es reescribir tu capítulo como si lo hubieras empezado después del 4bis: el libro queda en orden, pero tus páginas son copias nuevas, no las originales.

## Concepto

Estás en `feature` y ejecutas `git rebase main`:

1. Git busca los commits de `feature` que no están en `main` (C y D).
2. Mueve `feature` a la punta de `main`.
3. **Reaplica** C y D uno a uno encima. Como cambia su padre, son **commits nuevos con otro hash** (C' y D').

```
Antes:                        Después de git rebase main:
      C ── D   ← feature                      C' ── D'   ← feature
     /                                        /
A ── B ── E    ← main          A ── B ── E    ← main
```

Después, en `main`, `git merge feature` será un simple fast-forward.

**Merge frente a rebase:**

| | Merge | Rebase |
|---|---|---|
| Historia | Refleja lo que pasó (con commits de merge) | Lineal, más fácil de leer |
| Commits existentes | No cambian | Se reescriben (hashes nuevos) |
| Conflictos | Se resuelven una vez | Se pueden resolver commit a commit |
| Seguro en ramas compartidas | Sí | **No** |

**Conflictos durante un rebase.** Git se para en el commit que choca. Resuelves igual que en un merge y sigues:

```bash
git add fichero
git rebase --continue    # Siguiente commit
git rebase --skip        # Descarta este commit y sigue
git rebase --abort       # Cancela todo: la rama vuelve a como estaba
```

Ojo: durante un rebase, *ours* (la parte de `HEAD`) es la rama sobre la que reaplicas y *theirs* es tu commit. Es al revés que en un merge.

**La regla de oro: no hagas rebase de commits que otros ya tienen.** Como el rebase crea commits nuevos, quien tenga los antiguos se encontrará con una historia que no encaja y tendrá que arreglarla a mano. Haz rebase solo de **tu** trabajo local o de ramas que solo usas tú. Si ya habías subido esa rama, tendrás que forzar el push, y entonces usa **`git push --force-with-lease`**.

`git pull --rebase` aplica la misma idea al descargar: pone tus commits locales encima de los del remoto, en vez de crear un merge.

## Ejemplo

```bash
git switch feature/login
git fetch origin
git rebase origin/main            # Pone tus commits encima del main remoto
# CONFLICT (content): Merge conflict in login.py
# ... resuelves login.py ...
git add login.py
git rebase --continue
git push --force-with-lease       # La rama ya estaba subida y sus commits han cambiado
```

## Errores comunes

- **Hacer rebase de `main` o de una rama compartida.** Reescribes commits que otros tienen. Solo en ramas propias.
- **Forzar el push con `--force` tras el rebase.** Si alguien subió algo a tu rama, lo borras. Usa `--force-with-lease`.
- **Asustarse con los hashes nuevos.** Es lo esperado: los commits reaplicados son copias con otro padre.
- **Olvidar que un rebase a medias sigue en curso.** `git status` te lo recuerda; termina con `--continue` o sal con `--abort`.

## En la entrevista

**«¿Merge o rebase?»**
Merge conserva la historia tal como ocurrió y es seguro en ramas compartidas. Rebase deja una historia lineal, pero reescribe commits, así que solo lo uso en mis ramas antes de integrarlas. Muchos equipos combinan ambos: rebase para ponerse al día en la rama propia y merge (o squash merge) para integrar en `main`.

**«¿Por qué no se debe hacer rebase de una rama pública?»**
Porque crea commits nuevos con otros hashes. Quien tenga los antiguos tendrá una historia divergente y duplicada.

**«¿Qué haces si un rebase se complica?»**
`git rebase --abort` deja la rama como estaba antes de empezar.

## Resumen

- `git rebase main` reaplica tus commits encima de `main`: historia lineal, **hashes nuevos**.
- Conflictos: resolver, `git add`, `git rebase --continue` (o `--skip`, `--abort`).
- Merge conserva la historia; rebase la reescribe.
- Regla de oro: **no** hagas rebase de commits que otros ya tienen.
- Tras reescribir una rama ya subida: `git push --force-with-lease`.
