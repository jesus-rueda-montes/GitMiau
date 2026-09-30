---
title: Workflows, eventos, jobs y runners
minutes: 11
---

## Qué problema resuelve

Cada vez que alguien abre un PR habría que instalar dependencias, compilar, pasar los tests y el linter y, al fusionar, desplegar. Hacerlo a mano es lento y se olvida. **GitHub Actions** automatiza estas tareas: se ejecutan solas cuando pasa algo en el repositorio. Es la base del **CI/CD** (integración y entrega continuas) en GitHub. Los workflows se escriben en YAML: si no te sientes seguro con su sintaxis, repasa antes el módulo «YAML sin miedo» de Fundamentos.

## Analogía

Es una **cadena de montaje con sensores**. Un sensor detecta que ha llegado una pieza (el **evento**: un push, un PR…) y pone en marcha una o varias **estaciones de trabajo** (los **jobs**). Cada estación está en su propia **máquina** (el **runner**) y sigue una lista de **pasos** (los **steps**). Algunos pasos son herramientas compradas y listas para usar (las **actions** del Marketplace).

## Concepto

| Pieza | Qué es |
|---|---|
| **Workflow** | Un proceso automatizado, definido en un fichero YAML en **`.github/workflows/`** (`.yml` o `.yaml`) |
| **Evento** (`on`) | Lo que lo dispara: `push`, `pull_request`, `schedule`, `workflow_dispatch` (manual)… |
| **Job** | Un conjunto de steps que se ejecuta en un runner. Los jobs de un workflow van **en paralelo** salvo que uno dependa de otro con `needs` |
| **Step** | Un paso dentro de un job: un comando (`run`) o una action (`uses`). Van en orden y comparten el sistema de ficheros del runner |
| **Runner** | La máquina que ejecuta un job. Los de GitHub son máquinas virtuales nuevas para cada job (Ubuntu, Windows o macOS) |
| **Action** | Un bloque reutilizable, como `actions/checkout` (descarga el código del repo) o `actions/setup-node` (instala Node.js) |

**Eventos más usados:**

```yaml
on:
  push:
    branches: [main]          # Solo los push a main
    paths: ["src/**"]         # …y solo si cambia algo en src/
  pull_request:               # PRs abiertos o actualizados
  workflow_dispatch:          # Botón «Run workflow» (o gh workflow run)
  schedule:
    - cron: "0 6 * * 1"       # Cada lunes a las 06:00 UTC
```

- Los filtros `branches`, `paths` y `tags` (este último, solo en `push`) usan patrones glob (`*`, `**`…). También existen `branches-ignore` y `paths-ignore`.
- `schedule` usa sintaxis cron de cinco campos (minuto, hora, día del mes, mes, día de la semana), siempre en **UTC**. El intervalo mínimo es **cada 5 minutos**.

**Runners alojados por GitHub.** Se eligen con `runs-on`, por ejemplo `ubuntu-latest`, `windows-latest` o `macos-latest` (o una versión fija como `ubuntu-24.04`). En **repositorios públicos** su uso es **gratuito e ilimitado**. También puedes usar **self-hosted runners**, máquinas tuyas registradas en GitHub.

Por defecto, un job que dura más de **360 minutos** (6 horas) se cancela; se puede cambiar con `timeout-minutes`.

## Ejemplo

El workflow mínimo, con un job y dos steps:

```yaml
# .github/workflows/saludo.yml
name: Saludo
on: [push]
jobs:
  saludar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7          # Descarga el código del repositorio
      - run: echo "Hola desde ${{ github.ref_name }}"   # Un comando de shell
```

`${{ … }}` es una **expresión**: aquí lee el contexto `github` para mostrar el nombre de la rama.

## Errores comunes

- **Poner el workflow fuera de `.github/workflows/`.** GitHub no lo encuentra y no se ejecuta.
- **Olvidar `actions/checkout`.** El runner empieza vacío: sin ese paso, tu código no está.
- **Suponer que los jobs comparten ficheros.** Cada job va en una máquina nueva; para pasar ficheros entre jobs hacen falta artifacts (en el módulo avanzado).
- **Escribir el cron en tu hora local.** Es UTC.

## En la entrevista

**«¿Qué diferencia hay entre un job y un step?»**
Un job es un conjunto de pasos que se ejecuta en su propio runner; los jobs van en paralelo salvo que se encadenen con `needs`. Un step es un paso dentro de un job (un comando o una action) y se ejecuta en orden, en la misma máquina que los demás steps del job.

**«¿Cómo lanzarías un workflow a mano?»**
Añadiendo `workflow_dispatch` a `on`: aparece un botón en la pestaña Actions y también se puede lanzar con `gh workflow run`.

## Resumen

- Workflow = YAML en `.github/workflows/`, disparado por eventos (`on`).
- Jobs en paralelo (salvo `needs`), cada uno en su runner; steps en orden dentro del job.
- Steps: `run` (comandos) o `uses` (actions reutilizables).
- `schedule` usa cron en UTC (mínimo cada 5 minutos); `workflow_dispatch` permite lanzarlo a mano.
- Runners de GitHub: `ubuntu-latest`, `windows-latest`, `macos-latest`; gratis en repos públicos.
