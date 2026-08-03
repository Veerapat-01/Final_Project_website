@echo off
chcp 65001 >nul
color 0A
title AIT ARC Website Installer

echo ==============================================
echo         AIT ARC Website Installer            
echo ==============================================
echo.

set "TARGET_FOLDER=C:\AIT_ARC"
set /p TARGET_FOLDER="Enter installation folder (Default: C:\AIT_ARC): "

if not exist "%TARGET_FOLDER%" (
    mkdir "%TARGET_FOLDER%"
)

echo.
echo Extracting files to %TARGET_FOLDER%...
powershell -Command "Expand-Archive -Path 'app_package.zip' -DestinationPath '%TARGET_FOLDER%' -Force"

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Failed to extract files. Make sure app_package.zip is in the same folder.
    pause
    exit /b
)

echo.
echo Installation Completed Successfully!
echo ----------------------------------------------
echo To start the application:
echo 1. Open folder: %TARGET_FOLDER%
echo 2. Double click 'veerapat.exe' to launch.
echo ----------------------------------------------
echo.
pause
