@echo off
title JNTUA Central Library Management System Launcher
echo ===================================================================
echo   JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY ANANTAPUR (JNTUA)
echo   Dr. A.P.J. Abdul Kalam Central Library Management System (CLMS)
echo ===================================================================
echo.
echo [1/3] Checking dependencies & database...
cd /d "%~dp0backend"
if not exist "database\jntua_clms.db" (
  echo Initializing database schema and seed data...
  call node database/initDb.js
)

echo [2/3] Starting Backend API Server (Port 5000)...
start "JNTUA CLMS Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

echo [3/3] Starting Frontend Portal (Port 5173)...
start "JNTUA CLMS Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 2 /nobreak >nul
echo.
echo Launching Central Library Portal in browser: http://localhost:5173
start http://localhost:5173

echo.
echo ===================================================================
echo System is running!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api/health
echo ===================================================================
pause
