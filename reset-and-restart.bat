@echo off
echo ========================================
echo 🔄 Resetting Demo Data and Restarting
echo ========================================
echo.
echo This will reset the demo data to show:
echo - Ravi's Card: ₹400 raised from 4 donors
echo - Dashboard: ₹100 total, 1 story, 1 collaboration
echo - Other cards: ₹0 from 0 donors
echo.
echo Press any key to continue...
pause >nul

echo.
echo 🔄 Resetting demo data...
cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Backend"
node reset-demo-data.js

echo.
echo 🛑 Stopping any running servers...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Starting Backend Server...
start "Backend Server" cmd /k "npm run dev-server-only"

echo.
echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Starting Frontend Server...
cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Frontend"
start "Frontend Server" cmd /k "npm start"

echo.
echo ========================================
echo ✅ Servers restarted with fresh data!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo The cards should now show:
echo - Ravi: ₹400 raised, 4 donors
echo - Dashboard: ₹100 total, 1 story, 1 collaboration
echo.
echo Press any key to exit...
pause >nul