"""
Software Metrics API Router.
"""

from fastapi import APIRouter
from backend.app.services.contract_service import contract_service
from backend.app.engines.metrics_engine import compute_all_software_metrics

router = APIRouter(prefix="/api/metrics", tags=["Metrics"])

@router.get("/all")
def get_all_metrics():
    metrics = compute_all_software_metrics(
        current_pcae=contract_service.last_pcae,
        gate_decision=contract_service.last_gate,
        recent_changes=contract_service.contract_changes,
        nlp_commands_history=contract_service.nlp_commands
    )
    return metrics
