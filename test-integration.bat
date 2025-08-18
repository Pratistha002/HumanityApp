@echo off
echo ========================================
echo 🧪 Testing Frontend-Backend Integration
echo ========================================
echo.
echo This will test the integration between frontend and backend
echo by starting both servers and running basic connectivity tests.
echo.
echo Press any key to continue...
pause >nul

echo.
echo 🔧 Starting Backend Server...
cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Backend"
start "Backend Test Server" cmd /k "npm install && npm run dev-server-only"

echo.
echo ⏳ Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak >nul

echo.
echo 🧪 Testing Backend API Endpoints...
echo.

echo Testing /api/posts endpoint...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:5000/api/posts

echo Testing /api/stats endpoint...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:5000/api/stats

echo Testing /api/payment-config endpoint...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:5000/api/payment-config

echo Testing /api/collaborations endpoint...
curl -s -o nul -w "Status: %%{http_code}\n" http://localhost:5000/api/collaborations

echo.
echo 🔧 Starting Frontend Server...
cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Frontend"
start "Frontend Test Server" cmd /k "npm install && npm start"

echo.
echo ⏳ Waiting 15 seconds for frontend to start...
timeout /t 15 /nobreak >nul

echo.
echo 🧪 Testing Frontend-Backend Integration...
echo.

echo Testing Frontend accessibility...
curl -s -o nul -w "Frontend Status: %%{http_code}\n" http://localhost:3000

echo.
echo ========================================
echo ✅ Integration Test Complete!
echo ========================================
echo.
echo If all status codes are 200, integration is working!
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Check the opened browser windows to verify functionality.
echo.
echo Press any key to exit...
pause >nul