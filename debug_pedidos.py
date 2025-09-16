#!/usr/bin/env python3

from app import app
from models import db, Pedido, Presupuesto, Cliente
from sqlalchemy.orm import joinedload

def debug_pedidos():
    with app.app_context():
        print("=== DEBUGGING PEDIDOS ===")

        # 1. Test basic query
        print("\n1. Basic pedidos query:")
        pedidos_basic = Pedido.query.limit(3).all()
        for p in pedidos_basic:
            print(f"  Pedido {p.id[:8]}... presupuesto_id: {p.presupuesto_id}")

        # 2. Test with joinedload
        print("\n2. Pedidos with joinedload:")
        pedidos_joined = (
            Pedido.query
            .options(joinedload(Pedido.presupuesto).joinedload(Presupuesto.cliente))
            .limit(3)
            .all()
        )

        for p in pedidos_joined:
            print(f"  Pedido {p.id[:8]}...")
            print(f"    presupuesto_id: {p.presupuesto_id}")
            print(f"    presupuesto object: {p.presupuesto}")
            if p.presupuesto:
                print(f"    presupuesto.numero: {p.presupuesto.numero}")
                print(f"    presupuesto.cliente: {p.presupuesto.cliente}")
                if p.presupuesto.cliente:
                    print(f"    cliente.nombre: {p.presupuesto.cliente.nombre}")

        # 3. Test to_dict method
        print("\n3. Testing to_dict method:")
        if pedidos_joined:
            p = pedidos_joined[0]
            print(f"  Testing pedido {p.id[:8]}...")
            try:
                result = p.to_dict()
                print(f"  to_dict result keys: {list(result.keys())}")
                print(f"  presupuesto_numero: {result.get('presupuesto_numero')}")
                print(f"  cliente_nombre: {result.get('cliente_nombre')}")
                print(f"  presupuesto object: {result.get('presupuesto')}")
            except Exception as e:
                print(f"  ERROR in to_dict: {e}")

if __name__ == "__main__":
    debug_pedidos()
