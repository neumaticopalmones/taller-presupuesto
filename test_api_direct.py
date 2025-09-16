#!/usr/bin/env python3

import urllib.request
import json

def test_api():
    try:
        print("=== TESTING API PEDIDOS ===")
        url = "http://localhost:5000/pedidos?page=1&per_page=3"

        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())

        print(f"Status Code: {response.status}")
        print(f"Total pedidos: {data.get('total', 0)}")

        if data.get('pedidos'):
            for i, pedido in enumerate(data['pedidos'][:3]):
                print(f"\nPedido {i}:")
                print(f"  ID: {pedido.get('id', '')[:8]}...")
                print(f"  presupuesto_id: {pedido.get('presupuesto_id')}")
                print(f"  presupuesto object: {pedido.get('presupuesto')}")
                print(f"  presupuesto_numero: {pedido.get('presupuesto_numero')}")
                print(f"  cliente_nombre: {pedido.get('cliente_nombre')}")
                print(f"  Keys: {sorted(list(pedido.keys()))}")
        else:
            print("No hay pedidos en la respuesta")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
