@echo off
REM Alias: crear_copia_completa.bat -> create_restore_point_plus.bat
if exist create_restore_point_plus.bat (
  call create_restore_point_plus.bat %*
) else (
  echo No se encuentra create_restore_point_plus.bat
  pause
)
