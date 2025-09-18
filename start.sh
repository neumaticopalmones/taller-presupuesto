#!/bin/bash
set -e

echo "🚀 Iniciando aplicación en Render..."

# Verificar variables de entorno críticas - más flexible
if [ -z "$DATABASE_URL" ] && [ -z "$POSTGRES_HOST" ]; then
    echo "❌ ERROR: Ni DATABASE_URL ni POSTGRES_HOST están definidas"
    echo "💡 Se requiere DATABASE_URL o las variables individuales (POSTGRES_HOST, POSTGRES_USER, etc.)"
    exit 1
fi

if [ -n "$DATABASE_URL" ]; then
    echo "✅ Usando DATABASE_URL para conexión a la base de datos"
else
    echo "✅ Usando variables individuales para conexión a la base de datos"
    echo "   POSTGRES_HOST: ${POSTGRES_HOST}"
    echo "   POSTGRES_DB: ${POSTGRES_DB}"
    echo "   POSTGRES_USER: ${POSTGRES_USER}"
fi

# Usar nuestro script inteligente para manejar migraciones
echo "🔧 Ejecutando script inteligente de migraciones..."
python fix_migrations.py

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Falló el manejo de migraciones"
    exit 1
fi

echo "✅ Migraciones manejadas correctamente"

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
