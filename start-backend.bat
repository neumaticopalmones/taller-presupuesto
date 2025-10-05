@echo off
echo 🚀 Iniciando Backend (Python/Flask)...
echo.
cd backend
call ..\venv\Scripts\activate.bat
echo ✅ Entorno virtual activado
echo 📦 Instalando dependencias...
pip install -r requirements.txt
echo.
echo 🌐 Servidor corriendo en: http://localhost:5000
echo 📱 Para parar el servidor: Ctrl+C
echo.
python app.py
