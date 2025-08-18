@echo off
echo ========================================
echo 🧪 Testing API Data
echo ========================================
echo.

echo 📋 Testing Posts API...
curl -s http://localhost:5000/api/posts > posts.json
echo Posts data saved to posts.json

echo.
echo 📊 Testing Stats API...
curl -s http://localhost:5000/api/stats
echo.

echo ========================================
echo ✅ Test Complete!
echo ========================================
echo.
echo Check the browser at:
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo.
echo Expected Results:
echo - Ravi's Card: ₹400 raised from 4 donors
echo - Dashboard: ₹100 total, 1 story, 1 collaboration
echo.
pause