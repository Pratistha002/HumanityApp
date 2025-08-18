@echo off
echo ========================================
echo 🚀 Starting Frontend (React App)
echo ========================================
echo.

cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Frontend"

echo Installing frontend dependencies...
call npm install

echo.
echo Starting React development server...
echo Frontend will be available at: http://localhost:3000
echo.

call npm start

pause