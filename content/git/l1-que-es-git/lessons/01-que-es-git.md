---
title: ¿Qué es Git?
minutes: 8
---

## Qué problema resuelve

Sin control de versiones, un proyecto acaba lleno de archivos como `informe_final.docx`, `informe_final_v2.docx` o `informe_final_AHORA_SI.docx`. Además:

- no sabes **qué cambió**, **quién** lo cambió ni **por qué**;
- volver a una versión que funcionaba es un acto de fe;
- si dos personas editan el mismo archivo, una pisa el trabajo de la otra.

Un **sistema de control de versiones** (VCS) guarda la historia completa del proyecto como una serie de "fotos" con autor, fecha y motivo, y permite volver a cualquiera de ellas. **Git** es el más usado del mundo.

## Analogía

Piensa en un **álbum de fotos** de tu proyecto. Tu mesa de trabajo es donde cambias cosas (el **working tree**). Cuando algo está listo, lo pones en la **bandeja del fotógrafo** (la **staging area**). Al hacer la foto (el **commit**), todo lo que hay en la bandeja queda guardado para siempre en el álbum (el **repositorio**), con una nota que explica qué muestra.

## Concepto

**Git** es un sistema de control de versiones **distribuido**: cada copia del proyecto contiene la historia completa, así que puedes trabajar sin conexión y no dependes de un servidor central. Lo creó Linus Torvalds en 2005 para desarrollar el kernel de Linux.

**Git no es GitHub.** Git es la herramienta que se ejecuta en tu máquina. **GitHub** es una plataforma web que aloja repositorios Git y añade colaboración (Pull Requests, issues, Actions…). Puedes usar Git sin GitHub; GitHub no existiría sin Git.

Las **tres áreas** de Git:

| Área | Qué es | Cómo llega algo ahí |
|---|---|---|
| **Working tree** | Los archivos tal como los ves y editas en tu carpeta. | Editando. |
| **Staging area** (o *index*) | La lista de cambios que irán en el próximo commit. | `git add` |
| **Repositorio** (carpeta `.git`) | La historia: todos los commits. | `git commit` |

Un **commit** es una foto del proyecto completo en un momento dado. Guarda:

1. el contenido de los archivos,
2. el **autor** y la fecha,
3. un **mensaje** que explica el cambio,
4. un enlace al commit **padre** (el anterior), lo que forma la historia.

Cada commit se identifica con un **hash**: 40 caracteres hexadecimales (SHA-1) calculados a partir de su contenido, por ejemplo `3f2a9c1…`. Si cambia un solo byte, cambia el hash. Normalmente basta con los primeros 7 caracteres para referirse a él.

Cada archivo del working tree puede estar:

- **untracked** (sin seguimiento): Git lo ve, pero aún no forma parte del repositorio;
- **tracked** (con seguimiento): ya está en algún commit o preparado para el siguiente. Puede estar sin cambios, **modificado** o **preparado** (*staged*).

## Ejemplo

El ciclo básico de trabajo:

```bash
# 1. Editas archivos en el working tree
# 2. Miras qué ha cambiado
git status
# 3. Preparas lo que quieres guardar (pasa a la staging area)
git add README.md
# 4. Guardas la foto en el repositorio con un mensaje
git commit -m "Añade el README"
# 5. Consultas la historia
git log --oneline
```

## Errores comunes

- **Confundir Git con GitHub.** Git funciona sin internet y sin cuenta. GitHub es un servicio que aloja repositorios.
- **Pensar que `git add` guarda el cambio.** Solo lo prepara. Hasta que no haces `git commit`, no queda en la historia.
- **Hacer commits gigantes con todo mezclado.** Un commit debería contener **un cambio lógico** (por ejemplo, "Corrige el cálculo del IVA"), así es fácil de revisar y de deshacer.
- **Mensajes como "cambios" o "arreglos".** Dentro de seis meses no dirán nada. El mensaje explica **qué** cambia y **por qué**.

## En la entrevista

**«¿Qué diferencia hay entre Git y GitHub?»**
Git es un sistema de control de versiones distribuido que se ejecuta en local. GitHub es una plataforma que aloja repositorios Git y añade colaboración: Pull Requests, issues, CI/CD con Actions, permisos, etc.

**«¿Para qué sirve la staging area?»**
Permite elegir qué cambios entran en el próximo commit. Así puedes tener varios cambios en el working tree y guardarlos en commits separados y con sentido.

**«¿Qué significa que Git sea distribuido?»**
Que cada clon tiene la historia completa. Se puede trabajar sin conexión, y cada copia sirve de respaldo.

## Resumen

- Git guarda la historia del proyecto como una serie de **commits** (fotos) con autor, fecha, mensaje y padre.
- Hay **tres áreas**: working tree → (`git add`) → staging area → (`git commit`) → repositorio.
- Cada commit se identifica con un **hash** calculado a partir de su contenido.
- Git es **distribuido**: cada copia tiene toda la historia.
- **Git no es GitHub**: la herramienta frente a la plataforma.
