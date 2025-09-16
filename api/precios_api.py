from flask import Blueprint, request, jsonify, abort
from datetime import datetime
import re
from extensions import db
from models import Precio
from sqlalchemy import or_

bp_precios = Blueprint("precios", __name__)

# Reutilizamos mismo parser para bases de medida que existía en app

def _parse_medida_bases(text: str):
    if not text:
        return []
    s = (text or "").upper()
    s = re.sub(r"[^0-9R]+", " ", s)
    tokens = [t for t in s.split() if t]
    for i in range(len(tokens)):
        try:
            w = tokens[i]
            pr = tokens[i + 1]
            if i + 3 < len(tokens) and tokens[i + 2] == 'R':
                ri = tokens[i + 3]
                if len(w) == 3 and len(pr) == 2 and len(ri) == 2 and w.isdigit() and pr.isdigit() and ri.isdigit():
                    return [f"{w}/{pr}/{ri}", f"{w}/{pr}R{ri}"]
            if i + 2 < len(tokens):
                ri = tokens[i + 2]
                if len(w) == 3 and len(pr) == 2 and len(ri) == 2 and w.isdigit() and pr.isdigit() and ri.isdigit():
                    return [f"{w}/{pr}/{ri}", f"{w}/{pr}R{ri}"]
        except IndexError:
            pass
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


@bp_precios.get("/precios")
def get_precios_por_medida():
    medida = request.args.get("medida", type=str)
    if not medida:
        abort(400, description="Falta la medida")
    bases = _parse_medida_bases(medida)
    if not bases:
        return jsonify([])
    conds = [Precio.medida.ilike(f"{b}%") for b in bases]
    q = Precio.query.filter(or_(*conds)).order_by(Precio.updated_at.desc())
    rows = q.all()
    return jsonify([r.to_dict() for r in rows])


@bp_precios.post("/precios")
def upsert_precio():
    data = request.json or {}
    medida = (data.get("medida") or "").strip()
    marca = (data.get("marca") or "").strip()
    neto = data.get("neto")
    if not medida or not marca:
        abort(400, description="Medida y marca son obligatorias")
    try:
        neto_val = float(neto)
        if neto_val < 0:
            raise ValueError("Neto negativo")
    except Exception:
        abort(400, description="Neto inválido")
    row = Precio.query.filter_by(medida=medida, marca=marca).first()
    if row:
        row.neto = neto_val
        row.updated_at = datetime.utcnow()
    else:
        row = Precio(medida=medida, marca=marca, neto=neto_val)
        db.session.add(row)
    db.session.commit()
    return jsonify(row.to_dict())
