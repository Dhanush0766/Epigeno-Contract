"""
Payment Service (Provider Microservice)
Enforces the active API contract for POST /payment.
"""

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uuid
import time
import os

app = FastAPI(
    title="Payment Service (Provider)",
    description="Provider microservice implementing transactional payment settlement.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory runtime contract configuration that can be updated dynamically
CURRENT_CONTRACT_VERSION = os.getenv("PAYMENT_CONTRACT_VERSION", "1.0.0")
EXPECTED_AMOUNT_TYPE = os.getenv("AMOUNT_TYPE", "number") # 'number' or 'string'

class PaymentRequest(BaseModel):
    user_id: str = Field(..., description="Unique customer identifier", example="U100")
    amount: float = Field(..., description="Payment amount", example=100.50)
    currency: str = Field(..., description="Currency code", example="INR")

@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "payment-service",
        "service_id": "svc-payment-01",
        "contract_version": CURRENT_CONTRACT_VERSION,
        "expected_amount_type": EXPECTED_AMOUNT_TYPE,
        "timestamp": time.time()
    }

@app.post("/payment")
async def process_payment(request: Request):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed JSON payload")
    
    # Check schema requirements
    if "user_id" not in body or "amount" not in body or "currency" not in body:
        raise HTTPException(status_code=422, detail="Missing required field in PaymentRequest")
    
    amount_val = body["amount"]
    
    # Contract validation check based on current active schema type
    if EXPECTED_AMOUNT_TYPE == "number":
        if not isinstance(amount_val, (int, float)):
            raise HTTPException(
                status_code=422, 
                detail=f"Schema Violation: 'amount' expected to be numeric (number/float), received {type(amount_val).__name__}"
            )
        if amount_val <= 0:
            raise HTTPException(
                status_code=422,
                detail=f"Invariant Violation: 'amount' must be > 0, received {amount_val}"
            )
    elif EXPECTED_AMOUNT_TYPE == "string":
        if not isinstance(amount_val, str):
            raise HTTPException(
                status_code=422,
                detail=f"Schema Violation: 'amount' expected to be string, received {type(amount_val).__name__}"
            )

    # Simulated successful settlement
    tx_id = f"TX{int(time.time() * 1000) % 1000000:06d}"
    return {
        "status": "SUCCESS",
        "transaction_id": tx_id,
        "settled_amount": amount_val,
        "currency": body["currency"],
        "user_id": body["user_id"],
        "processed_at": time.time()
    }

@app.post("/admin/set-contract-version")
def set_contract_version(version: str, amount_type: str = "number"):
    global CURRENT_CONTRACT_VERSION, EXPECTED_AMOUNT_TYPE
    CURRENT_CONTRACT_VERSION = version
    EXPECTED_AMOUNT_TYPE = amount_type
    return {
        "message": "Payment service contract version updated",
        "version": CURRENT_CONTRACT_VERSION,
        "expected_amount_type": EXPECTED_AMOUNT_TYPE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
