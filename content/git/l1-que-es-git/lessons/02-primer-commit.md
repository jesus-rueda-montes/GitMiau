---
title: Tu primer repositorio y tu primer commit
minutes: 10
---

## Qué problema resuelve

Ya sabes qué es un commit. Ahora toca crearlo de verdad: decir quién eres, convertir una carpeta en repositorio, ver el estado de los archivos, prepararlos, guardarlos y consultar la historia. Son los comandos que usarás **todos los días**.

## Analogía

Es como abrir una **cuenta en un banco**. Primero te identificas (`git config`), después abres la cuenta (`git init`), revisas el extracto (`git status`), preparas un ingreso (`git add`), lo confirmas (`git commit`) y consultas los movimientos (`git log`).

## Concepto

**1. Identificarte (una vez por máquina).** Cada commit guarda un autor. Si Git no sabe quién eres, se queja al hacer commit:

```bash
git config set --global user.name "Ada Lovelace"
git config set --global user.email "ada@example.com"
```

`--global` guarda la configuración para tu usuario (en `~/.gitconfig`). `--local`, la opción por defecto al escribir, la guarda solo para el repositorio actual (en `.git/config`). Los subcomandos `set`, `get` y `list` son la forma moderna. La forma clásica, `git config --global user.name "Ada Lovelace"`, sigue funcionando y la verás en muchos tutoriales, pero la documentación oficial la marca como obsoleta (*deprecated*).

**2. Crear el repositorio.** `git init` crea la carpeta oculta `.git`, donde vive toda la historia. Borrar `.git` es borrar la historia. La rama inicial se llama `master` o `main` según tu versión y tu configuración (`init.defaultBranch`). Para elegirla, usa `git init -b main`.

**3. Ver el estado.** `git status` dice en qué rama estás, qué hay preparado, qué está modificado y qué archivos no tienen seguimiento. Con `-s` (`--short`) muestra una línea por archivo:

| Código | Significado |
|---|---|
| `??` | Untracked (sin seguimiento) |
| `A ` | Archivo nuevo preparado |
| `M ` | Modificado y preparado |
| ` M` | Modificado, **sin** preparar |

La primera columna es la staging area; la segunda, el working tree.

**4. Preparar cambios.** `git add <ruta>` pasa cambios a la staging area:

- `git add app.py` prepara un archivo;
- `git add .` prepara todo lo que hay en la carpeta actual y sus subcarpetas;
- `git add -A` (`--all`) prepara todos los cambios del repositorio, incluidos los borrados;
- `git add -p` (`--patch`) te deja elegir trozo a trozo.

**5. Guardar el commit.** `git commit -m "mensaje"` crea el commit con lo que hay en la staging area. Sin `-m`, Git abre un editor para escribir el mensaje. `git commit -a -m "…"` prepara antes los archivos **con seguimiento** que se han modificado o borrado, pero **no** incluye los archivos nuevos (untracked).

**6. Ver la historia.** `git log` muestra los commits del más nuevo al más antiguo. Algunas opciones útiles:

- `--oneline`: un commit por línea, con el hash abreviado;
- `-n 5` (`--max-count=5`): solo los 5 últimos;
- `--graph`: dibuja las ramas;
- `--stat`: qué archivos cambió cada commit.

## Ejemplo

```bash
git init -b main                        # Crea el repo con la rama main
git status                              # README.md aparece como untracked
git add README.md                       # Lo pasa a la staging area
git status -s                           # "A  README.md": nuevo y preparado
git commit -m "Añade el README"         # Primer commit
git log --oneline                       # 3f2a9c1 (HEAD -> main) Añade el README
```

`HEAD` es un puntero a "dónde estás ahora": normalmente, la rama actual y su último commit.

## Errores comunes

- **Hacer `git init` dentro de otro repositorio** (o en tu carpeta personal). Acabas con repos anidados o con Git vigilando medio disco. Ejecútalo en la carpeta del proyecto.
- **Creer que `git commit -a` incluye archivos nuevos.** Solo incluye los que ya tienen seguimiento. Los nuevos necesitan `git add`.
- **No configurar `user.email`**, o usar uno distinto al de tu cuenta de GitHub. Tus commits no aparecerán asociados a tu perfil.
- **Borrar la carpeta `.git`** para "limpiar". Borra toda la historia del proyecto.
- **Usar `git add .` sin mirar `git status`.** Es muy fácil preparar por accidente archivos con secretos o de compilación. Revisa antes qué vas a preparar.

## En la entrevista

**«¿Qué hace `git init` exactamente?»**
Crea un repositorio vacío: la carpeta `.git` con la base de datos de objetos, las referencias (ramas) y la configuración local. Los archivos del directorio no cambian.

**«¿Qué diferencia hay entre `git add .` y `git commit -a`?»**
`git add .` prepara todos los cambios de la carpeta actual, incluidos los archivos nuevos. `git commit -a` prepara y guarda solo los archivos que ya tienen seguimiento, así que ignora los nuevos.

**«¿Qué es HEAD?»**
Una referencia a la posición actual: normalmente apunta a la rama en la que estás, y esta, a su último commit.

## Resumen

- `git config set --global user.name` / `user.email`: identifícate una vez por máquina.
- `git init`: crea el repositorio (la carpeta `.git`).
- `git status` (`-s` para el formato corto): tu brújula; úsala antes y después de todo.
- `git add`: prepara los cambios. `git commit -m`: los guarda en la historia.
- `git log --oneline`: la historia, un commit por línea.
