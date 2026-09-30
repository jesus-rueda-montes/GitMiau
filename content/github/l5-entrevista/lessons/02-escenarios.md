---
title: Escenarios prácticos
minutes: 13
---

## Qué problema resuelve

Las preguntas de nivel más alto son escenarios: «Llegas a un equipo que hace push directo a `main` y el CI se rompe cada semana: ¿qué cambiarías?», «Alguien ha subido una clave a un repo público», «¿Cómo montarías el flujo desde la issue hasta producción?». No hay una respuesta única: se valora que **combines las piezas** y expliques el porqué de cada una.

## Analogía

Es el **examen práctico del carné de conducir**: ya sabes qué hace cada pedal; ahora tienes que llevar el coche por la ciudad, decidiendo en cada cruce.

## Concepto

Un método para cualquier escenario:

1. **Aclara el contexto**: tamaño del equipo, cómo se despliega (continuo o por versiones), repos públicos o privados.
2. **Resuelve lo urgente** si lo hay (un secreto filtrado se rota **ya**).
3. **Propón el flujo** por capas: ramas y PRs → CI → protección → despliegue → seguridad.
4. **Justifica** cada pieza con el problema que evita.
5. **Menciona el coste**: qué se complica y cómo lo compensas.

### Escenario 1: el equipo rompe `main`

«Cinco personas hacen push directo a `main`; el CI se rompe a menudo y nadie revisa el código.»

- **Flujo**: GitHub Flow, ramas cortas y PRs pequeños.
- **CI**: workflow con `on: pull_request` (y `merge_group` si hay merge queue) que ejecuta build y tests, con `permissions: contents: read`.
- **Protección de `main`**: PR obligatorio con 1 aprobación, el job de CI como **required status check**, conversaciones resueltas y sin excepciones para admins.
- **CODEOWNERS** para las áreas sensibles (infraestructura, workflows).
- **Coste**: algo más de tiempo por cambio; se compensa con PRs pequeños y revisiones rápidas.

### Escenario 2: una clave en un repo público

1. **Rotar** la clave (revocar y generar otra) inmediatamente.
2. Revisar los registros del proveedor por si se usó.
3. Quitarla del código y pasar a un **secret**; limpiar la historia solo si hace falta.
4. Prevenir: `.gitignore` para `.env`, **push protection** y secret scanning activados, y OIDC en vez de claves guardadas si es para desplegar en la nube.

### Escenario 3: de la issue a producción

Issue con labels y milestone → rama `feature/…` enlazada (`gh issue develop`) → commits pequeños → PR con `Closes #N` → CI y revisión (CODEOWNERS) → squash merge → la issue se cierra sola → un workflow en `main` despliega a staging y, con un **environment** que exige aprobación, a producción → para versiones publicadas, tag SemVer y release con notas generadas.

### Escenario 4: un monorepo lento

«El CI tarda 40 minutos y se ejecuta entero en cada PR.»

- **Filtros `paths`** para que cada workflow solo se ejecute si cambia su parte.
- **Cache** de dependencias y **matrix** para paralelizar.
- **`concurrency`** con `cancel-in-progress` para no gastar runners en commits ya superados.
- **Merge queue** si muchos PRs compiten por `main`.

### Escenario 5: releases de una librería

- Versionado **SemVer** y tags anotados (`v2.3.0`).
- **Release** con notas generadas agrupadas por labels (`.github/release.yml`).
- Workflow con `on: push: tags: ["v*"]` que publica el paquete en el registro, con el `GITHUB_TOKEN` y `packages: write` si es GitHub Packages.
- **Dependabot** para las dependencias de la librería y de las actions.

## Ejemplo

Respuesta modelo al escenario 1, en un minuto:

> «Primero preguntaría cómo despliegan. Suponiendo despliegue continuo, propondría GitHub Flow con PRs pequeños. Añadiría un workflow de CI en `pull_request` con build y tests y permisos de solo lectura. Protegería `main` con un ruleset: PR con una aprobación, el CI como check obligatorio y sin excepciones. Con CODEOWNERS, los cambios en infraestructura los revisa plataforma. El coste es algo de tiempo por cambio, pero dejamos de romper `main` y todo el código lo ve al menos otra persona.»

## Errores comunes

- **Saltar a la herramienta sin preguntar el contexto.**
- **Proponer Git Flow para todo**: para despliegue continuo es demasiado pesado.
- **Olvidar lo urgente**: en el escenario del secreto, lo primero es rotarlo, no reescribir la historia.
- **Soluciones sin coste**: todo tiene un precio; nombrarlo demuestra criterio.
- **Enumerar funciones sin justificarlas**: cada pieza debe responder a un problema del escenario.

## En la entrevista

**«¿Qué mejorarías primero en un equipo sin procesos?»**
PRs obligatorios con CI como check requerido en `main`: es lo que más fallos evita con menos esfuerzo. Después, CODEOWNERS, Dependabot y la automatización del despliegue.

**«¿Cómo harías un despliegue a producción seguro con Actions?»**
Workflow en `main` que despliega primero a staging; producción con un environment que exige aprobación y tiene sus propios secrets o, mejor, OIDC; `concurrency` para no solapar despliegues; y permisos mínimos.

## Resumen

- Método: contexto → urgente → flujo por capas → justificar → coste.
- Equipo que rompe `main`: PRs, CI obligatorio, protección y CODEOWNERS.
- Secreto filtrado: rotar primero, luego limpiar y prevenir.
- De la issue a producción: issue → rama → PR → CI → revisión → merge → environments → release.
- CI lento: `paths`, cache, matrix, `concurrency`, merge queue.
