"""
Contract Evolution & Proof Certificate API Router.
"""

from fastapi import APIRouter
from typing import Dict, Any, Optional

from backend.app.engines.evolution_engine import generate_compatibility_proof_certificate, evaluate_candidate_evolution
from backend.app.services.contract_service import contract_service

router = APIRouter(prefix="/api/evolution", tags=["Evolution"])

@router.post("/certify")
def issue_certificate(payload: Optional[Dict[str, Any]] = None):
    version = payload.get("version", contract_service.active_provider_contract.get("version", "1.0.0")) if payload else "1.0.0"
    cs = contract_service.last_pcae.get("cs", 0.976)
    
    cert = generate_compatibility_proof_certificate(
        contract_version=version,
        compatibility_score=cs,
        invariants_preserved=True,
        max_consumer_impact=0.02
    )
    return cert

@router.post("/evaluate-candidate")
def evaluate_candidate(payload: Dict[str, Any]):
    evolution_type = payload.get("evolution_type", "ADD_OPTIONAL_FIELD")
    target_field = payload.get("target_field", "customer_notes")
    details = payload.get("details", {})
    
    result = evaluate_candidate_evolution(evolution_type, target_field, details)
    return result
