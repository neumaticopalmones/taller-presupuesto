@echo off
setlocal
rem Abre una consola persistente y ejecuta run_host.bat
cd /d "%~dp0"
start "Taller Presupuestos - HOST" cmd /k ".\run_host.bat"
