@echo off
REM Run this ONCE on your PC to create ZIP for sir / employees
cd /d "%~dp0"

echo Building Talkpool Office Package...
call npm install
call npm run build --prefix frontend

if not exist "office-package" mkdir office-package
xcopy /E /I /Y backend office-package\backend
xcopy /E /I /Y frontend\dist office-package\frontend\dist
xcopy /E /I /Y sample-data office-package\sample-data
copy Talkpool-Start.bat office-package\
copy OFFICE_DISTRIBUTION_URDU.md office-package\README.txt

echo.
echo DONE! Zip the "office-package" folder and share with office.
echo Employees: extract ZIP, double-click Talkpool-Start.bat
pause
