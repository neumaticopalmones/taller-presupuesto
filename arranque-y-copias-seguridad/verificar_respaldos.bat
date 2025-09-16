@echo off
setlocal ENABLEDELAYEDEXPANSION
REM ======================================================
REM verificar_respaldos.bat
REM Verifica la integridad y disponibilidad de los puntos de restauración
REM ======================================================

echo =====================================
echo   VERIFICACION DE RESPALDOS
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

echo Verificando respaldos disponibles...
echo.

REM Contar tags de respaldo
set /a TAG_COUNT=0
for /f "delims=" %%i in ('git tag --list "ok-*"') do set /a TAG_COUNT+=1

echo [INFO] Puntos de restauracion encontrados: %TAG_COUNT%

if %TAG_COUNT% EQU 0 (
  echo [ADVERTENCIA] No hay puntos de restauracion creados.
  echo Ejecuta 'crear_copia_completa.bat' para crear el primero.
  pause & exit /b 0
)

echo.
echo ===== ULTIMOS 10 RESPALDOS =====
git for-each-ref --sort=-creatordate --format='%%(refname:short) - %%(subject)' refs/tags/ok-* | head -n 10

echo.
echo ===== VERIFICACION DE INTEGRIDAD =====

REM Verificar que cada tag tenga su rama asociada
set /a MISSING_BRANCHES=0
for /f "delims=" %%t in ('git tag --list "ok-*"') do (
  set TAG=%%t
  set BRANCH_NAME=estables/!TAG:ok-=!-ok
  git rev-parse -q --verify !BRANCH_NAME! >nul 2>&1 || (
    echo [AVISO] Rama !BRANCH_NAME! no encontrada para tag !TAG!
    set /a MISSING_BRANCHES+=1
  )
)

if %MISSING_BRANCHES% GTR 0 (
  echo [ADVERTENCIA] %MISSING_BRANCHES% ramas asociadas no encontradas.
) else (
  echo [OK] Todas las ramas asociadas están presentes.
)

echo.
echo ===== ESPACIO Y ESTADISTICAS =====
echo Espacio del repositorio:
git count-objects -vH

echo.
echo Ramas locales relacionadas con respaldos:
git branch --list "estables/*" "restore/*" | head -n 10

echo.
echo ===== RESPALDO MAS RECIENTE =====
for /f "delims=" %%t in ('git for-each-ref --sort=-creatordate --format="%%(refname:short)" refs/tags/ok-* | head -n 1') do set LATEST_TAG=%%t

if defined LATEST_TAG (
  echo Tag mas reciente: %LATEST_TAG%
  git show --stat %LATEST_TAG%

  echo.
  echo ¿Diferencias desde el ultimo respaldo?
  git diff --stat %LATEST_TAG%..HEAD
  if errorlevel 1 (
    echo [INFO] Hay cambios desde el ultimo respaldo.
  ) else (
    echo [INFO] No hay cambios desde el ultimo respaldo.
  )
)

echo.
echo ===== RECOMENDACIONES =====
for /f "usebackq delims=" %%d in (`powershell -NoProfile -Command "(Get-Date).AddDays(-7).ToString('yyyyMMdd')"`) do set WEEK_AGO=%%d

git tag --list "ok-%WEEK_AGO%*" >nul 2>&1 || (
  echo [RECOMENDACION] No hay respaldos de la ultima semana.
  echo Considera crear uno con: crear_copia_completa.bat
)

echo.
echo Verificacion completada.
pause
endlocal
