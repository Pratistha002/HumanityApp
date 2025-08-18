@echo off
echo ========================================
echo 🚀 Starting Full Donation System
echo ========================================
echo.
echo Choose your startup mode:
echo 1. Development Mode (Frontend: 3000, Backend: 5000)
echo 2. Production Mode (Single server on port 5000)
echo.
set /p mode="Enter your choice (1 or 2): "

if "%mode%"=="2" goto production
if "%mode%"=="1" goto development

:development
echo.
echo 🔧 Starting Development Mode...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000
echo Admin Dashboard: http://localhost:5000/admin
echo.
echo Press any key to continue...
pause >nul

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d c:\Users\PratisthaSingh\Desktop\Donation\Backend && npm install && npm run dev-server-only"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d c:\Users\PratisthaSingh\Desktop\Donation\Frontend && npm install && npm start"

echo.
echo ========================================
echo ✅ Development servers are starting!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo Admin: http://localhost:5000/admin
echo.
goto end

:production
echo.
echo 🏭 Starting Production Mode...
echo.
echo Building React frontend...
cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Frontend"
call npm install
call npm run build

echo.
echo Starting production server...
cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Backend"
call npm install
set NODE_ENV=production
start "Production Server" cmd /k "npm start"

echo.
echo ========================================
echo ✅ Production server is starting!
echo ========================================
echo.
echo Application: http://localhost:5000
echo Admin: http://localhost:5000/admin
echo API: http://localhost:5000/api
echo.

:end
echo Press any key to exit this window...
pause >nul