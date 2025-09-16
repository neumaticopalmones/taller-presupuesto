# Hoja Rápida

Resumen mínimo para trabajar con la aplicación.

## 🎯 TAREAS PARA MAÑANA (17 Sept 2025)

**📍 Ver detalles completos en**: `manual-aplicacion/BACKLOG.md`

1. **LIMPIEZA**: Limpiar carpeta y quitar archivos/código inútil
2. **VISUAL**: Revisar y mejorar interfaz de usuario
3. **STOCK**: Empezar implementación de gestión de stock

---

## 1. Arrancar Todo

```
docker compose up -d
```

Ver estado:

```
docker ps
```

## 2. Verificar Salud

```
health_check.bat
```

O manual:

```
curl http://localhost:5000/health
```

## 3. Logs

```
docker logs taller_web --tail 50
```

## 4. Detener

```
docker compose down
```

## 5. Cambié dependencias / requirements.txt

```
docker compose build --no-cache web
docker compose up -d
```

## 6. Migraciones Base de Datos

Crear nueva migración (tras cambiar modelos en app.py):

```
docker exec -it taller_web flask db migrate -m "mensaje"
```

Aplicar:

```
docker exec -it taller_web flask db upgrade
```

## 7. Variables Clave (.env)

```
POSTGRES_USER=admin
POSTGRES_PASSWORD=password123
POSTGRES_DB=taller_app
POSTGRES_HOST=db
POSTGRES_PORT=5432
SECRET_KEY=cambia-esta-clave
REDIS_URL=redis://redis:6379/0
FLASK_DEBUG=0
```

## 8. Añadir Endpoint Sencillo (ejemplo)

En `app.py` dentro del archivo:

```python
@app.route('/ping')
def ping():
    return {"pong": True}
```

Luego reinicia contenedor o deja que Gunicorn recicle workers (puede tardar unos segundos).
Prueba:

```
curl http://localhost:5000/ping
```

## 9. Problemas Rápidos

- No conecta BD: espera unos segundos (Postgres iniciando) y revisa `docker logs taller_db`.
- Error psycopg: reconstruye imagen.
- Rate limit: espera o baja límites en código.
- Salud KO: mira logs de `taller_web`.

## 10. Actualizar Todo (hard reset)

```
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

(Advertencia: `-v` borra los datos de Postgres.)

## 11. Métricas Rápidas (/stats)

Ver conteos y último presupuesto:

```
curl -s http://localhost:5000/stats
```

Útil para comprobar crecimiento o monitorización ligera.

## 12. Alias de Scripts (Uso Súper Rápido)

Estos alias simplifican operaciones frecuentes:

```
abrir_aplicacion.bat            # Lanza la app local (equivale a run_app.bat)
crear_copia_completa.bat        # Crea tag + rama (equivale a create_restore_point_plus.bat)
gestor_copias.bat               # Menú (crear, listar, restaurar, push)
restaurar_desde_copia.bat TAG   # Restaura a nueva rama desde tag
```

Ejemplos:

```
crear_copia_completa.bat push
restaurar_desde_copia.bat ok-20250914-120500 fix-bug-x
```

Listar últimos puntos:

```
git tag --list "ok-*" --sort=-creatordate | head -n 10
```

Más detalle en `RESTORE_POINTS.md`.

---

Con esta hoja deberías cubrir lo básico sin leer todo el manual.
