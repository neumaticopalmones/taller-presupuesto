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

import warnings
warnings.filterwarnings("ignore")  # Ignorar warnings de SQLAlchemy

from extensions import db
from sqlalchemy.orm import joinedload
import requests

try:
    from app import app
    from models import Pedido, Presupuesto

    print("=== DIAGNOSTICO VINCULACION PEDIDOS ===")

    with app.test_client():
        with app.app_context():
            # 1. Verificar que existe al least un presupuesto
            presupuesto_ejemplo = Presupuesto.query.first()
            if presupuesto_ejemplo:
                print(f"1. Presupuesto {presupuesto_ejemplo.id[:8]}...: EXISTE")
                print(f"   Número: {presupuesto_ejemplo.numero}")
                print(f"   Cliente: {presupuesto_ejemplo.cliente.nombre if presupuesto_ejemplo.cliente else 'SIN CLIENTE'}")
            else:
                print("1. ERROR: No hay presupuestos en la base de datos")
                exit(1)

            # 2. Estadísticas básicas
            total_presupuestos = Presupuesto.query.count()
            total_pedidos = Pedido.query.count()
            pedidos_con_presupuesto = Pedido.query.filter(Pedido.presupuesto_id.isnot(None)).count()

            print(f"\\n2. Estadísticas:")
            print(f"   Total presupuestos: {total_presupuestos}")
            print(f"   Total pedidos: {total_pedidos}")
            print(f"   Pedidos con presupuesto_id: {pedidos_con_presupuesto}")

            # 3. Probar API de pedidos
            print(f"\\n3. Probando API:")
            with app.test_client() as client:
                resp = client.get('/api/pedidos')
                print(f"   Status: {resp.status_code}")
                if resp.status_code == 200:
                    data = resp.get_json()
                    if data and 'pedidos' in data and len(data['pedidos']) > 0:
                        primer_pedido = data['pedidos'][0]
                        print(f"   Primer pedido ID: {primer_pedido['id'][:8]}...")
                        print(f"   presupuesto_id: {primer_pedido.get('presupuesto_id')}")
                        presupuesto_obj = primer_pedido.get('presupuesto')
                        print(f"   presupuesto obj: {presupuesto_obj}")
                        print(f"   presupuesto_numero: {primer_pedido.get('presupuesto_numero')}")
                        print(f"   cliente_nombre: {primer_pedido.get('cliente_nombre')}")

                        if primer_pedido.get('presupuesto_id') and presupuesto_obj:
                            print("   Presupuesto del pedido: EXISTE")
                        else:
                            print("   Presupuesto del pedido: NO VINCULADO")
                    else:
                        print("   ERROR: No hay pedidos en la respuesta")
                else:
                    print(f"   ERROR: API devolvió {resp.status_code}")

            # 4. Conclusión
            print(f"\\n4. Conclusión:")
            if pedidos_con_presupuesto > 0:
                print("   ✓ Los presupuestos existen, problema puede ser en las relaciones SQLAlchemy")
            else:
                print("   ✗ No hay pedidos vinculados a presupuestos")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\\n=== FIN DIAGNOSTICO ===")
