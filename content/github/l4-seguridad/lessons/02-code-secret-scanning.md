---
title: Code scanning, secret scanning y push protection
minutes: 11
---

## Qué problema resuelve

Dependabot vigila el código de **otros**. Pero tu propio código también puede tener fallos de seguridad (una consulta SQL construida con texto del usuario, una ruta de fichero sin validar…) y, el error más frecuente y caro, **credenciales escritas en el código**. GitHub tiene herramientas que buscan las dos cosas automáticamente: **code scanning** y **secret scanning**, con **push protection** para que el secreto ni siquiera llegue a subirse.

## Analogía

- **Code scanning** es el **corrector ortográfico** de la seguridad: repasa el texto buscando patrones de error conocidos y los subraya.
- **Secret scanning** es el **detector de metales** después del control: encuentra lo que ya ha entrado.
- **Push protection** es el **arco de seguridad** de la entrada: no te deja pasar con la llave maestra en el bolsillo.

## Concepto

**Code scanning** analiza el código del repo y muestra los problemas como **alertas**. El motor de GitHub es **CodeQL**. Dos formas de configurarlo:

- **Default setup**: se activa desde los ajustes del repo (*Code security*) sin escribir nada; GitHub elige los lenguajes y ejecuta el análisis en pushes, en PRs y con una programación semanal. Necesita **GitHub Actions** activado.
- **Advanced setup**: un workflow de CodeQL en `.github/workflows/` que puedes personalizar.

También admite **herramientas de terceros** que generen resultados en formato **SARIF** (un estándar para resultados de análisis estático), ejecutadas en Actions o en otro CI.

**Secret scanning** busca credenciales (claves de API, tokens, contraseñas) en **toda la historia de Git de todas las ramas**, y también en issues, PRs, discussions, wikis y gists. En los repositorios públicos es **gratuito y automático**. Con el programa de *partners*, si encuentra una credencial de un proveedor asociado, GitHub **avisa al proveedor**, que puede revocarla.

**Push protection** va un paso antes: **bloquea el push** si contiene un secreto detectado, y explica por qué. Funciona con `git push` desde la terminal, con los commits hechos en la web, con las subidas de ficheros y con la API. Hay dos niveles:

- **Para usuarios**: activado por defecto en todas las cuentas; protege los pushes a repositorios **públicos**.
- **Para repositorios**: se activa en los ajustes del repo (requiere *Secret Protection*); genera alertas.

Si el bloqueo es un error, quien tenga permiso de escritura puede **saltárselo** eligiendo un motivo: *It's used in tests*, *It's a false positive* o *I'll fix it later* (este último deja una alerta abierta).

**Si un secreto se filtra**, lo primero es **revocarlo y generar uno nuevo** (rotarlo). Borrarlo de la historia de Git es costoso y, una vez revocado, normalmente no hace falta: el secreto ya no sirve.

## Ejemplo

Haces commit de un `.env` con un token por despiste y ejecutas `git push`:

```text
remote:   —— GitHub Personal Access Token ——————————————————————
remote:    locations:
 remote:      - commit: 8728dbe67
remote:        path: .env:1
```

(Fragmento del mensaje: indica qué tipo de secreto es y en qué commit y fichero está.) El push no llega a GitHub. Lo correcto:

```bash
git rm --cached .env           # Deja de seguir el fichero (se queda en disco)
echo ".env" >> .gitignore      # Para que no vuelva a añadirse
git commit --amend --no-edit   # Rehace el último commit sin el secreto
git push                       # Ahora el push pasa
```

Si el secreto está en un commit anterior, la documentación indica reescribirlo con `git rebase -i <COMMIT>~1`: marcar ese commit como `edit`, quitar el secreto, `git commit --amend` y `git rebase --continue`. Y si llegó a publicarse, **rótalo**.

## Errores comunes

- **Borrar el secreto en un commit nuevo y darlo por resuelto.** Sigue en la historia: hay que rotarlo.
- **Saltarse push protection con *It's a false positive* cuando no lo es.** El secreto se publica y queda registrado quién lo permitió.
- **Activar code scanning y no mirar nunca las alertas.** Revísalas en cada PR, que es cuando corregir es más barato.
- **Pensar que secret scanning solo mira el último commit.** Revisa toda la historia, en todas las ramas.

## En la entrevista

**«Has subido una clave de API a un repositorio público. ¿Qué haces?»**
Revocarla y generar una nueva inmediatamente: en un repo público, cualquiera puede haberla copiado ya. Después, quitarla del código, pasar a usar un secret o variable de entorno y, si hace falta, limpiar la historia. Para que no vuelva a pasar: `.gitignore` y push protection.

**«¿Qué diferencia hay entre secret scanning y push protection?»**
Secret scanning detecta secretos que ya están en el repositorio (en toda la historia). Push protection impide que entren: bloquea el push antes de que llegue a GitHub.

**«¿Qué es CodeQL?»**
El motor de análisis estático de GitHub para code scanning. Busca vulnerabilidades en el código y las muestra como alertas, también en los PRs.

## Resumen

- **Code scanning**: análisis estático con **CodeQL** (default o advanced setup) o herramientas de terceros vía **SARIF**.
- **Secret scanning**: credenciales en toda la historia, issues, PRs…; gratis y automático en repos públicos.
- **Push protection**: bloquea el push con secretos (terminal, web, API); para usuarios, activado por defecto en repos públicos.
- Secreto filtrado: **primero rotarlo**; limpiar la historia es secundario.
