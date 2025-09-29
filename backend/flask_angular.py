#!/usr/bin/env python3
"""
Aplicación Flask simplificada que usa SOLO SQLite para Angular
"""
import os
import sys
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear aplicación Flask
app = Flask(__name__)

# Configurar CORS para Angular
CORS(app, origins=["http://localhost:4200"])

# FORZAR SQLite - No variables de entorno
db_path = os.path.join(os.path.dirname(__file__), 'taller_angular.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'dev-key-for-angular-testing'

print(f"🔗 Usando base de datos SQLite: {db_path}")

# Inicializar SQLAlchemy
db = SQLAlchemy(app)

# Modelos simplificados
class Cliente(db.Model):
    __tablename__ = 'cliente'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    telefono = db.Column(db.String(20))
    nif = db.Column(db.String(20))

class Presupuesto(db.Model):
    __tablename__ = 'presupuesto'
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'))
    numero_presupuesto = db.Column(db.String(50), unique=True, nullable=False)
    fecha = db.Column(db.Date)
    estado = db.Column(db.String(20), default='pendiente')
    total = db.Column(db.Numeric(10,2), default=0.00)
    observaciones = db.Column(db.Text)

class Pedido(db.Model):
    __tablename__ = 'pedido'
    id = db.Column(db.Integer, primary_key=True)
    presupuesto_id = db.Column(db.Integer, db.ForeignKey('presupuesto.id'))
    fecha_pedido = db.Column(db.Date)
    estado = db.Column(db.String(20), default='pendiente')
    total = db.Column(db.Numeric(10,2), default=0.00)

class Precio(db.Model):
    __tablename__ = 'precio'
    id = db.Column(db.Integer, primary_key=True)
    concepto = db.Column(db.String(200), nullable=False)
    precio_unitario = db.Column(db.Numeric(10,2), nullable=False)
    categoria = db.Column(db.String(50))
    activo = db.Column(db.Boolean, default=True)

# Rutas de la API
@app.route('/health', methods=['GET'])
def health():
    """Endpoint de salud"""
    return jsonify({"status": "ok"})

@app.route('/stats', methods=['GET'])
def get_stats():
    """Obtener estadísticas del taller"""
    try:
        total_clientes = db.session.query(Cliente).count()
        total_presupuestos = db.session.query(Presupuesto).count()
        total_pedidos = db.session.query(Pedido).count()

        # Calcular total de ventas
        total_ventas = db.session.query(db.func.sum(Pedido.total)).scalar() or 0

        stats = {
            "clientes": total_clientes,
            "presupuestos": total_presupuestos,
            "pedidos": total_pedidos,
            "total_ventas": float(total_ventas)
        }

        logger.info(f"Stats generadas: {stats}")
        return jsonify(stats)

    except Exception as e:
        logger.error(f"Error generando stats: {e}")
        return jsonify({"error": str(e), "ok": False}), 500

@app.route('/presupuestos', methods=['GET'])
def get_presupuestos():
    """Obtener lista de presupuestos"""
    try:
        presupuestos = db.session.query(Presupuesto, Cliente.nombre).join(Cliente).all()

        result = []
        for presupuesto, cliente_nombre in presupuestos:
            result.append({
                "id": presupuesto.id,
                "cliente": cliente_nombre,
                "numero": presupuesto.numero_presupuesto,
                "fecha": presupuesto.fecha.isoformat() if presupuesto.fecha else None,
                "estado": presupuesto.estado,
                "total": float(presupuesto.total) if presupuesto.total else 0.0,
                "observaciones": presupuesto.observaciones
            })

        logger.info(f"Presupuestos encontrados: {len(result)}")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error obteniendo presupuestos: {e}")
        return jsonify({"error": str(e), "ok": False}), 500

@app.route('/test-create', methods=['POST'])
def create_test_data():
    """Crear datos de prueba"""
    try:
        # Crear cliente de prueba
        cliente = Cliente(
            nombre="Cliente Prueba Angular",
            telefono="999888777",
            nif="99999999Z"
        )
        db.session.add(cliente)
        db.session.flush()  # Para obtener el ID

        # Crear presupuesto de prueba
        presupuesto = Presupuesto(
            cliente_id=cliente.id,
            numero_presupuesto=f"PRES-ANG-{cliente.id}",
            estado="pendiente",
            total=123.45,
            observaciones="Presupuesto creado desde Angular"
        )
        db.session.add(presupuesto)
        db.session.commit()

        return jsonify({
            "mensaje": "Datos de prueba creados exitosamente",
            "cliente_id": cliente.id,
            "presupuesto_id": presupuesto.id
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creando datos de prueba: {e}")
        return jsonify({"error": str(e), "ok": False}), 500

if __name__ == '__main__':
    print("🚀 Iniciando Flask simplificado para Angular...")
    print(f"📍 Base de datos: {db_path}")
    app.run(debug=True, host='0.0.0.0', port=5001)
