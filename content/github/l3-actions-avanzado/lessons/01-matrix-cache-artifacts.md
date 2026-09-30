---
title: Matrix, cache y artifacts
minutes: 11
---

## Qué problema resuelve

Tu librería tiene que funcionar en Node 20, 22 y 24, y en Linux y Windows: son 6 combinaciones y no quieres copiar el job 6 veces. Además, cada ejecución descarga todas las dependencias desde cero (lento) y el job de despliegue necesita los ficheros que compiló el job de build, que vive en otra máquina. **Matrix**, **cache** y **artifacts** resuelven estos tres problemas.

## Analogía

- **Matrix**: una **receta** que cocinas a la vez en varios hornos con distintas temperaturas.
- **Cache**: la **despensa**. En vez de ir al supermercado cada vez, reutilizas los ingredientes que ya compraste mientras sigan frescos.
- **Artifacts**: el **táper** con el plato ya hecho que le pasas al siguiente cocinero (el siguiente job), o que te llevas a casa (descarga).

## Concepto

**Matrix.** Con `strategy.matrix` defines variables con listas de valores y se crea **un job por cada combinación**:

```yaml
jobs:
  test:
    strategy:
      matrix:
        node: [20, 22, 24]
        os: [ubuntu-latest, windows-latest]    # 3 × 2 = 6 jobs
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci && npm test
```

- `include` añade combinaciones (o variables extra a combinaciones existentes) y `exclude` quita combinaciones.
- **`fail-fast`** vale **`true` por defecto**: si un job de la matrix falla, se cancelan los que están en curso o en cola. Ponlo a `false` si quieres ver todos los resultados.
- `max-parallel` limita cuántos jobs se ejecutan a la vez.
- Una matrix genera como máximo **256 jobs** por ejecución.

**Cache.** `actions/cache` guarda carpetas (dependencias descargadas) entre ejecuciones:

```yaml
- uses: actions/cache@v6
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

- `key`: si existe una caché con esa clave exacta, se restaura (`cache-hit` = `true`). Al incluir el hash del lockfile, cambiar las dependencias genera otra clave.
- `restore-keys`: si no hay coincidencia exacta, se busca la caché más reciente cuyo nombre **empiece** por esos prefijos.
- Límites: por defecto **10 GB por repositorio**, y las entradas que no se usan en **7 días** se borran.
- Muchas actions `setup-*` (`setup-node`, `setup-python`, `setup-java`…) traen **caché integrada**, que suele ser más sencilla.

**Artifacts.** Ficheros que produce un job y que se **guardan con la ejecución**: para descargarlos o para pasarlos a otro job.

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v7
        with:
          name: web
          path: dist/
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v8
        with:
          name: web
      - run: ls -R          # Aquí están los ficheros de dist/
```

Se conservan **90 días por defecto** (se puede reducir con `retention-days`), y el nombre de cada artifact debe ser único en la ejecución.

**Cache frente a artifact:** la caché acelera ejecuciones futuras con cosas que se pueden regenerar (dependencias). El artifact es un **resultado** de esta ejecución (un build, un informe de tests) que quieres conservar o pasar a otro job.

## Ejemplo

```bash
gh run view 123456              # Muestra los 6 jobs de la matrix y los artifacts
gh run download 123456          # Descarga los artifacts de la ejecución
```

## Errores comunes

- **Dejar `fail-fast: true` y no saber qué combinaciones fallan de verdad.** Un fallo cancela el resto.
- **Una `key` de caché fija** (sin hash del lockfile). Restaurarás dependencias viejas aunque cambies el `package-lock.json`.
- **Usar la caché para pasar el build entre jobs.** No está garantizada; para eso están los artifacts.
- **Matrices enormes** de combinaciones que nadie necesita. Usa `exclude` o reduce las variables.

## En la entrevista

**«¿Cómo probarías tu código en varias versiones y sistemas operativos?»**
Con una matrix: variables `os` y `version`, y `runs-on: ${{ matrix.os }}`. Con `fail-fast: false` si quiero ver todos los resultados aunque falle uno.

**«¿Diferencia entre cache y artifacts?»**
La caché reutiliza entre ejecuciones cosas regenerables para ir más rápido, y puede no estar. Los artifacts guardan resultados de una ejecución (builds, informes) para descargarlos o pasarlos a otro job.

## Resumen

- `strategy.matrix`: un job por combinación; `include`/`exclude`; `fail-fast` es `true` por defecto; máximo 256 jobs.
- `actions/cache`: `path` + `key` (con `hashFiles`) + `restore-keys`; 10 GB por repo; 7 días sin uso.
- `upload-artifact` / `download-artifact`: pasar ficheros entre jobs; 90 días por defecto.
- Caché = acelerar; artifact = conservar o compartir un resultado.
