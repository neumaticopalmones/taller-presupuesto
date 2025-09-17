#!/usr/bin/env python3
"""
Script para manejar migraciones de base de datos de manera inteligente.
Detecta si las tablas ya existen y marca las migraciones como aplicadas.
"""

import os
import sys

from sqlalchemy import create_engine, inspect, text


def check_database_state():
    """Verificar el estado actual de la base de datos."""
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("❌ ERROR: DATABASE_URL no está definida")
        sys.exit(1)

    try:
        engine = create_engine(database_url)
        inspector = inspect(engine)

        # Verificar si existen las tablas principales
        tables = inspector.get_table_names()

        has_alembic_version = "alembic_version" in tables
        has_presupuesto = "presupuesto" in tables
        has_cliente = "cliente" in tables
        has_pedido = "pedido" in tables

        print("📊 Estado de la base de datos:")
        print(f"   - alembic_version: {'✅' if has_alembic_version else '❌'}")
        print(f"   - presupuesto: {'✅' if has_presupuesto else '❌'}")
        print(f"   - cliente: {'✅' if has_cliente else '❌'}")
        print(f"   - pedido: {'✅' if has_pedido else '❌'}")

        if has_alembic_version:
            # Obtener versión actual
            with engine.connect() as conn:
                try:
                    result = conn.execute(text("SELECT version_num FROM alembic_version"))
                    current_version = result.scalar()
                    print(f"📋 Versión actual de migración: {current_version}")
                    return "has_migrations", current_version
                except Exception:
                    print("⚠️ Tabla alembic_version existe pero está vacía")
                    return "empty_migrations", None

        elif has_presupuesto and has_cliente:
            print("🔄 Base de datos con tablas existentes pero sin control de migraciones")
            return "existing_tables_no_migrations", None

        else:
            print("🆕 Base de datos nueva - requiere migraciones completas")
            return "new_database", None

    except Exception as e:
        print(f"❌ Error conectando a la base de datos: {e}")
        sys.exit(1)


def main():
    """Función principal para manejar las migraciones."""
    state, current_version = check_database_state()

    if state == "new_database":
        print("📊 Ejecutando migraciones completas...")
        os.system("python -m flask db upgrade")

    elif state == "existing_tables_no_migrations":
        print("🏷️ Marcando migraciones existentes como aplicadas...")
        # Marcar como aplicada la última migración
        os.system("python -m flask db stamp head")

    elif state == "empty_migrations":
        print("🏷️ Marcando migraciones como aplicadas...")
        os.system("python -m flask db stamp head")

    elif state == "has_migrations":
        print("⬆️ Aplicando migraciones pendientes...")
        os.system("python -m flask db upgrade")

    print("✅ Migraciones completadas correctamente")


if __name__ == "__main__":
    main()
