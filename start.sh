#!/bin/bash
set -e

echo "🚀 Iniciando aplicación en Render..."

# Verificar variables de entorno críticas
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está definida"
    exit 1
fi

echo "✅ Variables de entorno verificadas"

# Ejecutar migraciones de base de datos
echo "📊 Ejecutando migraciones de base de datos..."
python -m flask db upgrade

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló la migración de base de datos"
    exit 1
fi

echo "✅ Migraciones completadas"

# Configurar número de workers para Gunicorn
WORKERS=${WEB_CONCURRENCY:-4}
echo "👥 Iniciando Gunicorn con $WORKERS workers"

echo "🌟 Iniciando servidor con gunicorn..."
exec gunicorn \
    --bind 0.0.0.0:$PORT \
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
