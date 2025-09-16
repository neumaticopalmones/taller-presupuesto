#!/usr/bin/env python3

# Ejecutar: python diagnostic_cmd.py

exec("""
from app import app, db
from models import Pedido, Presupuesto, Cliente
from sqlalchemy.orm import joinedload

with app.test_client():
    with app.app_context():
        print("=== DIAGNOSTICO DE RELACIONES ===")

        # Información básica
        total_pedidos = Pedido.query.count()
        pedidos_con_presupuesto = Pedido.query.filter(Pedido.presupuesto_id.isnot(None)).count()
        total_presupuestos = Presupuesto.query.count()

        print(f"Total pedidos: {total_pedidos}")
        print(f"Pedidos con presupuesto_id: {pedidos_con_presupuesto}")
        print(f"Total presupuestos: {total_presupuestos}")

        # Buscar el pedido específico que vimos en las pruebas
        pedido = Pedido.query.filter(Pedido.presupuesto_id == "780953f3-27e5-4657-9c01-243e9a969639").first()
        if pedido:
            print(f"\\nPedido encontrado: {pedido.id[:8]}...")
            print(f"presupuesto_id: {pedido.presupuesto_id}")

            # Verificar si el presupuesto existe directamente
            pres = Presupuesto.query.get(pedido.presupuesto_id)
            if pres:
                print(f"✓ Presupuesto existe: {pres.numero}")
                if pres.cliente:
                    print(f"✓ Cliente existe: {pres.cliente.nombre}")
                else:
                    print("✗ Cliente no encontrado")
            else:
                print("✗ ERROR: Presupuesto NO existe")

            # Probar relación sin joinedload
            print(f"\\nRelación lazy: {pedido.presupuesto}")

            # Probar con joinedload
            pedido_joined = Pedido.query.options(
                joinedload(Pedido.presupuesto).joinedload(Presupuesto.cliente)
            ).filter(Pedido.id == pedido.id).first()

            print(f"Con joinedload: {pedido_joined.presupuesto}")

            # Probar to_dict_custom
            print("\\n=== PROBANDO to_dict_custom ===")
            result = pedido_joined.to_dict_custom()
            print(f"Campo presupuesto: {result.get('presupuesto')}")
            print(f"Campo presupuesto_numero: {result.get('presupuesto_numero')}")
            print(f"Campo cliente_nombre: {result.get('cliente_nombre')}")
        else:
            print("\\nNo se encontró el pedido específico")
""")
