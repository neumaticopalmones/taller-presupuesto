import logging
import os
import re
import sys

from dotenv import load_dotenv

try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
except Exception:  # pragma: no cover - entorno sin dependencia
    # Fallback no-op si flask-limiter no está disponible
    class Limiter:  # type: ignore
        def __init__(self, *_, **__):
            pass

        def init_app(self, *_):
            pass

        def limit(self, *_, **__):
            def deco(f):
                return f

            return deco

    def get_remote_address():  # type: ignore
        return None


from flask import Flask, abort, jsonify, request, send_file, send_from_directory
from flask_cors import CORS

try:

    REPORTLAB_AVAILABLE = True
except Exception:  # pragma: no cover - entorno sin dependencia
    REPORTLAB_AVAILABLE = False


# --- Utilidad para limpiar la vista antes de guardar ---
def _clean_vista_for_db(vista_data):
    if not vista_data or not isinstance(vista_data, dict) or "grupos" not in vista_data:
        return vista_data

    vista_copy = vista_data.copy()
    for grupo in vista_copy.get("grupos", []):
        cleaned_neumaticos = []
        for neumatico in grupo.get("neumaticos", []):
            # Ya no hay inventario, solo dejar el ítem tal cual
            cleaned_neumaticos.append(neumatico)
        grupo["neumaticos"] = cleaned_neumaticos
    return vista_copy


# Cargar variables de entorno desde el archivo .env
load_dotenv()

# Configuración de logging básica (puede ajustarse por entorno)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("app")

app = Flask(__name__)
app.config["SECRET_KEY"] = (
    os.environ.get("SECRET_KEY") or os.environ.get("FLASK_SECRET") or os.urandom(24)
)
if not os.environ.get("SECRET_KEY") and not os.environ.get("FLASK_SECRET"):
    logger.warning(
        "SECRET_KEY no definido en entorno; " "generando uno temporal (no usar en producción)"
    )
CORS(app)  # Habilita CORS para toda la aplicación

# Limiter (v3): si REDIS_URL está definida, usarla como backend de almacenamiento
_redis_url = os.environ.get("REDIS_URL")
limiter = Limiter(
    key_func=get_remote_address,
    # Eliminar límites globales para evitar 429 en recursos estáticos.
    # Aplicaremos límites solo de forma explícita con decoradores.
    default_limits=[],
    storage_uri=_redis_url if _redis_url else None,
)
limiter.init_app(app)


# Filtro global: excluir rutas estáticas y salud del rate limiting aunque hubiera defaults futuros
@limiter.request_filter
def _exempt_static_and_health():  # pragma: no cover - lógica sencilla
    try:
        p = request.path
    except Exception:
        return False
    # Paths a excluir siempre
    if p in ("/", "/health"):
        return True
    return (
        p.startswith("/js/")
        or p.startswith("/static/")
        or p.endswith(".css")
        or p.endswith(".js")
        or p.endswith(".map")
        or p.startswith("/favicon")
    )


# Función auxiliar para obtener variables de entorno excluyendo valores 'None'
def get_env_var(var_name):
    value = os.environ.get(var_name)
    return value if value and value.lower() != "none" else None


DB_USER = get_env_var("POSTGRES_USER")
DB_PASSWORD = get_env_var("POSTGRES_PASSWORD")
DB_HOST = get_env_var("POSTGRES_HOST")
DB_PORT = get_env_var("POSTGRES_PORT")
DB_NAME = get_env_var("POSTGRES_DB")

# Configuración de SQLAlchemy con override por DATABASE_URL
db_url = get_env_var("DATABASE_URL")
if not db_url:
    # Solo construir URL si todas las variables están presentes
    if all([DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME]):
        db_url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    else:
        # Fallback para desarrollo local
        db_url = "postgresql://postgres:password@localhost:5432/presupuestos"

# Asegurar que la URL usa el driver psycopg (para psycopg v3)
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg://", 1)

