---
title: Subir cambios con push
minutes: 10
---

## Qué problema resuelve

Tus commits solo existen en tu máquina hasta que los **subes**. Hasta entonces nadie puede verlos, revisarlos ni desplegarlos, y si se te rompe el disco, se pierden. `git push` los envía al remoto. Además tienes que saber qué hacer cuando el remoto **rechaza** tu push, sin destrozar el trabajo de los demás.

## Analogía

Volviendo a la biblioteca: `push` es **entregar tus páginas nuevas** para que las añadan al libro de referencia. Si mientras tanto otra persona ya añadió páginas en ese mismo punto, el bibliotecario no deja que las tuyas las tapen: te pide que primero leas lo nuevo y encajes lo tuyo detrás.

## Concepto

**`git push origin main`** sube los commits de tu rama `main` a la rama `main` del remoto `origin`.

**Upstream.** Cada rama local puede tener asociada una rama remota, su **upstream**. Con ella, `git push` y `git pull` sin argumentos saben adónde ir, y `git status` te dice cuántos commits vas por delante o por detrás. La primera vez que subes una rama nueva, fija el upstream con **`-u`** (`--set-upstream`):

```bash
git push -u origin feature/login   # Sube la rama y recuerda origin/feature/login
git push                           # A partir de ahora, basta con esto
```

(Para una rama ya subida, `git branch -u origin/rama` fija el upstream sin hacer push.)

**Push rechazado.** Git solo acepta un push que sea un **fast-forward** de la rama remota. Si alguien subió commits que tú no tienes, tu push se rechaza (*non-fast-forward*), porque aceptarlo borraría esos commits:

```text
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/ada/tienda.git'
```

La solución **no** es forzar: primero integra lo del remoto y después sube.

```bash
git pull --rebase    # (o --no-rebase) integra los commits remotos
git push
```

**Forzar el push.** `git push --force` (`-f`) sobrescribe la rama remota con la tuya, **aunque se pierdan commits**. Solo tiene sentido en tus propias ramas después de reescribir su historia (por ejemplo, con un rebase). Aun así, es más seguro **`--force-with-lease`**: fuerza solo si la rama remota sigue donde la viste por última vez, así que si alguien subió algo mientras tanto, falla en vez de borrarlo.

**Otras operaciones:**

- `git push origin --delete feature/login`: borra una rama del remoto;
- `git push --tags`: sube también los tags.

**HTTPS o SSH.** Hay dos formas de autenticarte con el remoto:

- **HTTPS** (`https://github.com/…`): funciona en casi cualquier red. GitHub no acepta tu contraseña de la cuenta para operaciones de Git: se usa un token o un gestor de credenciales.
- **SSH** (`git@github.com:…`): generas un par de claves y registras la pública en GitHub. No hay que escribir nada en cada push.

## Ejemplo

```bash
git switch -c feature/login
git commit -am "Añade el formulario de login"
git push -u origin feature/login      # Primera subida: fija el upstream
# ... más commits ...
git push                              # Rechazado: un compañero subió a la rama
git pull --rebase                     # Pone tus commits encima de los suyos
git push                              # Ahora sí
```

## Errores comunes

- **Resolver un push rechazado con `--force`.** Borras los commits de tus compañeros. Integra primero (`pull`) y vuelve a subir.
- **Forzar el push en `main` o en ramas compartidas.** Nunca. Si de verdad hay que forzar en una rama tuya, `--force-with-lease`.
- **Olvidar `-u` en la primera subida** y tener que escribir siempre `git push origin rama`.
- **Pensar que un commit está a salvo sin haber hecho push.** Solo está en tu disco.

## En la entrevista

**«Tu push ha sido rechazado. ¿Qué haces?»**
El remoto tiene commits que yo no tengo. Hago `git pull --rebase` (o un pull con merge), resuelvo conflictos si los hay y vuelvo a hacer push. No fuerzo.

**«¿Diferencia entre `--force` y `--force-with-lease`?»**
`--force` sobrescribe la rama remota sin mirar. `--force-with-lease` solo lo hace si la rama remota sigue donde yo la vi; si alguien subió algo mientras tanto, falla y no se pierde su trabajo.

**«¿Qué es el upstream de una rama?»**
La rama remota asociada a una rama local. Permite `git push` y `git pull` sin argumentos y que `git status` diga si vas por delante o por detrás.

## Resumen

- `git push origin rama` sube tus commits; `-u` fija el upstream la primera vez.
- Un push se rechaza si no es fast-forward: integra con `pull` y vuelve a subir.
- `--force` puede borrar trabajo ajeno; si hay que forzar, `--force-with-lease` y nunca en ramas compartidas.
- HTTPS usa un token o un gestor de credenciales; SSH, un par de claves.
