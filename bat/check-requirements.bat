@echo off
echo ==============================================
echo Checking Kavach Safety OS Requirements...
echo ==============================================

echo Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed. 
    echo Please install Node.js (v18+) from: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo [OK] Node.js is installed.
)

echo Checking Python...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is NOT installed. 
    echo Please install Python (3.10+) from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
) else (
    echo [OK] Python is installed.
)

echo Checking MySQL/MariaDB (XAMPP)...
netstat -ano | findstr "3307" >nul
if %errorlevel% neq 0 (
    echo [WARNING] Port 3307 is not in use. Is XAMPP/MariaDB running on port 3307?
    echo Make sure your database is running before you try to start the app.
) else (
    echo [OK] Database appears to be running on port 3307.
)

echo ==============================================
echo All critical checks passed! 
echo Next step: Run setup.bat to install dependencies.
echo ==============================================
pause
