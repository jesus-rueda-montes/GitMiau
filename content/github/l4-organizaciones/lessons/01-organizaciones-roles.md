---
title: Organizaciones, teams y roles
minutes: 10
---

## Qué problema resuelve

Con tres personas, dar acceso repo a repo funciona. Con cincuenta personas y doscientos repos es un caos: nadie sabe quién puede qué, los que se fueron siguen teniendo acceso y cada alta lleva una tarde. Las **organizaciones** agrupan repos y personas, los **teams** reflejan la estructura de la empresa y los **roles** dicen exactamente qué puede hacer cada uno.

## Analogía

Una organización es el **edificio de la empresa**; los teams son los **departamentos**; los roles, los **niveles de la tarjeta de acceso**. Cuando alguien entra en un departamento, recibe la tarjeta de ese departamento; no hay que programar puerta por puerta.

## Concepto

**Una organización** es una cuenta compartida que es dueña de repositorios, Projects, paquetes… Roles **en la organización**:

| Rol | Qué puede hacer |
|---|---|
| **Owner** | Administración completa de la organización. Se recomienda que haya **al menos dos**, para no quedarse sin nadie si uno se va |
| **Member** | El rol por defecto; por ejemplo, puede crear repositorios y Projects |
| **Moderator** | Member que además puede bloquear a colaboradores externos, limitar interacciones y ocultar comentarios |
| **Billing manager** | Gestiona la facturación |
| **Security manager** | Ve las alertas de seguridad y gestiona los ajustes de seguridad de toda la organización |
| **Outside collaborator** | No es miembro, pero tiene acceso a uno o varios repos concretos (por ejemplo, un consultor externo) |

**Roles de repositorio**, de menos a más:

| Rol | Pensado para |
|---|---|
| **Read** | Ver y comentar: personas que no aportan código |
| **Triage** | Gestionar issues, discussions y PRs (labels, asignar, cerrar) **sin permiso de escritura** |
| **Write** | Quien hace push al proyecto |
| **Maintain** | Gestionar el repo **sin** acciones sensibles o destructivas |
| **Admin** | Acceso completo, incluidas acciones sensibles (seguridad, borrar el repo) |

Los owners fijan unos **permisos base** que tienen todos los members en todos los repos de la organización (por ejemplo, *Read*).

**Teams.** Grupos de members que reflejan la estructura de la empresa:

- se da acceso a un repo **al team**, no persona a persona: quien entra en el team recibe el acceso, y quien sale lo pierde;
- se mencionan con **`@organizacion/team`**, se les puede pedir revisión y pueden ser propietarios en **CODEOWNERS**;
- pueden ser **visibles** (los ve y menciona cualquier member) o **secretos** (solo los ven sus miembros y los owners);
- se pueden **anidar**: un team hijo **hereda los permisos** del padre, y sus miembros reciben las menciones al padre.

## Ejemplo

Organización `mi-org`, repo `tienda`:

| Quién | Cómo | Rol en `tienda` |
|---|---|---|
| Team `@mi-org/backend` | Team con acceso al repo | Write |
| Team `@mi-org/backend-pagos` (hijo de `backend`) | Hereda del padre | Write |
| Team `@mi-org/plataforma` | Team con acceso al repo | Maintain |
| Team `@mi-org/soporte` | Clasifica las incidencias | Triage |
| Consultor externo | Outside collaborator | Read |

Cuando una persona entra en `backend-pagos`, obtiene acceso de escritura a `tienda` sin tocar el repo. Cuando deja la empresa, se la quita de la organización y pierde todos sus accesos a la vez.

## Errores comunes

- **Dar Admin «para que no pida permisos».** Da el rol mínimo; Maintain existe para gestionar el repo sin poder borrarlo.
- **Dar accesos persona a persona.** Usa teams: las altas y bajas se hacen en un solo sitio.
- **Un solo owner.** Si se va o pierde el acceso a su cuenta, nadie puede administrar la organización.
- **Hacer member a un externo** que solo necesita un repo: mejor outside collaborator con acceso a ese repo.
- **Dar Write a quien solo clasifica issues.** Para eso está Triage.

## En la entrevista

**«¿Cómo organizarías los permisos de GitHub en una empresa?»**
Con una organización con al menos dos owners, permisos base bajos (Read o ninguno), teams que reflejan los equipos reales con el rol mínimo en cada repo, y outside collaborators para externos. Así las altas y bajas se hacen cambiando de team.

**«¿Qué diferencia hay entre Triage y Write?»**
Triage gestiona issues y PRs (labels, asignaciones, cerrar) sin poder hacer push; Write puede hacer push al repo.

## Resumen

- Organización: cuenta compartida; roles de organización (owner, member, moderator, billing manager, security manager) y outside collaborators.
- Roles de repo: **Read < Triage < Write < Maintain < Admin**.
- Teams (`@org/team`): acceso por grupo, menciones, revisiones y CODEOWNERS; visibles o secretos; anidados heredan los permisos.
- Mínimo privilegio y al menos dos owners.
