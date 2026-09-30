---
title: Recuperar con reflog y encontrar errores con bisect
minutes: 10
---

## Qué problema resuelve

- Hiciste `git reset --hard` al commit equivocado, o borraste una rama con `-D`, y **tus commits han desaparecido** de `git log`.
- Algo que funcionaba hace dos semanas ya no funciona y hay 200 commits de por medio. ¿**Cuál** lo rompió?

**`git reflog`** resuelve lo primero y **`git bisect`**, lo segundo.

## Analogía

El **reflog** es el **historial del navegador**: aunque cierres una pestaña, puedes volver a la página porque quedó registrada. **Bisect** es el juego de **adivinar un número del 1 al 1000** diciendo «mayor» o «menor»: con unas 10 preguntas lo encuentras.

## Concepto

**`git reflog`** registra **cada vez que HEAD o una rama cambian de posición** en *tu* repositorio: commits, cambios de rama, resets, rebases, merges… Aunque un commit ya no esté en ninguna rama, el reflog sigue apuntando a él.

- Es **local**: no se sube ni se descarga.
- `HEAD@{2}` significa «donde estaba HEAD hace dos movimientos».
- Las entradas caducan: por defecto a los **90 días**, y a los **30** si el commit ya no es alcanzable desde ninguna rama.

Recuperar un commit perdido: busca su hash en `git reflog` y crea una rama que apunte a él (o haz reset a él).

```bash
git reflog
# 1c9e5a2 HEAD@{0}: reset: moving to HEAD~3
# 8f41d07 HEAD@{1}: commit: Valida el email      ← lo que quiero recuperar
git branch rescate 8f41d07      # o: git reset --hard 8f41d07
```

Lo que **nunca** estuvo en un commit (cambios sin guardar borrados con `reset --hard`) no aparece en el reflog: eso sí se pierde.

**`git bisect`** hace una **búsqueda binaria** en la historia:

1. `git bisect start`
2. `git bisect bad`: el commit actual tiene el error.
3. `git bisect good v1.4.0`: esa versión funcionaba.
4. Git se coloca en un commit intermedio. Lo pruebas y respondes `git bisect good` o `git bisect bad`. Si no se puede probar, `git bisect skip`.
5. Repites hasta que Git dice «`<hash>` is the first bad commit».
6. `git bisect reset` te devuelve a donde estabas.

Con N commits bastan unas log₂(N) pruebas: 1000 commits, unas 10.

**Automatizado:** `git bisect run <comando>` ejecuta el comando en cada paso y usa su código de salida: **0** = bueno, **125** = no se puede probar (saltar), **1 a 127** (salvo 125) = malo.

```bash
git bisect start HEAD v1.4.0     # malo: HEAD, bueno: v1.4.0
git bisect run npm test          # Git prueba solo cada commit
git bisect reset
```

## Ejemplo

```bash
# Borraste una rama sin fusionar por error
git branch -D feature/pagos
# Deleted branch feature/pagos (was 4e7a2b9).
git reflog | grep pagos          # o busca el hash en la salida
git branch feature/pagos 4e7a2b9 # La rama vuelve a existir
```

## Errores comunes

- **Dar por perdido un commit tras `reset --hard` o `branch -D`.** Mientras siga en el reflog, se recupera.
- **Creer que el reflog está en el remoto.** Es local: en un clon nuevo no está tu historial de movimientos.
- **Olvidar `git bisect reset`** y quedarte en un commit intermedio (detached HEAD).
- **Marcar mal un paso en bisect.** Una sola respuesta equivocada lleva a un culpable falso. `git bisect log` muestra lo que has marcado.

## En la entrevista

**«Has hecho `git reset --hard` y has perdido commits. ¿Se pueden recuperar?»**
Sí, si estaban en commits: `git reflog` muestra por dónde ha pasado HEAD; localizo el hash y creo una rama o hago reset a él. Los cambios que nunca llegaron a un commit no se recuperan.

**«¿Cómo encontrarías el commit que introdujo un error?»**
Con `git bisect`: marco un commit malo y uno bueno, y Git hace una búsqueda binaria. Si hay un test que detecte el error, `git bisect run` lo automatiza.

## Resumen

- `git reflog`: registro **local** de los movimientos de HEAD y las ramas; `HEAD@{n}`.
- Para recuperar un commit perdido: buscar su hash en el reflog y crear una rama (`git branch nombre <hash>`).
- Las entradas del reflog caducan (90 días; 30 si el commit no es alcanzable).
- `git bisect start/bad/good/reset`: búsqueda binaria del commit culpable.
- `git bisect run <comando>`: 0 = bueno, 125 = saltar, 1-127 = malo.
