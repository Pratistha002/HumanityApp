@echo off
echo ========================================
echo   🚀 Starting Humanity Development Mode
echo ========================================
echo.
echo 📡 Starting Backend Server with Auto-Refresh...
echo 🌐 Starting React Client with Hot Reload...
echo.
echo 🔄 Auto-refresh is enabled for:
echo   ✅ Server files (.js, .json, .env)
echo   ✅ React components (.js, .jsx, .css)
echo.
echo 📍 URLs:
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo 💡 Make changes to any file and see them instantly!
echo 🛑 Press Ctrl+C to stop both servers
echo.
echo ========================================
npm run dev
pause