# Debug logging para Railway
print(f"[DEBUG] DB_USER: {DB_USER}")
print(f"[DEBUG] DB_PASSWORD: {'***' if DB_PASSWORD else None}")
print(f"[DEBUG] DB_HOST: {DB_HOST}")
print(f"[DEBUG] DB_PORT: {DB_PORT}")
print(f"[DEBUG] DB_NAME: {DB_NAME}")
print(f"[DEBUG] Using database URL: {db_url[:50]}...")  # Solo primeros 50 chars por seguridad
print(f"[DEBUG] DATABASE_URL env var exists: {bool(get_env_var('DATABASE_URL'))}")

app.config["SQLALCHEMY_DATABASE_URI"] = db_url
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
try:
    from extensions import db, migrate  # usar instancias globales
except ModuleNotFoundError:  # pragma: no cover - fallback para entorno de test
    sys.path.append(os.path.dirname(__file__))
    from extensions import db, migrate
try:
    from models import Presupuesto
except ModuleNotFoundError:
    sys.path.append(os.path.dirname(__file__))
    from models import Presupuesto
try:
    from api.precios_api import bp_precios
    from api.presupuestos_api import bp_presupuestos  # Blueprint fase 2
    from api.stats_api import bp_stats

    try:
        from api.pedidos_api import bp_pedidos
    except Exception:
        bp_pedidos = None
except ModuleNotFoundError:
    sys.path.append(os.path.dirname(__file__))
    from api.precios_api import bp_precios
    from api.presupuestos_api import bp_presupuestos
    from api.stats_api import bp_stats

    try:
        from api.pedidos_api import bp_pedidos
    except Exception:
        bp_pedidos = None

db.init_app(app)
migrate.init_app(app, db)


# --- Modelos ---
"""Modelos movidos a models.py. Se mantienen importados para compatibilidad."""


app.register_blueprint(bp_stats)


# Serve static files (like index.html, CSS, JS)
@limiter.exempt
@app.route("/")
def serve_index():
    return send_file("index.html")


@limiter.exempt
@app.route("/<path:path>")
def serve_static(path):
    # Prevent directory traversal
    if ".." in path or path.startswith("/"):
        abort(404)
    return send_from_directory(".", path)


# Manejador global de errores 500 para devolver JSON
@app.errorhandler(500)
def handle_internal_error(error):
    description = getattr(error, "description", str(error))
    response = jsonify({"description": f"Error interno del servidor: {description}"})
    response.status_code = 500
    return response


@app.errorhandler(404)
def handle_not_found(error):
    response = jsonify({"description": "Recurso no encontrado"})
    response.status_code = 404
    return response


@app.errorhandler(400)
def handle_bad_request(error):
    description = getattr(error, "description", str(error))
    response = jsonify({"description": f"Solicitud incorrecta: {description}"})
    response.status_code = 400
    return response


@app.errorhandler(429)
def handle_rate_limit(error):  # pragma: no cover - handler simple
    # Aclarar al cliente qué ruta fue limitada
    response = jsonify(
        {
            "description": "Rate limit excedido",
            "path": request.path,
            "limit": getattr(error, "limit", None),
        }
    )
    response.status_code = 429
    return response


@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


# --- Sugerencias (medidas y marcas) ---
@app.get("/sugerencias")
@limiter.limit("10/minute")
def sugerencias():
    """
    Devuelve sugerencias basadas en el historial guardado:
    - medidas: lista de medidas más usadas
    - marcas: lista de marcas más usadas
    - combos: contador por (medida -> marca -> count)
    """
    try:
        limit = request.args.get("limit", default=200, type=int)
        # Seguridad: tope máximo para no cargar en exceso
        if limit is not None:
            try:
                limit = int(limit)
                if limit <= 0:
                    limit = 200
                if limit > 1000:
                    limit = 1000
            except Exception:
                limit = 200
        q = Presupuesto.query.order_by(Presupuesto.fecha.desc())
        if limit and limit > 0:
            q = q.limit(limit)
        rows = q.all()

        from collections import Counter, defaultdict

        medidas_counter = Counter()
        marcas_counter = Counter()
        combos = defaultdict(lambda: Counter())

        def process_vista(v):
            if not v or not isinstance(v, dict):
                return
            grupos = v.get("grupos") or []
            for g in grupos:
                medida = g.get("medida")
                if medida:
                    medidas_counter[medida] += 1
                neumaticos = g.get("neumaticos") or []
                for n in neumaticos:
                    marca = n.get("nombre") or n.get("marca")
                    if marca:
                        marcas_counter[marca] += 1
                        if medida:
                            combos[medida][marca] += 1

        for r in rows:
            process_vista(r.vista_cliente)
            process_vista(r.vista_interna)

        def top_list(counter: Counter, max_items=30):
            return [k for k, _ in counter.most_common(max_items)]

        combos_out = {m: [k for k, _ in c.most_common(20)] for m, c in combos.items()}

        return jsonify(
            {
                "medidas": top_list(medidas_counter, 50),
                "marcas": top_list(marcas_counter, 50),
                "combos": combos_out,
            }
        )
    except Exception as e:
        import traceback

        traceback.print_exc()
        abort(500, description=f"No se pudieron calcular sugerencias: {e}")


