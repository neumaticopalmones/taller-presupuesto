@echo off
REM Alias: restaurar_desde_copia.bat -> restore_from_point.bat
if "%1"=="" (
  echo Uso: restaurar_desde_copia.bat ok-YYYYMMDD-HHMMSS [nueva-rama]
  echo Ejemplo: restaurar_desde_copia.bat ok-20250914-120500 prueba-fix
  echo Lista de tags:
  git tag --list "ok-*" --sort=-creatordate | head -n 10
  pause
  exit /b 0
)
if exist restore_from_point.bat (
  call restore_from_point.bat %*
) else (
  echo No se encuentra restore_from_point.bat
  pause
)
