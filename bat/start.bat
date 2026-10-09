@echo off
echo ==============================================
echo Starting Kavach Safety OS Services...
echo ==============================================

cd ..

echo Starting Backend on port 5000...
start "Kavach Backend" cmd /c "cd backend && npm start"

echo Starting Frontend on port 3000...
start "Kavach Frontend" cmd /c "cd frontend && npm run dev"

echo Starting AI Service on port 8000...
start "Kavach AI Service" cmd /c "cd ai-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo ==============================================
echo All services are launching in separate windows!
echo - Frontend: http://localhost:3000
echo - Backend:  http://localhost:5000
echo - AI API:   http://localhost:8000
echo.
echo Leave those windows open to keep the app running.
echo To stop everything, run stop.bat.
echo ==============================================
pause
