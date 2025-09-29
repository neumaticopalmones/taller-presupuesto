# Manual de Reconstrucción: Taller Angular + Flask (2025)

Este manual describe cómo recrear la aplicación desde cero, con versiones modernas y estructura robusta, manteniendo las funcionalidades existentes (clientes, presupuestos, precios, estadísticas y health check).

## 1. Stack recomendado (septiembre 2025)
- Frontend: Angular 20 LTS (CLI 20.3.x), TypeScript 5.9, RxJS 7.8, Zone.js 0.15
- Backend: Python 3.12, Flask 3.x, Flask-CORS 4.x, SQLAlchemy 2.x, python-dotenv 1.x
- Base de datos: SQLite (dev). Opcional: PostgreSQL en producción.
- Gestor de paquetes: npm 10+ y pip

## 2. Estructura propuesta
```
<raiz>
  backend/
    app.py                # entrypoint (create_app())
    requirements.txt
    .env                  # configuración
    taller.db             # sqlite dev
    config/
      settings.py
      database.py
    models/
      __init__.py         # Cliente, Presupuesto, Precio
    routes/
      __init__.py
      health.py
      stats.py
      clientes.py
      presupuestos.py
      precios.py
    utils/
      seed.py
  frontend/
    angular.json
    package.json
    proxy.conf.json
    src/
      main.ts
      index.html
      styles.css
      app/
        app.ts
        app.html
        app.css
        services/
          api.service.ts
          environment.service.ts
```

## 3. Crear proyecto desde cero

### 3.1. Frontend Angular 20
```powershell
# En la carpeta raiz del proyecto
npm i -g @angular/cli@20
ng new frontend --style=css --routing=false --skip-tests
cd frontend
npm i @angular/common@20 @angular/core@20 @angular/forms@20 @angular/router@20 rxjs@7 zone.js@0.15
# Proxy a backend (http://localhost:5000)
# crear proxy.conf.json
```
Contenido `frontend/proxy.conf.json`:
```json
{
  "/": {
    "target": "http://localhost:5000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```
Agregar en `package.json`:
```json
{
  "scripts": {
    "start": "ng serve --proxy-config proxy.conf.json"
  }
}
```

### 3.2. Backend Flask 3
```powershell
# Desde la carpeta raiz
python -m venv .venv
. .venv\Scripts\Activate.ps1
mkdir backend
cd backend
python -m pip install --upgrade pip
pip install Flask==3.* Flask-Cors==4.* SQLAlchemy==2.* python-dotenv==1.*
pip freeze > requirements.txt
```

Archivo `backend/app.py` (esqueleto):
```python
from flask import Flask
from flask_cors import CORS
from config.settings import Config
from config.database import db
from routes import register_blueprints


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config())
    CORS(app, resources={r"/*": {"origins": "*"}})

    db.init_app(app)

    with app.app_context():
        from models import *  # registra modelos
        db.create_all()

    register_blueprints(app)
    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
```

`backend/config/settings.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///taller.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```

`backend/config/database.py`:
```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
```

`backend/models/__init__.py`:
```python
from datetime import datetime
from config.database import db

class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    telefono = db.Column(db.String(50))
    nif = db.Column(db.String(50))

    def to_dict(self):
        return {"id": self.id, "nombre": self.nombre, "telefono": self.telefono, "nif": self.nif}

class Presupuesto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cliente = db.Column(db.String(120), nullable=False)
    numero = db.Column(db.String(50))
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    estado = db.Column(db.String(30), default="pendiente")
    total = db.Column(db.Float, default=0.0)
    observaciones = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id, "cliente": self.cliente, "numero": self.numero,
            "fecha": self.fecha.isoformat() if self.fecha else None,
            "estado": self.estado, "total": self.total, "observaciones": self.observaciones,
        }

class Precio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    concepto = db.Column(db.String(200), nullable=False)
    precio_unitario = db.Column(db.Float, default=0.0)
    categoria = db.Column(db.String(100))
    activo = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id, "concepto": self.concepto, "precio_unitario": self.precio_unitario,
            "categoria": self.categoria, "activo": self.activo
        }
```

