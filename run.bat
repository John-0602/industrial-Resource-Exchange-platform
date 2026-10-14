@echo off
title Resource Exchange Platform - Launcher
color 0A

echo ======================================================================
echo           RESOURCE EXCHANGE PLATFORM (COLLEGE LAB CAT 2)
echo                  Full-Stack Microservices Launcher
echo ======================================================================
echo.

REM Check if Node.js is available
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

echo [1/4] Checking project dependencies...

if not exist "resource-service\node_modules" (
    echo [INFO] Installing Resource Service dependencies...
    cd resource-service && call npm install && cd ..
)

if not exist "exchange-service\node_modules" (
    echo [INFO] Installing Exchange Service dependencies...
    cd exchange-service && call npm install && cd ..
)

if not exist "frontend\node_modules" (
    echo [INFO] Installing Frontend dependencies...
    cd frontend && call npm install && cd ..
)

echo.
echo [2/4] Cleaning any previous processes on ports 5001, 5002, 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5002 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul

echo.
echo [3/4] Ensuring demo student accounts and sample resources are seeded...
cd resource-service
call npm run seed >nul 2>nul
cd ..

echo.
echo [4/5] Launching Microservices in independent processes...
echo.

REM Start Microservice 1: Resource Service on Port 5001
echo    - Starting Resource Service on http://localhost:5001 ...
start "Resource Service (:5001)" cmd /k "cd /d "%~dp0resource-service" && title Resource Service [Port 5001] && npm start"

REM Brief pause to let Resource Service bind its port
timeout /t 2 /nobreak >nul

REM Start Microservice 2: Exchange Service on Port 5002
echo    - Starting Exchange Service on http://localhost:5002 ...
start "Exchange Service (:5002)" cmd /k "cd /d "%~dp0exchange-service" && title Exchange Service [Port 5002] && npm start"

REM Brief pause to let Exchange Service initialize
timeout /t 2 /nobreak >nul

REM Start Frontend: React Vite on Port 5173
echo    - Starting React Frontend on http://localhost:5173 ...
start "Frontend Client (:5173)" cmd /k "cd /d "%~dp0frontend" && title Frontend React Client [Port 5173] && npm run dev"

echo.
echo [4/4] Opening Resource Exchange Platform in your default browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ======================================================================
echo   SUCCESS! All services are running:
echo   - Frontend:         http://localhost:5173
echo   - Resource Service: http://localhost:5001
echo   - Exchange Service: http://localhost:5002
echo.
echo   Demo Accounts for 1-Click Login (on /login screen):
echo   - Priya Sharma (CS)  : priya.sharma@apex.edu  / Password@123
echo   - Rahul Verma  (ECE) : rahul.verma@apex.edu   / Password@123
echo   - Ananya Iyer  (Mech): ananya.iyer@apex.edu   / Password@123
echo.
echo   Keep the service windows open. Run 'stop.bat' or close the windows
echo   when you wish to stop the application.
echo ======================================================================
echo.
pause
