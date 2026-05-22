@echo off
title Talkpool KPI Dashboard
cd /d "%~dp0"

REM Desktop app mode - data saves permanently in \data folder
set DESKTOP_MODE=1
set DB_TYPE=sqlite
set DATA_DIR=%~dp0
set PORT=5000

echo ============================================
echo   Talkpool KPI Dashboard
echo   Data folder: %~dp0data
echo ============================================
echo.

if not exist "frontend\dist\index.html" (
  echo Building app first time... Please wait.
  call npm run build --prefix frontend
)

echo Opening dashboard...
start "" "http://localhost:5000"
node backend\src\index.js

pause
