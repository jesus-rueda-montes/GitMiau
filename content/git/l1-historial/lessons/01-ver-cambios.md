---
title: Ver qué ha cambiado
minutes: 8
---

## Qué problema resuelve

`git status` te dice **qué** ficheros han cambiado, pero no **cómo**. Antes de hacer un commit quieres revisar las líneas exactas que vas a guardar, y a veces necesitas ver qué introdujo un commit antiguo o cómo era un fichero hace tres commits.

## Analogía

Es el **control de cambios** de un procesador de textos: las líneas tachadas en rojo son lo que se quita y las subrayadas en verde, lo que se añade. `git diff` te enseña ese control de cambios entre dos momentos del proyecto.

## Concepto

**`git diff` compara dos de las tres áreas.** Lo que compara depende de cómo lo llames:

| Comando | Compara | Sirve para ver… |
|---|---|---|
| `git diff` | working tree ↔ staging area | lo que has cambiado y **aún no** has preparado |
| `git diff --staged` (o `--cached`) | staging area ↔ último commit (HEAD) | lo que **entrará** en el próximo commit |
| `git diff HEAD` | working tree ↔ último commit | todo lo cambiado desde el último commit, preparado o no |
| `git diff A B` | commit A ↔ commit B | qué cambió entre dos commits |

Cómo se lee la salida: las líneas que empiezan por `-` se quitan y las que empiezan por `+` se añaden. Las demás son contexto (por defecto, 3 líneas alrededor de cada cambio).

Opciones útiles de `git diff`: `--stat` (resumen por fichero), `--name-only` (solo los nombres) y `--word-diff` (diferencias palabra a palabra, práctico en textos).

**`git show` enseña un commit**: su autor, fecha y mensaje, y el diff que introdujo. Sin argumentos muestra HEAD. Con `--stat` resume los ficheros y con `-s` (`--no-patch`) oculta el diff.

**Cómo nombrar commits sin copiar el hash:**

- `HEAD`: el commit en el que estás (`@` es un atajo de `HEAD`);
- `HEAD~1` (o `HEAD~`): el padre de HEAD; `HEAD~3`, tres commits atrás siguiendo siempre el primer padre;
- `HEAD^`: también el primer padre (la diferencia con `~` aparece con los merges, que tienen varios padres);
- `HEAD:README.md`: el fichero `README.md` tal como estaba en HEAD.

## Ejemplo

```bash
git diff                     # ¿Qué he tocado que aún no he preparado?
git add app.py
git diff --staged            # Revisa lo que vas a guardar antes del commit
git show                     # Mensaje y cambios del último commit
git show HEAD~2 --stat       # Qué ficheros cambió el commit de hace dos
git show HEAD~1:app.py       # Contenido de app.py un commit atrás
git diff HEAD~3 HEAD         # Todo lo que ha cambiado en los 3 últimos commits
```

Un fragmento de salida de `git diff`:

```diff
@@ -1,3 +1,3 @@
 def precio_final(base):
-    return base * 1.16
+    return base * 1.21
```

## Errores comunes

- **Ejecutar `git diff` después de `git add` y no ver nada.** No es que no haya cambios: ya están preparados. Usa `git diff --staged`.
- **Hacer commit sin revisar `git diff --staged`.** Así se cuelan líneas de depuración, contraseñas o ficheros que no tocaban.
- **Confundir `HEAD~1` con "el commit 1".** Es relativo: el padre del commit actual.

## En la entrevista

**«¿Cómo ves lo que vas a incluir en el próximo commit?»**
Con `git diff --staged` (sinónimo de `--cached`), que compara la staging area con HEAD. `git diff` sin opciones solo muestra lo que aún no está preparado.

**«¿Qué significa `HEAD~2`?»**
El abuelo del commit actual: dos generaciones atrás siguiendo el primer padre.

## Resumen

- `git diff`: working tree frente a staging area (lo no preparado).
- `git diff --staged`: staging area frente a HEAD (lo que irá en el commit).
- `git show <commit>`: mensaje y cambios de un commit.
- `HEAD~n` retrocede n commits; `HEAD:ruta` es un fichero tal como estaba en HEAD.
