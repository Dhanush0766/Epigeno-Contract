#!/usr/bin/env bash
# Bash script to start all ACO/ECG services

echo "================================================="
echo "  Starting ACO / ECG Autonomous Contract Organism"
echo "================================================="

# Start Payment Service (Provider - Port 8002)
cd services/payment-service && python app.py &
PAYMENT_PID=$!

# Start Order Service (Consumer - Port 8001)
cd ../order-service && python app.py &
ORDER_PID=$!

# Start Backend Engine (Port 8000)
cd ../../ && python backend/run_backend.py &
BACKEND_PID=$!

# Start Frontend (Port 5173)
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "All services running. Press Ctrl+C to terminate."
wait
