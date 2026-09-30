---
title: Secrets, variables y environments
minutes: 10
---

## Qué problema resuelve

Para desplegar, un workflow necesita credenciales: una clave de API, un token de un registro… No pueden estar en el código. Además, desplegar a **producción** no debería ocurrir sin que alguien lo apruebe. **Secrets**, **variables** y **environments** cubren estas necesidades.

## Analogía

Los **secrets** son la **caja fuerte**: el workflow puede usar lo que hay dentro, pero nadie lo ve (ni siquiera en los logs). Las **variables** son el **tablón de avisos**: configuración a la vista de todos. Un **environment** es la **sala de máquinas de producción**: tiene su propia caja fuerte y una puerta que solo se abre cuando un responsable firma.

## Concepto

**Secrets.** Se crean en *Settings → Secrets and variables → Actions*, a tres niveles: **organización**, **repositorio** y **environment**. En el workflow se leen con `${{ secrets.NOMBRE }}` y se pasan por `env` o por `with`:

```yaml
- run: ./publicar.sh
  env:
    API_KEY: ${{ secrets.API_KEY }}
```

- GitHub **oculta** su valor en los logs (`***`), aunque solo puede hacerlo con los secretos que se usan en el job actual.
- **Salvo el `GITHUB_TOKEN`, los secrets no llegan al runner cuando el workflow lo dispara un PR desde un fork.** Si no, cualquiera podría abrir un PR que los imprimiera.
- No se pueden usar directamente en un `if:`. Si hace falta, se asignan antes a una variable de entorno.

**Variables** (*configuration variables*). Para configuración **no sensible** (una región, un nombre de entorno…), en los mismos tres niveles. Se leen con `${{ vars.NOMBRE }}`; si no existe, se obtiene una cadena vacía.

**Environments.** Un environment (por ejemplo `production`) agrupa **reglas de protección** y **secrets propios**. Un job lo usa con `environment`:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - run: ./desplegar.sh
        env:
          TOKEN: ${{ secrets.DEPLOY_TOKEN }}   # Secret del environment production
```

Reglas de protección disponibles:

- **Required reviewers**: una persona debe aprobar el despliegue;
- **Wait timer**: esperar X minutos antes de empezar;
- **Deployment branches and tags**: solo se puede desplegar desde ciertas ramas o tags (por ejemplo, solo `main`);
- reglas personalizadas (*custom deployment protection rules*).

El job solo accede a los secrets del environment **cuando las reglas se cumplen** y se envía al runner.

**Concurrency.** Para que no se pisen dos despliegues, `concurrency` hace que solo se ejecute a la vez un job o workflow de un mismo grupo. Con `cancel-in-progress: true`, el nuevo cancela al que estaba en curso:

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: true
```

## Ejemplo

```yaml
name: Deploy
on:
  push:
    branches: [main]
concurrency:
  group: deploy-production
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production        # Pide aprobación y da acceso a sus secrets
    steps:
      - uses: actions/checkout@v7
      - run: ./desplegar.sh --region "${{ vars.REGION }}"
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

## Errores comunes

- **Guardar credenciales en variables** (`vars`) en lugar de secrets. Las variables no se ocultan.
- **Imprimir un secret transformado** (codificado en base64, cortado…). El ocultado automático ya no lo reconoce.
- **Esperar que un PR desde un fork tenga acceso a los secrets.** No lo tiene, por seguridad.
- **Desplegar a producción sin environment** ni revisores: un push equivocado va directo a los usuarios.

## En la entrevista

**«¿Cómo gestionas las credenciales en GitHub Actions?»**
Como secrets (de repo, organización o environment), leídos con `secrets.X` y pasados por `env`. Mejor aún, con OIDC para no guardar credenciales de larga duración. Los datos no sensibles van en `vars`.

**«¿Cómo evitas que cualquier push despliegue en producción?»**
Con un environment `production` con revisores obligatorios y restricción de ramas, y con los secrets de producción solo en ese environment.

**«¿Por qué un workflow de un PR desde un fork no ve los secrets?»**
Porque el código del PR lo controla un desconocido: podría leerlos y enviarlos fuera. GitHub no los pasa (salvo el `GITHUB_TOKEN`).

## Resumen

- `secrets.X`: credenciales, ocultas en los logs; a nivel de organización, repo o environment.
- `vars.X`: configuración no sensible.
- Los PRs desde forks no reciben secrets (salvo el `GITHUB_TOKEN`).
- `environment: production`: revisores, wait timer, ramas permitidas y secrets propios.
- `concurrency` evita ejecuciones simultáneas de un mismo grupo.
