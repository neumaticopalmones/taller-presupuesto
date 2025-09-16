# Aplicación Presupuestos Neumáticos

## 📚 DOCUMENTACIÓN COMPLETA

> 🎯 **TODA LA DOCUMENTACIÓN ESTÁ EN**: [`manual-aplicacion/`](manual-aplicacion/)

### 🚀 **EMPEZAR AQUÍ**

- **[📋 ÍNDICE MAESTRO](manual-aplicacion/INDICE_MAESTRO.md)** → Navegación a toda la documentación
- **[🏗️ DOCUMENTACIÓN TÉCNICA](manual-aplicacion/DOCUMENTACION_TECNICA.md)** → Arquitectura completa y setup
- **[🛠️ GUÍA DE EXTENSIONES](manual-aplicacion/GUIA_EXTENSIONES_VSCODE.md)** → VS Code + GitHub Copilot

### 🆘 **RESOLVER PROBLEMAS**

- **[🔧 GUÍA DE RESOLUCIÓN](manual-aplicacion/GUIA_RESOLUCION_PROBLEMAS.md)** → Debugging paso a paso
- **[🗂️ MAPEO DE FUNCIONES](manual-aplicacion/MAPEO_FUNCIONES.md)** → Encontrar cualquier función

### 🤖 **DESARROLLO CON IA**

- **[🎓 TUTORIAL RECREAR CON IA](manual-aplicacion/TUTORIAL_RECREAR_CON_IA.md)** → Paso a paso completo
- **[⚡ SNIPPETS PERSONALIZADOS](manual-aplicacion/SNIPPETS_PERSONALIZADOS.md)** → Desarrollo rápido

---

## Resumen de Funcionalidades

- Gestión de presupuestos con numeración automática anual (`YYYY-XXX`).
- Clientes integrados (nombre, teléfono, NIF) autogenerados / reutilizados.
- Grupos con neumáticos (medida, marca, costes, IVA, ecotasa, ganancia) y trabajos manuales.
- Cálculo total automático y vista interna con borrador (draft) y metadatos.
- Almacenamiento estructurado en JSONB (PostgreSQL) para flexibilidad de grupos.
- Búsqueda en historial por: nombre, teléfono, número y medida (nueva).
- Sugerencias dinámicas de medidas / marcas a partir del histórico (`/sugerencias`).
- Catálogo de precios por medida y marca con upsert rápido (`/precios`).
- Exportación de presupuesto a PDF (`/presupuestos/<id>/pdf`).
- Endpoint de métricas simples `/stats`.
- Rate limiting con Redis (Flask-Limiter) + Gunicorn en producción.
- Scripts de creación y restauración de puntos estables (tags + ramas) + alias en español.
- Health check `/health` y healthcheck Docker.
- Generación de PDFs usando reportlab (opcional; controlado por dependencia instalada).

Este documento describe instalación y operación; `INSTRUCCIONES_APLICACION.md` profundiza en arquitectura y flujos; `RESTORE_POINTS.md` detalla copias.

## Requisitos

- Python 3.11+ (parece que usas 3.13)
- PostgreSQL (puedes usar Docker)

## Variables de entorno (.env)

Ejemplo rápido: copia `.env.example` a `.env` y ajusta valores.

```
POSTGRES_USER=admin
POSTGRES_PASSWORD=password123
POSTGRES_DB=taller_app
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

## Preparación del entorno

1. Crear entorno e instalar dependencias:

```
pip install -r requirements.txt
```

2. Inicializar base de datos (si usas alembic/migrate):

```
flask db upgrade
```

3. Ejecutar backend:

```
python app.py
```

4. Abrir `index.html` en el navegador o servirlo desde Flask (ruta `/`).

### Nota sobre el driver PostgreSQL (psycopg v3)

La aplicación usa `psycopg` (v3) con la URL `postgresql+psycopg://`. Se ha fijado la versión en `requirements.txt`:

```
psycopg[binary]==3.2.10
```

Si ves un error `ModuleNotFoundError: No module named 'psycopg'`:

1. Asegúrate de haber activado el entorno virtual correcto.
2. Reinstala dependencias:
   ```
   pip install -r requirements.txt --upgrade
   ```
3. Prueba la importación:
   ```
   python -c "import psycopg; print(psycopg.__version__)"
   ```
4. En Docker, reconstruye la imagen si cambiaste `requirements.txt`:
   ```
   docker compose build --no-cache web
   docker compose up -d
   ```

Para cambiar de versión, edita la línea en `requirements.txt` y vuelve a instalar.

## Docker (PostgreSQL)

```
docker compose up -d
```

