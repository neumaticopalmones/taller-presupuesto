Puntos de restauración (estados que funcionan)

- 2025-08-30 19:00 — tag: ok-20250830-1900 — rama: estables/2025-08-30-1900-ok — Descripción: Estado estable local antes de cambios de la noche.

Cómo volver a un punto:

- En VS Code Terminal (PowerShell):
  - git switch estables/2025-08-30-1900-ok
  - o: git switch -c restore/desde-ok-20250830-1900 ok-20250830-1900

Cómo crear un nuevo punto:

- Ejecuta el script create_restore_point.bat o usa manual:
  - set TS=$(Get-Date -Format 'yyyyMMdd-HHmmss')
  - git tag -a ok-%TS% -m "Estado estable local %TS%"
  - git branch estables/%TS%-ok

## Scripts Mejorados

### backup_completo.bat **[NUEVO]**

Versión mejorada que incluye:

- Commit automático opcional de cambios pendientes
- Descripción más detallada del respaldo
- Log de respaldos (respaldos.log)
- Verificaciones adicionales
- Push opcional interactivo

Uso:

```
backup_completo.bat
```

### verificar_respaldos.bat **[NUEVO]**

Verifica la integridad y estado de todos los respaldos:

- Cuenta puntos de restauración disponibles
- Verifica que cada tag tenga su rama asociada
- Muestra estadísticas del repositorio
- Detecta diferencias desde el último respaldo
- Recomendaciones automáticas

Uso:

```
verificar_respaldos.bat
```

### limpiar_respaldos_antiguos.bat **[NUEVO]**

Limpia respaldos antiguos manteniendo los más importantes:

- Mantiene los 5 respaldos más recientes
- Elimina respaldos muy antiguos
- Confirmación doble por seguridad
- Opción de limpieza en remoto

Uso:

```
limpiar_respaldos_antiguos.bat
```

### create_restore_point_plus.bat

Crea punto sólo si no hay cambios sin commit y opcionalmente hace push.

Uso:

```
create_restore_point_plus.bat          (solo local)
create_restore_point_plus.bat push     (crea y hace push a origin)
```

Lista últimos puntos:

```
git tag --list "ok-*" --sort=-creatordate | head -n 10
```

### restore_from_point.bat

Restaura (checkout) un estado usando un tag previamente creado.

Uso:

```
restore_from_point.bat ok-YYYYMMDD-HHMMSS
restore_from_point.bat ok-YYYYMMDD-HHMMSS rama-nueva
```

Ejemplo:

```
restore_from_point.bat ok-20250914-120500 prueba-fix
```

Ver diferencias después de restaurar:

```
git diff ok-20250914-120500..main
```

Volver a rama principal:

```
git switch main
```

## Alias Rápidos

Para facilitar el uso diario existen alias en español que envuelven los scripts principales:

| Alias                          | Script original               | Función                                                 |
| ------------------------------ | ----------------------------- | ------------------------------------------------------- |
| abrir_aplicacion.bat           | run_app.bat                   | Inicia la aplicación local (modo desarrollo).           |
| crear_copia_completa.bat       | create_restore_point_plus.bat | Crea tag y rama (valida árbol limpio). `push` opcional. |
| backup_completo.bat            | **[NUEVO]**                   | Respaldo completo con commit automático y logs.         |
| gestor_copias.bat              | gestor_restore.bat            | Menú interactivo (crear, listar, restaurar, push).      |
| restaurar_desde_copia.bat      | restore_from_point.bat        | Restaura desde tag creando rama nueva opcional.         |
| verificar_respaldos.bat        | **[NUEVO]**                   | Verifica integridad y estado de respaldos.              |
| limpiar_respaldos_antiguos.bat | **[NUEVO]**                   | Limpia respaldos antiguos manteniendo los recientes.    |

Ejemplos:

```
crear_copia_completa.bat
crear_copia_completa.bat push
restaurar_desde_copia.bat ok-20250914-120500 prueba-ajuste
```

Listado rápido de tags recientes:

```
git tag --list "ok-*" --sort=-creatordate | head -n 10
```

Ver también la sección de alias en `README.md` y la hoja rápida `HOJA_RAPIDA.md`.
