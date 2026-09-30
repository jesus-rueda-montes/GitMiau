---
title: Branch protection rules y rulesets
minutes: 11
---

## Qué problema resuelve

Todo lo que has aprendido (PRs, revisión, CI) son **buenas intenciones** hasta que alguien hace `git push` directo a `main` o fusiona un PR con los tests en rojo. Las **reglas de protección** convierten esas buenas prácticas en **obligaciones** que GitHub hace cumplir.

## Analogía

Es la **puerta con control de acceso** de un laboratorio: no basta con saber que hay que ponerse la bata. La puerta no se abre sin la tarjeta (PR), la firma de un responsable (aprobación) y el semáforo en verde (status checks).

## Concepto

**Branch protection rules.** Se configuran en *Settings → Branches* para las ramas que coincidan con un patrón (por ejemplo `main`). Los ajustes principales:

| Ajuste | Qué obliga |
|---|---|
| **Require a pull request before merging** | Nada entra sin PR; opcionalmente, con N aprobaciones |
| Dismiss stale approvals | Un push nuevo anula las aprobaciones anteriores |
| **Require review from Code Owners** | Aprueba al menos un propietario del código tocado (ver CODEOWNERS) |
| **Require status checks to pass** | Los checks elegidos (jobs de CI) deben estar en verde |
| Require branches to be up to date | La rama del PR debe estar al día con la base antes de fusionar |
| Require conversation resolution | Todos los comentarios de la revisión resueltos |
| Require signed commits | Solo commits firmados y verificados |
| **Require linear history** | Sin commits de merge: solo squash o rebase |
| Require merge queue | Los PRs se fusionan a través de una cola (ver más abajo) |
| Lock branch | La rama pasa a ser de solo lectura |
| Do not allow bypassing | Las reglas se aplican también a los administradores |

Por defecto, en una rama protegida **no se permite el force push** ni **borrar la rama**; hay opciones para permitirlos.

**Rulesets** (*Settings → Rules → Rulesets*) son la evolución de las branch protection rules:

- **varios rulesets** pueden aplicarse a la misma rama; sus reglas **se suman** y, si una regla está definida de formas distintas, **gana la más restrictiva**. Con las branch protection rules, en cambio, a cada rama solo se le aplica una;
- se pueden **desactivar sin borrarlos** (estado *Active* o *Disabled*);
- tienen una **bypass list** explícita (usuarios, roles o GitHub Apps que pueden saltárselos);
- cualquiera con acceso de lectura puede **ver** los rulesets activos;
- pueden apuntar a **ramas y tags**, y en GitHub Enterprise existen rulesets de organización para muchos repos a la vez.

Con `gh`:

```bash
gh ruleset list              # Rulesets del repo (alias: gh rs ls)
gh ruleset check main        # Qué reglas se aplican a la rama main
```

**Merge queue.** En una rama con mucho tráfico, dos PRs pueden pasar el CI por separado y romper `main` al juntarse. La **merge queue** prueba cada PR **con la base más reciente y los PRs que tiene delante en la cola** antes de fusionarlo. Para que el CI se ejecute en la cola, el workflow debe escuchar el evento **`merge_group`**:

```yaml
on:
  pull_request:
  merge_group:
```

## Ejemplo

Configuración habitual para `main` en un equipo:

- Require a pull request, con 1 aprobación y *dismiss stale approvals*.
- Require review from Code Owners.
- Require status checks: `test` y `build` (los nombres de los jobs de CI).
- Require conversation resolution.
- Sin force push ni borrado (valores por defecto).

Con eso, `git push origin main` se rechaza, y un PR no se puede fusionar hasta tener la aprobación y el CI en verde.

## Errores comunes

- **Proteger la rama pero no marcar ningún status check como obligatorio.** El CI se ejecuta, pero se puede fusionar aunque falle.
- **Dejar que los administradores se salten las reglas por costumbre.** Activa *Do not allow bypassing*, o usa una bypass list mínima.
- **Activar la merge queue sin añadir `merge_group` al workflow.** Los checks no se ejecutan en la cola y los merges fallan.
- **Exigir *up to date* en un repo con mucho tráfico sin merge queue.** Todo el mundo actualiza su rama una y otra vez.

## En la entrevista

**«¿Cómo impedirías que alguien rompa `main`?»**
Con una branch protection rule o un ruleset en `main`: PR obligatorio con aprobaciones, status checks de CI obligatorios, resolución de conversaciones, sin force push, y que no se lo salten los administradores.

**«¿Qué ventaja tienen los rulesets sobre las branch protection rules?»**
Se pueden combinar varios en la misma rama (gana lo más restrictivo), activar o desactivar sin borrarlos, definir quién puede saltárselos y los puede ver cualquiera con lectura; también aplican a tags y, en Enterprise, a toda la organización.

**«¿Para qué sirve una merge queue?»**
Para que cada PR se pruebe con la base actualizada y con los PRs que tiene delante antes de fusionarse, y así `main` no se rompa por cambios incompatibles.

## Resumen

- Protección de ramas: PR obligatorio, aprobaciones, status checks, historia lineal, firma, conversaciones resueltas.
- En ramas protegidas, force push y borrado están bloqueados por defecto.
- Rulesets: varios a la vez (gana el más restrictivo), Active/Disabled, bypass list, ramas y tags.
- Merge queue: prueba cada PR contra lo que se fusionará antes que él; el workflow necesita `merge_group`.
