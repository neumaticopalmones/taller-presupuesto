import json
import os
import uuid
from datetime import date, datetime

from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory, abort, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.exc import IntegrityError

# --- Utilidad para limpiar la vista antes de guardar ---
def _clean_vista_for_db(vista_data):
    if not vista_data or not isinstance(vista_data, dict) or 'grupos' not in vista_data:
        return vista_data

    vista_copy = vista_data.copy()
    for grupo in vista_copy.get('grupos', []):
        cleaned_neumaticos = []
        for neumatico in grupo.get('neumaticos', []):
            # Ya no hay inventario, solo dejar el ítem tal cual
            cleaned_neumaticos.append(neumatico)
        grupo['neumaticos'] = cleaned_neumaticos
    return vista_copy

# Cargar variables de entorno desde el archivo .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Habilita CORS para toda la aplicación

DB_USER = os.environ.get('POSTGRES_USER')
DB_PASSWORD = os.environ.get('POSTGRES_PASSWORD')
DB_HOST = os.environ.get('POSTGRES_HOST')
DB_PORT = os.environ.get('POSTGRES_PORT')
DB_NAME = os.environ.get('POSTGRES_DB')

# Configuración de SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# --- Modelos ---
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    telefono = db.Column(db.String(20), nullable=True)
    nif = db.Column(db.String(20), nullable=True)
    presupuestos = db.relationship('Presupuesto', backref='cliente', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'telefono': self.telefono,
            'nif': self.nif
        }

class Presupuesto(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    numero = db.Column(db.String(50), unique=True, nullable=False)
    fecha = db.Column(db.Date, nullable=False, default=date.today)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    vista_cliente = db.Column(JSONB)
    vista_interna = db.Column(JSONB)

    def to_dict(self):
        return {
            'id': self.id,
            'numero': self.numero,
            'fecha': self.fecha.isoformat(),
            'cliente': self.cliente.to_dict() if self.cliente else None,
            'vista_cliente': self.vista_cliente,
            'vista_interna': self.vista_interna
        }

# --- Presupuesto Routes ---
@app.route('/presupuestos', methods=['GET'])
def get_presupuestos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    nombre = request.args.get('nombre', type=str)
    telefono = request.args.get('telefono', type=str)
    numero = request.args.get('numero', type=str)

    q = Presupuesto.query.join(Cliente)
    if numero:
        like_num = f"%{numero}%"
        q = q.filter(Presupuesto.numero.ilike(like_num))
    if nombre:
        like_nom = f"%{nombre}%"
        q = q.filter(Cliente.nombre.ilike(like_nom))
    if telefono:
        like_tel = f"%{telefono}%"
        q = q.filter(Cliente.telefono.ilike(like_tel))

    q = q.order_by(Presupuesto.numero.desc())
    presupuestos_page = q.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'presupuestos': [p.to_dict() for p in presupuestos_page.items],
        'total': presupuestos_page.total,
        'pages': presupuestos_page.pages,
        'current_page': presupuestos_page.page,
        'has_next': presupuestos_page.has_next,
        'has_prev': presupuestos_page.has_prev
    })

def generar_siguiente_numero_presupuesto():
    today = date.today()
    current_year = today.year
    
    # Busca el último número de presupuesto para el año actual que sigue el formato YYYY-NNN
    ultimo_numero_str = db.session.query(db.func.max(Presupuesto.numero)).filter(
        Presupuesto.numero.like(f'{current_year}-%')
    ).scalar()

    nuevo_numero_secuencial = 1
    if ultimo_numero_str:
        try:
            ultimo_numero_secuencial = int(ultimo_numero_str.split('-')[-1])
            nuevo_numero_secuencial = ultimo_numero_secuencial + 1
        except (ValueError, IndexError):
            pass

    return f"{current_year}-{str(nuevo_numero_secuencial).zfill(3)}"

