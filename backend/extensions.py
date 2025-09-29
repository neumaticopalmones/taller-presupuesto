from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Instancias globales (se inicializan en app.py)
db = SQLAlchemy()
migrate = Migrate()
