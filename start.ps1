# JNTUA Central Library Management System (CLMS) PowerShell Launcher
Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  JAWAHARLAL NEHRU TECHNOLOGICAL UNIVERSITY ANANTAPUR (JNTUA)" -ForegroundColor Yellow
Write-Host "  Dr. A.P.J. Abdul Kalam Central Library Management System (CLMS)" -ForegroundColor White
Write-Host "===================================================================" -ForegroundColor Cyan

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend
Write-Host "Starting Backend API Server on http://localhost:5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; node server.js"

# 2. Start Frontend
Write-Host "Starting Frontend Portal on http://localhost:5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; npm run dev"

Start-Sleep -Seconds 2
Write-Host "Opening http://localhost:5173 in default browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"
