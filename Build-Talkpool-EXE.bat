@echo off
title Build Talkpool KPI Windows Installer
cd /d "%~dp0"

echo ============================================
echo   Talkpool KPI - Building Windows .exe
echo   This may take 10-15 minutes...
echo ============================================
echo.

call npm install
if errorlevel 1 goto fail

call npm run build --prefix frontend
if errorlevel 1 goto fail

cd electron
call npm install
if errorlevel 1 goto fail

call npm run rebuild
if errorlevel 1 goto fail

call npm run build
if errorlevel 1 goto fail

cd ..
echo.
echo ============================================
echo   SUCCESS!
echo   Installer: electron\release\
echo   File: Talkpool KPI Dashboard Setup 1.0.0.exe
echo ============================================
explorer "electron\release"
pause
exit /b 0

:fail
echo.
echo BUILD FAILED - check errors above
pause
exit /b 1
