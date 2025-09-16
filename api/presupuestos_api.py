from flask import Blueprint, request, jsonify, abort, send_file
from datetime import date, datetime
import uuid
from io import BytesIO
import logging

from extensions import db
from models import Presupuesto, Cliente
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

try:  # PDF opcional
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except Exception:  # pragma: no cover
    REPORTLAB_AVAILABLE = False

logger = logging.getLogger(__name__)

bp_presupuestos = Blueprint("presupuestos", __name__)

# Helpers locales (se reutilizan desde app mediante import si hiciera falta)

def _clean_vista_for_db(vista_data):
    if not vista_data or not isinstance(vista_data, dict) or "grupos" not in vista_data:
        return vista_data
    vista_copy = vista_data.copy()
    for grupo in vista_copy.get("grupos", []):
        cleaned_neumaticos = []
        for neumatico in grupo.get("neumaticos", []):
            cleaned_neumaticos.append(neumatico)
        grupo["neumaticos"] = cleaned_neumaticos
    return vista_copy


def generar_siguiente_numero_presupuesto():  # conservado por si se necesitara fuera
    today = date.today()
    current_year = today.year
    ultimo_numero_str = (
        db.session.query(db.func.max(Presupuesto.numero))
        .filter(Presupuesto.numero.like(f"{current_year}-%"))
        .scalar()
    )
    nuevo_numero_secuencial = 1
    if ultimo_numero_str:
        try:
            nuevo_numero_secuencial = int(ultimo_numero_str.split("-")[-1]) + 1
        except (ValueError, IndexError):
            pass
    return f"{current_year}-{str(nuevo_numero_secuencial).zfill(3)}"


