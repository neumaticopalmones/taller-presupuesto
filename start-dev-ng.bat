@echo off
echo Iniciando Backend (5000) + Angular (4200)
echo.
echo Esta opcion usa el frontend Angular en lugar del HTML estatico.
echo.
pause
echo.

REM Backend en nueva ventana
start "🐍 Backend - 5000" cmd /k "start-backend.bat"

timeout /t 3 /nobreak > nul

REM Angular en nueva ventana
start "🅰️ Angular - 4200" cmd /k "start-frontend-ng.bat"

echo.
echo ✅ Servicios iniciados:
echo    🐍 Backend:  http://localhost:5000
echo    🅰️ Angular:  http://localhost:4200
echo.
echo 💡 Abre http://localhost:4200 en tu navegador
pause
