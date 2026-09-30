---
title: Contribuir a open source con fork y PR
minutes: 9
---

## Qué problema resuelve

En un proyecto open source no tienes permiso de escritura: no puedes crear ramas en su repositorio. Aun así, cualquiera puede contribuir. El flujo **fork & PR** permite proponer cambios desde **tu copia**, y te obliga a mantenerla al día con el original.

## Analogía

Quieres proponer una mejora al **menú de un restaurante**. No puedes entrar en su cocina, pero puedes hacer la receta en **tu cocina** (el fork), probarla y **llevar el plato** para que lo prueben (el PR). Si mientras tanto el restaurante cambia su menú, tienes que actualizar tu copia antes de proponer otra cosa.

## Concepto

**Antes de empezar**, lee el `README` y, si existe, el **`CONTRIBUTING.md`**: explica cómo quiere el proyecto que se contribuya (estilo, tests, cómo nombrar las ramas…). Busca issues con `good first issue` o `help wanted`, y comenta en la issue antes de dedicarle mucho tiempo.

**El flujo:**

1. **Fork** del repositorio original (botón *Fork* o `gh repo fork dueño/repo --clone`).
2. **Remotos**: `origin` = tu fork, `upstream` = el original.
3. **Rama** para el cambio, siempre partiendo del `main` actualizado del original. Nunca trabajes en el `main` de tu fork.
4. **Commits y push a tu fork** (`origin`).
5. **Pull Request** desde tu rama del fork hacia el `main` del original.
6. **Revisión**: los mantenedores comentan; tú haces push a la misma rama.
7. Cuando lo fusionan, **borras tu rama**.

**Mantener el fork al día.** El original sigue avanzando. Antes de cada contribución:

```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main   # Tu main = el del original
git push origin main                # Actualiza también tu fork en GitHub
```

Alternativas: el botón **Sync fork** en la web de tu fork, o **`gh repo sync`**, que actualiza tu copia (local o el fork remoto) desde su repositorio padre con un fast-forward.

Si tu rama se queda atrás mientras esperas la revisión, ponla al día con `git rebase upstream/main` (es tu rama, solo tuya) y `git push --force-with-lease`.

## Ejemplo

```bash
gh repo fork biblioteca/proyecto --clone
cd proyecto
git switch -c docs/typo-instalacion
git commit -am "Corrige una errata en la guía de instalación"
git push -u origin docs/typo-instalacion
gh pr create --fill                # gh lo abre contra el repositorio original

# Semanas después, para la siguiente contribución:
git switch main
gh repo sync                        # Trae a tu main local lo nuevo del original
git switch -c fix/otro-error
```

## Errores comunes

- **Trabajar en el `main` de tu fork.** En cuanto el original avanza, tu `main` diverge y cada PR arrastra cambios ajenos. Una rama por contribución.
- **No leer `CONTRIBUTING.md`** y ver el PR rechazado por formato o por no tener tests.
- **Enviar un PR enorme sin hablar antes con los mantenedores.** Puede que no encaje en el proyecto: comenta primero en una issue.
- **Olvidar sincronizar el fork** y partir de código de hace meses.

## En la entrevista

**«¿Cómo contribuirías a un proyecto open source?»**
Leo el README y el CONTRIBUTING, elijo una issue (por ejemplo, `good first issue`) y comento. Hago fork, configuro `upstream`, creo una rama desde el `main` actualizado, hago commits pequeños con tests, push a mi fork y abro un PR que enlaza la issue. Atiendo la revisión con más commits en la misma rama.

**«¿Cómo mantienes tu fork actualizado?»**
`git fetch upstream` y `git merge --ff-only upstream/main` (o `gh repo sync`, o Sync fork en la web), y después push a mi fork.

## Resumen

- Fork & PR: contribuir sin permiso de escritura, desde tu copia.
- `origin` = tu fork, `upstream` = el original; una rama por contribución, nunca en `main`.
- Lee `CONTRIBUTING.md` y habla en la issue antes de un cambio grande.
- Sincroniza: `git fetch upstream` + merge, Sync fork o `gh repo sync`.
