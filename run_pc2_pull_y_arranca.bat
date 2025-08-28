@echo off
setlocal
title PC2 - Pull y Arrancar app
cd /d "%~dp0"
echo Actualizando codigo (git pull)...
git pull
if errorlevel 1 (
  echo Error al hacer git pull. Revisa tu conexion o credenciales.
  pause
  exit /b 1
)

if not exist .venv (
  echo Creando entorno virtual .venv...
  py -3 -m venv .venv
)
call .\.venv\Scripts\activate
echo Instalando dependencias (pip install -r requirements.txt)...
pip install -r requirements.txt

echo Ejecutando app (python app.py)...
python app.py