@app.route('/presupuestos', methods=['POST'])
def create_presupuesto():
    data = request.json
    if not data:
        abort(400, description="Invalid JSON")

    cliente_data = data.get('cliente', {})
    
    # Find or create client
    cliente = None
    if cliente_data.get('nif') and cliente_data['nif'].strip():
        cliente = Cliente.query.filter_by(nif=cliente_data['nif']).first()
    
    if not cliente and cliente_data.get('nombre'):
         cliente = Cliente.query.filter_by(nombre=cliente_data['nombre']).first()

    if not cliente:
        cliente = Cliente(
            nombre=cliente_data.get('nombre', 'Sin Nombre'),
            telefono=cliente_data.get('telefono'),
            nif=cliente_data.get('nif')
        )
        db.session.add(cliente)
        db.session.flush()

    # Clean and normalize the vista data before saving
    vista_cliente_data = _clean_vista_for_db(data.get('vista_cliente', {}))
    vista_interna_data = _clean_vista_for_db(data.get('vista_interna', {}))

    try:
        fecha_str = data.get('fecha')
        if not fecha_str:
            abort(400, description="Fecha del presupuesto es requerida.")
        fecha_obj = datetime.strptime(fecha_str, '%Y-%m-%d').date()

        # Intentar varias veces por si hay colisión de número (uso simultáneo)
        intentos = 5
        for _ in range(intentos):
            try:
                new_presupuesto = Presupuesto(
                    id=str(uuid.uuid4()),
                    numero=generar_siguiente_numero_presupuesto(),
                    fecha=fecha_obj,
                    cliente_id=cliente.id,
                    vista_cliente=vista_cliente_data,
                    vista_interna=vista_interna_data
                )
                db.session.add(new_presupuesto)
                db.session.commit()
                return jsonify(new_presupuesto.to_dict()), 201
            except IntegrityError:
                db.session.rollback()
                # Reintentar generando otro número
                continue
        abort(409, description="No se pudo generar un número de presupuesto único tras varios intentos. Intenta de nuevo.")

    except ValueError as e:
        db.session.rollback()
        abort(400, description=f"Error en el formato de la fecha: {e}. Asegúrate de que sea YYYY-MM-DD.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.session.rollback()
        abort(500, description=f"Error interno al crear el presupuesto: {e}")

@app.route('/presupuestos/<string:presupuesto_id>', methods=['GET'])
def get_presupuesto(presupuesto_id):
    presupuesto = Presupuesto.query.get_or_404(presupuesto_id)
    return jsonify(presupuesto.to_dict())

@app.route('/presupuestos/<string:presupuesto_id>', methods=['PUT'])
def update_presupuesto(presupuesto_id):
    presupuesto = Presupuesto.query.get_or_404(presupuesto_id)
    data = request.json
    if not data:
        abort(400, description="Invalid JSON")

    # Clean and normalize the vista data before saving
    presupuesto.vista_cliente = _clean_vista_for_db(data.get('vista_cliente', presupuesto.vista_cliente))
    presupuesto.vista_interna = _clean_vista_for_db(data.get('vista_interna', presupuesto.vista_interna))

    # Update other fields
    presupuesto.fecha = datetime.strptime(data.get('fecha'), '%Y-%m-%d').date() if data.get('fecha') else presupuesto.fecha
    
    cliente_data = data.get('cliente')
    if cliente_data and presupuesto.cliente:
        presupuesto.cliente.nombre = cliente_data.get('nombre', presupuesto.cliente.nombre)
        presupuesto.cliente.telefono = cliente_data.get('telefono', presupuesto.cliente.telefono)
        presupuesto.cliente.nif = cliente_data.get('nif', presupuesto.cliente.nif)

    db.session.commit()
    return jsonify(presupuesto.to_dict())

@app.route('/presupuestos/<string:presupuesto_id>', methods=['DELETE'])
def delete_presupuesto(presupuesto_id):
    presupuesto = Presupuesto.query.get_or_404(presupuesto_id)
    db.session.delete(presupuesto)
    db.session.commit()
    return '', 204  # No Content



# Serve static files (like index.html, CSS, JS)
@app.route('/')
def serve_index():
    return send_file('index.html')
@app.route('/<path:path>')
def serve_static(path):
    # Prevent directory traversal
    if ".." in path or path.startswith('/'):
        abort(404)
    return send_from_directory('.', path)


# Manejador global de errores 500 para devolver JSON
@app.errorhandler(500)
def handle_internal_error(error):
    description = getattr(error, 'description', str(error))
    response = jsonify({
        'description': f'Error interno del servidor: {description}'
    })
    response.status_code = 500
    return response

@app.errorhandler(404)
def handle_not_found(error):
    response = jsonify({
        'description': 'Recurso no encontrado'
    })
    response.status_code = 404
    return response

@app.errorhandler(400)
def handle_bad_request(error):
    description = getattr(error, 'description', str(error))
    response = jsonify({
        'description': f'Solicitud incorrecta: {description}'
    })
    response.status_code = 400
    return response

@app.get('/health')
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')