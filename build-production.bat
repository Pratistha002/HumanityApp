@echo off
echo ========================================
echo 🏗️  Building Production Version
echo ========================================
echo.
echo This will build the React frontend for production
echo and configure the backend to serve it as a single app.
echo.
echo Press any key to continue...
pause >nul

echo.
echo 📦 Installing Frontend Dependencies...
cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Frontend"
call npm install

echo.
echo 🏗️  Building React Frontend...
call npm run build

echo.
echo 📦 Installing Backend Dependencies...
cd /d "c:\Users\PratisthaSingh\Desktop\Donation\Backend"
call npm install

echo.
echo ========================================
echo ✅ Production Build Complete!
echo ========================================
echo.
echo To run in production mode:
echo 1. Set NODE_ENV=production
echo 2. Run: npm start (from Backend folder)
echo 3. Access: http://localhost:5000
echo.
echo The React app will be served from the backend server.
echo.
pause