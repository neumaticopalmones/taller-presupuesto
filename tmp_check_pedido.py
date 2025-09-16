from app import app
from extensions import db
from models import Cliente, Presupuesto, Pedido
from datetime import date
import uuid, json

with app.app_context():
    c = Cliente(nombre='Cliente Demo3', telefono='622222222', nif='Z1234567')
    db.session.add(c); db.session.commit()
    pres = Presupuesto(id=str(uuid.uuid4()), numero='TEST-PED-3', fecha=date.today(), cliente_id=c.id, vista_cliente={'grupos':[], 'totalGeneral':0}, vista_interna={})
    db.session.add(pres); db.session.commit()
    ped = Pedido(presupuesto_id=pres.id, medida='215/60R16', marca='MarcaZ', unidades=2, descripcion='Par', proveedor='ProveedorDemo')
    db.session.add(ped); db.session.commit()
    print(json.dumps(ped.to_dict(), ensure_ascii=False, indent=2))
