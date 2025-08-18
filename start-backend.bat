@echo off
echo ========================================
echo 🔧 Starting Backend (Node.js Server)
echo ========================================
echo.

cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Backend"

echo Installing backend dependencies...
call npm install

echo.
echo Starting Node.js server with nodemon...
echo Backend API will be available at: http://localhost:5000
echo Admin Dashboard: http://localhost:5000/admin
echo.

call npm run dev

pause