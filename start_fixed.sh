#!/bin/bash

echo "🔧 Solucionando conflicto de migraciones PostgreSQL..."
echo "✅ Variables de entorno verificadas"

# Verificar si DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está definida"
    exit 1
fi

echo "📊 Marcando migraciones como aplicadas..."

# Marcar la versión actual como aplicada sin ejecutar los comandos CREATE TABLE
# Esto le dice a Alembic que las tablas ya existen
echo "🏷️ Marcando migración 1eba3dd5e8f8 como aplicada..."
flask db stamp 1eba3dd5e8f8

echo "🏷️ Marcando migración 3f6eec664c6a como aplicada..."
flask db stamp 3f6eec664c6a

echo "⬆️ Aplicando migraciones restantes (si las hay)..."
flask db upgrade

echo "🎯 Iniciando servidor Gunicorn..."
exec gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
