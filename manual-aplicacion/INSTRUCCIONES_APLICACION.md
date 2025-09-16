# Instrucciones de la Aplicación

Guía rápida para entender cómo está construida y cómo funciona tu aplicación de presupuestos.

## 1. Visión General

La aplicación permite gestionar clientes y presupuestos. El frontend (HTML + JavaScript) llama a una API en Flask que guarda datos en PostgreSQL.

## 2. Componentes Principales

- **Frontend (index.html + js/)**: Interfaz que el usuario ve. Hace peticiones fetch.
- **Caddy (opcional)**: Servidor reverse proxy (puede servir HTTPS o archivos estáticos).
- **Flask (app.py)**: Lógica de negocio y endpoints REST.
- **Gunicorn**: Servidor WSGI para producción (múltiples workers/hilos).
- **SQLAlchemy**: ORM que traduce objetos Python a tablas PostgreSQL.
- **PostgreSQL**: Base de datos que guarda los datos.
- **Alembic / Flask-Migrate**: Control de cambios de la base (migraciones).
- **Redis**: Backend para rate limiting y potencial caché.
- **docker-compose**: Orquesta todos los servicios con un solo comando.
- **Variables de entorno (.env)**: Configuración (usuarios, claves, URLs) fuera del código.

## 3. Diagrama ASCII (Arquitectura)

```
+---------------------------+
|      Navegador (UI)       |
|  HTML + JS (fetch API)    |
+-------------+-------------+
              |
              | HTTP (JSON)
              v
+---------------------------+
|        Caddy (proxy)      |
| (opcional / puede omitirse)|
+-------------+-------------+
              |
              v
+---------------------------+
|   Flask + Gunicorn        |
| - Endpoints REST          |
| - Lógica Presupuestos     |
| - Rate Limiting (Redis)   |
+------+----------+---------+
       |          |
       | SQL      | Contadores
       v          v
+--------------+  +------------------+
| PostgreSQL   |  | Redis            |
| Datos/Migr.  |  | Rate limit / Caché|
+--------------+  +------------------+

(Orquestado con docker-compose)
```

## 4. Flujo de una Petición (Ejemplo GET /presupuestos)

1. El navegador ejecuta `fetch('/presupuestos?page=1')`.
2. (Si está) Caddy pasa la petición a Flask.
3. Flask verifica límites (Flask-Limiter + Redis).
4. Flask pide datos a PostgreSQL mediante SQLAlchemy.
5. Flask responde JSON al navegador.
6. El frontend actualiza la interfaz.

## 5. Comandos Frecuentes

Levantar todo:

```
docker compose up -d
```

Reconstruir backend (si cambias dependencias):

```
docker compose build --no-cache web
```

Ver logs backend:

```
docker logs taller_web --tail 50
```

Migraciones:

```
docker exec -it taller_web flask db migrate -m "mensaje"
docker exec -it taller_web flask db upgrade
```

Comprobar salud:

```
health_check.bat
```

## 6. Archivos Clave

- `app.py`: Código principal Flask.
- `requirements.txt`: Dependencias Python.
- `docker-compose.yml`: Servicios (web, db, redis, caddy).
- `Dockerfile`: Cómo construir la imagen del backend.
- `migrations/`: Historial de migraciones Alembic.
- `.env.example`: Plantilla de configuración.
- `INSTRUCCIONES_APLICACION.md`: Este documento.

## 7. Variables Importantes

```
POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT
DATABASE_URL (opcional para sobreescribir la cadena completa)
SECRET_KEY (recomendado definir en producción)
REDIS_URL (para rate limit y caché futura)
FLASK_DEBUG (0 producción, 1 desarrollo)
```

## 8. Añadir Nuevas Funciones (Guía Básica)

1. Crear/editar modelo en `app.py`.
2. Ejecutar migración:
   ```
   flask db migrate -m "nueva tabla X"
   flask db upgrade
   ```
3. Añadir endpoint (ejemplo):
   ```python
   @app.route('/mi_endpoint', methods=['GET'])
   def mi_endpoint():
       return {"ok": True}
   ```
4. Probar con navegador o `curl`.

## 9. Errores Comunes

- `ModuleNotFoundError psycopg`: Reinstala dependencias o reconstruye imagen.
- `Connection refused` a PostgreSQL: Aún arrancando el contenedor DB.
- Migración falla: Revisa cambios de modelo y vuelve a generar.
- Límite de peticiones: Espera o ajusta límites en código.

## 10. Próximos Pasos Sugeridos

- Añadir caché para lecturas frecuentes.
- Endpoint de exportación avanzado (PDF/Excel).
- Autenticación si abres la app a internet.
- Tests adicionales para nuevos endpoints.

---

Cualquier duda, abre este archivo y repasa la sección correspondiente.

## 11. Endpoint /stats (Métricas Rápidas)

Resumen rápido del estado de la aplicación para paneles o scripts de monitorización.

Ruta:

```
GET /stats
```

Respuesta (ejemplo):

