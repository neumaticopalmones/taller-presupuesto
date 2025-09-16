#!/bin/bash
set -e

echo "🚀 Iniciando aplicación en Railway..."

# Ejecutar migraciones automáticamente
echo "📊 Ejecutando migraciones de base de datos..."
python -m flask db upgrade

echo "🌟 Iniciando servidor con gunicorn..."
exec gunicorn --bind 0.0.0.0:$PORT app:app
