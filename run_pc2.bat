@echo off
setlocal

echo ==============================================
echo  Arrancar web local (PC2) contra DB del host
echo ==============================================
echo.
REM Intentar leer IP guardada
if exist host_ip.txt (
    for /f "usebackq delims=" %%A in ("host_ip.txt") do set HOST_DB_IP=%%A
)
if "%HOST_DB_IP%"=="" (
    set /p HOST_DB_IP=Introduce la IP del PC host (ej. 192.168.18.12): 
    if "%HOST_DB_IP%"=="" (
		echo Debes introducir una IP. Saliendo...
		pause
		exit /b 1
	)
    echo %HOST_DB_IP%>host_ip.txt
)

set HOST_DB_IP=%HOST_DB_IP%
echo Usando HOST_DB_IP=%HOST_DB_IP%
echo.

docker compose -f docker-compose.pc2.yml up -d --build web
if errorlevel 1 (
	echo Hubo un error levantando el servicio. Revisa Docker Desktop y la IP.
	pause
	exit /b 1
)

echo.
echo Abre ahora http://localhost:5000 en este PC.
echo Si falla, revisa que el host tiene abierto el puerto 5432 y que la IP es correcta.
pause
