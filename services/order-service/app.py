"""
Order Service (Consumer Microservice)
Initiates payment requests to the payment service, integrated with ACO pre-emptive gating.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests
import os
import time

app = FastAPI(
    title="Order Service (Consumer)",
    description="Consumer microservice initiating customer orders and payment transactions.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PAYMENT_SERVICE_URL = os.getenv("PAYMENT_SERVICE_URL", "http://127.0.0.1:8002")
ACO_GATEWAY_URL = os.getenv("ACO_GATEWAY_URL", "http://127.0.0.1:8000")

class OrderRequest(BaseModel):
    order_id: str = Field(default_factory=lambda: f"ORD-{int(time.time()*1000)%100000}")
    user_id: str = "U100"
    amount: float = 100.50
    currency: str = "INR"

@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "order-service",
        "service_id": "svc-order-01",
        "target_payment_service": PAYMENT_SERVICE_URL,
        "timestamp": time.time()
    }

@app.post("/create-order")
def create_order(order: OrderRequest, bypass_gating: bool = False):
    """
    Creates an order and initiates payment request.
    If bypass_gating is False, queries ACO Gating Engine first for pre-emptive allowance.
    """
    start_time = time.time()
    
    gate_decision = "ALLOW"
    gate_reason = "Bypassed or Nominal"
    
    # 1. Pre-emptive Gating Query
    if not bypass_gating:
        try:
            gate_resp = requests.get(f"{ACO_GATEWAY_URL}/api/gating/current", timeout=0.5)
            if gate_resp.status_code == 200:
                gdata = gate_resp.json()
                gate_decision = gdata.get("current_gate", "ALLOW")
                gate_reason = gdata.get("primary_reason", "")
        except Exception:
            gate_decision = "ALLOW" # Fallback if gateway offline
            
    # If QUARANTINED: Pre-emptively block request and return structured error before touching provider
    if gate_decision == "QUARANTINE":
        return {
            "status": "PRE_EMPTIVELY_QUARANTINED",
            "order_id": order.order_id,
            "message": "Order execution pre-emptively blocked by ACO Gating Engine to protect payment provider.",
            "gate_decision": "QUARANTINE",
            "reason": gate_reason,
            "latency_ms": round((time.time() - start_time) * 1000, 2)
        }
    
    # If DEGRADE: Use degraded / asynchronous flow
    if gate_decision == "DEGRADE":
        return {
            "status": "ORDER_ACCEPTED_ASYNC_DEGRADED",
            "order_id": order.order_id,
            "message": "Payment degraded to asynchronous settlement due to moderate compatibility risk.",
            "gate_decision": "DEGRADE",
            "latency_ms": round((time.time() - start_time) * 1000, 2)
        }

    # Dispatch to Payment Service
    payload = {
        "user_id": order.user_id,
        "amount": order.amount,
        "currency": order.currency
    }
    
    try:
        resp = requests.post(f"{PAYMENT_SERVICE_URL}/payment", json=payload, timeout=2.5)
        latency = round((time.time() - start_time) * 1000, 2)
        
        if resp.status_code == 200:
            return {
                "status": "ORDER_COMPLETED",
                "order_id": order.order_id,
                "payment_details": resp.json(),
                "gate_decision": gate_decision,
                "latency_ms": latency
            }
        else:
            return {
                "status": "PAYMENT_FAILED_AT_RUNTIME",
                "order_id": order.order_id,
                "error": resp.text,
                "status_code": resp.status_code,
                "gate_decision": gate_decision,
                "latency_ms": latency
            }
    except Exception as e:
        return {
            "status": "PAYMENT_UNREACHABLE",
            "order_id": order.order_id,
            "error": str(e),
            "latency_ms": round((time.time() - start_time) * 1000, 2)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
