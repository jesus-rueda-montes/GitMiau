---
title: Releases y Semantic Versioning
minutes: 11
---

## Qué problema resuelve

Tus usuarios no leen commits: quieren saber **qué versión** usar, **qué ha cambiado** y si actualizar **va a romper algo**. Un tag de Git marca el commit, pero no explica nada ni ofrece ficheros para descargar. Las **releases** de GitHub y el **versionado semántico** convierten un commit en una entrega que otros pueden entender y descargar.

## Analogía

Una **release** es la **edición de un libro**: tiene número (2.ª edición), una nota de la editorial con las novedades y ejemplares a la venta. El **versionado semántico** es la convención que dice si la nueva edición corrige erratas, añade capítulos o reescribe el libro entero.

## Concepto

**Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`, por ejemplo `2.4.1`.

| Sube… | Cuando… | Ejemplo |
|---|---|---|
| **MAJOR** | Haces cambios **incompatibles** con la versión anterior | `2.4.1` → `3.0.0` |
| **MINOR** | Añades funcionalidad **compatible** | `2.4.1` → `2.5.0` |
| **PATCH** | Corriges errores de forma **compatible** | `2.4.1` → `2.4.2` |

Reglas que se olvidan a menudo:

- al subir un número, **los de su derecha vuelven a 0** (`2.4.1` → `3.0.0`, no `3.4.1`);
- **`0.y.z`** es desarrollo inicial: cualquier cosa puede cambiar en cualquier momento;
- las **pre-releases** llevan un guion: `1.0.0-alpha`, `1.0.0-rc.1`, y van **antes** que la versión final (`1.0.0-alpha` < `1.0.0`);
- los **metadatos de build** llevan `+` (`1.0.0+20260930`) y no cuentan para ordenar versiones;
- `v1.2.3` no es, técnicamente, una versión SemVer, pero el prefijo `v` es la convención habitual **en los nombres de tag**.

**Releases.** Una release de GitHub se crea **a partir de un tag** y añade:

- **notas** (escritas a mano o generadas automáticamente);
- **ficheros adjuntos** (*assets*): binarios, instaladores…;
- los **archivos del código fuente** (zip y tar.gz) en ese tag, que GitHub añade solo.

Puede publicarse como **borrador** (*draft*), marcarse como **pre-release** o como **Latest** (por defecto, GitHub decide cuál es la última según la fecha y la versión). Solo quien tiene **permiso de escritura** puede gestionar releases.

**Notas generadas.** GitHub puede generar las notas: la lista de **PRs fusionados**, los **contribuidores** y un enlace al **changelog** completo. Se agrupan por labels con **`.github/release.yml`**:

```yaml
changelog:
  exclude:
    labels:
      - ignore-for-release     # Estos PRs no aparecen
  categories:
    - title: Cambios incompatibles
      labels:
        - breaking-change
    - title: Novedades
      labels:
        - enhancement
    - title: Otros cambios
      labels:
        - "*"                  # Todo lo demás
```

**Con `gh`:**

```bash
gh release create v1.2.0 --generate-notes     # Crea la release con notas generadas
gh release create v1.2.0 -F notas.md          # Con las notas de un fichero
gh release create v2.0.0-rc.1 --prerelease    # Una pre-release
gh release create v1.2.0 ./dist/*.tgz         # Adjunta ficheros
gh release list                               # Lista releases (alias: ls)
gh release view                               # La última release
gh release download v1.2.0 -p "*.tgz"         # Descarga los ficheros que coinciden
gh release upload v1.2.0 app.zip              # Añade un fichero a una release existente
```

Si el tag no existe, `gh release create` **lo crea** a partir del último estado de la rama por defecto. Con `--verify-tag` falla en vez de crearlo, que es lo prudente si el tag lo creas tú con `git tag -a`.

## Ejemplo

La versión publicada es `1.4.2`. Desde entonces se han fusionado dos PRs: uno añade la exportación a CSV (label `enhancement`) y otro corrige un fallo (label `bug`). Ninguno rompe la compatibilidad.

```bash
git switch main && git pull                  # Al día con main
git tag -a v1.5.0 -m "Versión 1.5.0"          # MINOR: hay funcionalidad nueva
git push origin v1.5.0                        # Los tags se suben aparte
gh release create v1.5.0 --verify-tag --generate-notes
```

Es `1.5.0` y no `1.4.3` porque hay una funcionalidad nueva, y no `2.0.0` porque nada es incompatible.

## Errores comunes

- **Subir PATCH cuando hay cambios incompatibles.** Quien actualice «solo un parche» verá su código roto.
- **No volver a 0**: `1.4.2` → `1.5.2` es incorrecto; lo correcto es `1.5.0`.
- **Pensar que `1.0.0-rc.1` es posterior a `1.0.0`.** Las pre-releases van antes.
- **Borrar o mover el tag de una release publicada.** Publica una versión nueva.
- **Escribir las notas a mano copiando commits.** Con labels en los PRs y `release.yml`, las notas se generan solas.

## En la entrevista

**«¿Qué es el versionado semántico?»**
`MAJOR.MINOR.PATCH`: MAJOR para cambios incompatibles, MINOR para funcionalidad compatible y PATCH para correcciones compatibles; al subir uno, los de la derecha vuelven a 0.

**«¿Qué diferencia hay entre un tag y una release?»**
El tag es un objeto de Git que marca un commit. La release es una función de GitHub construida sobre un tag, con notas, ficheros adjuntos y los archivos del código fuente.

**«¿Cómo generas el changelog?»**
Con las notas generadas de GitHub: agrupan los PRs fusionados por labels según `.github/release.yml`.

## Resumen

- SemVer: MAJOR (incompatible), MINOR (compatible con novedades), PATCH (correcciones); lo de la derecha vuelve a 0.
- Pre-release con guion (`-rc.1`), anterior a la final; `0.y.z` = desarrollo inicial.
- Release = tag + notas + assets + código fuente; draft, pre-release, Latest.
- Notas generadas: PRs, contribuidores y changelog, agrupados con `.github/release.yml`.
- `gh release create|list|view|download|upload|delete`.
