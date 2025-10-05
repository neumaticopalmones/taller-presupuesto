# Frontend Angular (frontend-ng)

Este directorio alojará la nueva app Angular.

## Crear el proyecto Angular

Requisitos: Node 18+ y Angular CLI instalado globalmente.

1. Instala Angular CLI (una sola vez):

```powershell
npm i -g @angular/cli
```

2. Crea el proyecto dentro de `frontend-ng/`:

```powershell
cd frontend-ng
ng new app --routing --style=css --skip-git
```

3. Arranca en modo desarrollo:

```powershell
cd app
npm start
# o
ng serve --open --port 4200
```

La API del backend sigue en http://localhost:5000.

## Próximos pasos

- Integrar Tailwind
- Crear servicios para llamar a la API existente
- Migrar vistas prioritarias