@bp_presupuestos.get("/presupuestos")
def get_presupuestos():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    nombre = request.args.get("nombre", type=str)
    telefono = request.args.get("telefono", type=str)
    numero = request.args.get("numero", type=str)
    medida_param = request.args.get("medida", type=str)

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

    if medida_param:
        medida_like = medida_param.strip().lower()
        try:
            bind = db.session.get_bind()
        except Exception:
            bind = None
        es_postgres = bool(getattr(getattr(bind, "dialect", None), "name", None) == "postgresql")
        if es_postgres:
            q = q.filter(
                or_(
                    db.cast(Presupuesto.vista_cliente, db.Text).ilike(f"%{medida_like}%"),
                    db.cast(Presupuesto.vista_interna, db.Text).ilike(f"%{medida_like}%"),
                )
            )
        else:
            all_rows = q.order_by(Presupuesto.numero.desc()).all()
            filtrados = []
            for p in all_rows:
                def contiene_medida(v):
                    if not v or not isinstance(v, dict):
                        return False
                    for g in v.get("grupos", []) or []:
                        m = (g.get("medida") or "").lower()
                        if medida_like in m:
                            return True
                    return False
                if contiene_medida(p.vista_cliente) or contiene_medida(p.vista_interna):
                    filtrados.append(p)
            total = len(filtrados)
            start = (page - 1) * per_page
            end = start + per_page
            slice_items = filtrados[start:end]
            return jsonify(
                {
                    "presupuestos": [p.to_dict() for p in slice_items],
                    "total": total,
                    "pages": (total // per_page) + (1 if total % per_page else 0),
                    "current_page": page,
                    "has_next": end < total,
                    "has_prev": start > 0,
                }
            )

    q = q.order_by(Presupuesto.numero.desc())
    presupuestos_page = q.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify(
        {
            "presupuestos": [p.to_dict() for p in presupuestos_page.items],
            "total": presupuestos_page.total,
            "pages": presupuestos_page.pages,
            "current_page": presupuestos_page.page,
            "has_next": presupuestos_page.has_next,
            "has_prev": presupuestos_page.has_prev,
        }
    )


@bp_presupuestos.post("/presupuestos")
def create_presupuesto():
    data = request.json
    if not data:
        abort(400, description="Invalid JSON")

    cliente_data = data.get("cliente", {})

    cliente = None
    if cliente_data.get("nif") and cliente_data["nif"].strip():
        cliente = Cliente.query.filter_by(nif=cliente_data["nif"]).first()
    if not cliente and cliente_data.get("nombre"):
        cliente = Cliente.query.filter_by(nombre=cliente_data["nombre"]).first()
    if not cliente:
        cliente = Cliente(
            nombre=cliente_data.get("nombre", "Sin Nombre"),
            telefono=cliente_data.get("telefono"),
            nif=cliente_data.get("nif"),
        )
        db.session.add(cliente)
        db.session.flush()

    vista_cliente_data = _clean_vista_for_db(data.get("vista_cliente", {}))
    vista_interna_data = _clean_vista_for_db(data.get("vista_interna", {}))

    try:
        fecha_str = data.get("fecha")
        if not fecha_str:
            abort(400, description="Fecha del presupuesto es requerida.")
        fecha_obj = datetime.strptime(fecha_str, "%Y-%m-%d").date()

        intentos = 2
        current_year = date.today().year
        lock_key = abs(hash(f"presupuesto-{current_year}")) % (2**31)
        for intento in range(1, intentos + 1):
            try:
                try:
                    bind = db.session.get_bind()
                except Exception:
                    bind = None
                es_postgres = bool(getattr(getattr(bind, "dialect", None), "name", None) == "postgresql")
                if es_postgres:
                    try:
                        db.session.execute(db.text("SELECT pg_advisory_xact_lock(:k)"), {"k": lock_key})
                    except Exception as lk_err:
                        logger.warning(f"[create_presupuesto] No lock advisory: {lk_err}")
                ultimo_numero = (
                    db.session.query(db.func.max(Presupuesto.numero))
                    .filter(Presupuesto.numero.like(f"{current_year}-%"))
                    .scalar()
                )
                if ultimo_numero:
                    try:
                        sec = int(ultimo_numero.split("-")[-1]) + 1
                    except (ValueError, IndexError):
                        sec = 1
                else:
                    sec = 1
                numero_generado = f"{current_year}-{sec:03d}"
                new_presupuesto = Presupuesto(
                    id=str(uuid.uuid4()),
                    numero=numero_generado,
                    fecha=fecha_obj,
                    cliente_id=cliente.id,
                    vista_cliente=vista_cliente_data,
                    vista_interna=vista_interna_data,
                )
                db.session.add(new_presupuesto)
                db.session.commit()
                return jsonify(new_presupuesto.to_dict()), 201
            except IntegrityError as ie:
                db.session.rollback()
                logger.warning(f"[create_presupuesto] Colisión IntegrityError {numero_generado}: {ie}")
                continue
        abort(409, description="No se pudo generar un número único. Reintenta.")
    except ValueError as e:
        db.session.rollback()
        abort(400, description=f"Error fecha: {e} (YYYY-MM-DD)")
    except Exception as e:
        from werkzeug.exceptions import HTTPException
        if isinstance(e, HTTPException):
            raise
        import traceback
        traceback.print_exc()
        db.session.rollback()
        abort(500, description=f"Error interno al crear: {e}")


@bp_presupuestos.get("/presupuestos/<string:presupuesto_id>")
def get_presupuesto(presupuesto_id):
    presupuesto = Presupuesto.query.get_or_404(presupuesto_id)
    return jsonify(presupuesto.to_dict())


@bp_presupuestos.put("/presupuestos/<string:presupuesto_id>")
def update_presupuesto(presupuesto_id):
    presupuesto = Presupuesto.query.get_or_404(presupuesto_id)
    data = request.json
    if not data:
        abort(400, description="Invalid JSON")

    presupuesto.vista_cliente = _clean_vista_for_db(
        data.get("vista_cliente", presupuesto.vista_cliente)
    )
    presupuesto.vista_interna = _clean_vista_for_db(
        data.get("vista_interna", presupuesto.vista_interna)
    )

    if data.get("fecha"):
        try:
            presupuesto.fecha = datetime.strptime(data.get("fecha"), "%Y-%m-%d").date()
        except ValueError as e:
            abort(400, description=f"Error fecha: {e} (YYYY-MM-DD)")

    cliente_data = data.get("cliente")
    if cliente_data and presupuesto.cliente:
        presupuesto.cliente.nombre = cliente_data.get("nombre", presupuesto.cliente.nombre)
        presupuesto.cliente.telefono = cliente_data.get("telefono", presupuesto.cliente.telefono)
        presupuesto.cliente.nif = cliente_data.get("nif", presupuesto.cliente.nif)

    db.session.commit()
    return jsonify(presupuesto.to_dict())


@bp_presupuestos.delete("/presupuestos/<string:presupuesto_id>")
def delete_presupuesto(presupuesto_id):
    presupuesto = Presupuesto.query.get_or_404(presupuesto_id)
    db.session.delete(presupuesto)
    db.session.commit()
    return "", 204


@bp_presupuestos.get("/presupuestos/<string:presupuesto_id>/pdf")
def presupuesto_pdf(presupuesto_id):
    if not REPORTLAB_AVAILABLE:
        abort(501, description="Exportación PDF no disponible. Instala 'reportlab'.")
    p = Presupuesto.query.get_or_404(presupuesto_id)
    buf = BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 40
    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, y, "Presupuesto")
    y -= 24
    c.setFont("Helvetica", 11)
    c.drawString(40, y, f"Nº: {p.numero}  Fecha: {p.fecha.isoformat()}")
    y -= 18
    cli = p.cliente.to_dict() if p.cliente else {}
    c.drawString(40, y, f"Cliente: {cli.get('nombre','-')}  Tel: {cli.get('telefono','-')}")
    y -= 24
    vista = p.vista_cliente or {}
    grupos = (vista.get("grupos") or [])[:20]
    total_general = (vista.get("totalGeneral") or 0)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(40, y, "Detalle")
    y -= 16
    c.setFont("Helvetica", 10)
    for g in grupos:
        if y < 60:
            c.showPage()
            y = height - 40
            c.setFont("Helvetica", 10)
        medida = g.get("medida") or ""
        cant = g.get("cantidad") or g.get("neumaticos", [{}])[0].get("cantidad") or ""
        n0 = (g.get("neumaticos") or [{}])[0]
        marca = n0.get("nombre") or n0.get("marca") or ""
        total = n0.get("total") or g.get("totalGrupo") or 0
        c.drawString(40, y, f"{cant}x {medida} {marca} — Total: {round(float(total))} €")
        y -= 14
    y -= 10
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y, f"Total: {round(float(total_general))} €")
    c.showPage()
    c.save()
    buf.seek(0)
    filename = f"presupuesto-{p.numero}.pdf"
    return send_file(buf, mimetype="application/pdf", as_attachment=True, download_name=filename)
