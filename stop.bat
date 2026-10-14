@echo off
title Resource Exchange Platform - Stopper
color 0C

echo ======================================================================
echo           RESOURCE EXCHANGE PLATFORM - STOPPING SERVICES
echo ======================================================================
echo.

echo Stopping services on ports 5001, 5002, 5173...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5001 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo [STOPPED] Terminated process on port 5001 (PID %%a)
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5002 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo [STOPPED] Terminated process on port 5002 (PID %%a)
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
    echo [STOPPED] Terminated process on port 5173 (PID %%a)
)

echo.
echo All microservices and frontend instances have been stopped cleanly.
echo ======================================================================
timeout /t 2 >nul
