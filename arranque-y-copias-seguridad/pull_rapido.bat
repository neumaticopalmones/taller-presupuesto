@echo off
setlocal
title Pull rápido - Taller Presupuestos
cd /d "%~dp0"
echo Haciendo git pull...
git pull
echo.
echo Estado breve tras pull:
git status -sb
echo.
echo Listo. Pulsa una tecla para salir.
pause >nul
