from flask import Blueprint, jsonify

from extensions import db
from models import Cliente, Presupuesto

bp_stats = Blueprint("stats", __name__)


@bp_stats.get("/stats")
def stats():
    try:
        clientes_count = db.session.query(Cliente).count()
        presup_count = db.session.query(Presupuesto).count()
        ultimo = db.session.query(Presupuesto).order_by(Presupuesto.fecha.desc()).first()
        ult_dict = {"id": ultimo.id, "fecha": ultimo.fecha.isoformat()} if ultimo else None
        return jsonify(
            {
                "ok": True,
                "clientes": clientes_count,
                "presupuestos": presup_count,
                "ult_presupuesto": ult_dict,
            }
        )
    except Exception as e:  # pragma: no cover
        return (jsonify({"ok": False, "error": str(e)}), 500)
