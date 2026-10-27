"""
Digital Twin Simulation & Behavior Morphing Router.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from backend.app.services.simulation_service import run_digital_twin_simulation
from backend.app.engines.behavior_morphing import attempt_behavior_morph
from backend.app.services.contract_service import contract_service

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

@router.post("/evaluate")
def simulate_contract_change(payload: Dict[str, Any]):
    simulated_contract = payload.get("simulated_contract")
    if not simulated_contract:
        raise HTTPException(status_code=400, detail="Missing simulated_contract")
    result = run_digital_twin_simulation(simulated_contract)
    return result

@router.post("/morph")
def simulate_behavior_morph(payload: Dict[str, Any]):
    sample_payload = payload.get("payload", {"user_id": "U100", "amount": 100.5, "currency": "INR"})
    source_schema = payload.get("source_schema", contract_service.active_consumer_contract.get("request_schema", {}))
    target_schema = payload.get("target_schema", contract_service.active_provider_contract.get("request_schema", {}))
    
    morph_result = attempt_behavior_morph(sample_payload, source_schema, target_schema)
    return morph_result
