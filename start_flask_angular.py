#!/usr/bin/env python3
"""
Script para iniciar Flask con la nueva base de datos Angular
"""
import os
import sys

# Obtener directorio raíz y backend
root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, 'backend')

# Configurar la ruta absoluta de la base de datos
db_path = os.path.abspath(os.path.join(backend_dir, 'taller_angular.db'))
os.environ['DATABASE_URL'] = f'sqlite:///{db_path}'

print(f"🔗 Configurando Flask para usar: {db_path}")
print(f"📍 Directorio backend: {backend_dir}")
print(f"🔌 DATABASE_URL: {os.environ['DATABASE_URL']}")

# Cambiar al directorio backend para que app.py funcione correctamente
os.chdir(backend_dir)

# Importar y ejecutar la aplicación
sys.path.insert(0, backend_dir)
from app import app

if __name__ == '__main__':
    print("🚀 Iniciando Flask con la nueva base de datos...")
    app.run(debug=True, host='0.0.0.0', port=5000)
