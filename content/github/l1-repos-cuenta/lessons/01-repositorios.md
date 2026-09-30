---
title: Repositorios en GitHub
minutes: 9
---

## Qué problema resuelve

Git guarda la historia en tu máquina, pero para colaborar hace falta un sitio común donde viva el repositorio, con control de quién puede verlo y quién puede cambiarlo, una portada que explique el proyecto y unas reglas claras sobre qué pueden hacer otros con tu código. Eso es un **repositorio en GitHub**.

## Analogía

Un repositorio en GitHub es como un **local comercial**. La **visibilidad** decide si la puerta está abierta al público o solo entra quien tiene llave. El **README** es el escaparate. La **licencia** es el cartel con las condiciones de uso. Y un **fork** es que otra persona monte una copia del local para probar sus propias ideas y, si le gustan, proponértelas.

## Concepto

**Visibilidad:**

| Tipo | Quién lo ve |
|---|---|
| **Público** | Cualquiera en internet (pero solo quien tenga permiso puede escribir) |
| **Privado** | Solo tú y las personas o equipos a los que des acceso |
| **Interno** | Todos los miembros de la empresa (solo en organizaciones de GitHub Enterprise) |

**Ficheros que se esperan en la raíz:**

- **`README.md`**: la portada. GitHub la muestra al entrar en el repo. Explica qué es el proyecto, cómo instalarlo y cómo usarlo.
- **`LICENSE`**: qué pueden hacer otros con tu código. **Sin licencia se aplica el copyright por defecto**: conservas todos los derechos y nadie puede reproducir, distribuir ni crear obras derivadas. Aun así, los términos de servicio de GitHub permiten a los demás **ver** tu repositorio público y hacer **fork**. Si quieres que se pueda reutilizar, elige una licencia (MIT, Apache 2.0, GPL…).
- **`.gitignore`**: al crear un repo, GitHub ofrece plantillas por lenguaje.

**Fork.** Un fork es **tu copia de un repositorio ajeno**, en tu cuenta. Sirve para proponer cambios a proyectos donde **no tienes permiso de escritura**: haces cambios en tu fork y abres un Pull Request al original. La convención de remotos es:

- `origin` → tu fork (donde haces push);
- `upstream` → el repositorio original (de donde traes novedades con `git fetch upstream`).

**Otras acciones sociales:** una **star** marca un repositorio como favorito (y es una señal pública de popularidad). **Watch** te suscribe a sus notificaciones.

## Ejemplo

Contribuir a un proyecto open source con un fork:

```bash
# 1. En la web: botón "Fork" en github.com/biblioteca/proyecto
# 2. Clonas TU fork
git clone https://github.com/ada/proyecto.git
cd proyecto
# 3. Añades el original como upstream
git remote add upstream https://github.com/biblioteca/proyecto.git
git remote -v
# origin    https://github.com/ada/proyecto.git (fetch)
# upstream  https://github.com/biblioteca/proyecto.git (fetch)
# 4. Rama, cambios, push a tu fork y Pull Request al original
git switch -c arregla-typo
git commit -am "Corrige una errata en la documentación"
git push -u origin arregla-typo
```

## Errores comunes

- **Publicar un repo sin licencia pensando que así es «libre».** Es justo lo contrario: sin licencia nadie tiene permiso legal para reutilizarlo.
- **Subir secretos a un repo privado «porque es privado».** Cualquiera con acceso puede verlos, y un repo privado puede hacerse público más adelante.
- **Hacer push al repositorio original en vez de a tu fork.** Sin permiso de escritura se rechaza; tu destino es `origin` (tu fork).
- **No sincronizar el fork.** Tu copia se queda atrás; trae las novedades de `upstream` antes de empezar cada cambio.

## En la entrevista

**«¿Qué es un fork y para qué sirve?»**
Una copia de un repositorio en tu cuenta. Permite proponer cambios a proyectos donde no tienes permiso de escritura, mediante Pull Requests desde el fork al original.

**«¿Qué pasa si un repositorio público no tiene licencia?»**
Se aplica el copyright por defecto: el autor conserva todos los derechos y nadie puede reutilizar el código legalmente, aunque GitHub permita verlo y hacer fork.

**«¿Diferencia entre fork y clone?»**
El fork es una copia en GitHub, en tu cuenta. El clone es una copia en tu máquina. Lo habitual es hacer fork y luego clonar tu fork.

## Resumen

- Visibilidad: **pública**, **privada** o **interna** (Enterprise).
- `README.md` es la portada; `LICENSE` fija qué pueden hacer otros; sin licencia, todos los derechos reservados.
- Un **fork** es tu copia en GitHub para proponer cambios sin permiso de escritura.
- Convención: `origin` = tu fork, `upstream` = el original.
