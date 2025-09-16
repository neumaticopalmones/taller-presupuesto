@echo off
echo Activando entorno virtual e iniciando servidor Flask...
echo Si ves algun error, por favor, copialo y pegalo en el chat.
echo.

:: Inicia el servidor Flask en una nueva ventana de CMD y permite que este script continúe
start "Flask Server" cmd /k "venv\Scripts\activate.bat && python run.py"

echo.
echo Esperando a que el servidor se inicie (5 segundos)...
timeout /t 5 /nobreak >nul

echo.
echo Abriendo la aplicación en el navegador...
start http://localhost:5000

echo.
echo El servidor Flask se está ejecutando en una ventana separada.
echo Cierra esa ventana para detener el servidor.
pause