## Modo Producción (Gunicorn + Redis para rate limiting)

El `docker-compose.yml` incluye ahora:

- `web` ejecutando: `gunicorn -w 4 -k gthread -b 0.0.0.0:5000 app:app`
- `redis` como backend para Flask-Limiter (`REDIS_URL=redis://redis:6379/0`)

Si cambias dependencias o el comando:

```
docker compose build --no-cache web
docker compose up -d
```

Verificar que no aparece el warning de almacenamiento in-memory:

```
docker logs taller_web | findstr /I limiter
```

Escalar workers (ejemplo 2 procesos \* 2 hilos):

```
gunicorn -w 2 -k gthread --threads 2 -b 0.0.0.0:5000 app:app
```

Variables útiles adicionales (añadir a `.env` si procede):

```
FLASK_DEBUG=0
SECRET_KEY=cambia-esta-clave
DATABASE_URL=postgresql://admin:password123@db:5432/taller_app
REDIS_URL=redis://redis:6379/0
```

Migraciones dentro del contenedor (tras levantar):

```
docker exec -it taller_web flask db upgrade
```

Regenerar una migración:

```
docker exec -it taller_web flask db migrate -m "descripcion"
docker exec -it taller_web flask db upgrade
```

Health check manual:

```
curl http://localhost:5000/health
```

El servicio `web` ahora tiene un `healthcheck` en `docker-compose.yml` que consulta `/health` cada 15s. Si falla varias veces Docker marcará el contenedor como unhealthy.

Si no defines `SECRET_KEY` en `.env`, la aplicación genera una temporal (solo para desarrollo) y lanza un aviso.

## Endpoints

Listado principal (prefijo base `/`):

| Método | Ruta                   | Descripción                    | Notas                                                                                                                |
| ------ | ---------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| GET    | /presupuestos          | Lista paginada de presupuestos | Parámetros: `page`, `per_page`, filtros `nombre`, `telefono`, `numero`, `medida` (búsqueda parcial dentro de grupos) |
| POST   | /presupuestos          | Crea un presupuesto            | Requiere JSON con `cliente`, `fecha`, `vista_cliente`, `vista_interna`                                               |
| GET    | /presupuestos/<id>     | Obtiene un presupuesto         | Devuelve estructura completa con vistas                                                                              |
| PUT    | /presupuestos/<id>     | Actualiza un presupuesto       | Mantiene número; modifica vistas / fecha / cliente                                                                   |
| DELETE | /presupuestos/<id>     | Elimina un presupuesto         | 204 No Content                                                                                                       |
| GET    | /presupuestos/<id>/pdf | PDF del presupuesto            | Requiere `reportlab`; genera totales simplificados                                                                   |
| GET    | /sugerencias           | Sugerencias de medidas/marcas  | Parámetro opcional `limit` (máx. 1000)                                                                               |
| GET    | /precios?medida=XXX    | Precios por medida             | `medida` necesaria; devuelve coincidencias por base (normaliza variantes)                                            |
| POST   | /precios               | Crear/actualizar precio        | JSON `{medida, marca, neto}` upsert por (medida, marca)                                                              |
| GET    | /stats                 | Métricas de conteo             | Clientes, presupuestos, último                                                                                       |
| GET    | /health                | Health básico                  | Devuelve `{status: "ok"}`                                                                                            |

### Pedidos (Nuevo módulo)

Gestión independiente de líneas de pedido (neumáticos u otros) derivadas o no de un presupuesto.

| Método | Ruta                            | Descripción                                      | Notas                                                                                                |
| ------ | ------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| POST   | /pedidos                        | Crea un pedido                                   | Campos mínimos: `medida` y (`marca` o `descripcion`)                                                 |
| GET    | /pedidos                        | Lista paginada de pedidos                        | Filtros: `q`, `proveedor`, `estado` (pending/ordered/received), `desde`, `hasta`, `page`, `per_page` |
| GET    | /pedidos/<id>                   | Obtiene un pedido                                | Devuelve flags `is_confirmed`, `is_received`, `status`                                               |
| PATCH  | /pedidos/<id>                   | Edita pedido                                     | Si `received_at` no nulo solo permite `notas`                                                        |
| POST   | /pedidos/<id>/toggle_confirmado | Alterna confirmado (pone / quita `confirmed_at`) | No permite desconfirmar si está recibido                                                             |
| POST   | /pedidos/<id>/toggle_recibido   | Alterna recibido (pone / quita `received_at`)    | Requiere estar confirmado para marcar recibido                                                       |
| DELETE | /pedidos/<id>                   | Elimina un pedido                                | Prohibido si está recibido                                                                           |