`backend/routes/__init__.py`:
```python
from flask import Blueprint
from .health import bp as health_bp
from .stats import bp as stats_bp
from .clientes import bp as clientes_bp
from .presupuestos import bp as presupuestos_bp
from .precios import bp as precios_bp

def register_blueprints(app):
    app.register_blueprint(health_bp)
    app.register_blueprint(stats_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(presupuestos_bp)
    app.register_blueprint(precios_bp)
```

`backend/routes/health.py`:
```python
from flask import Blueprint, jsonify
from config.database import db

bp = Blueprint("health", __name__)

@bp.get("/health")
def health():
    try:
        db.session.execute(db.text("SELECT 1"))
        return jsonify({"status": "ok", "mensaje": "Servidor operativo", "database": "ok"})
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 500
```

`backend/routes/stats.py`:
```python
from flask import Blueprint, jsonify
from models import Cliente, Presupuesto
from config.database import db

bp = Blueprint("stats", __name__)

@bp.get("/stats")
def stats():
    return jsonify({
        "clientes": db.session.query(Cliente).count(),
        "presupuestos": db.session.query(Presupuesto).count(),
        "pedidos": 0,
        "total_ventas": db.session.query(db.func.coalesce(db.func.sum(Presupuesto.total), 0)).scalar(),
    })
```

`backend/routes/clientes.py`:
```python
from flask import Blueprint, request, jsonify
from config.database import db
from models import Cliente

bp = Blueprint("clientes", __name__)

@bp.get("/clientes")
def get_clientes():
    return jsonify([c.to_dict() for c in Cliente.query.order_by(Cliente.id.desc()).all()])

@bp.post("/clientes")
def create_cliente():
    data = request.get_json(force=True)
    if not data.get("nombre"):
        return jsonify({"error": "El nombre es obligatorio"}), 400
    c = Cliente(nombre=data["nombre"], telefono=data.get("telefono"), nif=data.get("nif"))
    db.session.add(c)
    db.session.commit()
    return jsonify(c.to_dict()), 201
```

`backend/routes/presupuestos.py`:
```python
from flask import Blueprint, request, jsonify
from config.database import db
from models import Presupuesto

bp = Blueprint("presupuestos", __name__)

@bp.get("/presupuestos")
def get_presupuestos():
    return jsonify([p.to_dict() for p in Presupuesto.query.order_by(Presupuesto.id.desc()).all()])

@bp.post("/presupuestos")
def create_presupuesto():
    data = request.get_json(force=True)
    if not data.get("cliente"):
        return jsonify({"error": "El cliente es obligatorio"}), 400
    p = Presupuesto(
        cliente=data["cliente"], estado=data.get("estado", "pendiente"),
        total=float(data.get("total", 0)), observaciones=data.get("observaciones")
    )
    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict()), 201

@bp.post("/crear-presupuesto")
def crear_presupuesto_prueba():
    p = Presupuesto(cliente="Cliente de Prueba", estado="pendiente", total=100.0, observaciones="Auto")
    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict()), 201
```

`backend/routes/precios.py`:
```python
from flask import Blueprint, jsonify

bp = Blueprint("precios", __name__)

PRECIOS = [
    {"id": 1, "concepto": "Cambio de aceite", "precio_unitario": 49.99, "categoria": "Mecánica", "activo": True},
    {"id": 2, "concepto": "Revisión general", "precio_unitario": 89.99, "categoria": "Mantenimiento", "activo": True},
]

@bp.get("/precios")
def get_precios():
    return jsonify(PRECIOS)
```

## 4. Conectar y ejecutar

### Backend
```powershell
cd backend
. ..\.venv\Scripts\Activate.ps1
python app.py
```

### Frontend
```powershell
cd frontend
npm start
```

- Frontend: http://localhost:4200
- API (proxy): http://localhost:4200/health -> a backend http://localhost:5000/health

## 5. Funcionalidades y botones (mapa)
- Estado del Sistema:
  - Botón: Verificar Conexión -> `GET /health`
