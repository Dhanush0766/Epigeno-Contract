"""
Seed Data Loader.
Populates realistic deterministic demo baseline data for services, contracts, and telemetry.
"""

from typing import Dict, Any
from datetime import datetime, timezone, timedelta
import json
import os

from backend.app.services.contract_service import contract_service

def load_initial_seed_data():
    """
    Initializes Payment and Order contracts and seeds historical data points.
    """
    # 1. Default Payment Contract (Provider)
    payment_contract = {
        "contract_id": "CTR-PAYMENT-001",
        "name": "PaymentServiceContract",
        "version": "1.0.0",
        "service_id": "svc-payment-01",
        "service_name": "Payment Service",
        "endpoint": "/payment",
        "method": "POST",
        "description": "Primary transactional settlement endpoint for consumer order processing",
        "request_schema": {
            "type": "object",
            "required": ["user_id", "amount", "currency"],
            "properties": {
                "user_id": { "type": "string", "description": "Customer identifier" },
                "amount": { "type": "number", "minimum": 0.01, "description": "Payment amount in base units" },
                "currency": { "type": "string", "enum": ["INR", "USD", "EUR", "GBP"], "description": "ISO currency code" }
            }
        },
        "response_schema": {
            "type": "object",
            "required": ["status", "transaction_id"],
            "properties": {
                "status": { "type": "string", "enum": ["SUCCESS", "FAILED", "PENDING"] },
                "transaction_id": { "type": "string" }
            }
        },
        "invariants": [
            { "id": "inv_amount_pos", "expression": "amount > 0", "description": "Amount must be strictly positive", "weight": 0.95 },
            { "id": "inv_curr_enum", "expression": "currency in ['INR','USD','EUR','GBP']", "description": "Allowed currencies", "weight": 0.85 }
        ],
        "temporal_constraints": {
            "max_latency_ms": 2000,
            "timeout_ms": 3000
        },
        "resource_constraints": {
            "min_throughput_rps": 500,
            "max_payload_kb": 64
        }
    }

    # 2. Default Order Consumer Contract
    order_contract = {
        "contract_id": "CTR-ORDER-PAY-001",
        "name": "OrderToPaymentConsumerContract",
        "version": "1.0.0",
        "service_id": "svc-order-01",
        "service_name": "Order Service",
        "target_service_id": "svc-payment-01",
        "endpoint": "/payment",
        "method": "POST",
        "request_schema": {
            "type": "object",
            "required": ["user_id", "amount", "currency"],
            "properties": {
                "user_id": { "type": "string" },
                "amount": { "type": "number" },
                "currency": { "type": "string" }
            }
        },
        "response_schema": {
            "type": "object",
            "required": ["status", "transaction_id"],
            "properties": {
                "status": { "type": "string" },
                "transaction_id": { "type": "string" }
            }
        },
        "invariants": [
            { "id": "inv_amount_pos", "expression": "amount > 0" }
        ],
        "temporal_constraints": {
            "expected_timeout_ms": 2500
        },
        "resource_constraints": {
            "required_throughput_rps": 400
        }
    }

    # Initialize Contract Manager with seed
    contract_service.initialize_system(payment_contract, order_contract)
    
    # 3. Seed historical time series records (10 intervals) for trend visualization
    now = datetime.now(timezone.utc)
    seeded_history = [
        {"timestamp": (now - timedelta(minutes=45)).isoformat(), "cs_composite": 0.982, "scs": 1.0, "semcs": 0.985, "tcs": 0.962, "rcs": 0.988, "p_fail": 0.034, "gate": "ALLOW"},
        {"timestamp": (now - timedelta(minutes=40)).isoformat(), "cs_composite": 0.974, "scs": 1.0, "semcs": 0.980, "tcs": 0.941, "rcs": 0.978, "p_fail": 0.042, "gate": "ALLOW"},
        {"timestamp": (now - timedelta(minutes=35)).isoformat(), "cs_composite": 0.961, "scs": 1.0, "semcs": 0.972, "tcs": 0.915, "rcs": 0.960, "p_fail": 0.059, "gate": "ALLOW"},
        {"timestamp": (now - timedelta(minutes=30)).isoformat(), "cs_composite": 0.978, "scs": 1.0, "semcs": 0.984, "tcs": 0.952, "rcs": 0.982, "p_fail": 0.038, "gate": "ALLOW"},
        {"timestamp": (now - timedelta(minutes=25)).isoformat(), "cs_composite": 0.985, "scs": 1.0, "semcs": 0.990, "tcs": 0.965, "rcs": 0.991, "p_fail": 0.031, "gate": "ALLOW"},
        {"timestamp": (now - timedelta(minutes=20)).isoformat(), "cs_composite": 0.979, "scs": 1.0, "semcs": 0.982, "tcs": 0.954, "rcs": 0.987, "p_fail": 0.037, "gate": "ALLOW"},
        {"timestamp": (now - timedelta(minutes=15)).isoformat(), "cs_composite": 0.968, "scs": 1.0, "semcs": 0.978, "tcs": 0.928, "rcs": 0.969, "p_fail": 0.051, "gate": "ALLOW"},
        {"timestamp": (now - timedelta(minutes=10)).isoformat(), "cs_composite": 0.975, "scs": 1.0, "semcs": 0.981, "tcs": 0.948, "rcs": 0.975, "p_fail": 0.043, "gate": "ALLOW"},
        {"timestamp": (now - timedelta(minutes=5)).isoformat(), "cs_composite": 0.981, "scs": 1.0, "semcs": 0.986, "tcs": 0.960, "rcs": 0.985, "p_fail": 0.035, "gate": "ALLOW"},
        {"timestamp": now.isoformat(), "cs_composite": 0.976, "scs": 1.0, "semcs": 0.980, "tcs": 0.950, "rcs": 0.974, "p_fail": 0.041, "gate": "ALLOW"}
    ]
    contract_service.compatibility_history = seeded_history
    
    # Initial seed event
    contract_service.record_event("SYSTEM_BOOTSTRAPPED", {
        "provider": "svc-payment-01",
        "consumer": "svc-order-01",
        "initial_cs": 0.976,
        "initial_gate": "ALLOW",
        "data_label": "DEMO DATA"
    })
    
    # Seed sample NLP history
    contract_service.nlp_commands = [
        {
            "id": "NLP-SEED-01",
            "raw_input": "Check compatibility.",
            "input_mode": "TEXT",
            "intent": "CHECK_COMPATIBILITY",
            "confidence": 0.99,
            "entities": {},
            "requires_confirmation": False,
            "is_executed": True,
            "created_at": (now - timedelta(minutes=30)).isoformat()
        }
    ]
