from app import app, db
from models import Pedido, Presupuesto, Cliente
from sqlalchemy.orm import joinedload

with app.test_client():
    with app.app_context():
        print("=== DIAGNOTICO DE RELACIONES ===")

        # Primero obtener info básica
        total_pedidos = Pedido.query.count()
        pedidos_con_presupuesto = Pedido.query.filter(Pedido.presupuesto_id.isnot(None)).count()
        total_presupuestos = Presupuesto.query.count()

        print(f"Total pedidos: {total_pedidos}")
        print(f"Pedidos con presupuesto_id: {pedidos_con_presupuesto}")
        print(f"Total presupuestos: {total_presupuestos}")

        # Buscar un pedido específico que sabemos tiene presupuesto
        pedido = Pedido.query.filter(
            Pedido.presupuesto_id == "780953f3-27e5-4657-9c01-243e9a969639"
        ).first()
        if pedido:
            print(f"\nPedido específico encontrado: {pedido.id[:8]}...")
            print(f"presupuesto_id: {pedido.presupuesto_id}")

            # Verificar si el presupuesto existe
            pres = Presupuesto.query.get(pedido.presupuesto_id)
            if pres:
                print(f"✓ Presupuesto existe: numero={pres.numero}")
                cli = pres.cliente
                if cli:
                    print(f"✓ Cliente existe: nombre={cli.nombre}")
                else:
                    print("✗ Cliente no encontrado")
            else:
                print("✗ Presupuesto NO existe en la BD")

            # Probar la relación lazy
            print(f"pedido.presupuesto (lazy): {pedido.presupuesto}")

            # Probar con joinedload
            pedido_joined = (
                Pedido.query.options(joinedload(Pedido.presupuesto).joinedload(Presupuesto.cliente))
                .filter(Pedido.id == pedido.id)
                .first()
            )

            print(f"pedido_joined.presupuesto: {pedido_joined.presupuesto}")

            # Probar el método to_dict_custom
            print("\n=== PROBANDO to_dict_custom ===")
            result = pedido_joined.to_dict_custom()
            print(f"Resultado presupuesto: {result.get('presupuesto')}")

        else:
            print("No se encontró el pedido específico")

            # Buscar cualquier pedido con presupuesto
            any_pedido = Pedido.query.filter(Pedido.presupuesto_id.isnot(None)).first()
            if any_pedido:
                print(f"Pedido alternativo: {any_pedido.id[:8]}")
                print(f"presupuesto_id: {any_pedido.presupuesto_id}")
                pres = Presupuesto.query.get(any_pedido.presupuesto_id)
                print(f"Presupuesto existe: {pres is not None}")