Estados derivados:

- `pending`: sin `confirmed_at`.
- `ordered`: con `confirmed_at` pero sin `received_at`.
- `received`: con `received_at`.

Reglas de negocio clave:

- Confirmar y recibir son toggles reversibles (soft-state) salvo protección: no se puede borrar si recibido.
- Para marcar recibido antes debe estar confirmado (consistencia de flujo).
- Se puede desmarcar recibido y luego desconfirmar si es necesario (reversibilidad completa).
- Edición restringida tras recepción (solo notas) para preservar histórico.

Frontend: botón “Pedidos” en la barra superior abre vista con filtros y acciones rápidas (confirmar, recibir, editar, borrar) y creación manual.

### Filtro por Medida (Historial)

En `/presupuestos` el parámetro `medida` hace una búsqueda parcial (case-insensitive) dentro del JSON de grupos (`vista_cliente` y `vista_interna`). Ejemplos:

```
/presupuestos?medida=205/55
/presupuestos?medida=215/60R17&page=2
```

En el frontend existe ahora un campo “Medida” en el Historial. La coincidencia se realiza por substring; escribir una parte suficiente de la medida funciona (ej: `205/55`).

### Sugerencias y Precios

El endpoint `/sugerencias` analiza los últimos N (por defecto 200) presupuestos y extrae:

- `medidas`: medidas más frecuentes
- `marcas`: marcas más frecuentes
- `combos`: mapping `medida -> [marcas frecuentes]`

El endpoint `/precios?medida=` devuelve precios registrados (cacheados por tu uso) para apoyar la creación rápida; el frontend muestra chips clicables y filtros de código (carga, índice de velocidad, etc.).

### Exportación PDF

`GET /presupuestos/<id>/pdf` genera un documento simple con líneas (primera marca por grupo) y totales. Si `reportlab` no está instalado devuelve 501.

## Notas

- El número de presupuesto lo genera el backend automáticamente por año.
- Se ha eliminado la conversión a pedido e inventario (no implementados en backend).

## Sincronización con GitHub (2 PCs)

Host (PC principal):

1. Instala Git si no lo tienes: https://git-scm.com/download/win
2. En la carpeta del proyecto, inicializa y sube a GitHub:

```
git init
git add .
git commit -m "Inicial"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

PC2:

1. Clona el repo en una carpeta nueva:

```
git clone https://github.com/<tu-usuario>/<tu-repo>.git
```

2. Crea `.env` apuntando al host:

```
POSTGRES_USER=admin
POSTGRES_PASSWORD=password123
POSTGRES_DB=taller_app
POSTGRES_HOST=192.168.18.12
POSTGRES_PORT=5432
```

3. Instala dependencias y ejecuta:

```
pip install -r requirements.txt
python app.py
```

## Scripts Alias (Operaciones Rápidas)

| Acción                     | Script alias                | Script real                     | Descripción                                                                                                                            |
| -------------------------- | --------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Abrir aplicación local     | `abrir_aplicacion.bat`      | `run_app.bat`                   | Lanza la app en modo desarrollo.                                                                                                       |
| Crear punto estable seguro | `crear_copia_completa.bat`  | `create_restore_point_plus.bat` | Crea tag y rama (verifica que no haya cambios sin commit). Uso: `crear_copia_completa.bat` o con push `crear_copia_completa.bat push`. |
| Gestor copias (menú)       | `gestor_copias.bat`         | `gestor_restore.bat`            | Menú interactivo: crear, listar, restaurar, push.                                                                                      |
| Restaurar desde copia      | `restaurar_desde_copia.bat` | `restore_from_point.bat`        | Crea rama desde tag: `restaurar_desde_copia.bat ok-YYYYMMDD-HHMMSS [nueva-rama]`.                                                      |

Listar últimos puntos:

```
git tag --list "ok-*" --sort=-creatordate | head -n 10
```

Más detalles en `RESTORE_POINTS.md`.

## Resumen Actual de Scripts y Alias

| Script                        | Alias Español             | Propósito Breve                                |
| ----------------------------- | ------------------------- | ---------------------------------------------- |
| run_app.bat                   | abrir_aplicacion.bat      | Ejecutar app modo desarrollo                   |
| create_restore_point_plus.bat | crear_copia_completa.bat  | Crear tag + rama verificada (opcional push)    |
| restore_from_point.bat        | restaurar_desde_copia.bat | Restaurar desde tag a nueva rama               |
| gestor_restore.bat            | gestor_copias.bat         | Menú interactivo (crear/listar/restaurar/push) |

Para ver ejemplos detallados revisar `RESTORE_POINTS.md`.
