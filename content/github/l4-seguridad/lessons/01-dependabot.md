---
title: Dependencias seguras con Dependabot
minutes: 10
---

## Qué problema resuelve

La mayor parte del código de un proyecto no lo has escrito tú: son **dependencias** (paquetes de npm, pip, imágenes de Docker, actions…). Cada semana se descubren vulnerabilidades en paquetes populares. Revisar a mano si alguna te afecta es imposible. **Dependabot** vigila tus dependencias, te avisa cuando una es vulnerable y abre los PRs para actualizarla.

## Analogía

Es el **aviso de retirada de un coche**: el fabricante descubre un fallo en una pieza, consulta quién tiene ese modelo y le escribe para que pase por el taller. Tú no tienes que leer cada boletín técnico; te avisan si te afecta, y a veces el taller ya te propone la cita.

## Concepto

Todo se apoya en el **dependency graph**: GitHub lee los ficheros de manifiesto y de bloqueo del repo (`package.json`, `package-lock.json`, `requirements.txt`…) y sabe qué dependencias usas y en qué versión. Se consulta en la pestaña *Insights*.

Dependabot tiene **tres funciones distintas**:

| Función | Qué hace | Se activa |
|---|---|---|
| **Dependabot alerts** | Avisa cuando una dependencia tiene una vulnerabilidad conocida | En los ajustes del repo |
| **Dependabot security updates** | Abre un PR que sube la dependencia vulnerable a **la versión mínima que incluye el parche** | En los ajustes; necesita las alertas |
| **Dependabot version updates** | Abre PRs para mantener las dependencias al día **aunque no tengan vulnerabilidades** | Con el fichero `.github/dependabot.yml` |

Las alertas salen de la **GitHub Advisory Database**, una base de datos pública de vulnerabilidades. Se generan cuando se publica una vulnerabilidad nueva que te afecta o cuando cambia tu dependency graph (por ejemplo, al añadir un paquete).

**`dependabot.yml`** (solo para las version updates) va en **`.github/dependabot.yml`**:

- `version: 2` (siempre 2);
- `updates`: una entrada por ecosistema, con tres claves obligatorias:
  - `package-ecosystem`: `npm`, `pip`, `docker`, `maven`, `github-actions`…;
  - `directory`: dónde están los manifiestos (`"/"` para la raíz);
  - `schedule.interval`: `daily`, `weekly`, `monthly`… (también `cron`).

Por defecto, Dependabot abre **un PR por cada dependencia** que hay que actualizar y, cuando hay **5 PRs** de version updates abiertos, no abre más hasta que se fusionen o cierren (se cambia con `open-pull-requests-limit`).

Los PRs de Dependabot son PRs normales: el CI se ejecuta, se revisan y se fusionan como cualquier otro.

## Ejemplo

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"          # Paquetes de package.json
    directory: "/"                    # package.json está en la raíz
    schedule:
      interval: "weekly"              # Revisa una vez por semana
  - package-ecosystem: "github-actions"   # Las actions de los workflows
    directory: "/"                        # Busca en .github/workflows (y action.yml)
    schedule:
      interval: "weekly"
```

Cada semana, Dependabot comprueba si hay versiones nuevas de los paquetes de npm y de las actions (`actions/checkout@v6` → `@v7`) y abre un PR por cada dependencia.

## Errores comunes

- **Confundir las tres funciones.** Las alertas solo avisan; las security updates arreglan vulnerabilidades; las version updates actualizan todo, vulnerable o no.
- **Pensar que `dependabot.yml` es necesario para las security updates.** Solo configura las version updates (y personaliza las security updates, si quieres).
- **Fusionar los PRs de Dependabot sin CI.** Una versión nueva puede romper tu código; los tests son los que te dan confianza para fusionar.
- **Ignorar las alertas durante meses.** Se acumulan y cada actualización pendiente hace más difícil la siguiente.
- **Olvidar el ecosistema `github-actions`.** Las actions también son dependencias.

## En la entrevista

**«¿Cómo gestionas las vulnerabilidades de las dependencias?»**
Con Dependabot: las alertas avisan cuando una dependencia aparece en la GitHub Advisory Database, las security updates abren PRs a la versión parcheada y las version updates (con `dependabot.yml`) mantienen todo al día. Los PRs pasan por el CI antes de fusionarse.

**«¿Qué diferencia hay entre security updates y version updates?»**
Las security updates solo actualizan dependencias vulnerables, a la versión mínima con el parche. Las version updates actualizan cualquier dependencia a la última versión, según el calendario de `dependabot.yml`.

## Resumen

- Dependency graph: qué dependencias usa el repo (pestaña *Insights*).
- **Alerts**: avisan (fuente: GitHub Advisory Database).
- **Security updates**: PR a la versión mínima parcheada.
- **Version updates**: PRs periódicos, configurados en `.github/dependabot.yml` (`version: 2`, `package-ecosystem`, `directory`, `schedule.interval`).
