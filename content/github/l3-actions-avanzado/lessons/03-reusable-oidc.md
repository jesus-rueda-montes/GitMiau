---
title: Reusable workflows y OIDC
minutes: 10
---

## Qué problema resuelve

Tienes 20 repositorios con el mismo workflow de CI copiado y pegado. Cada mejora hay que hacerla 20 veces. Y para desplegar en la nube guardas una clave de acceso de larga duración como secret: si se filtra, sirve hasta que alguien la revoque. **Reusable workflows** y **OIDC** atacan estos dos problemas.

## Analogía

Un **reusable workflow** es una **receta estándar** del restaurante: todas las cocinas la usan y, si el chef la mejora, mejora en todas. **OIDC** es la **pulsera de un festival**: en vez de darte una llave maestra, en la puerta comprueban quién eres y te dan una entrada que caduca al acabar la noche.

## Concepto

**Reusable workflows.** Un workflow se vuelve reutilizable declarando el evento **`workflow_call`**, con sus entradas y secretos:

```yaml
# .github/workflows/ci-node.yml (el reutilizable)
on:
  workflow_call:
    inputs:
      node-version:
        type: string
        required: true
    secrets:
      NPM_TOKEN:
        required: false
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci && npm test
```

Se llama **a nivel de job** con `uses`, no dentro de un step:

```yaml
# El workflow que lo usa
jobs:
  ci:
    uses: mi-org/plantillas/.github/workflows/ci-node.yml@v1   # o ./.github/workflows/ci-node.yml
    with:
      node-version: "24"
    secrets: inherit           # Pasa todos los secrets del llamante
```

- En el mismo repo: `./.github/workflows/fichero.yml`. En otro: `dueño/repo/.github/workflows/fichero.yml@ref` (un SHA, un tag o una rama).
- Los secrets **no se pasan solos**: `secrets: inherit` o uno a uno.
- Se pueden encadenar hasta **10 niveles** (el workflow principal y hasta 9 reutilizables).

**OIDC (OpenID Connect).** En vez de guardar una clave de la nube como secret, el workflow **pide a GitHub un token de identidad** (un JWT) que dice «soy el repo X, rama Y, environment Z». El proveedor de nube (AWS, Azure, GCP, HashiCorp Vault…) confía en GitHub, comprueba esos datos (*claims*) y entrega **credenciales temporales** que caducan al terminar.

- Hay que dar al `GITHUB_TOKEN` el permiso **`id-token: write`** (y `contents: read` para el checkout).
- En la nube se configura una **política de confianza** que solo acepta tokens de tu repo y rama, por ejemplo `repo:mi-org/tienda:ref:refs/heads/main`.
- Los proveedores tienen actions oficiales para hacer el intercambio.

```yaml
permissions:
  id-token: write     # Permite pedir el token OIDC
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v7
      - uses: aws-actions/configure-aws-credentials@<sha>   # Action oficial de AWS, fijada a un SHA
        with:
          role-to-assume: arn:aws:iam::123456789012:role/despliegue
          aws-region: eu-west-1
      - run: aws s3 sync dist/ s3://mi-web
```

**Ventajas de OIDC:** no hay credenciales de larga duración guardadas en GitHub que se puedan filtrar, el acceso se limita por repo, rama o environment, y las credenciales caducan solas.

## Ejemplo

Estructura típica en una organización:

```text
mi-org/plantillas/.github/workflows/ci-node.yml   ← workflow_call, versionado con tags
mi-org/tienda/.github/workflows/ci.yml            ← uses: mi-org/plantillas/…@v1
mi-org/blog/.github/workflows/ci.yml              ← uses: mi-org/plantillas/…@v1
```

Una mejora en `plantillas` con un tag `v1.1` llega a todos los repositorios que la usan.

## Errores comunes

- **Poner `uses:` de un reusable workflow dentro de `steps`.** Va a nivel de job.
- **Olvidar pasar los secrets** al reusable workflow. No los hereda salvo `secrets: inherit`.
- **OIDC sin `id-token: write`.** El workflow no puede pedir el token y el login en la nube falla.
- **Una política de confianza OIDC demasiado abierta** (cualquier repo de la organización o cualquier rama). Restringe el repo, la rama o el environment.

## En la entrevista

**«¿Cómo evitas duplicar workflows entre repositorios?»**
Con reusable workflows (`on: workflow_call`), llamados con `uses` a nivel de job y versionados con tags. Para trozos de pasos, con composite actions.

**«¿Qué ventaja tiene OIDC frente a guardar una clave de la nube como secret?»**
No hay credenciales de larga duración guardadas: el workflow obtiene credenciales temporales tras demostrar su identidad (repo, rama, environment), y la nube solo confía en los tokens que cumplen su política. Requiere `permissions: id-token: write`.

## Resumen

- Reusable workflow: `on: workflow_call` (inputs y secrets); se llama con `jobs.<id>.uses`; `secrets: inherit`; hasta 10 niveles.
- OIDC: token de identidad de GitHub → credenciales temporales de la nube; requiere `id-token: write`.
- La política de confianza de la nube restringe repo, rama o environment.
- Sin claves de larga duración que puedan filtrarse.
