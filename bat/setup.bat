@echo off
echo ==============================================
echo Setting up Kavach Safety OS...
echo ==============================================

cd ..

echo.
echo [1/3] Setting up Backend...
cd backend
call npm install
cd ..

echo.
echo [2/3] Setting up Frontend...
cd frontend
call npm install
cd ..

echo.
echo [3/3] Setting up AI Service...
cd ai-service
call python -m pip install -r requirements.txt
cd ..

echo.
echo ==============================================
echo Setup complete! 
echo Next step: Run start.bat to launch the application.
echo ==============================================
pause
