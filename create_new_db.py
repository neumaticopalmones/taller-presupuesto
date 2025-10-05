#!/usr/bin/env python3
"""
Script para crear una nueva base de datos SQLite compatible con Angular
"""
import os
import sys
import sqlite3
from datetime import datetime

# Agregar el directorio actual al path para importar módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_fresh_database():
    """Crear una base de datos SQLite completamente nueva"""
    db_path = os.path.join(os.path.dirname(__file__), 'taller_angular.db')

    # Eliminar base de datos existente si existe
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"🗑️  Base de datos anterior eliminada: {db_path}")

    # Crear nueva conexión SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"📋 Creando nueva base de datos: {db_path}")

    # Crear tabla cliente
    cursor.execute('''
        CREATE TABLE cliente (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(100) NOT NULL,
            telefono VARCHAR(20),
            nif VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("✅ Tabla 'cliente' creada")

    # Crear tabla presupuesto
    cursor.execute('''
        CREATE TABLE presupuesto (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER,
            numero_presupuesto VARCHAR(50) UNIQUE NOT NULL,
            fecha DATE DEFAULT CURRENT_DATE,
            estado VARCHAR(20) DEFAULT 'pendiente',
            total DECIMAL(10,2) DEFAULT 0.00,
            observaciones TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cliente_id) REFERENCES cliente (id)
        )
    ''')
    print("✅ Tabla 'presupuesto' creada")

    # Crear tabla precio
    cursor.execute('''
        CREATE TABLE precio (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            concepto VARCHAR(200) NOT NULL,
            precio_unitario DECIMAL(10,2) NOT NULL,
            categoria VARCHAR(50),
            activo BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("✅ Tabla 'precio' creada")

    # Crear tabla pedido
    cursor.execute('''
        CREATE TABLE pedido (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            presupuesto_id INTEGER,
            fecha_pedido DATE DEFAULT CURRENT_DATE,
            estado VARCHAR(20) DEFAULT 'pendiente',
            total DECIMAL(10,2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (presupuesto_id) REFERENCES presupuesto (id)
        )
    ''')
    print("✅ Tabla 'pedido' creada")

    # Insertar datos de ejemplo para pruebas
    print("\n📊 Insertando datos de ejemplo...")

    # Clientes de ejemplo
    cursor.execute('''
        INSERT INTO cliente (nombre, telefono, nif) VALUES
        ('Juan Pérez', '123456789', '12345678A'),
        ('María García', '987654321', '87654321B'),
        ('Carlos López', '555123456', '11223344C')
    ''')

    # Precios de ejemplo
    cursor.execute('''
        INSERT INTO precio (concepto, precio_unitario, categoria) VALUES
        ('Cambio de aceite', 25.50, 'Mantenimiento'),
        ('Revisión frenos', 45.00, 'Seguridad'),
        ('Alineación', 30.00, 'Neumáticos'),
        ('Cambio filtro aire', 15.75, 'Mantenimiento')
    ''')

    # Presupuestos de ejemplo
    cursor.execute('''
        INSERT INTO presupuesto (cliente_id, numero_presupuesto, estado, total, observaciones) VALUES
        (1, 'PRES-2024-001', 'pendiente', 71.25, 'Mantenimiento completo'),
        (2, 'PRES-2024-002', 'aprobado', 45.00, 'Revisión de frenos urgente'),
        (3, 'PRES-2024-003', 'pendiente', 30.00, 'Alineación después de cambio neumáticos')
    ''')

    # Pedidos de ejemplo
    cursor.execute('''
        INSERT INTO pedido (presupuesto_id, estado, total) VALUES
        (2, 'completado', 45.00),
        (1, 'en_proceso', 71.25)
    ''')

    conn.commit()

    # Verificar que las tablas se crearon correctamente
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    print(f"\n✅ Base de datos creada exitosamente con {len(tables)} tablas:")
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
        count = cursor.fetchone()[0]
        print(f"   - {table[0]}: {count} registros")

    conn.close()
    return db_path

if __name__ == "__main__":
    try:
        db_path = create_fresh_database()
        print(f"\n🎉 ¡Base de datos SQLite creada exitosamente!")
        print(f"📁 Ubicación: {db_path}")
        print(f"🔌 Para usar con Flask: DATABASE_URL=sqlite:///{os.path.basename(db_path)}")
    except Exception as e:
        print(f"❌ Error creando la base de datos: {e}")
        sys.exit(1)
