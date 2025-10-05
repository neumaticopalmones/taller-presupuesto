@echo off
echo 🎨 Iniciando Frontend (HTML/CSS/JS)...
echo.
cd frontend
echo 📦 Instalando dependencias Node.js...
npm install
echo.
echo 🌐 Abriendo en navegador: http://localhost:3000
echo 📱 Para parar el servidor: Ctrl+C
echo.
echo ⚡ Iniciando servidor de desarrollo...
npx serve -s . -l 3000
