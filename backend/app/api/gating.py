"""
Pre-Emptive Gating & Explanation API Router.
"""

from fastapi import APIRouter
from backend.app.services.contract_service import contract_service

router = APIRouter(prefix="/api/gating", tags=["Gating"])

@router.get("/current")
def get_current_gate():
    return {
        "current_gate": contract_service.last_gate.get("current_gate", "ALLOW"),
        "raw_gate": contract_service.last_gate.get("raw_gate", "ALLOW"),
        "p_fail": contract_service.last_gate.get("p_fail", 0.041),
        "hysteresis_applied": contract_service.last_gate.get("hysteresis_applied", False),
        "primary_reason": contract_service.last_gate.get("primary_reason", "All envelopes nominal"),
        "affected_genes": contract_service.last_gate.get("affected_genes", []),
        "thresholds": contract_service.last_gate.get("thresholds", {}),
        "explanation": contract_service.last_explanation
    }

@router.get("/explanation")
def get_detailed_explanation():
    return contract_service.last_explanation
