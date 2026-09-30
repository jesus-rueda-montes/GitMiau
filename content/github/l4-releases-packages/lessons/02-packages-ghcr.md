---
title: GitHub Packages y el Container registry
minutes: 9
---

## Qué problema resuelve

Tu proyecto no solo produce código: produce **paquetes** (una librería de npm, un `.jar` de Maven) e **imágenes de contenedor** que otros instalan o despliegan. Necesitan un sitio donde publicarse, con control de acceso, cerca del código y del CI que los construye. **GitHub Packages** es ese sitio.

## Analogía

Si el repositorio es el **taller** donde se fabrica, GitHub Packages es el **almacén de al lado**: lo que sale de la cadena (el CI) se guarda allí, etiquetado con su versión, y los clientes lo recogen sin tener que entrar en el taller.

## Concepto

**GitHub Packages** tiene registros para varios ecosistemas: **npm**, **Maven**, **Gradle**, **NuGet**, **RubyGems** y el **Container registry** para imágenes Docker y OCI. Es **gratuito para paquetes públicos**; los privados tienen una cuota incluida según el plan.

**Container registry (`ghcr.io`).** Las imágenes se nombran así:

```text
ghcr.io/PROPIETARIO/IMAGEN:TAG
ghcr.io/mi-org/tienda:1.5.0
```

- Un paquete nuevo es **privado por defecto**; se hace público desde sus ajustes.
- Se **vincula a un repositorio** con la etiqueta `org.opencontainers.image.source` en el `Dockerfile`, y así aparece en la página del repo.
- Tiene **permisos propios** (por usuario, equipo u organización), además de los que hereda del repo vinculado.

**Autenticación.**

- Desde tu máquina, GitHub Packages **solo acepta tokens classic**, con los scopes `read:packages` (descargar), `write:packages` (publicar) o `delete:packages` (borrar):

  ```bash
  echo $CR_PAT | docker login ghcr.io -u USUARIO --password-stdin
  ```

  Con `--password-stdin` el token no queda en el historial de la terminal.

- **En Actions**, lo recomendado es el **`GITHUB_TOKEN`** con `permissions: packages: write`: no hace falta crear ningún token personal.

## Ejemplo

Workflow que, al subir un tag `v*`, construye la imagen y la publica en `ghcr.io` con la versión del tag:

```yaml
name: Publicar imagen
on:
  push:
    tags:
      - "v*"                        # Solo al subir un tag de versión
permissions:
  contents: read
  packages: write                   # Para publicar en ghcr.io
jobs:
  imagen:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - name: Login en ghcr.io
        run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
      - name: Construir y publicar
        run: |
          docker build -t ghcr.io/${{ github.repository }}:${{ github.ref_name }} .
          docker push ghcr.io/${{ github.repository }}:${{ github.ref_name }}
```

- `github.repository` es `propietario/repo` y `github.ref_name` es el nombre del tag (`v1.5.0`).
- El ejemplo de la documentación oficial usa las actions `docker/login-action`, `docker/metadata-action` y `docker/build-push-action`, fijadas a un SHA de commit. El resultado es el mismo; las actions añaden, por ejemplo, etiquetas automáticas.
- Docker exige nombres de imagen en minúsculas: si el propietario o el repo tienen mayúsculas, hay que convertirlos.

## Errores comunes

- **Crear un token personal para publicar desde Actions.** Basta con `GITHUB_TOKEN` y `packages: write`.
- **Olvidar `packages: write`** en `permissions`: el push de la imagen falla por falta de permisos.
- **Usar un token fine-grained para `docker login` desde tu máquina.** GitHub Packages solo acepta tokens classic.
- **Esperar que la imagen sea pública al publicarla.** Es privada por defecto.
- **Publicar solo la etiqueta `latest`.** No se sabe qué versión es ni se puede volver atrás; publica también la versión.

## En la entrevista

**«¿Dónde publicarías la imagen Docker de un proyecto alojado en GitHub?»**
En el Container registry de GitHub Packages (`ghcr.io`), desde un workflow de Actions que se ejecuta al crear un tag, con el `GITHUB_TOKEN` y `permissions: packages: write`.

**«¿Cómo te autenticas en `ghcr.io`?»**
En Actions, con el `GITHUB_TOKEN`. Desde fuera, con un token classic con `read:packages` o `write:packages` y `docker login ghcr.io --password-stdin`.

## Resumen

- GitHub Packages: npm, Maven, Gradle, NuGet, RubyGems y Container registry; gratis para paquetes públicos.
- Imágenes: `ghcr.io/PROPIETARIO/IMAGEN:TAG`; privadas por defecto; se vinculan al repo con `org.opencontainers.image.source`.
- Fuera de Actions: token classic (`read:packages`, `write:packages`, `delete:packages`).
- En Actions: `GITHUB_TOKEN` + `permissions: packages: write`.
