---
title: Ignorar ficheros con .gitignore
minutes: 7
---

## Qué problema resuelve

En cualquier proyecto hay ficheros que **no** deben ir al repositorio: dependencias descargadas (`node_modules/`), resultados de compilar (`dist/`), logs, configuración de tu editor y, sobre todo, **secretos** (`.env` con contraseñas o claves de API). Si no se lo dices, Git los mostrará siempre como untracked y tarde o temprano alguien hará `git add .` y los subirá.

## Analogía

Es el cartel de **«No molestar»** en la puerta de un hotel: la limpieza (Git) pasa por delante de esas habitaciones sin entrar. Pero si ya estabas dentro limpiando cuando pusieron el cartel, sigues dentro: el cartel no te echa.

## Concepto

Un fichero **`.gitignore`** contiene patrones, uno por línea, de rutas que Git debe ignorar. Se guarda en el repositorio (con su commit), así que todo el equipo comparte las mismas reglas.

Reglas de los patrones:

| Patrón | Significado |
|---|---|
| `*.log` | Cualquier fichero que termine en `.log`, en cualquier carpeta |
| `dist/` | La barra final: solo **directorios** llamados `dist` |
| `/config.local` | La barra inicial: solo en la carpeta del `.gitignore`, no en subcarpetas |
| `**/temp` | `temp` en cualquier nivel |
| `logs/**` | Todo lo que hay dentro de `logs` |
| `!importante.log` | La `!` **vuelve a incluir** algo que un patrón anterior ignoraba |
| `# comentario` | Comentario; las líneas vacías no hacen nada |

`*` equivale a cualquier cosa salvo `/`, y `?` a un solo carácter.

**La regla clave: `.gitignore` no afecta a los ficheros que Git ya sigue.** Si `config.env` ya está en un commit, añadirlo al `.gitignore` no hace nada. Hay que dejar de seguirlo:

```bash
git rm --cached config.env   # Lo quita del índice; el fichero sigue en tu disco
```

y después hacer commit. Ojo: sigue en los commits anteriores. Si era un secreto, hay que **cambiarlo** (rotarlo), porque cualquiera con acceso a la historia puede leerlo.

Otros sitios para reglas de ignorar: `.git/info/exclude` (solo para tu copia, no se comparte) y el fichero global de `core.excludesFile` (para todos tus repos, p. ej. los ficheros de tu sistema operativo).

Para saber **qué regla** ignora un fichero: `git check-ignore -v ruta`.

## Ejemplo

```gitignore
# Dependencias y compilación
node_modules/
dist/

# Logs, excepto el de auditoría
*.log
!auditoria.log

# Secretos: nunca al repositorio
.env
```

```bash
git check-ignore -v debug.log
# .gitignore:6:*.log	debug.log   (fichero:línea:patrón y la ruta)
```

## Errores comunes

- **Añadir al `.gitignore` un fichero ya seguido** y esperar que desaparezca del repo. Hace falta `git rm --cached`.
- **Subir un secreto y creer que borrarlo en el siguiente commit lo arregla.** Sigue en la historia: hay que rotarlo.
- **Querer rescatar con `!` un fichero dentro de una carpeta ignorada** (`logs/` y `!logs/importante.log`). No funciona: si la carpeta padre está excluida, Git ni siquiera mira dentro.
- **Poner en el `.gitignore` del proyecto cosas de tu editor o tu sistema.** Van mejor en tu ignore global.

## En la entrevista

**«He añadido un fichero al `.gitignore` y Git lo sigue mostrando como modificado. ¿Por qué?»**
Porque ya estaba seguido: `.gitignore` solo afecta a los ficheros untracked. Hay que ejecutar `git rm --cached fichero` y hacer commit.

**«Has subido una clave de API por error. ¿Qué haces?»**
Revocarla y generar otra inmediatamente, porque sigue en la historia aunque la borres. Después, dejar de seguir el fichero, añadirlo al `.gitignore` y, si hace falta, limpiar la historia.

## Resumen

- `.gitignore` lista patrones de rutas que Git no debe seguir; se versiona y lo comparte el equipo.
- `/` al final = solo directorios; `/` al principio = relativo a la carpeta del `.gitignore`; `!` vuelve a incluir.
- No afecta a ficheros ya seguidos: `git rm --cached` los deja de seguir sin borrarlos del disco.
- `git check-ignore -v` dice qué regla ignora un fichero.
- Un secreto subido se considera comprometido: hay que rotarlo.
