#!/usr/bin/env python3
"""
Script para crear todas las tablas de la base de datos sin migraciones.
"""
import os
import sys

# Agregar el directorio backend al path
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_dir)

# Configurar la base de datos
os.environ['DATABASE_URL'] = 'sqlite:///taller.db'

try:
    from app import app, db

    print("🔄 Creando todas las tablas de la base de datos...")

    with app.app_context():
        # Eliminar todas las tablas existentes y recrearlas
        db.drop_all()
        db.create_all()

        print("✅ Tablas creadas exitosamente:")

        # Verificar qué tablas se crearon
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()

        for table in tables:
            print(f"   - {table}")

        print("\n🚀 Base de datos lista para usar!")

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
