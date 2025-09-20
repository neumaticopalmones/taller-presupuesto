@echo off
echo ===============================================
echo CONFIGURACION AUTOMATICA GIT - TALLER
echo ===============================================
echo.

REM Verificar que Git esté instalado
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Git no está instalado o no está en PATH
    echo.
    echo SOLUCION:
    echo 1. Instalar Git desde: https://git-scm.com/downloads
    echo 2. Reiniciar PowerShell
    echo 3. Ejecutar este script de nuevo
    echo.
    pause
    exit /b 1
)

echo ✅ Git detectado correctamente
echo.

REM Solicitar información del usuario
set /p USERNAME="Ingresa tu nombre completo: "
set /p EMAIL="Ingresa tu email: "

echo.
echo Configurando Git con:
echo Nombre: %USERNAME%
echo Email: %EMAIL%
echo.

REM Configurar Git globalmente
git config --global user.name "%USERNAME%"
git config --global user.email "%EMAIL%"

REM Configuraciones adicionales recomendadas
git config --global init.defaultBranch main
git config --global core.autocrlf true
git config --global push.default simple

echo ✅ Git configurado exitosamente
echo.

echo CONFIGURACION ACTUAL:
git config --list | findstr user
echo.

echo ===============================================
echo VERIFICACION SSH (OPCIONAL)
echo ===============================================
echo.
echo Para conexión más segura con GitHub, puedes configurar SSH:
echo.
echo 1. Generar clave SSH:
echo    ssh-keygen -t rsa -b 4096 -C "%EMAIL%"
echo.
echo 2. Agregar a GitHub:
echo    - Ir a GitHub → Settings → SSH and GPG keys
echo    - Click "New SSH key"
echo    - Copiar contenido de ~/.ssh/id_rsa.pub
echo.
echo 3. Probar conexión:
echo    ssh -T git@github.com
echo.

echo ===============================================
echo ✅ CONFIGURACION COMPLETADA
echo ===============================================
echo.
echo Ahora puedes clonar el proyecto:
echo.
echo cd Desktop
echo git clone https://github.com/neumaticopalmones/taller-presupuesto.git
echo cd taller-presupuesto
echo.
pause
