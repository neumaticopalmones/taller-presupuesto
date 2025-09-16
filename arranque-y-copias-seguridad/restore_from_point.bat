@echo off
setlocal
REM ==============================================
REM Script: restore_from_point.bat
REM Restaura (checkout) un punto de restauracion basado en tag ok-YYYYMMDD-HHMMSS
REM Uso:
REM   restore_from_point.bat ok-20250914-123045
REM   (opcional) restore_from_point.bat ok-20250914-123045 nueva-rama
REM ==============================================

if "%1"=="" (
  echo Uso: %~n0 ok-YYYYMMDD-HHMMSS [nombre-rama-nueva]
  echo Lista de tags disponibles (ultimos 10):
  git tag --list "ok-*" --sort=-creatordate | head -n 10
  pause
  exit /b 1
)

set TAG=%1
set NEWBR=%2

REM Verificar repositorio git
git rev-parse --is-inside-work-tree >nul 2>&1 || (
  echo [ERROR] No estas en un repo git.
  pause & exit /b 1
)

REM Comprobar existencia del tag
git rev-parse -q --verify refs/tags/%TAG% >nul 2>&1 || (
  echo [ERROR] Tag %TAG% no existe.
  echo Usa: git tag --list "ok-*" --sort=-creatordate
  pause & exit /b 1
)

REM Comprobar cambios sin commit
for /f "delims=" %%i in ('git status --porcelain') do set HAS_CHANGES=1
if defined HAS_CHANGES (
  echo [ADVERTENCIA] Hay cambios sin commit en tu copia.
  echo Haz commit o stash antes de restaurar para no perder trabajo.
  pause
  exit /b 1
)

if "%NEWBR%"=="" (
  echo Cambiando a rama temporal basada en el tag...
  git switch -c restore/%TAG% %TAG%
) else (
  echo Creando y cambiando a rama %NEWBR% basada en %TAG% ...
  git switch -c %NEWBR% %TAG%
)

if errorlevel 1 (
  echo [ERROR] Fallo en el cambio de rama.
  pause & exit /b 1
)

echo.
echo [OK] Ahora estas en una rama basada en %TAG%.
echo Para volver a tu rama anterior:
echo   git switch main   (o la rama en la que estabas)

echo Para comparar diferencias:
echo   git diff %TAG%..main

echo.
pause
endlocal
