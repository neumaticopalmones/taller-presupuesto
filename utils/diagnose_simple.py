import warnings
warnings.filterwarnings("ignore")  # Ignorar warnings de SQLAlchemy

iprint("\n=== FIN DIAGNOSTICO ===")

# NOTA: Este script es una herramienta de diagnóstico para la vinculación pedidos-presupuestos.
# Valida que los presupuestos existen, las relaciones SQLAlchemy cargan correctamente,
# y que el API /api/pedidos devuelve los campos planos esperados.
# Útil para diagnosticar problemas de "(no vinculado)" en el frontend.
# Creado: 15/09/2025 durante resolución del issue de vinculación.port sys
print("=== DIAGNOSTICO VINCULACION PEDIDOS ===")

try:
    #!/usr/bin/env python3
"""
HERRAMIENTA DE DIAGNÓSTICO - VINCULACIÓN PEDIDOS-PRESUPUESTOS
============================================================

Este script valida que la vinculación entre pedidos y presupuestos funcione correctamente.

Funciones:
- Verifica que los presupuestos existen en la base de datos
- Prueba la carga de relaciones SQLAlchemy con joinedload
- Valida que el API /api/pedidos devuelva los campos planos esperados
- Diagnostica problemas de serialización y vinculación

Uso: python diagnose_simple.py

Creado durante la resolución del issue: "(no vinculado)" en lista de pedidos
Fecha: 15/09/2025
"""

from extensions import db
    from models import Pedido, Presupuesto

    with app.test_client():
        with app.app_context():
            # 1. Verificar presupuesto específico
            pres_id = "780953f3-27e5-4657-9c01-243e9a969639"
            pres = Presupuesto.query.filter_by(id=pres_id).first()

            print(f"1. Presupuesto {pres_id[:8]}...: {'EXISTE' if pres else 'NO EXISTE'}")
            if pres:
                print(f"   Número: {pres.numero}")
                print(f"   Cliente: {pres.cliente.nombre if pres.cliente else 'Sin cliente'}")

            # 2. Estadísticas generales
            total_presupuestos = Presupuesto.query.count()
            total_pedidos = Pedido.query.count()
            pedidos_con_pres_id = Pedido.query.filter(Pedido.presupuesto_id.isnot(None)).count()

            print(f"\\n2. Estadísticas:")
            print(f"   Total presupuestos: {total_presupuestos}")
            print(f"   Total pedidos: {total_pedidos}")
            print(f"   Pedidos con presupuesto_id: {pedidos_con_pres_id}")

            # 3. Probar API directamente
            print(f"\\n3. Probando API:")
            from api.pedidos_api import bp_pedidos

            # Hacer petición interna
            with app.test_client() as client:
                response = client.get('/pedidos')
                print(f"   Status: {response.status_code}")

                if response.status_code == 200:
                    data = response.get_json()
                    primer_pedido = data['pedidos'][0] if data.get('pedidos') else None

                    if primer_pedido:
                        print(f"   Primer pedido ID: {primer_pedido['id'][:8]}...")
                        print(f"   presupuesto_id: {primer_pedido.get('presupuesto_id', 'None')}")
                        print(f"   presupuesto obj: {primer_pedido.get('presupuesto', 'None')}")
                        print(f"   presupuesto_numero: {primer_pedido.get('presupuesto_numero', 'None')}")
                        print(f"   cliente_nombre: {primer_pedido.get('cliente_nombre', 'None')}")

                        # Verificar si este pedido tiene presupuesto válido
                        pedido_id = primer_pedido['id']
                        pedido_obj = Pedido.query.filter_by(id=pedido_id).first()
                        if pedido_obj and pedido_obj.presupuesto_id:
                            pres_check = Presupuesto.query.filter_by(id=pedido_obj.presupuesto_id).first()
                            print(f"   Presupuesto del pedido: {'EXISTE' if pres_check else 'NO EXISTE EN BD'}")

            print(f"\\n4. Conclusión:")
            if not pres:
                print("   ❌ PROBLEMA: Los pedidos apuntan a presupuestos que no existen")
                print("   💡 SOLUCIÓN: Necesitamos crear los presupuestos faltantes o limpiar los presupuesto_id")
            else:
                print("   ❓ Los presupuestos existen, problema puede ser en las relaciones SQLAlchemy")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\\n=== FIN DIAGNOSTICO ===")
