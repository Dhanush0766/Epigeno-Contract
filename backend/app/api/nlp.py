"""
NLP & Voice Contract Assistant API Router.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
import copy
import uuid

from backend.app.engines.nlp_engine import parse_nlp_command
from backend.app.services.contract_service import contract_service
from backend.app.api.websocket import ws_hub

router = APIRouter(prefix="/api/nlp", tags=["NLP"])

@router.post("/parse")
def parse_command(payload: Dict[str, Any]):
    text = payload.get("text", "")
    mode = payload.get("mode", "TEXT")
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Empty text input")
        
    parsed = parse_nlp_command(text, mode=mode)
    
    # Store in history
    command_record = {
        "id": f"NLP-{uuid.uuid4().hex[:8].upper()}",
        "raw_input": text,
        "input_mode": mode,
        "intent": parsed["intent"],
        "confidence": parsed["confidence"],
        "entities": parsed["entities"],
        "requires_confirmation": parsed["requires_confirmation"],
        "is_executed": False
    }
    contract_service.nlp_commands.append(command_record)
    parsed["command_id"] = command_record["id"]
    
    return parsed

@router.post("/execute")
async def execute_nlp_command(payload: Dict[str, Any]):
    """
    Executes a parsed NLP contract mutation after user confirmation.
    """
    intent = payload.get("intent")
    entities = payload.get("entities", {})
    confirmed = payload.get("confirmed", True)
    
    if not confirmed:
        return {"status": "CANCELLED", "message": "Command cancelled by user."}
        
    # Mark in history
    for cmd in contract_service.nlp_commands:
        if cmd.get("intent") == intent:
            cmd["is_executed"] = True
            
    # Handle Intent Mutations
    if intent == "CHANGE_TYPE":
        field_name = entities.get("field", "amount")
        new_type = entities.get("new_type", "string")
        
        proposed = copy.deepcopy(contract_service.active_provider_contract)
        req_props = proposed.setdefault("request_schema", {}).setdefault("properties", {})
        if field_name in req_props:
            req_props[field_name]["type"] = new_type
            
        mutation_res = contract_service.apply_contract_mutation(proposed, "2.0.0")
        
        await ws_hub.broadcast_event("contract.updated", mutation_res)
        await ws_hub.broadcast_event("pcae.completed", contract_service.last_pcae)
        await ws_hub.broadcast_event("gate.changed", contract_service.last_gate)
        
        return {
            "status": "EXECUTED",
            "message": f"Successfully mutated '{field_name}' type to '{new_type}'.",
            "mutation_result": mutation_res
        }
        
    elif intent == "ADD_FIELD":
        field_name = entities.get("field", "phone")
        field_type = entities.get("type", "string")
        is_req = entities.get("required", False)
        
        proposed = copy.deepcopy(contract_service.active_provider_contract)
        req_props = proposed.setdefault("request_schema", {}).setdefault("properties", {})
        req_props[field_name] = {"type": field_type, "description": f"Customer {field_name}"}
        if is_req:
            req_list = proposed.setdefault("request_schema", {}).setdefault("required", [])
            if field_name not in req_list:
                req_list.append(field_name)
                
        mutation_res = contract_service.apply_contract_mutation(proposed, "1.1.0")
        await ws_hub.broadcast_event("contract.updated", mutation_res)
        await ws_hub.broadcast_event("pcae.completed", contract_service.last_pcae)
        await ws_hub.broadcast_event("gate.changed", contract_service.last_gate)
        
        return {
            "status": "EXECUTED",
            "message": f"Added field '{field_name}' ({field_type}).",
            "mutation_result": mutation_res
        }

    elif intent == "MAKE_OPTIONAL":
        field_name = entities.get("field", "transaction_id")
        proposed = copy.deepcopy(contract_service.active_provider_contract)
        req_list = proposed.setdefault("response_schema", {}).setdefault("required", [])
        if field_name in req_list:
            req_list.remove(field_name)
        mutation_res = contract_service.apply_contract_mutation(proposed, "1.0.1")
        await ws_hub.broadcast_event("contract.updated", mutation_res)
        return {"status": "EXECUTED", "message": f"Made '{field_name}' optional."}

    elif intent == "CHANGE_TIMEOUT":
        timeout_val = entities.get("new_value_ms", 5000)
        proposed = copy.deepcopy(contract_service.active_provider_contract)
        proposed.setdefault("temporal_constraints", {})["max_latency_ms"] = timeout_val
        mutation_res = contract_service.apply_contract_mutation(proposed, "1.2.0")
        await ws_hub.broadcast_event("contract.updated", mutation_res)
        await ws_hub.broadcast_event("pcae.completed", contract_service.last_pcae)
        await ws_hub.broadcast_event("gate.changed", contract_service.last_gate)
        return {"status": "EXECUTED", "message": f"Updated timeout constraint to {timeout_val}ms."}

    elif intent == "CHANGE_THROUGHPUT":
        rps_val = entities.get("new_value_rps", 100)
        proposed = copy.deepcopy(contract_service.active_provider_contract)
        proposed.setdefault("resource_constraints", {})["min_throughput_rps"] = rps_val
        mutation_res = contract_service.apply_contract_mutation(proposed, "1.3.0")
        await ws_hub.broadcast_event("contract.updated", mutation_res)
        await ws_hub.broadcast_event("pcae.completed", contract_service.last_pcae)
        await ws_hub.broadcast_event("gate.changed", contract_service.last_gate)
        return {"status": "EXECUTED", "message": f"Updated throughput requirement to {rps_val} RPS."}

    elif intent == "ROLLBACK":
        res = contract_service.rollback_to_version()
        await ws_hub.broadcast_event("contract.rolled_back", res)
        await ws_hub.broadcast_event("pcae.completed", contract_service.last_pcae)
        await ws_hub.broadcast_event("gate.changed", contract_service.last_gate)
        return {"status": "EXECUTED", "message": "Successfully rolled back to previous contract version."}

    elif intent == "CHECK_COMPATIBILITY":
        eval_res = contract_service.run_full_evaluation_pipeline(record_history=True)
        return {"status": "EXECUTED", "message": f"Current Compatibility Score: {round(eval_res['pcae']['cs']*100, 1)}% ({eval_res['gate']['current_gate']})"}

    return {"status": "EXECUTED", "message": f"Command intent '{intent}' executed successfully."}

@router.get("/history")
def get_nlp_command_history():
    return {"history": contract_service.nlp_commands}
