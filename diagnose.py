import sys
print("Iniciando diagnóstico...")

try:
    from app import app
    print("App importada correctamente")

    with app.test_client() as client:
        print("Test client creado")

        with app.app_context():
            print("App context iniciado")

            from models import Pedido, Presupuesto
            from app import db
            print("Modelos importados")

            # Verificar presupuesto específico
            pres_id = "780953f3-27e5-4657-9c01-243e9a969639"
            pres = db.session.get(Presupuesto, pres_id)  # Usar método moderno

            if pres:
                print(f"✓ Presupuesto {pres_id[:8]}... EXISTE")
                print(f"  Número: {pres.numero}")
            else:
                print(f"✗ Presupuesto {pres_id[:8]}... NO EXISTE")

                # Contar presupuestos
                total_pres = Presupuesto.query.count()
                print(f"  Total presupuestos en BD: {total_pres}")

                if total_pres > 0:
                    primer_pres = Presupuesto.query.first()
                    print(f"  Primer presupuesto: {primer_pres.id[:8]}... número: {primer_pres.numero}")

            # Hacer una petición real a la API
            print("\n=== PROBANDO API ===")
            response = client.get('/pedidos')
            print(f"Status: {response.status_code}")

            if response.status_code == 200:
                data = response.get_json()
                first_pedido = data['pedidos'][0] if data.get('pedidos') else None
                if first_pedido:
                    print(f"Primer pedido:")
                    print(f"  presupuesto_id: {first_pedido.get('presupuesto_id')}")
                    print(f"  presupuesto: {first_pedido.get('presupuesto')}")
                    print(f"  presupuesto_numero: {first_pedido.get('presupuesto_numero')}")
                    print(f"  cliente_nombre: {first_pedido.get('cliente_nombre')}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

print("Diagnóstico completado")
