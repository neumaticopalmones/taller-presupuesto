@echo off
REM Alias: respaldo_completo.bat -> backup_completo.bat
echo =====================================
echo   RESPALDO COMPLETO DE APLICACION
echo =====================================
if exist backup_completo.bat (
  call backup_completo.bat %*
) else (
  echo No se encuentra backup_completo.bat
  pause
)