- Estadísticas:
  - Botón: Cargar Estadísticas -> `GET /stats`
- Clientes:
  - Botón: Ver Clientes -> `GET /clientes`
  - Botón: Crear Cliente -> `POST /clientes` con {nombre, telefono, nif}
- Presupuestos:
  - Botón: Ver Presupuestos -> `GET /presupuestos`
  - Botón: Crear Presupuesto de Prueba -> `POST /crear-presupuesto`
  - Botón: Crear Presupuesto -> `POST /presupuestos` con {cliente, estado, total, observaciones}
- Precios:
  - Botón: Ver Precios -> `GET /precios`

## 5.1. Marcas, Pedidos e Historial (ampliación)

Para equiparar la funcionalidad que mencionas (marcas cargadas, elegir una marca y deseleccionar las otras, crear pedidos, historial), añade lo siguiente:

### Modelos nuevos
`backend/models/__init__.py` (añadir al final):
```python
class Marca(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False, unique=True)
    activa = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {"id": self.id, "nombre": self.nombre, "activa": self.activa}

class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    presupuesto_id = db.Column(db.Integer, db.ForeignKey('presupuesto.id'), nullable=False)
    marca_id = db.Column(db.Integer, db.ForeignKey('marca.id'), nullable=False)
    estado = db.Column(db.String(30), default="pendiente")
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "presupuesto_id": self.presupuesto_id,
            "marca_id": self.marca_id,
            "estado": self.estado,
            "fecha": self.fecha.isoformat() if self.fecha else None,
        }
```

### Endpoints nuevos
`backend/routes/marcas.py`:
```python
from flask import Blueprint, request, jsonify
from config.database import db
from models import Marca

bp = Blueprint("marcas", __name__)

@bp.get("/marcas")
def get_marcas():
    return jsonify([m.to_dict() for m in Marca.query.order_by(Marca.nombre).all()])

@bp.post("/marcas")
def create_marca():
    data = request.get_json(force=True)
    if not data.get("nombre"):
        return jsonify({"error": "El nombre es obligatorio"}), 400
    m = Marca(nombre=data["nombre"], activa=bool(data.get("activa", True)))
    db.session.add(m)
    db.session.commit()
    return jsonify(m.to_dict()), 201

@bp.patch("/marcas/<int:marca_id>")
def update_marca(marca_id: int):
    data = request.get_json(force=True)
    m = Marca.query.get_or_404(marca_id)
    if "nombre" in data:
        m.nombre = data["nombre"]
    if "activa" in data:
        m.activa = bool(data["activa"])
    db.session.commit()
    return jsonify(m.to_dict())
```

`backend/routes/pedidos.py`:
```python
from flask import Blueprint, request, jsonify
from config.database import db
from models import Pedido, Presupuesto, Marca

bp = Blueprint("pedidos", __name__)

@bp.get("/pedidos")
def get_pedidos():
    presupuesto_id = request.args.get("presupuesto_id", type=int)
    q = Pedido.query
    if presupuesto_id:
        q = q.filter(Pedido.presupuesto_id == presupuesto_id)
    return jsonify([p.to_dict() for p in q.order_by(Pedido.id.desc()).all()])

@bp.post("/pedidos")
def create_pedido():
    data = request.get_json(force=True)
    presupuesto_id = data.get("presupuesto_id")
    marca_id = data.get("marca_id")
    if not presupuesto_id or not marca_id:
        return jsonify({"error": "presupuesto_id y marca_id son obligatorios"}), 400
    # Validar existencia
    Presupuesto.query.get_or_404(presupuesto_id)
    Marca.query.get_or_404(marca_id)

    # Lógica de selección exclusiva de marca por presupuesto:
    # si un presupuesto ya tiene pedidos con otra marca, opcionalmente se pueden eliminar
    # Aquí, si viene `exclusivo=True`, eliminamos pedidos previos del mismo presupuesto
    exclusivo = bool(data.get("exclusivo", True))
    if exclusivo:
        Pedido.query.filter_by(presupuesto_id=presupuesto_id).delete()

    p = Pedido(presupuesto_id=presupuesto_id, marca_id=marca_id, estado=data.get("estado", "pendiente"))
    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict()), 201
```

