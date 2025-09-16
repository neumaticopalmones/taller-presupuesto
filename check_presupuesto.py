import sys
sys.path.append(".")
from app import app
from models import Presupuesto

# Verificar presupuesto específico
with app.app_context():
    pres_id = "780953f3-27e5-4657-9c01-243e9a969639"
    pres = Presupuesto.query.get(pres_id)

    if pres:
        print(f"✓ Presupuesto encontrado")
        print(f"  ID: {pres.id}")
        print(f"  Número: {pres.numero}")
        print(f"  Cliente: {pres.cliente}")
        if pres.cliente:
            print(f"  Cliente nombre: {pres.cliente.nombre}")
    else:
        print("✗ Presupuesto NO encontrado")

        # Buscar si hay algún presupuesto
        any_pres = Presupuesto.query.first()
        if any_pres:
            print(f"Hay presupuestos en la BD. Ejemplo: {any_pres.id}")
        else:
            print("No hay presupuestos en la BD")
