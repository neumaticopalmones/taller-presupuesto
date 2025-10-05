@echo off
echo Iniciando Frontend Angular (puerto 4200)...
echo.
if not exist "frontend-ng" (
  echo [ERROR] Carpeta frontend-ng no encontrada. Crea el proyecto primero.
  echo   Lee: frontend-ng\README.md
  exit /b 1
)

pushd frontend-ng
if exist app (
  cd app
)

echo Instalando dependencias...
npm install
if %errorlevel% neq 0 (
  echo [ERROR] npm install fallo.
  popd & exit /b 1
)

where ng >nul 2>nul
if %errorlevel% neq 0 (
  echo [AVISO] Angular CLI no esta instalado globalmente. Ejecuta:
  echo   npm i -g @angular/cli
  echo Continuando con npx...
  npx ng serve --port 4200
) else (
  ng serve --port 4200
)

popd