# --- Precios por medida y marca ---
def _parse_medida_bases(text: str):
    """
    Devuelve posibles bases de medida sin código (ej: 205/55/16 y 205/55R16) a partir de
    un texto como "205/55/16 91V" o "205/55R16 91V" o similares.
    """
    if not text:
        return []
    s = (text or "").upper()
    # Reemplazar separadores no alfanuméricos (excepto R) por espacios para tokenizar
    s = re.sub(r"[^0-9R]+", " ", s)
    tokens = [t for t in s.split() if t]
    # Buscar patrón: 3 dígitos, 2 dígitos, (opcional R), 2 dígitos consecutivos
    for i in range(len(tokens)):
        try:
            w = tokens[i]
            pr = tokens[i + 1]
            # Caso con R separada
            if i + 3 < len(tokens) and tokens[i + 2] == "R":
                ri = tokens[i + 3]
                valid_parts = (
                    len(w) == 3
                    and len(pr) == 2
                    and len(ri) == 2
                    and w.isdigit()
                    and pr.isdigit()
                    and ri.isdigit()
                )
                if valid_parts:
                    return [f"{w}/{pr}/{ri}", f"{w}/{pr}R{ri}"]
            # Caso sin R separada (puede venir en forma compacta luego, pero aquí solo números)
            if i + 2 < len(tokens):
                ri = tokens[i + 2]
                valid_parts = (
                    len(w) == 3
                    and len(pr) == 2
                    and len(ri) == 2
                    and w.isdigit()
                    and pr.isdigit()
                    and ri.isdigit()
                )
                if valid_parts:
                    return [f"{w}/{pr}/{ri}", f"{w}/{pr}R{ri}"]
        except IndexError:
            pass
    # Segundo intento: detectar formato compacto con R
    # ### ## R## o ### ##R## sin espacios (ej: 205/55R16 ya capturado antes)
    compact = re.sub(r"\s+", "", text.upper())
    m = re.search(r"(\d{3})[\/](\d{2})R(\d{2})", compact)
    if m:
        w, pr, ri = m.group(1), m.group(2), m.group(3)
        return [f"{w}/{pr}/{ri}", f"{w}/{pr}R{ri}"]
    m2 = re.search(r"(\d{3})(\d{2})R(\d{2})", compact)
    if m2:
        w, pr, ri = m2.group(1), m2.group(2), m2.group(3)
        return [f"{w}/{pr}/{ri}", f"{w}/{pr}R{ri}"]
    return []


# Marcador para tests: línea que comienza con '@' para delimitar extracción en test_utils_backend
def _noop_marker(f):  # pragma: no cover - utilidad de test
    return f


@_noop_marker
def _after_parse_marker():  # pragma: no cover
    return None


app.register_blueprint(bp_precios)


# --- PDF del presupuesto ---
# Registro de blueprint de presupuestos (CRUD + PDF)
app.register_blueprint(bp_presupuestos)

# Registrar blueprint pedidos si disponible
if "bp_pedidos" in globals() and bp_pedidos is not None:
    app.register_blueprint(bp_pedidos, url_prefix="/api")


if __name__ == "__main__":
    # Crear tablas que no existan aún (útil para nuevas tablas como precios)
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0")
