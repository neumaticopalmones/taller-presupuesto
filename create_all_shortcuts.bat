@echo off
setlocal
cd /d "%~dp0"
echo Creando accesos directos en el Escritorio...

REM 1) Host (Docker web + db)
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0create_shortcut.ps1" -Name "Taller Presupuestos (HOST)" -TargetBat "run_host_console.bat"
if errorlevel 1 echo [AVISO] No se pudo crear acceso (HOST).

REM 2) PC2 (web local contra DB del host)
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0create_shortcut.ps1" -Name "Taller Presupuestos (PC2)" -TargetBat "run_pc2.bat"
if errorlevel 1 echo [AVISO] No se pudo crear acceso (PC2).

REM 3) Local sin Docker (venv + Flask)
powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0create_shortcut.ps1" -Name "Taller Presupuestos (Local)" -TargetBat "run_app.bat"
if errorlevel 1 echo [AVISO] No se pudo crear acceso (Local).

echo.
echo Listo. Revisa tu Escritorio.
pause