@echo off
echo ==============================================
echo Stopping Kavach Safety OS Services...
echo ==============================================

echo Closing all Kavach command windows and their background processes...
taskkill /F /T /FI "WINDOWTITLE eq Kavach*" >nul 2>&1

echo ==============================================
echo Services stopped!
echo Note: If XAMPP/MariaDB is running, you need to stop it manually.
echo ==============================================
pause
