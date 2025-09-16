# Backlog Futuro

Lista viva de mejoras y evoluciones pendientes. Marca con [x] al completar.

## 🎯 TAREAS PARA MAÑANA (Prioridad máxima)

**📅 Programado para: 17 de septiembre de 2025**

- [ ] (P1) **LIMPIEZA GENERAL**: Limpiar y ordenar la carpeta y aplicación - Eliminar archivos innecesarios - Quitar código obsoleto que no sirve - Reorganizar estructura de ficheros si es necesario

- [ ] (P1) **MEJORAS VISUALES**: Revisar la parte visual y mejorarla - Revisar interfaz de usuario actual - Identificar elementos visuales a mejorar - Aplicar mejoras de UX/UI

- [ ] (P1) **FUNCIONALIDAD STOCK**: Empezar con la parte del stock - Analizar requisitos de gestión de inventario - Diseñar estructura para control de stock - Implementar funcionalidad básica de stock

---

## Leyenda Prioridad (orientativa)

- P1: Rápido / Alto valor
- P2: Medio
- P3: Más complejo / Depende de otros

## Backlog

- [ ] (P1) Filtro fechas en /stats
      Extender `/stats` con `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD` para conteos en rango.
- [ ] (P1) Cache simple /stats
      Cache 30s en Redis para reducir consultas repetidas.
- [ ] (P2) Exportaciones PDF/Excel
      Endpoint para descargar presupuestos (PDF con ReportLab, Excel con openpyxl).
- [ ] (P2) Autenticación básica
      JWT o token simple para proteger POST/PUT/DELETE.
- [ ] (P2) Roles y permisos
      Rol admin vs lectura; integrar con autenticación.
- [ ] (P1) Búsqueda avanzada
      Filtros: `cliente`, `desde`, `hasta`, `orden=fecha_desc` en `/presupuestos`.
- [ ] (P2) OpenAPI/Swagger
      Documentación automática (flasgger o flask-smorest).
- [ ] (P2) Métricas Prometheus
      Exponer `/metrics` (prometheus_client).
- [ ] (P2) Alertas errores
      Integrar Sentry para capturar excepciones.
- [ ] (P1) Índices BD
      Índices en `presupuesto(fecha)` y `presupuesto(cliente_id)`.
- [ ] (P2) Pruebas cobertura
      Aumentar cobertura >70% (CRUD completo, errores, /stats, paginación).
- [ ] (P2) Pipeline CI
      GitHub Actions: lint + tests + build imagen Docker.
- [ ] (P2) Backups automáticos
      Script/tarea `pg_dump` diario + rotación N días.
- [ ] (P3) Rate limit por rol
      Límites diferenciados usuarios autenticados vs anónimos.
- [ ] (P2) Refactor frontend estado
      Unificar gestión de errores, loading, render y mensajes.
- [ ] (P3) Paginación eficiente
      Paginación por cursor (id) para listas grandes.
- [ ] (P3) Soporte multimoneda
      Campo moneda + tabla tipos de cambio.
- [ ] (P3) Histórico cambios
      Auditoría de modificaciones (tabla versiones presupuestos).
- [ ] (P2) Notificaciones email
      Correo al crear/actualizar (SMTP configurable).
- [ ] (P1) Script restore rápido
      Automatizar restauración basada en puntos creados.

## Sugerencia de Primer Bloque

1. Cache /stats
2. Filtro fechas /stats
3. Búsqueda avanzada
4. Índices BD
5. Pipeline CI

## Cómo Actualizar

Editar este archivo y hacer commit:

```
git add BACKLOG.md
git commit -m "update: progreso backlog"
git push
```

## Notas

- Reevalúa prioridades tras cada entrega.
- Mover a Issues si necesitas comentarios/historial.
