@echo off
echo 🚀 Iniciando AMBOS: Backend + Frontend
echo.
echo 📋 Este script abre dos ventanas:
echo    1️⃣ Backend (Python) en puerto 5000
echo    2️⃣ Frontend (HTML) en puerto 3000
echo.
pause
echo.

REM Abrir backend en nueva ventana
start "🐍 Backend - Puerto 5000" cmd /k "start-backend.bat"

REM Esperar un poco para que el backend arranque
timeout /t 3 /nobreak > nul

REM Abrir frontend en nueva ventana
start "🎨 Frontend - Puerto 3000" cmd /k "start-frontend.bat"

echo ✅ Aplicación iniciada:
echo    🐍 Backend: http://localhost:5000
echo    🎨 Frontend: http://localhost:3000
echo.
echo 💡 Abre http://localhost:3000 en tu navegador
pause
