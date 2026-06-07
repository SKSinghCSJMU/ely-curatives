@echo off
REM For Windows users

cd /d "%~dp0backend"
echo.
echo 🚀 Starting ELY Curatives Backend...
echo 📍 Admin Dashboard: http://localhost:3000/admin
echo ✅ Press Ctrl+C to stop server
echo.
npm start
pause
