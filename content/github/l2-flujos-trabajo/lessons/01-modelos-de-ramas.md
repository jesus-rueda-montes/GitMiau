---
title: GitHub Flow, Git Flow y trunk-based
minutes: 12
---

## Qué problema resuelve

Git permite crear ramas de mil maneras. Si cada persona del equipo hace lo que quiere, nadie sabe de dónde sacar una rama, adónde fusionarla ni qué hay en producción. Un **flujo de trabajo** (*branching model*) es el acuerdo del equipo sobre **qué ramas existen, cuánto viven y cómo se integran**.

## Analogía

Es como las **normas de circulación** de una ciudad: da igual que se conduzca por la derecha o por la izquierda, pero todos deben hacerlo igual. Una ciudad pequeña funciona con pocas señales (GitHub Flow). Una con tráfico pesado y varias vías de servicio necesita más carriles y semáforos (Git Flow). Y otras apuestan por una sola avenida muy rápida en la que todos se incorporan a menudo (trunk-based).

## Concepto

**1. GitHub Flow.** El más sencillo y el que describe la documentación de GitHub:

1. Crea una rama desde `main` con un nombre descriptivo (`increase-test-timeout`).
2. Haz commits y push a esa rama.
3. Abre un Pull Request.
4. Atiende la revisión con más commits: el PR se actualiza solo.
5. Fusiona en `main`.
6. Borra la rama.

`main` es la única rama permanente. Encaja con equipos que **despliegan de forma continua**.

**2. Git Flow.** Propuesto por Vincent Driessen en 2010, con más ramas:

| Rama | Sale de | Se fusiona en | Para qué |
|---|---|---|---|
| `master` (o `main`) | — | — | Lo publicado: cada commit es una versión |
| `develop` | — | — | Integración de lo que irá en la próxima versión |
| `feature/*` | `develop` | `develop` | Cada funcionalidad |
| `release-*` | `develop` | `develop` y `master` | Preparar una versión (solo arreglos) |
| `hotfix-*` | `master` | `master` y `develop` | Arreglos urgentes en producción |

Usa merges con `--no-ff` para que cada funcionalidad quede agrupada en la historia. En 2020, el propio autor añadió una nota: si tu equipo hace **entrega continua**, recomienda un flujo más simple como GitHub Flow. Git Flow encaja con **software versionado** del que hay que mantener **varias versiones** a la vez (una app de escritorio, una librería…).

**3. Trunk-based development.** Todo el equipo integra en **una sola rama** (*trunk*, normalmente `main`) y se evitan las ramas de desarrollo de larga duración:

- ramas de funcionalidad **muy cortas** (horas o pocos días), solo para revisión y CI; los equipos muy pequeños pueden hacer commit directo al trunk;
- cada persona integra en el trunk **al menos una vez cada 24 horas**;
- el trabajo sin terminar se oculta con **feature flags** (interruptores en el código), así se puede fusionar sin que el usuario lo vea;
- las ramas de release son opcionales: se crean cuando hace falta y se borran tras publicar.

Minimiza los conflictos y exige un **CI sólido**, porque `main` siempre debe estar lista para publicar.

**¿Cuál elegir?**

| Situación | Flujo |
|---|---|
| Web o servicio con despliegue continuo, equipo pequeño o mediano | GitHub Flow |
| Equipo con CI muy maduro que integra varias veces al día | Trunk-based |
| Producto con versiones numeradas y varias mantenidas a la vez | Git Flow |

## Ejemplo

Un día en GitHub Flow:

```bash
git switch main && git pull
git switch -c fix/redondeo-iva
git commit -am "Corrige el redondeo del IVA"
git push -u origin fix/redondeo-iva
gh pr create --fill
# revisión → gh pr merge --squash --delete-branch
```

Un hotfix en Git Flow:

```bash
git switch -c hotfix-1.4.1 master
git commit -am "Corrige el cálculo del envío"
git switch master && git merge --no-ff hotfix-1.4.1 && git tag -a 1.4.1 -m "1.4.1"
git switch develop && git merge --no-ff hotfix-1.4.1
git branch -d hotfix-1.4.1
```

## Errores comunes

- **Adoptar Git Flow «porque es el estándar»** en una web que se despliega varias veces al día: demasiadas ramas para nada.
- **Ramas que viven semanas** en cualquier flujo. Cuanto más vive una rama, peores son los conflictos al integrarla.
- **Trunk-based sin tests ni CI.** `main` se rompe continuamente.
- **Mezclar flujos** sin acordarlo: unos fusionan en `develop` y otros en `main`.

## En la entrevista

**«¿Qué flujo de ramas usarías?»**
Depende del producto. Para un servicio con despliegue continuo, GitHub Flow o trunk-based: ramas cortas, PR con revisión y CI, y `main` siempre desplegable. Git Flow solo si hay que mantener varias versiones publicadas a la vez.

**«¿Qué son los feature flags y por qué se usan en trunk-based?»**
Interruptores en el código que activan o desactivan una funcionalidad. Permiten fusionar trabajo sin terminar en `main` sin que el usuario lo vea, y así integrar a diario.

**«¿Qué ramas tiene Git Flow?»**
`master` y `develop` permanentes, y ramas temporales `feature`, `release` y `hotfix`.

## Resumen

- **GitHub Flow**: `main` + ramas cortas + PR; ideal con despliegue continuo.
- **Git Flow**: `master`, `develop`, `feature`, `release`, `hotfix`; para software con varias versiones mantenidas.
- **Trunk-based**: todos integran en `main` a diario; feature flags y CI sólido.
- Sea cual sea el flujo, ramas **cortas**: menos conflictos.
