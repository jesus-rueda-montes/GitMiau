---
title: Las preguntas que siempre salen
minutes: 14
---

## Qué problema resuelve

En casi cualquier entrevista técnica aparecen preguntas de Git y GitHub, y se repite un núcleo: Git frente a GitHub, merge frente a rebase, reset frente a revert, fetch frente a pull, cómo trabaja un equipo con PRs, qué es CI/CD… Son preguntas sencillas, pero una respuesta **ordenada y con un matiz práctico** marca la diferencia entre «lo he usado» y «lo entiendo».

## Analogía

Es preparar la **defensa de un proyecto**: ya sabes hacerlo; ahora ensayas **contarlo** en un minuto, con una estructura clara y un detalle que demuestre experiencia real.

## Concepto

Estructura de cada respuesta: **definición → para qué → cómo funciona → matiz práctico**.

### Git

**«¿Qué diferencia hay entre Git y GitHub?»**
Git es un **sistema de control de versiones distribuido**: funciona en tu máquina, sin servidor, y cada clon tiene la historia completa. GitHub es una **plataforma** que aloja repositorios Git y añade colaboración: Pull Requests, issues, Actions, seguridad, permisos.

**«¿Qué son el working tree, el staging area y un commit?»**
El working tree son tus ficheros; el staging area (`git add`) es lo que irá en el próximo commit; un commit es una foto del proyecto con autor, fecha, mensaje y un puntero a su padre, identificada por un hash.

**«¿Merge o rebase?»**
Los dos integran una rama en otra. **Merge** conserva la historia tal como ocurrió y crea un commit de merge si las ramas divergieron. **Rebase** reaplica tus commits encima de la otra rama: historia lineal, pero **reescribe** los commits (hashes nuevos). Regla: rebase para ordenar **tu** rama antes de compartirla; **nunca** sobre commits que otros ya tienen.

**«¿Reset o revert?»**
`git reset` mueve la rama atrás (reescribe historia: solo para lo local). `git revert` crea un commit nuevo que deshace otro: lo seguro para lo que ya está subido.

**«¿Fetch o pull?»**
`git fetch` descarga los cambios del remoto sin tocar tu rama; `git pull` hace fetch y después integra (merge o rebase). Fetch primero si quieres ver qué ha cambiado antes de integrarlo.

**«¿Cómo recuperas un commit perdido?»**
Con `git reflog`, que registra los movimientos de HEAD en tu repo: localizo el hash y creo una rama (`git branch rescate <hash>`).

**«¿`--force` o `--force-with-lease`?»**
`--force-with-lease` solo sobrescribe si la rama remota sigue donde la viste; si alguien subió algo, falla en vez de borrarlo. Y nunca en ramas compartidas.

### GitHub y colaboración

**«¿Cómo es el flujo de trabajo con Pull Requests?»**
Rama corta desde `main` → commits → push → PR con descripción y enlace a la issue (`Closes #42`) → CI automático → revisión → merge (a menudo squash) → borrar la rama → despliegue.

**«¿Qué estrategia de ramas usarías?»**
Depende de cómo se entrega: **GitHub Flow** o **trunk-based** para servicios con despliegue continuo (ramas cortas, `main` siempre desplegable, feature flags para lo no terminado); **Git Flow** para software versionado con varias versiones mantenidas a la vez.

**«¿Squash, merge commit o rebase al fusionar un PR?»**
Squash deja un commit por PR (historia limpia en `main`); el merge commit conserva todos los commits y el punto de integración; rebase and merge deja historia lineal con todos los commits.

**«¿Cómo proteges `main`?»**
Branch protection o rulesets: PR obligatorio con aprobaciones, required status checks, conversaciones resueltas, sin force push y sin excepciones para admins; CODEOWNERS para las revisiones obligatorias de cada área.

### CI/CD y seguridad

**«¿Qué es CI/CD?»**
**Integración continua**: cada cambio se integra a menudo y se verifica automáticamente (build y tests). **Entrega/despliegue continuo**: lo que pasa el CI queda listo para desplegar (entrega) o se despliega solo (despliegue).

**«¿Cómo es un workflow de GitHub Actions?»**
Un YAML en `.github/workflows/` con eventos (`on`), jobs que corren en runners en paralelo (o en orden con `needs`) y steps que ejecutan comandos (`run`) o actions (`uses`). Con `permissions` mínimos para el `GITHUB_TOKEN`.

**«¿Cómo gestionas secretos y credenciales?»**
Nunca en el código: secrets de Actions (por environment si hace falta aprobación), OIDC para desplegar en la nube sin credenciales guardadas, tokens fine-grained o GitHub Apps con el mínimo privilegio, y push protection para que no se suban por error. Si se filtra uno: rotarlo primero.

**«¿Cómo mantienes las dependencias seguras?»**
Dependabot: alertas, security updates y version updates con `dependabot.yml`, todo pasando por el CI; y code scanning (CodeQL) para el propio código.

## Ejemplo

Pregunta: **«¿Merge o rebase?»**

- ❌ «Rebase es mejor porque la historia queda más limpia.»
- ✅ «Los dos integran cambios. Merge conserva la historia real y crea un commit de merge; rebase reaplica mis commits encima y deja una historia lineal, pero les cambia el hash. Yo hago rebase de mi rama con `main` antes de abrir el PR, y nunca de ramas que otros usan. Para fusionar el PR, depende del equipo: muchos usan squash.»

La segunda respuesta define, compara, da una regla y muestra cómo se usa en la práctica.

## Errores comunes

- **Responder con una sola palabra** («rebase es mejor»): el entrevistador busca el criterio.
- **Confundir Git con GitHub.**
- **Decir que `git pull` «descarga» sin más**: integra en tu rama.
- **Presentar `--force` como solución normal.**
- **Hablar de GitHub Actions sin mencionar `permissions` ni secrets** cuando preguntan por seguridad.

## En la entrevista

**«¿Qué haces si tu PR tiene conflictos con `main`?»**
Actualizo mi rama con `main` (merge o rebase, según el equipo), resuelvo los conflictos entendiendo los dos lados, paso los tests en local y hago push (con `--force-with-lease` si hice rebase). El CI vuelve a ejecutarse.

**«¿Cómo escribes un buen mensaje de commit?»**
Una primera línea corta que resuma qué cambia (muchos proyectos, como el propio Git, piden el modo imperativo: «Añade…», «Corrige…») y, si hace falta, un cuerpo que explique por qué. Commits pequeños que hacen una sola cosa.

## Resumen

- Estructura: definición → para qué → cómo → matiz práctico.
- Git ≠ GitHub; merge conserva, rebase reescribe; reset para lo local, revert para lo compartido; fetch no integra, pull sí.
- Flujo de PRs, estrategias de ramas según cómo se entrega y protección de `main`.
- CI/CD con Actions, `permissions` mínimos, secrets, OIDC, Dependabot y code scanning.
