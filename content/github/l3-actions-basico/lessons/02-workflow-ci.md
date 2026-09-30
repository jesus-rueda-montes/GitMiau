---
title: Un workflow de CI, permisos y seguridad
minutes: 12
---

## Qué problema resuelve

Ya conoces las piezas. Ahora toca montar el workflow más habitual del mundo: el **CI** que, en cada PR, instala, comprueba y testea el proyecto, de forma que el PR muestre un check verde o rojo. También hay que hacerlo **seguro**: un workflow tiene acceso a tu repositorio y a tus secretos.

## Analogía

El CI es el **control de calidad** a la salida de la fábrica: ninguna pieza sale sin pasar por él. Y como el control tiene llaves del almacén, se le dan **solo las llaves que necesita** (permisos mínimos) y no se deja entrar a cualquiera con cualquier herramienta (actions de confianza, fijadas a una versión).

## Concepto

**Un CI típico para un proyecto Node.js:**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read                # El GITHUB_TOKEN solo puede leer el repo

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:                   # Entradas (inputs) de la action
          node-version: 24
      - run: npm ci
      - run: npm test

  build:
    needs: test                 # Solo empieza si test termina bien
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: npm ci && npm run build
```

- `with` pasa entradas a una action; `env` define variables de entorno (en el workflow, en un job o en un step).
- `needs` encadena jobs: `build` espera a `test`.
- `if` ejecuta un job o un step solo si se cumple una condición, por ejemplo `if: github.ref == 'refs/heads/main'`.

**`GITHUB_TOKEN`.** En cada ejecución, GitHub crea automáticamente un token para que el workflow actúe sobre el repositorio (leer código, comentar en un PR, publicar un release…). Se usa como `${{ secrets.GITHUB_TOKEN }}` (o `github.token`). Con la clave **`permissions`** (a nivel de workflow o de job) le das **el mínimo necesario**, por ejemplo `contents: read`.

Un detalle importante: los eventos que provoca el `GITHUB_TOKEN` **no crean nuevas ejecuciones de workflows** (salvo `workflow_dispatch` y `repository_dispatch`). Así se evitan bucles infinitos: si tu workflow hace push con ese token, el workflow de `push` no se vuelve a disparar.

**Seguridad:**

- **Fijar las actions de terceros.** `uses: dueño/action@v2` depende de que nadie mueva ese tag. GitHub indica que fijar a un **SHA completo** de commit es la única forma de usar una action como versión **inmutable**: `uses: dueño/action@<sha de 40 caracteres>`. Si usas un tag, que sea de alguien de confianza.
- **Inyección de scripts.** No metas datos que controla cualquiera (el título de un PR o de una issue) directamente en un `run`:

  ```yaml
  # MAL: el título se pega dentro del script y puede contener comandos
  - run: echo "${{ github.event.pull_request.title }}"
  # BIEN: pásalo por una variable de entorno intermedia
  - env:
      TITULO: ${{ github.event.pull_request.title }}
    run: echo "$TITULO"
  ```

**Con `gh`:**

| Comando | Qué hace |
|---|---|
| `gh run list` (`ls`) | Últimas ejecuciones; `--workflow ci.yml`, `--branch`, `--status failure` |
| `gh run watch` | Sigue una ejecución en directo |
| `gh run view <id> --log-failed` | Logs solo de los pasos que fallaron |
| `gh run rerun <id> --failed` | Relanza solo los jobs fallidos |
| `gh workflow run ci.yml --ref main` | Lanza a mano un workflow con `workflow_dispatch` |
| `gh workflow list` | Workflows del repositorio |

## Ejemplo

```bash
git push -u origin feature/login
gh pr create --fill
gh run watch                          # Elige la ejecución y la sigue en directo
# X test  failed
gh run view 123456 --log-failed       # ¿Qué ha fallado?
# ... arreglas, commit, push: el CI se vuelve a ejecutar solo ...
gh pr checks                          # Todos los checks del PR en verde
```

## Errores comunes

- **Dejar el `GITHUB_TOKEN` con más permisos de los necesarios.** Declara `permissions` con lo mínimo.
- **Usar actions de desconocidos con un tag que puede moverse.** Fija el SHA.
- **Interpolar `github.event.*` en `run`.** Riesgo de inyección: variable de entorno intermedia.
- **Esperar que un push hecho con el `GITHUB_TOKEN` dispare otro workflow.** No lo hace (salvo `workflow_dispatch`/`repository_dispatch`).

## En la entrevista

**«¿Qué es el `GITHUB_TOKEN` y cómo lo limitas?»**
Un token que GitHub crea en cada ejecución para que el workflow actúe sobre el repo. Se limita con la clave `permissions`, dando solo lo necesario (por ejemplo `contents: read`).

**«¿Cómo usas una action de terceros de forma segura?»**
Revisándola y fijándola al SHA completo de un commit, que es inmutable, en vez de a un tag que se puede mover.

**«¿Qué es la inyección de scripts en Actions?»**
Meter en un `run` texto que controla un atacante (el título de un PR) mediante `${{ }}`: se pega en el script y puede ejecutar comandos. Se evita pasándolo por una variable de entorno.

## Resumen

- CI típico: `on: push/pull_request` → checkout → setup → install → test.
- `with` (entradas de actions), `env` (variables), `needs` (orden entre jobs), `if` (condiciones).
- `GITHUB_TOKEN`: automático; limítalo con `permissions`. Sus eventos no disparan otros workflows.
- Seguridad: actions fijadas a SHA y datos no confiables a través de `env`.
- `gh run list | watch | view --log-failed | rerun --failed` y `gh workflow run`.
