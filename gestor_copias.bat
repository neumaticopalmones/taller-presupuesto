@echo off
REM Alias: gestor_copias.bat -> abre menu de gestor_restore
if exist gestor_restore.bat (
  call gestor_restore.bat
) else (
  echo No se encuentra gestor_restore.bat
  pause
)