Registrar en `backend/routes/__init__.py`:
```python
from .marcas import bp as marcas_bp
from .pedidos import bp as pedidos_bp

def register_blueprints(app):
    # ...existentes...
    app.register_blueprint(marcas_bp)
    app.register_blueprint(pedidos_bp)
```

### Historial
Para un historial simple, puedes reutilizar `GET /presupuestos` y `GET /pedidos` con ordenación por fecha descendente. Si quieres un endpoint agregado:

`backend/routes/stats.py` (añadir):
```python
@bp.get("/historial")
def historial():
    from models import Presupuesto, Pedido
    presup = [p.to_dict() for p in db.session.query(Presupuesto).order_by(Presupuesto.fecha.desc()).limit(50)]
    peds = [p.to_dict() for p in db.session.query(Pedido).order_by(Pedido.id.desc()).limit(50)]
    return jsonify({"presupuestos": presup, "pedidos": peds})
```

### UI/Flujo (Angular)
- Marcas:
  - Botón: Ver Marcas -> `GET /marcas`
  - Botón: Crear Marca -> `POST /marcas` {nombre, activa}
- Pedidos (selección exclusiva de marca):
  - En el formulario de Pedido, muestra las marcas como radio buttons (una sola selección). Al confirmar Crear Pedido, envía `POST /pedidos` con `{presupuesto_id, marca_id, exclusivo: true}` para borrar otros pedidos del mismo presupuesto.
- Historial:
  - Botón: Ver Historial -> `GET /historial` y muestra dos listas: últimos presupuestos y últimos pedidos.

Ejemplo de selección exclusiva (plantilla Angular):
```html
<div>
  <h3>Nuevo Pedido</h3>
  <label>Presupuesto</label>
  <select [(ngModel)]="pedidoForm.presupuesto_id">
    <option *ngFor="let p of presupuestos()" [value]="p.id">#{{p.id}} - {{p.cliente}}</option>
  </select>

  <div>
    <label>Marca</label>
    <label *ngFor="let m of marcas()">
      <input type="radio" name="marca" [value]="m.id" [(ngModel)]="pedidoForm.marca_id" /> {{ m.nombre }}
    </label>
  </div>

  <button (click)="createPedido()" [disabled]="!pedidoForm.presupuesto_id || !pedidoForm.marca_id">Crear Pedido</button>
</div>
```

Ejemplo de llamada (servicio Angular):
```ts
createPedido(body: {presupuesto_id: number; marca_id: number; exclusivo?: boolean}) {
  return this.http.post('/pedidos', { ...body, exclusivo: body.exclusivo ?? true });
}
```

### Mapa de botones (extendido)
- Marcas:
  - Ver Marcas -> `GET /marcas`
  - Crear Marca -> `POST /marcas`
- Pedidos:
  - Ver Pedidos -> `GET /pedidos?presupuesto_id=<id>`
  - Crear Pedido (selección exclusiva de marca) -> `POST /pedidos` {presupuesto_id, marca_id, exclusivo}
- Historial:
  - Ver Historial -> `GET /historial`

## 6. Buenas prácticas
- Validar en backend entradas obligatorias y tipos
- Manejar CORS solo en desarrollo abierto (*)
- Usar `.env` para `DATABASE_URL`, `FLASK_ENV`
- Tipar en Angular las respuestas del API
- Mantener servicios en `app/services` y componentes simples con signals

## 7. Troubleshooting rápido
- Puertos: proxy a 5000 y Angular a 4200
- CORS: habilitado en Flask, pero en prod restringir orígenes
- SQLite: borrar `taller.db` si hay migraciones inconsistentes
- Node/CLI: usar misma mayor 20.x entre `@angular/core` y `@angular/cli`

## 8. Próximos pasos opcionales
- Tests: PyTest en backend, Karma/Jasmine en frontend
- Dockerización con `docker-compose` para api + frontend
- Autenticación básica y paginación para listas
