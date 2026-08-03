@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
color 0B
title AIT ARC Website Launcher

if not exist ".launcher_setup_done" (
    echo --- First Time Setup ---
    set "dbServer=localhost"
    set /p dbServer="Enter Database IP/Hostname (e.g. localhost or Cloud IP) [localhost]: "

    set "dbPort=3306"
    set /p dbPort="Enter Database Port (Press Enter for 3306) [3306]: "

    set "dbName="
    set /p dbName="Enter Database Name: "
    
    set "dbUser="
    set /p dbUser="Enter Database Username: "
    
    set "dbPass="
    set /p dbPass="Enter Database Password: "

    (
    echo DATABASE_HOST=!dbServer!
    echo DATABASE_PORT=!dbPort!
    echo DATABASE_USER=!dbUser!
    echo DATABASE_PASSWORD=!dbPass!
    echo DATABASE_NAME=!dbName!
    ) > .env

    type NUL > .launcher_setup_done
    echo.
    echo Configuration saved to .env!
    echo.
)

echo Checking Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Installing Node.js LTS via winget...
    winget install OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
    
    echo Node.js has been installed. Please close this window and run veerapat.bat again.
    pause
    exit /b
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Building production server...
call npm run build

echo.
echo Starting production server...
start http://localhost:3000
call npm start
pause
