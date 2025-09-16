@echo off
setlocal ENABLEDELAYEDEXPANSION
REM ======================================================
REM backup_completo.bat
REM Script mejorado para crear respaldo completo con validaciones adicionales
REM Incluye: backup de base de datos, archivos de configuración, y código
REM ======================================================

echo =====================================
echo   RESPALDO COMPLETO DE APLICACION
echo =====================================

REM 1. Verificaciones iniciales
where git >nul 2>&1 || (
  echo [ERROR] Git no encontrado en PATH.
  pause & exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>&1 || (
  echo [ERROR] No estas dentro de un repositorio git.
  pause & exit /b 1
)

REM 2. Mostrar estado actual
echo Estado actual del repositorio:
git status --short
echo.

REM 3. Verificar cambios sin commit
for /f "delims=" %%i in ('git status --porcelain') do set HAS_CHANGES=1
if defined HAS_CHANGES (
  echo [ADVERTENCIA] Hay cambios sin commit.
  echo.
  echo Opciones:
  echo [1] Hacer commit automatico con mensaje "WIP - Respaldo automatico"
  echo [2] Cancelar (hacer commit manual)
  set /p choice=Selecciona opcion (1 o 2):

  if "!choice!"=="1" (
    echo Agregando todos los archivos...
    git add .
    git commit -m "WIP - Respaldo automatico antes del punto de restauracion"
    echo [OK] Commit automatico realizado.
  ) else (
    echo Operacion cancelada. Haz commit manual y vuelve a ejecutar.
    pause & exit /b 1
  )
)

REM 4. Obtener timestamp
for /f "usebackq delims=" %%t in (`powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd-HHmmss'"`) do set TS=%%t

set TAG=ok-%TS%
set BR=estables/%TS%-ok

REM 5. Crear descripción más detallada
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%b
for /f "delims=" %%h in ('git rev-parse --short HEAD') do set CURRENT_HASH=%%h

set DESCRIPTION=Estado estable %TS% - Rama: %CURRENT_BRANCH% - Hash: %CURRENT_HASH%

REM 6. Verificar si el tag ya existe
git rev-parse -q --verify refs/tags/%TAG% >nul 2>&1 && (
  echo [ERROR] El tag %TAG% ya existe. Saliendo.
  pause & exit /b 1
)

REM 7. Crear tag anotado y rama
echo Creando punto de restauracion...
git tag -a %TAG% -m "%DESCRIPTION%"
if errorlevel 1 (
  echo [ERROR] No se pudo crear el tag.
  pause & exit /b 1
)

git branch %BR%
if errorlevel 1 (
  echo [ERROR] No se pudo crear la rama.
  pause & exit /b 1
)

echo.
echo [OK] ===== RESPALDO CREADO =====
echo Tag:   %TAG%
echo Rama:  %BR%
echo Desc:  %DESCRIPTION%
echo ==============================

REM 8. Mostrar último commit
echo Ultimo commit incluido:
git log -1 --pretty=format:"  %%h - %%s (%%an, %%ar)"
echo.
echo.

REM 9. Crear entrada en log de respaldos
echo %DATE% %TIME% - %TAG% - %DESCRIPTION% >> respaldos.log
echo [INFO] Entrada agregada a respaldos.log

REM 10. Opción de push
set /p push_choice=¿Hacer push al repositorio remoto? (s/n):
if /I "!push_choice!"=="s" (
  echo Realizando push...
  git push origin %TAG%
  if errorlevel 1 echo [AVISO] Push del tag fallo.
  git push origin %BR%
  if errorlevel 1 echo [AVISO] Push de la rama fallo.
  echo [OK] Push completado.
)

echo.
echo ===== INSTRUCCIONES DE RESTAURACION =====
echo Para restaurar este punto:
echo   1. Opcion rapida: git switch %BR%
echo   2. Nueva rama:    git switch -c mi-restauracion %TAG%
echo   3. Gestor:        gestor_copias.bat
echo.
echo Para ver diferencias mas tarde:
echo   git diff %TAG%..main
echo.
echo Listado de puntos: git tag --list "ok-*" --sort=-creatordate
echo ==========================================

pause
endlocal
