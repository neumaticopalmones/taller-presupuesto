import uuid
from datetime import date, datetime

from sqlalchemy import UniqueConstraint, Text
# from sqlalchemy.dialects.postgresql import JSONB  # Comentado para SQLite

from extensions import db


class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    telefono = db.Column(db.String(20), nullable=True)
    nif = db.Column(db.String(20), nullable=True)
    presupuestos = db.relationship("Presupuesto", backref="cliente", lazy=True)

    def to_dict(self):
        return {"id": self.id, "nombre": self.nombre, "telefono": self.telefono, "nif": self.nif}


class Presupuesto(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    numero = db.Column(db.String(50), unique=True, nullable=False)
    fecha = db.Column(db.Date, nullable=False, default=date.today)
    cliente_id = db.Column(db.Integer, db.ForeignKey("cliente.id"), nullable=False)
    vista_cliente = db.Column(Text)  # Cambiar JSONB por Text para SQLite
    vista_interna = db.Column(Text)  # Cambiar JSONB por Text para SQLite

    def to_dict(self):
        return {
            "id": self.id,
            "numero": self.numero,
            "fecha": self.fecha.isoformat(),
            "cliente": self.cliente.to_dict() if self.cliente else None,
            "vista_cliente": self.vista_cliente,
            "vista_interna": self.vista_interna,
        }


class Precio(db.Model):
    __tablename__ = "precios"
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    medida = db.Column(db.String(100), nullable=False, index=True)
    marca = db.Column(db.String(150), nullable=False, index=True)
    neto = db.Column(db.Float, nullable=False)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    __table_args__ = (UniqueConstraint("medida", "marca", name="uq_medida_marca"),)

    def to_dict(self):
        return {
            "id": self.id,
            "medida": self.medida,
            "marca": self.marca,
            "neto": self.neto,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Pedido(db.Model):
    __tablename__ = "pedido"
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    presupuesto_id = db.Column(
        db.String(36), db.ForeignKey("presupuesto.id"), nullable=True, index=True
    )
    # Relación para poder acceder a datos del presupuesto y cliente asociado
    presupuesto = db.relationship("Presupuesto", backref="pedidos", lazy="joined")
    linea_ref = db.Column(db.String(50), nullable=True)
    medida = db.Column(db.String(50), nullable=False, index=True)
    marca = db.Column(db.String(80), nullable=True, index=True)
    descripcion = db.Column(db.Text, nullable=True)
    proveedor = db.Column(db.String(40), nullable=True, index=True)
    unidades = db.Column(db.Integer, nullable=False, default=1)
    notas = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    confirmed_at = db.Column(db.DateTime, nullable=True, index=True)
    received_at = db.Column(db.DateTime, nullable=True, index=True)

    def to_dict_custom(self):
        """Convierte el pedido a diccionario con información de presupuesto y cliente cargada."""
        import sys

        status = "pending"
        if self.confirmed_at and not self.received_at:
            status = "ordered"
        if self.received_at:
            status = "received"

        presupuesto_info = None
        try:
            if self.presupuesto_id and not self.presupuesto:
                # Caso: hay presupuesto_id pero la relación no carga - carga manual
                from models import Presupuesto

                pres_manual = Presupuesto.query.get(self.presupuesto_id)
                if pres_manual:
                    cli = pres_manual.cliente
                    presupuesto_info = {
                        "id": pres_manual.id,
                        "numero": pres_manual.numero,
                        "fecha": pres_manual.fecha.isoformat() if pres_manual.fecha else None,
                        "vista_cliente": pres_manual.vista_cliente,
                        "vista_interna": pres_manual.vista_interna,
                        "cliente": (
                            {
                                "id": cli.id,
                                "nombre": cli.nombre,
                                "telefono": cli.telefono,
                                "nif": cli.nif,
                            }
                            if cli
                            else None
                        ),
                    }
            elif self.presupuesto:
                # Relación cargada correctamente con joinedload
                cli = self.presupuesto.cliente if hasattr(self.presupuesto, "cliente") else None
                presupuesto_info = {
                    "id": self.presupuesto.id,
                    "numero": self.presupuesto.numero,
                    "fecha": self.presupuesto.fecha.isoformat() if self.presupuesto.fecha else None,
                    "vista_cliente": self.presupuesto.vista_cliente,
                    "vista_interna": self.presupuesto.vista_interna,
                    "cliente": (
                        {
                            "id": cli.id,
                            "nombre": cli.nombre,
                            "telefono": cli.telefono,
                            "nif": cli.nif,
                        }
                        if cli
                        else None
                    ),
                }
        except Exception as e:
            print(f"[DEBUG] Error en to_dict: {e}", file=sys.stderr, flush=True)
            import traceback

            traceback.print_exc(file=sys.stderr)

        return {
            "id": self.id,
            "presupuesto_id": self.presupuesto_id,
            "linea_ref": self.linea_ref,
            "medida": self.medida,
            "marca": self.marca,
            "descripcion": self.descripcion,
            "proveedor": self.proveedor,
            "unidades": self.unidades,
            "notas": self.notas,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "confirmed_at": self.confirmed_at.isoformat() if self.confirmed_at else None,
            "received_at": self.received_at.isoformat() if self.received_at else None,
            "is_confirmed": bool(self.confirmed_at),
            "is_received": bool(self.received_at),
            "status": status,
            "presupuesto": presupuesto_info,
        }
