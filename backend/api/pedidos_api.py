from datetime import datetime

from flask import Blueprint, abort, jsonify, request
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

from extensions import db
from models import Pedido, Presupuesto

bp_pedidos = Blueprint("pedidos", __name__)

# --- Helpers ---


def _apply_filters(q):
    estado = request.args.get("estado")  # pending|ordered|received
    proveedor = request.args.get("proveedor")
    qtext = request.args.get("q")
    desde = request.args.get("desde")
    hasta = request.args.get("hasta")

    if estado == "pending":
        q = q.filter(Pedido.confirmed_at.is_(None))
    elif estado == "ordered":
        q = q.filter(Pedido.confirmed_at.isnot(None), Pedido.received_at.is_(None))
    elif estado == "received":
        q = q.filter(Pedido.received_at.isnot(None))

    if proveedor:
        q = q.filter(Pedido.proveedor == proveedor)

    if qtext:
        like = f"%{qtext}%"
        q = q.filter(
            or_(Pedido.medida.ilike(like), Pedido.marca.ilike(like), Pedido.descripcion.ilike(like))
        )

    if desde:
        try:
            d = datetime.strptime(desde, "%Y-%m-%d")
            q = q.filter(Pedido.created_at >= d)
        except Exception:
            pass
    if hasta:
        try:
            h = datetime.strptime(hasta + " 23:59:59", "%Y-%m-%d %H:%M:%S")
            q = q.filter(Pedido.created_at <= h)
        except Exception:
            pass
    return q


# --- CRUD ---
@bp_pedidos.post("/pedidos")
def crear_pedido():
    data = request.json or {}
    medida = (data.get("medida") or "").strip()
    marca = (data.get("marca") or "").strip()
    descripcion = (data.get("descripcion") or "").strip() or None
    proveedor = (data.get("proveedor") or "").strip() or None
    unidades = data.get("unidades") or 1
    notas = data.get("notas")
    presupuesto_id = data.get("presupuesto_id") or None
    linea_ref = (data.get("linea_ref") or "").strip() or None

    if not medida:
        abort(400, description="Medida obligatoria")
    if not (marca or descripcion):
        abort(400, description="Marca o descripción requerida")
    try:
        unidades = int(unidades)
        if unidades <= 0:
            raise ValueError
    except Exception:
        abort(400, description="Unidades inválidas")

    if presupuesto_id:
        # Validar que exista (pero no bloquear si no)
        Presupuesto.query.get(presupuesto_id)  # ignore result

    pedido = Pedido(
        presupuesto_id=presupuesto_id,
        linea_ref=linea_ref,
        medida=medida,
        marca=marca or None,
        descripcion=descripcion,
        proveedor=proveedor,
        unidades=unidades,
        notas=notas,
    )
    db.session.add(pedido)
    db.session.commit()
    return jsonify(pedido.to_dict_custom()), 201


@bp_pedidos.get("/pedidos")
def listar_pedidos():
    """
    Lista pedidos con información de presupuesto y cliente vinculada.

    Utiliza joinedload para cargar eager las relaciones Pedido->Presupuesto->Cliente
    y agrega campos planos (presupuesto_numero, cliente_nombre, cliente_telefono)
    para facilitar el renderizado en el frontend.

    Resuelve el problema de "(no vinculado)" asegurando que todos los pedidos
    con presupuesto_id válido muestren la información del cliente y presupuesto.
    """
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 25, type=int)
    q = Pedido.query.options(joinedload(Pedido.presupuesto).joinedload(Presupuesto.cliente))
    q = _apply_filters(q).order_by(Pedido.created_at.desc())
    pag = q.paginate(page=page, per_page=per_page, error_out=False)
    items = []
    for p in pag.items:
        d = p.to_dict_custom()
        # Campos planos para facilitar frontend
        if d.get("presupuesto"):
            d["presupuesto_numero"] = d["presupuesto"].get("numero")
            cli = d["presupuesto"].get("cliente") or {}
            d["cliente_nombre"] = cli.get("nombre")
            d["cliente_telefono"] = cli.get("telefono")
        else:
            d["presupuesto_numero"] = None
            d["cliente_nombre"] = None
            d["cliente_telefono"] = None
        items.append(d)
    return jsonify(
        {
            "pedidos": items,
            "total": pag.total,
            "pages": pag.pages,
            "current_page": pag.page,
            "has_next": pag.has_next,
            "has_prev": pag.has_prev,
        }
    )


@bp_pedidos.get("/pedidos/<string:pedido_id>")
def obtener_pedido(pedido_id):
    p = Pedido.query.get_or_404(pedido_id)
    return jsonify(p.to_dict_custom())


@bp_pedidos.patch("/pedidos/<string:pedido_id>")
def editar_pedido(pedido_id):
    p = Pedido.query.get_or_404(pedido_id)
    data = request.json or {}

    recibido = bool(p.received_at)
    editable_campos = ["proveedor", "unidades", "notas", "descripcion", "marca", "medida"]

    if recibido:
        # Si ya se recibió, solo se pueden editar las notas
        editable_campos = ["notas"]
    elif not p.confirmed_at:
        # Si no está ni confirmado, se puede cambiar también el presupuesto
        editable_campos.append("presupuesto_id")

    cambios = False
    for campo in editable_campos:
        if campo in data:
            val = data[campo]

            # --- Validación específica ---
            if campo == "unidades":
                try:
                    val = int(val)
                    if val <= 0:
                        raise ValueError
                except (ValueError, TypeError):
                    abort(400, description="Unidades inválidas")

            if campo == "presupuesto_id" and val:
                presupuesto = Presupuesto.query.get(val)
                if not presupuesto:
                    abort(404, description=f"El presupuesto con id {val} no existe.")

            # --- Asignación ---
            setattr(p, campo, val or None)  # Convierte strings vacíos a None
            cambios = True

    if cambios:
        db.session.commit()

    return jsonify(p.to_dict_custom())


# --- Toggles ---
@bp_pedidos.post("/pedidos/<string:pedido_id>/toggle_confirmado")
def toggle_confirmado(pedido_id):
    p = Pedido.query.get_or_404(pedido_id)
    if p.confirmed_at is None:
        p.confirmed_at = datetime.utcnow()
    else:
        if p.received_at is not None:
            abort(409, description="Primero desmarca recibido")
        p.confirmed_at = None
    db.session.commit()
    return jsonify(p.to_dict_custom())


@bp_pedidos.post("/pedidos/<string:pedido_id>/toggle_recibido")
def toggle_recibido(pedido_id):
    p = Pedido.query.get_or_404(pedido_id)
    if p.received_at is None:
        if p.confirmed_at is None:
            abort(409, description="Debes confirmar antes")
        p.received_at = datetime.utcnow()
    else:
        p.received_at = None
    db.session.commit()
    return jsonify(p.to_dict_custom())


@bp_pedidos.delete("/pedidos/<string:pedido_id>")
def borrar_pedido(pedido_id):
    p = Pedido.query.get_or_404(pedido_id)
    if p.received_at:
        abort(409, description="No puedes borrar un pedido recibido")
    db.session.delete(p)
    db.session.commit()
    return "", 204
