---
title: Autenticación y la CLI gh
minutes: 11
---

## Qué problema resuelve

Para hacer push, GitHub tiene que saber **quién eres**. Tu contraseña de la cuenta **no** sirve para las operaciones de Git: necesitas un **token** o una **clave SSH**. Además, muchas tareas de GitHub (crear repos, forks, Pull Requests…) se pueden hacer desde la terminal con la **CLI oficial `gh`**, sin salir de tu flujo de trabajo y de forma automatizable.

## Analogía

La contraseña es la **llave maestra** de tu casa: no se la das a cualquiera. Un **token** es una **tarjeta de hotel**: abre solo ciertas puertas, caduca y se puede anular sin cambiar la cerradura. Una **clave SSH** es tu **huella dactilar** registrada en la puerta: la parte pública la tiene GitHub y la privada no sale nunca de tu ordenador.

## Concepto

**HTTPS con token.** Al hacer push por HTTPS, en lugar de tu contraseña usas un **personal access token** (PAT). Hay dos tipos:

- **Fine-grained** (recomendado por GitHub): limitado a repositorios concretos y con permisos detallados.
- **Classic**: permisos más amplios (*scopes*) sobre todos tus repositorios.

GitHub insiste en tratar los tokens **como contraseñas**: nunca en el código ni en un repositorio, y con fecha de caducidad.

**SSH.** Generas un par de claves y registras la **pública** en tu cuenta (*Settings → SSH and GPG keys*). La recomendación de GitHub:

```bash
ssh-keygen -t ed25519 -C "ada@example.com"   # Crea ~/.ssh/id_ed25519 (privada) e id_ed25519.pub (pública)
ssh -T git@github.com                         # Comprueba la conexión
```

Las URL SSH tienen la forma `git@github.com:ada/tienda.git`.

**La CLI `gh`.** Es la herramienta oficial de GitHub para la terminal. Lo primero es iniciar sesión:

```bash
gh auth login                  # Asistente interactivo (navegador o token, HTTPS o SSH)
gh auth login --web -p ssh     # Directo: navegador y protocolo SSH para Git
gh auth status                 # ¿Con qué cuenta estoy?
```

`gh auth login` también puede configurar Git para que use tus credenciales de `gh` (lo mismo hace `gh auth setup-git`), así que después `git push` por HTTPS funciona sin pedirte nada.

Comandos de repositorio más usados:

| Comando | Qué hace |
|---|---|
| `gh repo create tienda --public --clone` | Crea el repo en GitHub y lo clona |
| `gh repo create --source=. --private --push` | Sube a un repo nuevo un proyecto que ya tienes en local |
| `gh repo clone ada/tienda` | Clona con la forma corta `dueño/repo` |
| `gh repo fork biblioteca/proyecto --clone` | Hace fork y lo clona; `origin` = tu fork y `upstream` = el original |
| `gh repo view --web` | Abre el repo actual en el navegador |

## Ejemplo

```bash
gh auth login --web -p https
gh auth status
# ✓ Logged in to github.com account ada

# Un proyecto local que aún no está en GitHub
cd ~/proyectos/tienda
gh repo create tienda --private --source=. --push

# Contribuir a un proyecto ajeno
gh repo fork biblioteca/proyecto --clone
cd proyecto
git remote -v          # origin = tu fork, upstream = biblioteca/proyecto
```

## Errores comunes

- **Usar la contraseña de la cuenta al hacer push por HTTPS.** No se acepta: usa un token, `gh auth login` o SSH.
- **Compartir o subir la clave privada** (`id_ed25519`, sin `.pub`). Solo se registra la **pública**.
- **Tokens classic con todos los permisos y sin caducidad.** Usa fine-grained, con lo mínimo imprescindible.
- **Pegar un token en un script del repositorio.** En Actions se usan *secrets* (lo verás más adelante).

## En la entrevista

**«¿HTTPS o SSH para trabajar con GitHub?»**
Los dos son válidos. HTTPS funciona en casi cualquier red y se autentica con un token (o con el gestor de credenciales de `gh`). SSH usa un par de claves y no pide nada en cada push. Nunca la contraseña de la cuenta.

**«¿Qué ventaja tiene un fine-grained token sobre uno classic?»**
Se limita a repositorios concretos y a permisos detallados (mínimo privilegio), por eso GitHub lo recomienda.

**«¿Para qué usarías `gh` en vez de la web?»**
Para no salir de la terminal y, sobre todo, para automatizar: scripts y workflows que crean repos, PRs o releases.

## Resumen

- Para Git por HTTPS: **token** (mejor fine-grained), nunca la contraseña.
- SSH: `ssh-keygen -t ed25519`, registrar la clave **pública**, probar con `ssh -T git@github.com`.
- `gh auth login` / `gh auth status`: sesión de la CLI (y credenciales para Git).
- `gh repo create | clone | fork | view`: repositorios desde la terminal.
