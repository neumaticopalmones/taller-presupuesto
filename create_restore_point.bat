@echo off
setlocal
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do set DATE=%%d%%b%%c
for /f "tokens=1-2 delims=:" %%a in ("%time%") do set TIME=%%a%%b
set TS=%DATE%-%TIME%
set TS=%TS: =0%
set TS=%TS:,=%
set TAG=ok-%TS%
set BR=estables/%DATE%-%TIME%-ok

git tag -a %TAG% -m "Estado estable local %DATE% %TIME%"
git branch %BR%
echo Creado tag %TAG% y rama %BR%.
pause
