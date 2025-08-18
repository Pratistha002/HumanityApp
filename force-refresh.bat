@echo off
echo ========================================
echo 🔄 Force Refreshing Frontend
echo ========================================
echo.
echo This will:
echo 1. Clear browser cache
echo 2. Restart React development server
echo 3. Open fresh browser window
echo.
pause

echo 🛑 Stopping React server...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Frontend*" >nul 2>&1

echo 🧹 Clearing React cache...
cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Frontend"
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist build rmdir /s /q build

echo 🚀 Starting fresh React server...
start "Frontend Server" cmd /k "npm start"

echo ⏳ Waiting for server to start...
timeout /t 8 /nobreak >nul

echo 🌐 Opening fresh browser window...
start "" "http://localhost:3000?cache-bust=%random%"

echo.
echo ========================================
echo ✅ Frontend refreshed!
echo ========================================
echo.
echo Check the new browser window for updated data:
echo - Ravi's Card: ₹400 raised from 4 donors
echo - Dashboard: ₹100 total, 1 story, 1 collaboration
echo.
pause