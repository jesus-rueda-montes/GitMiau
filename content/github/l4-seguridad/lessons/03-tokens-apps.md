---
title: Tokens, GitHub Apps y secrets
minutes: 10
---

## Qué problema resuelve

Scripts, CI y herramientas externas necesitan hablar con GitHub en tu nombre. La tentación es crear un token con **todos los permisos**, sin caducidad, y pegarlo donde haga falta. Si se filtra, quien lo tenga puede hacer todo lo que tú puedes, en todos tus repos. La regla es el **mínimo privilegio**: cada automatización recibe solo el acceso que necesita, durante el menor tiempo posible.

## Analogía

- Un **token classic** es darle a alguien **una copia de tus llaves de casa**, que abren todas las puertas.
- Un **token fine-grained** es una **tarjeta de hotel**: abre solo ciertas habitaciones y caduca.
- Una **GitHub App** es el **servicio de limpieza del hotel**: tiene su propia identidad, entra solo donde el hotel lo ha autorizado y su tarjeta se renueva cada poco tiempo.

## Concepto

**Opciones de menos a más adecuadas para automatizar:**

| Credencial | Alcance | Caducidad |
|---|---|---|
| **Personal access token (classic)** | *Scopes* amplios; accede a todos los repos a los que accedes tú | Opcional (GitHub borra los classic sin usar tras un año) |
| **Fine-grained personal access token** | Un único propietario (tu cuenta o una organización), repos concretos y permisos detallados; la organización puede exigir aprobarlo | Se le pone fecha de caducidad |
| **GitHub App** | Permisos detallados; se instala solo en los repos elegidos; no depende de una persona | Sus tokens de instalación caducan **en 1 hora** |
| **`GITHUB_TOKEN`** (dentro de Actions) | El repo del workflow, con los `permissions` que declares | Al terminar el job |

**Fine-grained frente a classic.** GitHub recomienda los fine-grained. Todavía tienen limitaciones: por ejemplo, no sirven para contribuir a repos públicos de los que no eres miembro ni para acceder a varias organizaciones a la vez. En esos casos sigue haciendo falta un classic.

**GitHub Apps.** Son la opción recomendada para integraciones duraderas (un bot, una herramienta de la empresa):

- actúan **con su propia identidad**, no con la de una persona: si quien la creó deja la empresa, la integración sigue funcionando, y no ocupan una licencia;
- usan **tokens de corta duración**: si se filtra uno, sirve durante poco tiempo;
- quien la instala elige **en qué repos** puede actuar;
- traen **webhooks** centralizados para todos esos repos.

Las **OAuth apps**, en cambio, acceden a todos los repos del usuario que las autoriza y sus tokens no caducan hasta que se revocan.

**Dónde guardar las credenciales.** Nunca en el código. En Actions, como **secrets**; y siempre que se pueda, con el `GITHUB_TOKEN` en vez de un token personal. Desde la terminal, con `gh secret`:

```bash
gh secret set NPM_TOKEN                          # Pide el valor sin mostrarlo
gh secret set NPM_TOKEN --body "$NPM_TOKEN"      # Lo lee de una variable de entorno
gh secret set NPM_TOKEN < token.txt              # Lo lee de un fichero
gh secret set DEPLOY_KEY --env production        # Secret de un environment
gh secret set NPM_TOKEN --app dependabot         # Secret para Dependabot
gh secret list                                   # Lista los nombres (alias: ls)
gh secret delete NPM_TOKEN                       # Lo borra (alias: remove)
```

Con `--body` el valor queda en el historial de la terminal si lo escribes tal cual; por eso es mejor pasarlo desde una variable de entorno o dejar que `gh` lo pida.

**`SECURITY.md`.** El fichero de política de seguridad del repo: qué versiones tienen soporte y **cómo informar de una vulnerabilidad** sin publicarla en una issue.

## Ejemplo

Un script nocturno debe leer las issues de un solo repositorio de la empresa.

- ❌ Un token classic con el scope `repo`: podría escribir en todos los repos a los que tienes acceso, y deja de funcionar si te vas.
- ✅ Un token fine-grained con acceso solo a ese repo, permiso *Issues: Read-only* y caducidad; o, si es una integración permanente, una GitHub App instalada solo en ese repo.
- En un workflow de ese mismo repo, basta con `GITHUB_TOKEN` y `permissions: issues: read`.

## Errores comunes

- **Tokens classic con todos los scopes «por si acaso».** Pide solo los permisos que necesitas.
- **Tokens sin caducidad.** Si se filtran, sirven para siempre.
- **Automatizaciones con el token de una persona.** Se rompen cuando esa persona cambia de puesto o pierde el acceso; usa una GitHub App.
- **Crear un token personal para un workflow** que podría usar el `GITHUB_TOKEN`.
- **Escribir el valor del secret en la línea de comandos** (`--body "abc123"`): queda en el historial.

## En la entrevista

**«¿Qué diferencia hay entre un token fine-grained y uno classic?»**
El fine-grained se limita a un propietario y a repos concretos, con permisos detallados y caducidad; el classic usa scopes amplios y accede a todo lo que el usuario puede ver. GitHub recomienda el fine-grained.

**«¿Por qué usar una GitHub App en vez de un token personal?»**
Porque no depende de una persona, tiene permisos detallados, se instala solo en los repos elegidos y sus tokens caducan en una hora, así que una filtración hace mucho menos daño.

**«¿Qué es el principio de mínimo privilegio?»**
Dar a cada persona o sistema solo los permisos que necesita, durante el tiempo que los necesita.

## Resumen

- Mínimo privilegio: el menor acceso, el menor tiempo.
- Classic (amplio) < **fine-grained** (repos y permisos concretos, caducidad) < **GitHub App** (identidad propia, tokens de 1 hora).
- En Actions, `GITHUB_TOKEN` con `permissions` y secrets; nunca credenciales en el código.
- `gh secret set|list|delete` (flags `--body`, `--env`, `--app`, `--org`).
- `SECURITY.md`: cómo informar de vulnerabilidades.
