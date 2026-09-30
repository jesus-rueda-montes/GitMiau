---
title: Rescates en GitHub
minutes: 11
---

## Qué problema resuelve

En GitHub los problemas son de otra clase: Git pide una contraseña que no funciona, el CI está en rojo sin razón aparente, un workflow no se ejecuta nunca, el botón de merge está gris, se ha subido una clave… Casi todos tienen una causa conocida y una forma de comprobarla. Esta lección es la lista de comprobación.

## Analogía

Es el **diagnóstico de un mecánico**: no cambia piezas al azar. Lee el testigo del salpicadero (el mensaje de error), conecta el ordenador de diagnóstico (los logs) y solo entonces decide qué tocar.

## Concepto

**Autenticación.**

| Síntoma | Causa | Solución |
|---|---|---|
| `git push` por HTTPS pide contraseña y la tuya no vale | GitHub ya no acepta contraseñas para operaciones de Git | Usa un token en lugar de la contraseña, o mejor `gh auth login` / `gh auth setup-git`, que configuran Git por ti |
| `gh` actúa con la cuenta equivocada | Varias cuentas iniciadas | `gh auth status` para ver cuál está activa y `gh auth switch` para cambiar |

**Secretos subidos.** Primero **rotar** el secreto (revocarlo y crear otro); después quitarlo del código y, si hace falta, de la historia. Si push protection lo bloqueó, el secreto no llegó a subirse: quítalo del commit (`git commit --amend` si es el último) y repite el push.

**Un workflow falla.**

```bash
gh run list --status failure        # Ejecuciones fallidas
gh run view <id> --log-failed       # Solo los logs de los pasos que fallaron
gh run rerun <id> --failed          # Relanza solo los jobs fallidos
gh run rerun <id> --debug           # Relanza con logs de depuración
```

Para tener siempre logs de depuración, crea el secret o la variable **`ACTIONS_STEP_DEBUG`** con valor `true` (y `ACTIONS_RUNNER_DEBUG` para el diagnóstico del runner). Cualquiera que pueda ejecutar el workflow puede activar la depuración solo para un *re-run*, sin tocar los ajustes.

Causas frecuentes: un secret que no existe o está mal escrito (llega vacío), `permissions` insuficientes para el `GITHUB_TOKEN`, un PR desde un **fork** (los secrets no se pasan y el `GITHUB_TOKEN` es de solo lectura), o algo que funciona en tu máquina pero no en el runner (versiones, variables de entorno).

**Un workflow no se ejecuta.**

| Causa | Detalle |
|---|---|
| El evento lo generó el `GITHUB_TOKEN` | Salvo `workflow_dispatch` y `repository_dispatch`, los eventos creados con el `GITHUB_TOKEN` no lanzan workflows (así se evitan bucles) |
| Filtros `branches` o `paths` | El push no tocó esas ramas o rutas |
| `workflow_dispatch` | Solo funciona si el workflow está en la **rama por defecto** |
| `schedule` | Se ejecuta sobre la rama por defecto, puede retrasarse con mucha carga y, en repos públicos, se desactiva tras **60 días sin actividad** en el repo |
| YAML inválido | La pestaña Actions muestra el error del fichero |
| Workflow desactivado | `gh workflow enable <workflow>` |

**El PR no se puede fusionar.** Mira el recuadro de merge del PR: dice qué falta. Lo habitual es un **required status check** en rojo o pendiente, **aprobaciones** que faltan (o anuladas por un push nuevo), **conversaciones** sin resolver, **conflictos** con la rama base o una rama que debe estar **al día** con la base. `gh pr checks` y `gh pr view` lo muestran desde la terminal.

## Ejemplo

El CI de un PR de un colaborador externo falla en el paso de despliegue a staging con «credenciales vacías», pero en tus PRs funciona.

1. `gh run view <id> --log-failed`: el paso usa `${{ secrets.STAGING_KEY }}`.
2. El PR viene de un **fork**: los secrets no se pasan a esos workflows (y el `GITHUB_TOKEN` es de solo lectura). Por eso el valor llega vacío.
3. Solución: el paso de despliegue no debe ejecutarse en PRs de forks; se despliega después del merge, en un workflow con `push` a `main`.

## Errores comunes

- **Relanzar el workflow una y otra vez** sin leer el log.
- **Poner la contraseña de GitHub** donde se pide un token.
- **Arreglar un workflow que no se lanza** cambiando el código, cuando el problema es un filtro `paths` o un evento generado por el `GITHUB_TOKEN`.
- **Pedir a un admin que se salte las reglas** para fusionar, en vez de ver qué check falla.
- **Dejar `ACTIONS_STEP_DEBUG` activado** para siempre: los logs se llenan de ruido.

## En la entrevista

**«El CI falla en GitHub pero en tu máquina funciona. ¿Cómo lo investigas?»**
Leo el log del paso que falla (`gh run view --log-failed`), comparo versiones y variables de entorno con las mías, compruebo secrets y permisos y, si hace falta, relanzo con logs de depuración (`gh run rerun --debug`).

**«Un workflow no se ejecuta. ¿Qué revisas?»**
El evento y sus filtros (`branches`, `paths`), si el evento lo generó el `GITHUB_TOKEN` (no lanza workflows), si el workflow está desactivado o tiene el YAML mal, y para `workflow_dispatch` o `schedule`, que esté en la rama por defecto.

## Resumen

- HTTPS sin contraseña: token o `gh auth login` / `gh auth setup-git`.
- Workflow que falla: `gh run view --log-failed`, `gh run rerun --failed` o `--debug`; `ACTIONS_STEP_DEBUG`.
- PRs de forks: sin secrets y `GITHUB_TOKEN` de solo lectura.
- Workflow que no se lanza: eventos del `GITHUB_TOKEN`, filtros, rama por defecto, `schedule` inactivo tras 60 días.
- PR bloqueado: el recuadro de merge dice qué falta (checks, aprobaciones, conversaciones, conflictos).
