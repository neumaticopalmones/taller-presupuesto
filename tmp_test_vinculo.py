from app import app, db
from models import Cliente, Presupuesto
from datetime import date
import uuid, json

with app.app_context():
    cli = Cliente(nombre='Test Cliente Vinc', telefono='600111222')
    db.session.add(cli); db.session.commit()
    numero = 'TEST-VINC-' + str(uuid.uuid4())[:8]
    pres = Presupuesto(numero=numero, fecha=date.today(), cliente_id=cli.id, vista_cliente={}, vista_interna={})
    db.session.add(pres); db.session.commit()
    print('Presupuesto creado:', pres.id, pres.numero)

    c = app.test_client()
    payload = {
        'medida':'205/55/16','marca':'MarcaX','unidades':2,
        'proveedor':'ProvDemo','descripcion':'Pedido prueba vinc',
        'presupuesto_id': pres.id,'linea_ref':'manual'
    }
    res = c.post('/pedidos', json=payload)
    print('POST /pedidos status:', res.status_code)
    print('Respuesta creación keys:', sorted(res.json.keys()))
    print('Presupuesto en creación:', res.json.get('presupuesto'))

    lst = c.get('/pedidos')
    data = lst.json
    print('LIST /pedidos status:', lst.status_code, 'total:', data.get('total'))
    first = data['pedidos'][0]
    print('Primer pedido presupuesto:', first.get('presupuesto'))
    print('Campos planos:', first.get('presupuesto_numero'), first.get('cliente_nombre'), first.get('cliente_telefono'))

    # Dump JSON para inspección manual
    print('\nJSON completo primer pedido:')
    print(json.dumps(first, indent=2, ensure_ascii=False))
