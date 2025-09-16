@echo off
setlocal ENABLEDELAYEDEXPANSION
REM ======================================================
REM gestor_restore.bat
REM Menu unificado para:
REM   1) Crear punto de restauracion (tag + rama)
REM   2) Listar puntos existentes
REM   3) Restaurar a partir de un tag
REM   4) Push de un tag y su rama asociada
REM   5) Salir
REM Requiere: Git y PowerShell disponibles en PATH.
REM ======================================================

where git >nul 2>&1 || (echo [ERROR] Git no encontrado.& pause & exit /b 1)

git rev-parse --is-inside-work-tree >nul 2>&1 || (echo [ERROR] No estas en un repo git.& pause & exit /b 1)

:menu
echo =============================================
echo   GESTOR PUNTOS DE RESTAURACION
set BRANCH=
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%b
echo   Rama actual: %BRANCH%
echo =============================================
echo  [1] Crear punto (tag+rama)
echo  [2] Listar puntos (tags ok-*)
echo  [3] Restaurar desde tag
echo  [4] Push de tag y rama asociada
echo  [5] Salir
echo ---------------------------------------------
set /p opt=Selecciona opcion:

if "%opt%"=="1" goto crear
if "%opt%"=="2" goto listar
if "%opt%"=="3" goto restaurar
if "%opt%"=="4" goto push
if "%opt%"=="5" goto fin
echo Opcion invalida.
cls
goto menu

:crear
for /f "delims=" %%i in ('git status --porcelain') do set DIRTY=1
if defined DIRTY (
  echo [ADVERTENCIA] Cambios sin commit. Haz commit antes de crear el punto.
  pause
  set DIRTY=
  cls & goto menu
)
for /f "usebackq delims=" %%t in (`powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd-HHmmss'"`) do set TS=%%t
set TAG=ok-%TS%
set RBR=estables/%TS%-ok

git rev-parse -q --verify refs/tags/%TAG% >nul 2>&1 && (
  echo [ERROR] Tag %TAG% ya existe.
  pause & cls & goto menu
)

git tag -a %TAG% -m "Estado estable local %TS%"
if errorlevel 1 (echo [ERROR] Fallo creando tag.& pause & cls & goto menu)

git branch %RBR%
if errorlevel 1 (echo [ERROR] Fallo creando rama.& pause & cls & goto menu)

echo [OK] Creado tag %TAG% y rama %RBR%
echo Ultimo commit:
call git log -1 --oneline
echo.
pause
cls & goto menu

:listar
echo Ultimos 15 tags ok-* (orden cronologico inverso):
git for-each-ref --sort=-creatordate --format='%%(refname:short)' refs/tags/ok-* | head -n 15

echo.
pause
cls & goto menu

:restaurar
set TAG=
set /p TAG=Introduce tag (ej: ok-20250914-120500):
if "%TAG%"=="" (echo Tag vacio.& pause & cls & goto menu)

git rev-parse -q --verify refs/tags/%TAG% >nul 2>&1 || (
  echo [ERROR] Tag no existe.
  pause & cls & goto menu
)
for /f "delims=" %%i in ('git status --porcelain') do set DIRTY=1
if defined DIRTY (
  echo [ADVERTENCIA] Cambios sin commit. Cancela o haz commit/stash.
  set DIRTY=
  pause & cls & goto menu
)
set NEWBR=
set /p NEWBR=Nombre nueva rama (ENTER = restore/%TAG%):
if "%NEWBR%"=="" set NEWBR=restore/%TAG%

git switch -c %NEWBR% %TAG%
if errorlevel 1 (echo [ERROR] No se pudo crear/cambiar a la rama.%NEWBR% & pause & cls & goto menu)

echo [OK] Ahora en rama %NEWBR% basada en %TAG%.
echo Para volver: git switch %BRANCH%
echo Para diff:   git diff %TAG%..%BRANCH%

echo.
pause
cls & goto menu

:push
set TAGP=
set /p TAGP=Tag a publicar (ej: ok-20250914-120500):
if "%TAGP%"=="" (echo Tag vacio.& pause & cls & goto menu)

git rev-parse -q --verify refs/tags/%TAGP% >nul 2>&1 || (
  echo [ERROR] Tag no existe.
  pause & cls & goto menu
)
set RPBR=estables/%TAGP:ok-=%-ok

REM Intentar inferir rama (estables/<timestamp>-ok)
git rev-parse -q --verify %RPBR% >nul 2>&1 || (
  echo [AVISO] Rama asociada no encontrada: %RPBR%
  set RPBR=
)

echo Publicando tag %TAGP% ...
git push origin %TAGP%
if not "%RPBR%"=="" (
  echo Publicando rama %RPBR% ...
  git push origin %RPBR%
)

echo Hecho.
Pause
cls & goto menu

:fin
echo Saliendo...
endlocal
