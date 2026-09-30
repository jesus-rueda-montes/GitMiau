---
title: La API de GitHub y los webhooks
minutes: 11
---

## Qué problema resuelve

Tarde o temprano querrás automatizar algo que no tiene botón: un informe de los PRs abiertos de todos los repos, crear cincuenta repos con la misma configuración, avisar en el chat cuando se publica una release… Todo lo que haces en la web se puede hacer con la **API**. Y para **reaccionar** a lo que pasa en GitHub sin preguntar cada minuto, están los **webhooks**.

## Analogía

- La **API** es **llamar por teléfono** a la oficina para preguntar o pedir algo.
- Hacer **polling** es **llamar cada cinco minutos** para ver si ha llegado tu paquete.
- Un **webhook** es que **la oficina te avise** cuando llegue.

## Concepto

**Dos APIs.**

| | REST | GraphQL |
|---|---|---|
| Forma | Un endpoint por recurso (`repos/OWNER/REPO/issues`…) con métodos HTTP (`GET`, `POST`, `PATCH`, `DELETE`) | Un **único endpoint** al que envías una consulta |
| Datos | Estructura fija, a menudo con más datos de los que necesitas | **Exactamente** los campos que pides |
| Peticiones | A veces varias para juntar datos relacionados | Una sola consulta puede sustituir a muchas |

GitHub no obliga a elegir una: se usa la que encaje mejor en cada caso.

**`gh api`** hace peticiones **autenticadas** con tu sesión de `gh`:

```bash
gh api repos/{owner}/{repo}/releases                  # GET; {owner} y {repo} salen del repo actual
gh api repos/{owner}/{repo}/issues/123/comments -f body='Hola desde la CLI'   # Con parámetros pasa a POST
gh api -X GET search/issues -f q='repo:cli/cli is:open'  # Fuerza GET con parámetros
gh api repos/{owner}/{repo}/issues --paginate --jq '.[].title'   # Todas las páginas, solo los títulos
gh api graphql -f query='query { viewer { login } }'  # GraphQL
```

- El método por defecto es **GET**; al añadir parámetros pasa a **POST**; `-X` (`--method`) lo fija.
- **`-f`** (`--raw-field`) envía el valor como texto; **`-F`** (`--field`) convierte `true`, `false`, `null` y números a su tipo JSON, y lee ficheros con `@fichero`.
- `{owner}`, `{repo}` y `{branch}` se sustituyen por los del repositorio actual. En PowerShell, pon entre comillas los valores con llaves.

**Rate limits (API REST).** Cada credencial tiene un máximo de peticiones por hora:

| Quién llama | Límite |
|---|---|
| Sin autenticar | 60 / hora |
| Usuario autenticado | 5.000 / hora |
| `GITHUB_TOKEN` en Actions | 1.000 / hora por repositorio |

Las cabeceras `x-ratelimit-limit`, `x-ratelimit-remaining` y `x-ratelimit-reset` dicen cuántas quedan y cuándo se reinicia el contador. Si te pasas, la API responde **403 o 429** y hay que esperar al reinicio.

**Webhooks.** Se configuran en un repositorio, en una organización o en una GitHub App: eliges los **eventos** (`push`, `pull_request`, `release`…) y la **URL** de tu servidor, y GitHub envía un POST con los datos del evento cada vez que ocurre. Frente al polling, gastan menos recursos, escalan mejor y llegan casi en tiempo real.

Buenas prácticas de la documentación oficial:

- configura un **secret**: GitHub firma cada envío con él (HMAC SHA-256) en la cabecera **`X-Hub-Signature-256`**, que empieza por `sha256=`. Tu servidor recalcula la firma y la compara **en tiempo constante**; si no coincide, descarta la petición;
- usa **HTTPS**;
- responde con un **2XX en menos de 10 segundos**: guarda el evento en una **cola** y procésalo después;
- comprueba el **tipo de evento y la acción** antes de procesarlo;
- usa la cabecera **`X-GitHub-Delivery`** (única por envío) para detectar repeticiones;
- si tu servidor ha estado caído, **reenvía** (*redeliver*) los eventos perdidos.

## Ejemplo

Un bot publica en el chat de la empresa cada release nueva:

1. Webhook en la organización, con el evento **`release`**, la URL `https://bot.mi-empresa.com/github` y un secret.
2. Al publicarse una release, GitHub envía el POST con las cabeceras `X-GitHub-Event: release`, `X-GitHub-Delivery` y `X-Hub-Signature-256`.
3. El bot comprueba la firma con el secret, responde `202` enseguida y deja el mensaje en una cola.
4. Un proceso aparte lee la cola y publica en el chat. Si la misma `X-GitHub-Delivery` llega dos veces, la ignora.

## Errores comunes

- **Webhook sin secret**, o sin comprobar la firma: cualquiera que conozca la URL puede enviarte eventos falsos.
- **Comparar la firma con `==`.** Usa una comparación en tiempo constante (por ejemplo, `crypto.timingSafeEqual` en Node.js).
- **Procesar todo antes de responder.** Si tardas más de 10 segundos, GitHub da el envío por fallido.
- **Hacer polling de la API cada minuto** para detectar cambios: agota el rate limit; usa webhooks.
- **Olvidar la paginación**: la API devuelve los resultados por páginas; con `gh api --paginate` obtienes todas.

## En la entrevista

**«¿Qué diferencia hay entre la API REST y GraphQL de GitHub?»**
REST tiene un endpoint por recurso y devuelve estructuras fijas; GraphQL tiene un solo endpoint y devuelve exactamente los campos que pides, a menudo en una sola petición donde REST necesitaría varias.

**«¿Webhooks o polling?»**
Webhooks para reaccionar a eventos: menos recursos, casi en tiempo real y sin gastar rate limit. Polling solo para consultas puntuales.

**«¿Cómo aseguras un endpoint de webhooks?»**
HTTPS, un secret para validar `X-Hub-Signature-256` con una comparación en tiempo constante, responder rápido con una cola detrás y descartar entregas repetidas con `X-GitHub-Delivery`.

## Resumen

- REST: un endpoint por recurso. GraphQL: un endpoint y solo los datos pedidos.
- `gh api ENDPOINT`: GET por defecto, POST con parámetros, `-X` para el método, `-f`/`-F`, `--paginate`, `--jq`, `graphql`.
- Rate limits: 60/h sin autenticar, 5.000/h autenticado, 1.000/h por repo con `GITHUB_TOKEN`.
- Webhooks: eventos → POST a tu URL; secret + `X-Hub-Signature-256`, HTTPS, 2XX en menos de 10 s, cola, `X-GitHub-Delivery`.
