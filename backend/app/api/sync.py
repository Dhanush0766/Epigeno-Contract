"""
Quorum Synchronization API Router.
"""

from fastapi import APIRouter
from typing import Dict, Any, Optional

from backend.app.services.contract_service import contract_service
from backend.app.engines.quorum_sync import simulate_quorum_exchange
from backend.app.api.websocket import ws_hub

router = APIRouter(prefix="/api/sync", tags=["Quorum Sync"])

@router.post("/exchange")
async def trigger_quorum_exchange(payload: Optional[Dict[str, Any]] = None):
    source_node = payload.get("source_node", "Node-A") if payload else "Node-A"
    fail_node = payload.get("simulate_failure", False) if payload else False
    
    current_ver = contract_service.active_provider_contract.get("version", "1.0.0")
    changed_genes = contract_service.last_pcae.get("affected_genes", [])
    
    sync_res = simulate_quorum_exchange(
        genome_version=current_ver,
        changed_genes=changed_genes,
        source_node=source_node,
        simulate_byzantine_failure=fail_node
    )
    
    contract_service.sync_history.append(sync_res)
    contract_service.record_event("QUORUM_SYNC_EXECUTED", {
        "status": sync_res["status"],
        "votes": f"{sync_res['votes_approved']}/{sync_res['votes_total']}",
        "delta_hash": sync_res["delta_hash"]
    })
    
    await ws_hub.broadcast_event("sync.completed", sync_res)
    return sync_res

@router.get("/history")
def get_sync_history():
    return {"history": contract_service.sync_history}
