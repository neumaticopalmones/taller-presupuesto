#!/usr/bin/env python3
from app import app, db
from models import Pedido, Presupuesto, Cliente
from sqlalchemy.orm import joinedload

with app.app_context():
    print("=== PRUEBA DE RELACIONES ===")

    # Buscar un pedido con presupuesto_id
    pedido = Pedido.query.filter(Pedido.presupuesto_id.isnot(None)).first()
    if pedido:
        print(f"Pedido encontrado: {pedido.id}")
        print(f"presupuesto_id: {pedido.presupuesto_id}")
        print(f"self.presupuesto (sin joinedload): {pedido.presupuesto}")

        # Ahora con joinedload
        pedido_joined = Pedido.query.options(
            joinedload(Pedido.presupuesto).joinedload(Presupuesto.cliente)
        ).filter(Pedido.id == pedido.id).first()

        print(f"self.presupuesto (con joinedload): {pedido_joined.presupuesto}")

        if pedido_joined.presupuesto:
            print(f"presupuesto.numero: {pedido_joined.presupuesto.numero}")
            print(f"presupuesto.cliente: {pedido_joined.presupuesto.cliente}")

        # Verificar si existe el presupuesto en la BD
        pres = Presupuesto.query.get(pedido.presupuesto_id)
        print(f"Presupuesto directo: {pres}")
        if pres:
            print(f"Presupuesto.numero: {pres.numero}")
            print(f"Presupuesto.cliente: {pres.cliente}")
    else:
        print("No se encontró ningún pedido con presupuesto_id")
