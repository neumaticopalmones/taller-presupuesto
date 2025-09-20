@echo off
echo ===============================================
echo VERIFICACION INSTALACION TALLER
echo ===============================================
echo.
echo Verificando que todo esté instalado correctamente...
echo.

REM Verificar Python
echo [1/6] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python NO instalado o no en PATH
) else (
    python --version
    echo ✅ Python OK
)
echo.

REM Verificar Git
echo [2/6] Verificando Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git NO instalado
) else (
    git --version
    echo ✅ Git OK
)
echo.

REM Verificar Node.js
echo [3/6] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js NO instalado
) else (
    node --version
    echo ✅ Node.js OK
)
echo.

REM Verificar VS Code
echo [4/6] Verificando VS Code...
code --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ VS Code NO instalado o no en PATH
) else (
    echo ✅ VS Code OK
)
echo.

REM Verificar configuración Git
echo [5/6] Verificando configuración Git...
git config --global user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git NO configurado (ejecutar configurar_git.bat)
) else (
    echo Usuario Git:
    git config --global user.name
    git config --global user.email
    echo ✅ Git configurado OK
)
echo.

REM Verificar proyecto clonado
echo [6/6] Verificando proyecto...
if exist "Desktop\taller-presupuesto" (
    echo ✅ Proyecto taller-presupuesto encontrado
    if exist "Desktop\taller-presupuesto\venv" (
        echo ✅ Entorno virtual encontrado
    ) else (
        echo ❌ Entorno virtual NO encontrado
        echo    Ejecutar: python -m venv venv
    )
) else (
    echo ❌ Proyecto NO clonado
    echo    Ejecutar: git clone https://github.com/neumaticopalmones/taller-presupuesto.git
)
echo.

echo ===============================================
echo RESUMEN VERIFICACION
echo ===============================================

REM Contar éxitos
set SUCCESS=0
python --version >nul 2>&1 && set /a SUCCESS+=1
git --version >nul 2>&1 && set /a SUCCESS+=1
node --version >nul 2>&1 && set /a SUCCESS+=1
code --version >nul 2>&1 && set /a SUCCESS+=1
git config --global user.name >nul 2>&1 && set /a SUCCESS+=1
if exist "Desktop\taller-presupuesto" set /a SUCCESS+=1

echo.
echo Elementos verificados: %SUCCESS%/6
echo.

if %SUCCESS% geq 5 (
    echo ✅ INSTALACION CASI COMPLETA
    echo    Solo faltan detalles menores
) else if %SUCCESS% geq 3 (
    echo ⚠️ INSTALACION PARCIAL
    echo    Faltan elementos importantes
) else (
    echo ❌ INSTALACION INCOMPLETA
    echo    Revisar instalaciones básicas
)

echo.
echo SIGUIENTES PASOS:
echo 1. Corregir elementos marcados con ❌
echo 2. Abrir VS Code y verificar extensiones
echo 3. Ejecutar aplicación: python app.py
echo 4. Verificar GitHub Copilot funcionando
echo.
pause
