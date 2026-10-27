"""
Contracts REST API Router.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, List, Optional
import copy

from backend.app.services.contract_service import contract_service
from backend.app.api.websocket import ws_hub
from backend.app.schemas.schemas import ContractDiffRequest, ContractDiffResponse

router = APIRouter(prefix="/api/contracts", tags=["Contracts"])

@router.get("/active")
def get_active_contract():
    return {
        "provider_contract": contract_service.active_provider_contract,
        "consumer_contract": contract_service.active_consumer_contract,
        "version": contract_service.active_provider_contract.get("version", "1.0.0"),
        "status": "ACTIVE"
    }

@router.get("/history")
def get_contract_history():
    return {
        "history": [
            {
                "version": h["version"],
                "genotype_id": h["genotype"]["genotype_id"],
                "hash_sha256": h["genotype"]["hash_sha256"],
                "timestamp": h["timestamp"]
            }
            for h in contract_service.contract_history
        ],
        "changes": contract_service.contract_changes
    }

@router.post("/diff")
def compute_contract_diff(diff_req: ContractDiffRequest):
    proposed = copy.deepcopy(contract_service.active_provider_contract)
    # Merge proposed schema updates
    if "request_schema" in diff_req.proposed_schema:
        proposed["request_schema"] = diff_req.proposed_schema["request_schema"]
    if "temporal_constraints" in diff_req.proposed_schema:
        proposed["temporal_constraints"] = diff_req.proposed_schema["temporal_constraints"]
    if "resource_constraints" in diff_req.proposed_schema:
        proposed["resource_constraints"] = diff_req.proposed_schema["resource_constraints"]
        
    diff_result = contract_service.compute_diff(proposed)
    return diff_result

@router.post("/mutate")
async def mutate_contract(payload: Dict[str, Any], background_tasks: BackgroundTasks):
    """
    Applies a proposed contract change and broadcasts updates over WebSockets.
    """
    new_version = payload.get("new_version", "2.0.0")
    proposed_contract = payload.get("proposed_contract", {})
    
    if not proposed_contract:
        raise HTTPException(status_code=400, detail="Missing proposed_contract payload")
        
    mutation_result = contract_service.apply_contract_mutation(proposed_contract, new_version)
    
    # WebSocket Broadcast
    await ws_hub.broadcast_event("contract.updated", {
        "version": new_version,
        "mutation": mutation_result
    })
    await ws_hub.broadcast_event("pcae.completed", contract_service.last_pcae)
    await ws_hub.broadcast_event("prediction.updated", contract_service.last_prediction)
    await ws_hub.broadcast_event("gate.changed", contract_service.last_gate)
    
    return mutation_result

@router.post("/rollback")
async def rollback_contract(payload: Optional[Dict[str, Any]] = None):
    target_ver = payload.get("target_version") if payload else "previous"
    res = contract_service.rollback_to_version(target_ver)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("message"))
        
    await ws_hub.broadcast_event("contract.rolled_back", res)
    await ws_hub.broadcast_event("pcae.completed", contract_service.last_pcae)
    await ws_hub.broadcast_event("gate.changed", contract_service.last_gate)
    return res
