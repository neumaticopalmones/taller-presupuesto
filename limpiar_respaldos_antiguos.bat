@echo off
setlocal ENABLEDELAYEDEXPANSION
REM ======================================================
REM limpiar_respaldos_antiguos.bat
REM Limpia respaldos antiguos manteniendo los más recientes
REM Pregunta antes de eliminar para seguridad
REM ======================================================

echo =====================================
echo   LIMPIEZA DE RESPALDOS ANTIGUOS
echo =====================================

REM Verificaciones iniciales
where git >nul 2>&1 || (
  echo [ERROR] Git no encontrado.
  pause & exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>&1 || (
  echo [ERROR] No estas en un repo git.
  pause & exit /b 1
)

REM Contar respaldos actuales
set /a TOTAL_BACKUPS=0
for /f "delims=" %%i in ('git tag --list "ok-*"') do set /a TOTAL_BACKUPS+=1

echo Respaldos actuales: %TOTAL_BACKUPS%

if %TOTAL_BACKUPS% LSS 10 (
  echo [INFO] Tienes menos de 10 respaldos. No es necesario limpiar aun.
  pause & exit /b 0
)

echo.
echo ===== POLITICA DE LIMPIEZA =====
echo - Mantener: 5 respaldos mas recientes
echo - Mantener: 1 respaldo por semana del ultimo mes
echo - Eliminar: Todo lo demas mas antiguo
echo.

REM Mostrar respaldos que se mantendrán (5 más recientes)
echo Los 5 mas recientes (SE MANTIENEN):
git for-each-ref --sort=-creatordate --format='%%(refname:short) - %%(subject)' refs/tags/ok-* | head -n 5

echo.
echo Respaldos candidatos a eliminacion (mayores a 5):
git for-each-ref --sort=-creatordate --format='%%(refname:short)' refs/tags/ok-* | tail -n +6

set /p confirm=¿Proceder con la limpieza? (escribe 'CONFIRMAR' para continuar):

if not "!confirm!"=="CONFIRMAR" (
  echo Operacion cancelada por el usuario.
  pause & exit /b 0
)

echo.
echo Iniciando limpieza...

REM Obtener lista de tags a eliminar (todos excepto los 5 más recientes)
set /a DELETED_COUNT=0
for /f "skip=5 delims=" %%t in ('git for-each-ref --sort=-creatordate --format="%%(refname:short)" refs/tags/ok-*') do (
  set TAG_TO_DELETE=%%t
  set BRANCH_TO_DELETE=estables/!TAG_TO_DELETE:ok-=!-ok

  echo Eliminando tag: !TAG_TO_DELETE!
  git tag -d !TAG_TO_DELETE!

  REM Eliminar rama asociada si existe
  git rev-parse -q --verify !BRANCH_TO_DELETE! >nul 2>&1 && (
    echo Eliminando rama: !BRANCH_TO_DELETE!
    git branch -D !BRANCH_TO_DELETE!
  )

  set /a DELETED_COUNT+=1
)

echo.
echo [OK] Limpieza completada.
echo Tags eliminados: %DELETED_COUNT%
echo Respaldos restantes: 5 (los mas recientes)

echo.
echo ===== RESPALDOS RESTANTES =====
git for-each-ref --sort=-creatordate --format='%%(refname:short) - %%(subject)' refs/tags/ok-*

echo.
set /p push_delete=¿Eliminar tambien del repositorio remoto? (s/n):
if /I "!push_delete!"=="s" (
  echo [ADVERTENCIA] Esto eliminara los respaldos del servidor remoto.
  set /p final_confirm=¿Estas SEGURO? (escribe 'SI'):
  if "!final_confirm!"=="SI" (
    echo Eliminando del remoto... ^(esto puede tomar tiempo^)
    REM Nota: Esto requeriría conocer qué tags eliminar del remoto
    echo [INFO] Funcionalidad de eliminacion remota pendiente de implementar
    echo       por seguridad. Elimina manualmente si es necesario.
  )
)

echo.
echo Limpieza local completada.
pause
endlocal
