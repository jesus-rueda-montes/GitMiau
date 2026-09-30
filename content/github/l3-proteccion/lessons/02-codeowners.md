---
title: CODEOWNERS
minutes: 7
---

## Qué problema resuelve

En un repositorio grande nadie conoce todo el código. Si un PR toca la configuración de pagos, debería revisarlo quien la conoce, no la primera persona que pase por ahí. **CODEOWNERS** asigna **propietarios** a partes del código: GitHub les pide revisión automáticamente y, si lo exiges, su aprobación es obligatoria.

## Analogía

Es el **organigrama de un hospital**: cada planta tiene su jefe de servicio. Si un cambio afecta a cardiología, lo firma alguien de cardiología, no el jefe de traumatología.

## Concepto

Un fichero **`CODEOWNERS`** en `.github/`, en la raíz o en `docs/`. GitHub los busca **en ese orden** y usa el **primero** que encuentra.

Cada línea es un **patrón** (con la sintaxis de `.gitignore`) seguido de uno o varios propietarios: `@usuario`, `@organizacion/equipo` o un email.

```text
# Propietarios por defecto de todo el repo
*                 @ada @grace

# Ficheros JavaScript
*.js              @mi-org/frontend

# Una carpeta concreta (y todo lo que contiene)
/infra/           @mi-org/plataforma

# Carpetas logs en cualquier nivel
**/logs           @linus
```

**La última coincidencia manda.** Si un fichero coincide con varios patrones, gana **el último** del fichero. Por eso las reglas generales van arriba y las específicas abajo. En el ejemplo, `infra/main.tf` es de `@mi-org/plataforma`, no de `@ada`.

Cómo funciona:

- al abrir un PR (que no sea borrador) que toca ficheros con propietario, GitHub **pide revisión automáticamente** a esos propietarios;
- los propietarios necesitan **permiso de escritura** en el repositorio;
- con **Require review from Code Owners** (en una branch protection rule o un ruleset), el PR necesita la aprobación de **al menos un** propietario de los ficheros tocados; no hace falta que aprueben todos.

## Ejemplo

```text
# .github/CODEOWNERS
*                        @mi-org/equipo-web
/docs/                   @mi-org/documentacion
/.github/workflows/      @mi-org/plataforma
package.json             @mi-org/plataforma
```

Un PR que modifica `.github/workflows/ci.yml` y `src/app.ts` pide revisión a `@mi-org/plataforma` (por el workflow) y a `@mi-org/equipo-web` (por `src/app.ts`, que solo coincide con `*`).

## Errores comunes

- **Poner la regla general `*` al final.** Como gana la última coincidencia, se queda con todos los ficheros y anula las reglas específicas.
- **Propietarios sin permiso de escritura.** Su aprobación no cuenta.
- **Crear CODEOWNERS sin activar *Require review from Code Owners*.** Solo se pide revisión, pero no es obligatoria.
- **Tener varios CODEOWNERS** (en `.github/` y en la raíz) y editar el que no se usa.

## En la entrevista

**«¿Qué es CODEOWNERS?»**
Un fichero que asigna propietarios (personas o equipos) a rutas del repositorio. GitHub les pide revisión automáticamente en los PRs que tocan esas rutas y, con la regla *Require review from Code Owners*, su aprobación es obligatoria.

**«Si un fichero coincide con varios patrones, ¿quién es el propietario?»**
El de la última línea que coincide.

## Resumen

- `CODEOWNERS` en `.github/`, la raíz o `docs/` (se usa el primero que se encuentra en ese orden).
- Patrón (sintaxis de `.gitignore`) + propietarios (`@usuario`, `@org/equipo`, email).
- **Gana la última coincidencia**: lo general arriba, lo específico abajo.
- Revisión automática; obligatoria con *Require review from Code Owners* (basta un propietario).