```json
{
  "ok": true,
  "clientes": 12,
  "presupuestos": 45,
  "ult_presupuesto": {
    "id": "0f6c7c1a-...",
    "fecha": "2025-09-14"
  }
}
```

Campos:

- `ok`: boolean, indica éxito.
- `clientes`: total de clientes.
- `presupuestos`: total de presupuestos.
- `ult_presupuesto`: objeto con `id` y `fecha` del último presupuesto o `null` si no hay.

En caso de error de base de datos u otro problema interno:

```json
{
  "ok": false,
  "error": "mensaje"
}
```

Uso típico:

```
curl -s http://localhost:5000/stats | jq
```

Puedes usarlo para:

- Verificar crecimiento de datos.
- Crear panel sencillo (frontend podría refrescar cada X segundos).
- Health extendido (si `ok=false` se investiga).

No requiere autenticación (actualmente). Si en el futuro añades usuarios puede limitarse.

## 12. Sugerencias Dinámicas (/sugerencias)

Analiza los últimos N presupuestos (parámetro `limit`, por defecto 200, máximo 1000) y construye:

- `medidas`: top medidas (por ocurrencias en grupos)
- `marcas`: top marcas (por ocurrencias en neumáticos)
- `combos`: diccionario medida -> lista de marcas más usadas con esa medida

Uso:

```
GET /sugerencias?limit=300
```

El frontend muestra chips clicables; seleccionar una medida filtra y muestra marcas más frecuentes para esa medida.

## 13. Precios por Medida (/precios)

Permite mantener un pequeño catálogo histórico de netos por medida y marca.

### GET /precios?medida=205/55R16

Devuelve coincidencias basadas en variantes normalizadas (captura bases como `205/55/16` y `205/55R16`).

### POST /precios

Body JSON:

```json
{ "medida": "205/55R16 91V", "marca": "MICHELIN PRIMACY", "neto": 72.5 }
```

Upsert por (medida, marca). `updated_at` se refresca al modificar.

El frontend usa estos datos para ofrecer chips que rellenan marca y neto con un clic, además de filtros de código (ej: índice de carga/velocidad) extraídos del texto tras la base de medida.

## 14. Búsqueda en Historial por Medida

`GET /presupuestos?medida=<fragmento>` filtra presupuestos cuyo JSON (vista_cliente o vista_interna) contenga grupos con esa cadena en el campo `medida`.

Ejemplos:

```
/presupuestos?medida=205/55
/presupuestos?medida=215/60R17&nombre=juan
```

Implementación:

- En PostgreSQL se castea el JSONB a texto y se hace ILIKE `%fragmento%` (flexible).
- En otros motores (tests SQLite) se realiza filtrado en memoria.

Frontend: campo “Medida” añadido al formulario de Historial; Enter dispara búsqueda.

## 15. Exportación PDF

`GET /presupuestos/<id>/pdf` genera un PDF simple (cabecera, cliente, líneas y total). Requiere instalar `reportlab`.

Instalación manual:

```
pip install reportlab
```

Si la librería no está disponible el endpoint responde 501. Puedes usarla para imprimir o adjuntar presupuestos.

## 16. Scripts y Alias (Gestión de Puntos Estables)

Scripts principales:

| Script                        | Función                                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| create_restore_point_plus.bat | Crea tag `ok-YYYYMMDD-HHMMSS` + rama `estables/...` si el árbol está limpio. Push opcional pasando `push`. |
| restore_from_point.bat        | Crea una rama nueva desde un tag existente (opcional nombre).                                              |
| gestor_restore.bat            | Menú interactivo (crear, listar, restaurar, push).                                                         |

Alias amigables en español:

| Alias                     | Script original               | Descripción breve                         |
| ------------------------- | ----------------------------- | ----------------------------------------- |
| crear_copia_completa.bat  | create_restore_point_plus.bat | Crear punto verificado (y push opcional). |
| restaurar_desde_copia.bat | restore_from_point.bat        | Restaurar a nueva rama desde un tag.      |
| gestor_copias.bat         | gestor_restore.bat            | Menú unificado.                           |
| abrir_aplicacion.bat      | run_app.bat                   | Levantar app local.                       |

Listar últimos tags:

```
git tag --list "ok-*" --sort=-creatordate | head -n 10
```

## 17. Seguridad y Límites

- Rate limiting por defecto: `200/day`, `50/hour` global (ajustable en inicialización de `Limiter`).
- Uso de Redis si `REDIS_URL` está definido: persistencia entre workers.
- Si `SECRET_KEY` no está configurado se genera uno temporal (solo para desarrollo).

## 18. Extensiones Futuras (Backlog Extracto)

Ver `BACKLOG.md` para lista completa. Principales líneas:

- Cache en `/stats`.
- Exportaciones PDF avanzadas / Excel.
- Autenticación + roles.
- Métricas Prometheus.
- Alertas (Sentry) y auditoría de cambios.
- Paginación eficiente y búsqueda avanzada por rango fechas.
