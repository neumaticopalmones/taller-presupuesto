# Aplicación Presupuestos Neumáticos

## Requisitos
- Python 3.11+ (parece que usas 3.13)
- PostgreSQL (puedes usar Docker)

## Variables de entorno (.env)

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

## Docker (PostgreSQL)

```
docker compose up -d
```

## Endpoints
- GET /presupuestos?page=1
- POST /presupuestos
- GET /presupuestos/<id>
- PUT /presupuestos/<id>
- DELETE /presupuestos/<id>
- GET /health

## Notas
- El número de presupuesto lo genera el backend automáticamente por año.
- Se ha eliminado la conversión a pedido e inventario (no implementados en backend).
