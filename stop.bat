@echo off
title Resource Exchange Platform - Stopper
color 0C

echo ======================================================================
echo           RESOURCE EXCHANGE PLATFORM - STOPPING SERVICES
echo ======================================================================
echo.

echo Stopping services listening on ports 5001, 5002, 5173...

powershell -Command "foreach ($port in @(5001, 5002, 5173)) { $proc = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess; if ($proc) { Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue; Write-Host ('[STOPPED] Terminated process on port ' + $port) } else { Write-Host ('[INFO] Port ' + $port + ' is already clear') } }"

echo.
echo All microservices and frontend instances have been stopped.
echo ======================================================================
timeout /t 3
