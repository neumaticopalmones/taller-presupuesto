Puntos de restauración (estados que funcionan)

- 2025-08-30 19:00 — tag: ok-20250830-1900 — rama: estables/2025-08-30-1900-ok — Descripción: Estado estable local antes de cambios de la noche. 

Cómo volver a un punto:
- En VS Code Terminal (PowerShell):
  - git switch estables/2025-08-30-1900-ok
  - o: git switch -c restore/desde-ok-20250830-1900 ok-20250830-1900

Cómo crear un nuevo punto:
- Ejecuta el script create_restore_point.bat o usa manual:
  - set TS=$(Get-Date -Format 'yyyyMMdd-HHmmss')
  - git tag -a ok-%TS% -m "Estado estable local %TS%"
  - git branch estables/%TS%-ok
