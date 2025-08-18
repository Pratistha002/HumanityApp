@echo off
echo 🧪 Testing Dashboard API Endpoints
echo ==================================================

echo.
echo 📋 Test 1: /api/stats endpoint
echo ------------------------------
curl -s http://localhost:5000/api/stats
echo.

echo.
echo 📋 Test 2: /api/collaborations endpoint  
echo ------------------------------
curl -s http://localhost:5000/api/collaborations
echo.

echo.
echo 📋 Test 3: /api/posts endpoint
echo ------------------------------
curl -s http://localhost:5000/api/posts
echo.

echo.
echo ✨ Dashboard API Test Complete!
echo ==================================================
pause