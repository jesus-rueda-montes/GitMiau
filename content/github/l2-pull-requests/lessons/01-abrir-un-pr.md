---
title: Abrir un Pull Request
minutes: 10
---

## Qué problema resuelve

Terminas una funcionalidad en tu rama. Podrías hacer merge a `main` directamente, pero en un equipo nadie lo hace así: antes, otra persona revisa el código, el CI comprueba que los tests pasan y queda constancia de **qué** se cambió y **por qué**. Un **Pull Request** (PR) es la propuesta formal de fusionar una rama en otra, con su conversación, su revisión y sus comprobaciones.

## Analogía

Un PR es como **presentar un trabajo para revisión** en una editorial. No publicas directamente: entregas el borrador con una nota explicando qué has cambiado, el editor lo lee, deja comentarios en los márgenes, y cuando todo está bien lo aprueba para imprenta. Si aún no está terminado pero quieres opiniones, lo entregas marcado como **borrador**.

## Concepto

Un PR compara dos ramas:

- **base**: la rama que recibirá los cambios (normalmente `main`);
- **head** (o *compare*): tu rama, con los commits nuevos.

Mientras el PR esté abierto, cada push a tu rama **actualiza el PR automáticamente**. No hace falta abrir otro.

**Un buen PR:**

- es **pequeño** y hace **una sola cosa** (se revisa mejor y más rápido);
- tiene un **título** claro y una **descripción** con el qué, el porqué y cómo probarlo;
- **enlaza la issue** que resuelve.

**Enlazar issues.** Si la descripción del PR incluye una palabra clave seguida del número de issue, al fusionar el PR la issue se cierra sola:

```text
Closes #42
Fixes #42, resolves #57
Fixes otra-org/otro-repo#100
```

Palabras válidas: `close`, `closes`, `closed`, `fix`, `fixes`, `fixed`, `resolve`, `resolves` y `resolved` (vale en mayúsculas y con dos puntos). **Solo funciona si el PR va a la rama por defecto**; hacia otras ramas se ignora.

**Draft PR (borrador).** Un PR marcado como borrador indica «aún no está listo»: sirve para enseñar el trabajo pronto y recibir opiniones. No se puede fusionar hasta que lo marcas como *Ready for review*.

**En la web:** tras hacer push de tu rama, GitHub muestra el botón *Compare & pull request*. Eliges base y head, escribes título y descripción, añades revisores y creas el PR (o *Create draft pull request*).

**Con `gh`:**

| Comando | Qué hace |
|---|---|
| `gh pr create --title "…" --body "…"` | Crea el PR de la rama actual |
| `gh pr create --fill` | Título y descripción a partir de los commits |
| `gh pr create --draft` | Lo crea como borrador |
| `gh pr create --base develop --reviewer ana` | Otra rama base y un revisor |
| `gh pr list` (`ls`) | PRs abiertos; `--state merged` para los fusionados |
| `gh pr status` | Tus PRs y los que esperan tu revisión |
| `gh pr checkout 42` (`co`) | Descarga la rama del PR 42 para probarla en local |
| `gh pr view 42 --web` | Abre el PR en el navegador |
| `gh pr ready 42` | Marca un borrador como listo para revisión |

## Ejemplo

```bash
git switch -c feature/login
# ... commits ...
git push -u origin feature/login
gh pr create --title "Añade login con email" \
  --body "Closes #42. Añade el formulario y la validación del email." \
  --reviewer ana
# https://github.com/ada/tienda/pull/57

# Revisar el PR de otra persona en local
gh pr checkout 58
npm test
```

## Errores comunes

- **PRs gigantes** con cambios mezclados. Nadie los revisa de verdad. Divide en PRs pequeños.
- **Abrir un PR nuevo por cada corrección.** Basta con hacer push a la misma rama: el PR se actualiza solo.
- **Escribir `Closes #42` en un PR hacia una rama que no es la por defecto** y esperar que cierre la issue.
- **Descripciones vacías.** El revisor no sabe qué buscar ni cómo probarlo.

## En la entrevista

**«¿Qué es un Pull Request y para qué sirve?»**
Una propuesta de fusionar una rama en otra. Centraliza la revisión de código, la discusión y las comprobaciones automáticas (CI) antes de integrar los cambios.

**«¿Cómo haces que una issue se cierre al fusionar un PR?»**
Poniendo en la descripción una palabra clave como `Closes #42`. Solo funciona si el PR va a la rama por defecto.

**«¿Para qué sirve un draft PR?»**
Para compartir trabajo en curso y recibir opiniones pronto, dejando claro que no está listo para fusionarse.

## Resumen

- Un PR propone fusionar **head** (tu rama) en **base** (normalmente `main`).
- Cada push a la rama actualiza el PR.
- `Closes #42` en la descripción cierra la issue al fusionar (solo hacia la rama por defecto).
- Los **draft** no se pueden fusionar hasta marcarlos como listos.
- `gh pr create | list | status | checkout | view | ready`.
