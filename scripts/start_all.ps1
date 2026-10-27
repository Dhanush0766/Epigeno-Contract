# PowerShell script to start all ACO/ECG services locally

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Starting ACO / ECG Autonomous Contract Organism" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# 1. Start Payment Service (Provider - Port 8002)
Write-Host "[1/4] Starting Payment Service (Provider) on port 8002..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/../services/payment-service'; python app.py"

# 2. Start Order Service (Consumer - Port 8001)
Write-Host "[2/4] Starting Order Service (Consumer) on port 8001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/../services/order-service'; python app.py"

# 3. Start Backend Core Engine (Port 8000)
Write-Host "[3/4] Starting ACO Core Backend Engine on port 8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/..'; python backend/run_backend.py"

# 4. Start React Frontend Dashboard (Port 5173)
Write-Host "[4/4] Starting React Frontend Dashboard on port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/../frontend'; npm run dev"

Write-Host "All processes started! Open http://localhost:5173 in your browser." -ForegroundColor Yellow
