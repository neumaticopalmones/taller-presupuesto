@echo off
echo ====================================================
echo INSTALADOR AUTOMATICO EXTENSIONES VS CODE - TALLER
echo ====================================================
echo.
echo Instalando extensiones esenciales para desarrollo...
echo.

REM ===== EXTENSIONES CRITICAS =====
echo [1/6] Instalando Python Development...
code --install-extension ms-python.python
code --install-extension ms-python.vscode-pylance
code --install-extension ms-python.debugpy

echo [2/6] Instalando GitHub Integration...
code --install-extension github.copilot
code --install-extension github.copilot-chat
code --install-extension eamodio.gitlens

REM ===== DESARROLLO WEB =====
echo [3/6] Instalando Web Development...
code --install-extension rangav.vscode-thunder-client
code --install-extension yandeu.five-server
code --install-extension formulahendry.auto-rename-tag
code --install-extension formulahendry.auto-close-tag
code --install-extension ecmel.vscode-html-css

REM ===== JAVASCRIPT/NODE =====
echo [4/6] Instalando JavaScript Support...
code --install-extension xabikos.javascriptsnippets
code --install-extension christian-kohler.path-intellisense

REM ===== CALIDAD CODIGO =====
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint

REM ===== UTILIDADES =====
echo [5/6] Instalando Utilities...
code --install-extension usernamehw.errorlens
code --install-extension oderwat.indent-rainbow
code --install-extension wayou.vscode-todo-highlight
code --install-extension aaron-bond.better-comments
code --install-extension streetsidesoftware.code-spell-checker

REM ===== TEMAS E ICONOS =====
echo [6/6] Instalando Themes and Icons...
code --install-extension pkief.material-icon-theme
code --install-extension zhuangtongfa.material-theme

echo.
echo ====================================================
echo ✅ INSTALACION COMPLETADA - %DATE% %TIME%
echo ====================================================
echo.
echo SIGUIENTES PASOS:
echo 1. Reiniciar VS Code
echo 2. Login GitHub Copilot (Ctrl+Shift+P → GitHub: Sign In)
echo 3. Abrir proyecto taller-presupuesto
echo 4. Seleccionar Python interpreter (venv)
echo 5. Verificar que todo funciona
echo.
echo VERIFICACION RAPIDA:
echo - Abrir VS Code
echo - Ctrl+Shift+X (ver extensiones instaladas)
echo - Chat Copilot: @copilot hello
echo - Python interpreter en barra inferior
echo.
echo ¡Listo para desarrollar! 🚀
echo.
pause
