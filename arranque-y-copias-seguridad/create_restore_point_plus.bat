@echo off
setlocal ENABLEDELAYEDEXPANSION

REM ===============================
REM Script: create_restore_point_plus.bat
REM Crea un tag y rama "estado estable" sólo si no hay cambios sin commit.
REM Opcional: push automático si se pasa argumento push
REM Uso:
REM   create_restore_point_plus.bat          -> crea tag + rama local
REM   create_restore_point_plus.bat push     -> crea y hace push de tag y rama
REM ===============================

REM 1. Verificar que estamos en un repo git
where git >nul 2>&1 || (
  echo [ERROR] Git no encontrado en PATH.
  pause & exit /b 1
)

REM 2. Comprobar que estamos dentro de un repositorio
git rev-parse --is-inside-work-tree >nul 2>&1 || (
  echo [ERROR] No estas dentro de un repositorio git.
  pause & exit /b 1
)

REM 3. Detectar cambios sin commit (staged o no staged)
for /f "delims=" %%i in ('git status --porcelain') do set HAS_CHANGES=1
if defined HAS_CHANGES (
  echo [ADVERTENCIA] Hay cambios sin commit.
  echo Haz commit antes de crear punto de restauracion para que quede completo.
  echo Puedes hacerlo con:
  echo    git add .
  echo    git commit -m "WIP"
  echo Luego vuelve a ejecutar este script.
  pause
  exit /b 1
)

REM 4. Obtener timestamp consistente (yyyyMMdd-HHmmss) usando PowerShell
for /f "usebackq delims=" %%t in (`powershell -NoProfile -Command "Get-Date -Format 'yyyyMMdd-HHmmss'"`) do set TS=%%t

set TAG=ok-%TS%
set BR=estables/%TS%-ok

REM 5. Verificar si el tag ya existe
git rev-parse -q --verify refs/tags/%TAG% >nul 2>&1 && (
  echo [ERROR] El tag %TAG% ya existe. Saliendo.
  pause & exit /b 1
)

REM 6. Crear tag anotado y rama
git tag -a %TAG% -m "Estado estable local %TS%"
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
echo [OK] Creado tag:   %TAG%
echo [OK] Creada rama:  %BR%

echo Estado actual:
call git log -1 --oneline

echo.
REM 7. Push opcional
if /I "%1"=="push" (
  echo Realizando push de tag y rama...
  git push origin %TAG%
  if errorlevel 1 echo [AVISO] Push del tag fallo.
  git push origin %BR%
  if errorlevel 1 echo [AVISO] Push de la rama fallo.
)

echo.
echo Para restaurar luego:
echo   git switch %BR%
echo   (o) git switch -c restore/%TAG% %TAG%

echo Para listar puntos:
echo   git tag --list "ok-*" --sort=-creatordate

echo.
pause
endlocal
