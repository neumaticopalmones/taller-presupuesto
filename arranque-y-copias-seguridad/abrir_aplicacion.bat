@echo off
REM Alias: abrir_aplicacion.bat -> ejecuta run_app.bat
if exist run_app.bat (
  call run_app.bat
) else (
  echo No se encuentra run_app.bat
  pause
)
