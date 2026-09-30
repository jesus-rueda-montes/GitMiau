---
title: Rescates de Git
minutes: 12
---

## Qué problema resuelve

Todo el mundo acaba metiendo la pata con Git: un commit en la rama que no era, un push rechazado, un `reset --hard` de más. La diferencia entre un junior y un senior no es no equivocarse, sino **saber diagnosticar** y **deshacer sin empeorarlo**. Esta lección junta los rescates más habituales en un solo sitio.

## Analogía

Es el **manual de primeros auxilios**: primero **mirar** (¿respira?, ¿sangra?) y después aplicar el procedimiento adecuado. Actuar sin mirar (un `--force` «a ver si así») es lo que convierte un rasguño en una urgencia.

## Concepto

**Regla de oro: primero diagnostica.** `git status` dice en qué rama estás, qué hay sin guardar y si hay una operación a medias (merge, rebase). `git log --oneline --graph --all` enseña dónde está cada rama. Y recuerda: **lo que llegó a un commit casi nunca se pierde**; está en el reflog.

| Síntoma | Causa | Rescate |
|---|---|---|
| `git status` dice *HEAD detached at…* y has hecho commits | Estás en un commit, no en una rama | `git switch -c rescate` (crea una rama que conserva los commits) |
| Te fuiste de un detached HEAD y los commits «desaparecieron» | No estaban en ninguna rama | `git reflog`, localiza el hash y `git branch rescate <hash>` |
| `! [rejected] main -> main (fetch first)` | El remoto tiene commits que tú no tienes | `git pull --rebase` (o `git pull`) y después `git push` |
| Push rechazado en **tu** rama tras un rebase | Has reescrito la historia | `git push --force-with-lease` (nunca en ramas compartidas) |
| Un `reset --hard` o `branch -D` se llevó commits | Ya no están en ninguna rama | `git reflog` + `git branch rescate <hash>` |
| Commit en `main` que debía ir en una rama nueva (sin push) | Olvidaste crear la rama | Ver el ejemplo |
| Un commit ya **subido** y compartido es incorrecto | — | `git revert <commit>`: nunca reescribas historia compartida |
| Conflicto que no sabes resolver | Merge o rebase a medias | `git merge --abort` / `git rebase --abort` y vuelves al estado anterior |
| *Your local changes … would be overwritten* | Cambios sin commit que chocan al cambiar de rama o hacer pull | `git stash`, la operación, y `git stash pop` |

**Lo que no se puede rescatar:** cambios que **nunca** estuvieron en un commit y se borraron con `git reset --hard` o `git restore`. El reflog solo guarda commits. Moraleja: haz commits pequeños y a menudo, aunque luego los juntes.

## Ejemplo

Has hecho **dos commits en `main`** que debían ir en la rama `login`. Aún no has hecho push y no tienes cambios sin guardar.

```bash
git status                  # Comprueba: en main, sin cambios pendientes
git branch login            # Crea login apuntando aquí (con los dos commits)
git reset --hard HEAD~2     # Devuelve main dos commits atrás
git switch login            # Sigue trabajando en login: los commits están aquí
git log --oneline -3        # Verifica
```

Si esos commits **ya estaban subidos** a `main`, no reescribas `main`: crea la rama desde ahí y deshaz en `main` con `git revert`.

## Errores comunes

- **Usar `git push --force` para «arreglar» un push rechazado en `main`.** Borra el trabajo de otros. Primero `git pull`.
- **Reescribir historia ya compartida** (`reset`, `rebase`, `commit --amend` y push forzado) en ramas que usa más gente.
- **Borrar el repo y clonarlo de nuevo** al primer susto: pierdes el reflog y los cambios locales.
- **`reset --hard` con cambios sin commit** que querías conservar: haz `git stash` o un commit antes.
- **Actuar sin mirar `git status`.** La mitad de los problemas se explican leyendo lo que dice.

## En la entrevista

**«He hecho `git reset --hard` y he perdido commits. ¿Se pueden recuperar?»**
Sí, si estaban en commits: `git reflog` muestra por dónde ha pasado HEAD; localizo el hash y creo una rama con `git branch rescate <hash>`. Lo que nunca llegó a un commit no se recupera.

**«Tu push a `main` se rechaza. ¿Qué haces?»**
Leo el mensaje: si es *fetch first*, alguien subió commits antes. Hago `git pull` (o `pull --rebase`), resuelvo conflictos si los hay, paso los tests y vuelvo a hacer push. Nunca fuerzo en `main`.

**«¿Cómo deshaces un commit que ya está en `main` en el remoto?»**
Con `git revert`, que crea un commit nuevo con los cambios contrarios sin reescribir la historia que otros ya tienen.

## Resumen

- Primero diagnostica: `git status` y `git log --oneline --graph --all`.
- Detached HEAD con commits → `git switch -c rescate`.
- Push rechazado → `git pull` y push; en tu rama tras un rebase → `--force-with-lease`.
- Commits «perdidos» → `git reflog` + `git branch rescate <hash>`.
- Historia compartida → `git revert`, nunca reescribir.
- Conflicto a medias → `--abort`; cambios que estorban → `git stash`.
