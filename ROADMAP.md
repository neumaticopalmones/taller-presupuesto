# Hoja de ruta (CRM + Agenda + Flujo + Odoo)

## Objetivos
- Historial de clientes (timeline de interacciones y documentos)
- Agenda tipo calendario, editable y con acciones (pasar a factura/caja, etc.)
- Flujo: presupuesto → pedido → albarán → factura → contabilizado
- Integración con Odoo (partners, pedidos, facturas, albaranes)
- Seguridad básica, auditoría y tareas en segundo plano

## Fases
1) MVP Agenda + Historial
- Tablas: agenda_event, historial_cliente (Alembic)
- API: /agenda (GET por rango; POST/PUT), /clientes/{id}/historial (GET/POST)
- UI: FullCalendar (month/week/day), drag&drop, popover de acciones

2) Pedidos y flujo de trabajo
- Tabla pedido, estados y transiciones; vínculos con presupuesto
- UI Kanban por estado; acciones rápidas (convertir → albarán/factura)
- Export PDF y numeración por año

3) Integración Odoo (push)
- XML-RPC: res.partner, sale.order, account.move, stock.picking
- Tabla sync_external (idempotencia, errores, timestamps)
- Botón “Enviar a Odoo” con worker y reintentos

4) Integración Odoo (pull) + contabilidad
- Lectura de estados/facturas/albaranes para marcar “contabilizado”
- Conciliación mínima y notas de contabilidad

5) Seguridad y multiusuario
- JWT + roles (operador, admin)
- Auditoría de acciones y cambios de estado

## Modelo de datos (mínimo)
- agenda_event: id, cliente_id, related_type, related_id, titulo, descripcion, start, end, estado, action_required, assigned_to, timestamps
- historial_cliente: id, cliente_id, tipo (nota|llamada|doc|cambio_estado), payload(json), created_at, author
- pedido: id, numero, cliente_id, estado, totales, presupuesto_id, timestamps
- sync_external: id, local_type, local_id, external_system(odoo), external_model, external_id, status, last_error, updated_at

Índices sugeridos: (cliente_id), (start,end), (estado), FKs con ON UPDATE/DELETE restrict.

## Endpoints previstos
- GET /agenda?start=ISO&end=ISO
- POST /agenda, PUT /agenda/{id}, PATCH /agenda/{id}
- GET /clientes/{id}/historial, POST /clientes/{id}/historial
- CRUD /pedidos + POST /pedidos/{id}/accion (e.g., "pasar_a_factura")

## Integración con Odoo
- Variables .env: ODOO_URL, ODOO_DB, ODOO_USER, ODOO_PASSWORD
- XML-RPC: authenticate (common), execute_kw (object)
- Estrategia: push on-demand + reintentos; pull puntual para estados

## Infra y calidad
- Worker: Celery + Redis (servicios extra en docker-compose)
- Logs estructurados; correlación de request-id
- Healthchecks web/worker; métricas básicas
- Tests: unit (modelos/servicios) e integración (API y contratos Odoo mock)

## Mejoras de contenedor (opcional, recomendado)
- Servidor WSGI: gunicorn -w 2 -k gthread -t 60 -b 0.0.0.0:5000 app:app
- Healthcheck servicio web: consulta /health
- stop_grace_period: 30s para paradas limpias

## Sprint 1 (mañana): Agenda + Historial
- Migraciones: crear agenda_event e historial_cliente
- API: /agenda GET (por rango) y POST; /clientes/{id}/historial GET/POST
- UI: añadir vista Agenda con FullCalendar; listar historial en ficha de cliente
- Validación: pruebas mínimas de API y smoke test UI

## Notas
- Mantener numeración por año en nuevos documentos (pedido, etc.)
- Estados como máquina de estados (validar transiciones en backend)
- Idempotencia en integraciones mediante sync_external
