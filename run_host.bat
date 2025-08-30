C:\Program Files\Docker\Docker\Docker Desktop.exe@echo off
setlocal
title Taller Presupuestos - HOST (web + db)

echo ==============================================
echo  Arrancar app en el PC HOST (web + db)
echo ==============================================
echo.
echo Iniciando contenedores (puede tardar la primera vez)...
docker compose up -d --build
if errorlevel 1 (
  echo Hubo un error levantando los servicios. Abre Docker Desktop y reintenta.
  pause
  exit /b 1
)

echo.
echo Abriendo reglas de Firewall (5000 web, 5432 Postgres) en perfil Privado...
powershell -NoProfile -Command "Try { $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator); if ($isAdmin) { if (-not (Get-NetFirewallRule -DisplayName 'Taller Presupuestos 5000' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'Taller Presupuestos 5000' -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow -Profile Private -ErrorAction SilentlyContinue | Out-Null } } else { Write-Host 'Sin privilegios de admin; omitiendo apertura de puerto 5000.' } } Catch { }" 2>nul
powershell -NoProfile -Command "Try { $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator); if ($isAdmin) { if (-not (Get-NetFirewallRule -DisplayName 'Postgres 5432' -ErrorAction SilentlyContinue)) { New-NetFirewallRule -DisplayName 'Postgres 5432' -Direction Inbound -Protocol TCP -LocalPort 5432 -Action Allow -Profile Private -ErrorAction SilentlyContinue | Out-Null } } else { Write-Host 'Sin privilegios de admin; omitiendo apertura de puerto 5432.' } } Catch { }" 2>nul

echo.
echo Detectando IP local...
set "_TMP_IP_FILE=%TEMP%\taller_host_ip.txt"
set "_TMP_PS1=%TEMP%\taller_getip.ps1"
del /q "%_TMP_IP_FILE%" 2>nul
del /q "%_TMP_PS1%" 2>nul
> "%_TMP_PS1%" echo try {
>> "%_TMP_PS1%" echo   $ip = (Get-NetIPConfiguration ^| Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq 'Up' -and $_.NetAdapter.InterfaceDescription -notmatch 'Hyper-V^|Virtual^|vEthernet^|Docker' } ^| ForEach-Object { $_.IPv4Address.IPAddress } ^| Where-Object { $_ -notmatch '^169\.' -and $_ -ne '127.0.0.1' } ^| Select-Object -First 1)
>> "%_TMP_PS1%" echo   if (-not $ip) { $ip = (Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.IPAddress -notmatch '^169\.' -and $_.IPAddress -ne '127.0.0.1' -and $_.InterfaceAlias -match '^(Wi-Fi^|Ethernet)(\s^|$)' -and $_.InterfaceAlias -notmatch 'vEthernet^|Docker^|Virtual' } ^| Select-Object -ExpandProperty IPAddress -First 1) }
>> "%_TMP_PS1%" echo   if ($ip) { Set-Content -Path $env:TEMP\taller_host_ip.txt -Value $ip -NoNewline }
>> "%_TMP_PS1%" echo } catch { }
powershell -NoProfile -ExecutionPolicy Bypass -File "%_TMP_PS1%" 2>nul
if exist "%_TMP_IP_FILE%" (
  set /p HOST_IP=<"%_TMP_IP_FILE%"
)
del /q "%_TMP_PS1%" 2>nul
del /q "%_TMP_IP_FILE%" 2>nul

if "%HOST_IP%"=="" set HOST_IP=TU_IP_LOCAL

echo.
echo Listo.
echo - En este PC:   http://localhost:5000
echo - En otros PCs: http://%HOST_IP%:5000

echo.
echo Salud del servidor:
powershell -NoProfile -Command "Try { (Invoke-WebRequest -Uri 'http://localhost:5000/health' -UseBasicParsing -TimeoutSec 5).Content } Catch { 'No responde. Revisa los contenedores.' }"

echo.
echo Abriendo la app en el navegador por si quieres comprobar: http://localhost:5000
start "" http://localhost:5000

echo.
echo Deja esta ventana abierta para ver el estado o copiar la IP.
echo Cuando quieras cerrar, pulsa ENTER.
set /p _=""

echo.
echo (Seguridad extra) Pulsa cualquier tecla para cerrar esta ventana...
pause >nul

echo.
echo Esperando indefinidamente (CTRL+C para abortar)...
timeout /t -1 >nul
