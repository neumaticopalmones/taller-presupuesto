@echo off
setlocal
cd /d "%~dp0"
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do set FECHA=%%a-%%b-%%c
set HORA=%time: =0%
git add .
git commit -m "actualizacion rapida %FECHA% %HORA%" || echo (Nada que commitear)
git push
echo.
echo Listo. Pulsa una tecla para salir.
pause >nul
