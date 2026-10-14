@echo off
title Industrial Resource Exchange Platform (IREP) - Stopper
color 0C

echo ======================================================================
echo       INDUSTRIAL RESOURCE EXCHANGE PLATFORM (IREP) - STOPPING SERVICES
echo ======================================================================
echo.

echo Stopping services on ports 5001, 5002, 5173...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo [STOPPED] Terminated Resource Service on port 5001 (PID %%a)
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5002 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo [STOPPED] Terminated Exchange Service on port 5002 (PID %%a)
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo [STOPPED] Terminated Frontend Client on port 5173 (PID %%a)
)

echo.
echo All IREP microservices and frontend instances have been stopped cleanly.
echo ======================================================================
timeout /t 2 >nul
