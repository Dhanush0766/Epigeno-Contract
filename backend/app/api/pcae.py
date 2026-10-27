"""
PCAE & Compatibility API Router.
"""

from fastapi import APIRouter
from typing import Dict, Any

from backend.app.services.contract_service import contract_service
from backend.app.api.websocket import ws_hub

router = APIRouter(prefix="/api/pcae", tags=["PCAE"])

@router.get("/current")
def get_current_pcae_evaluation():
    return {
        "evaluation": contract_service.last_pcae,
        "prediction": contract_service.last_prediction,
        "gate": contract_service.last_gate,
        "explanation": contract_service.last_explanation,
        "history": contract_service.compatibility_history[-20:] # Last 20 points
    }

@router.post("/re-evaluate")
async def trigger_re_evaluation(weights: Dict[str, float] = None):
    """
    Triggers on-demand re-evaluation of PCAE compatibility.
    """
    if weights:
        alpha = weights.get("alpha", 0.25)
        beta = weights.get("beta", 0.25)
        gamma = weights.get("gamma", 0.25)
        delta = weights.get("delta", 0.25)
    else:
        alpha, beta, gamma, delta = 0.25, 0.25, 0.25, 0.25
        
    eval_res = contract_service.run_full_evaluation_pipeline(record_history=True)
    
    await ws_hub.broadcast_event("pcae.completed", eval_res["pcae"])
    await ws_hub.broadcast_event("prediction.updated", eval_res["prediction"])
    await ws_hub.broadcast_event("gate.changed", eval_res["gate"])
    
    return eval_res
