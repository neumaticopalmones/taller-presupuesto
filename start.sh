#!/bin/bash
set -e

echo "🚀 Iniciando aplicación..."

# Asegurar carpeta para SQLite relativa (si se usa fallback)
mkdir -p tmp || true

# Construir DATABASE_URL desde variables individuales si no está definida
if [ -z "$DATABASE_URL" ] && [ -n "$POSTGRES_HOST" ] && [ -n "$POSTGRES_USER" ] && [ -n "$POSTGRES_PASSWORD" ] && [ -n "$POSTGRES_DB" ]; then
    POSTGRES_PORT_USE=${POSTGRES_PORT:-5432}
    export DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT_USE/$POSTGRES_DB"
    echo "� Construida DATABASE_URL desde variables POSTGRES_*"
fi

# Si aún no hay DATABASE_URL ni variables de Postgres suficientes, activar fallback SQLite
if [ -z "$DATABASE_URL" ] && [ -z "$POSTGRES_HOST" ]; then
    echo "⚠️ No hay configuración de Postgres. Usando SQLite de respaldo en tmp/fallback.db"
    export DATABASE_URL="sqlite:///tmp/fallback.db"
fi

if [ -n "$DATABASE_URL" ]; then
    echo "✅ Usando DATABASE_URL: ${DATABASE_URL%%:*}://..."
else
    echo "ℹ️ Sin DATABASE_URL; el backend decidirá la conexión"
fi

# Preparar entorno Flask para comandos CLI de migraciones
export FLASK_APP=app:app
export PYTHONPATH="/app/backend:${PYTHONPATH}"

# Ejecutar migraciones de forma condicional
echo "🔧 Ejecutando migraciones (si aplica)..."
pushd backend >/dev/null
if [[ "$DATABASE_URL" == sqlite:* ]]; then
    # En SQLite las migraciones son opcionales; no bloquear el arranque si fallan
    python -m flask db upgrade || echo "⚠️ Migraciones SQLite fallaron (no bloqueante)"
else
    # Corregir ruta del script (está en la raíz del proyecto)
    python ../fix_migrations.py
fi
popd >/dev/null

echo "✅ Paso de migraciones finalizado"

# Configurar número de workers para Gunicorn
WORKERS=${WEB_CONCURRENCY:-4}
echo "👥 Iniciando Gunicorn con $WORKERS workers"

echo "🌟 Iniciando servidor con gunicorn..."
cd backend
exec gunicorn \
    --bind 0.0.0.0:${PORT:-5000} \
    --workers $WORKERS \
    --timeout 120 \
    --keep-alive 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --preload \
    --log-level info \
    --access-logfile - \
    --error-logfile - \
    app:app
