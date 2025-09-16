@echo off
echo Comprobando salud de la aplicación...
for /f "delims=" %%A in ('powershell -NoProfile -Command "(Invoke-WebRequest -UseBasicParsing http://localhost:5000/health).Content"') do set HEALTH=%%A
echo Respuesta /health: %HEALTH%

echo Ultimas lineas de logs (web):
docker logs --tail 10 taller_web 2>nul

echo Si no ves OK revisa:
echo - Contenedor: docker ps
echo - Logs completos: docker logs taller_web
pause
