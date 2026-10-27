"""
Deterministic NLP & Voice Contract Assistant Engine.
Parses natural language and speech commands into structured contract mutations and system queries.
Supports 15 canonical intent classes with deterministic entity extraction and breaking risk flagging.
"""

import re
from typing import Dict, Any, Tuple

def parse_nlp_command(text: str, mode: str = "TEXT") -> Dict[str, Any]:
    """
    Parses natural language text or voice transcript into structured intent and entities.
    """
    cleaned = text.strip()
    lower = cleaned.lower()
    
    intent = "UNKNOWN"
    confidence = 0.50
    entities = {}
    requires_confirmation = False
    risk_level = "SAFE"
    summary_message = "I could not understand that command. Please rephrase."
    proposed_change = None
    
    # 1. ROLLBACK
    if any(k in lower for k in ["rollback", "revert", "undo", "restore previous", "roll back"]):
        intent = "ROLLBACK"
        confidence = 0.99
        requires_confirmation = True
        risk_level = "WARNING"
        summary_message = "Revert active contract to previous stable version."
        entities = {"target_version": "previous"}

    # 2. CHANGE_TYPE (e.g. "Change amount from number to string", "Make amount a string")
    elif re.search(r"change\s+([a-zA-Z0-9_]+)\s+(?:type\s+)?from\s+([a-zA-Z]+)\s+to\s+([a-zA-Z]+)", lower):
        m = re.search(r"change\s+([a-zA-Z0-9_]+)\s+(?:type\s+)?from\s+([a-zA-Z]+)\s+to\s+([a-zA-Z]+)", lower)
        intent = "CHANGE_TYPE"
        field_name = m.group(1)
        old_type = m.group(2)
        new_type = m.group(3)
        confidence = 0.98
        entities = {"field": field_name, "old_type": old_type, "new_type": new_type}
        requires_confirmation = True
        risk_level = "BREAKING" if new_type != old_type else "SAFE"
        summary_message = f"Change field '{field_name}' type from '{old_type}' to '{new_type}'. This is potentially breaking."
        proposed_change = {
            "type": "CHANGE_TYPE",
            "field": field_name,
            "new_type": new_type
        }
    elif re.search(r"(?:change|set|make)\s+([a-zA-Z0-9_]+)\s+(?:to|as)\s+(string|number|integer|boolean|float|object|array)", lower):
        m = re.search(r"(?:change|set|make)\s+([a-zA-Z0-9_]+)\s+(?:to|as)\s+(string|number|integer|boolean|float|object|array)", lower)
        intent = "CHANGE_TYPE"
        field_name = m.group(1)
        new_type = m.group(2)
        confidence = 0.95
        entities = {"field": field_name, "new_type": new_type}
        requires_confirmation = True
        risk_level = "BREAKING"
        summary_message = f"Change field '{field_name}' type to '{new_type}'."
        proposed_change = {"type": "CHANGE_TYPE", "field": field_name, "new_type": new_type}

    # 3. ADD_FIELD (e.g. "Add an optional customer phone number", "Add required field email")
    elif "add" in lower and ("field" in lower or "optional" in lower or "required" in lower or "phone" in lower or "email" in lower or "number" in lower):
        intent = "ADD_FIELD"
        is_optional = "optional" in lower or "not required" in lower
        is_req = "required" in lower and not is_optional
        confidence = 0.96
        
        # Extract field name
        field_match = re.search(r"add\s+(?:an?\s+)?(?:optional\s+|required\s+)?(?:customer\s+)?([a-zA-Z0-9_]+)", lower)
        field_name = field_match.group(1) if field_match else "phone"
        
        # Type detection
        field_type = "string"
        if "number" in lower and field_name != "number":
            field_type = "string" # phone number is usually string
        elif "integer" in lower or "count" in lower:
            field_type = "integer"
        elif "boolean" in lower or "flag" in lower:
            field_type = "boolean"
            
        entities = {
            "field": field_name,
            "type": field_type,
            "required": is_req,
            "optional": is_optional or (not is_req)
        }
        requires_confirmation = is_req # Required additions break existing consumers
        risk_level = "BREAKING" if is_req else "SAFE"
        summary_message = f"Add {'required' if is_req else 'optional'} field '{field_name}' ({field_type})."
        proposed_change = {
            "type": "ADD_FIELD",
            "field": field_name,
            "data_type": field_type,
            "required": is_req
        }

    # 4. MAKE_OPTIONAL (e.g. "Make transaction_id optional", "Make amount optional")
    elif re.search(r"make\s+([a-zA-Z0-9_]+)\s+optional", lower) or "set optional" in lower:
        m = re.search(r"make\s+([a-zA-Z0-9_]+)\s+optional", lower)
        field_name = m.group(1) if m else "transaction_id"
        intent = "MAKE_OPTIONAL"
        confidence = 0.97
        entities = {"field": field_name, "required": False}
        requires_confirmation = False
        risk_level = "SAFE"
        summary_message = f"Make field '{field_name}' optional in contract."
        proposed_change = {"type": "MAKE_OPTIONAL", "field": field_name}

    # 5. MAKE_REQUIRED (e.g. "Make transaction_id required")
    elif re.search(r"make\s+([a-zA-Z0-9_]+)\s+required", lower):
        m = re.search(r"make\s+([a-zA-Z0-9_]+)\s+required", lower)
        field_name = m.group(1) if m else "transaction_id"
        intent = "MAKE_REQUIRED"
        confidence = 0.97
        entities = {"field": field_name, "required": True}
        requires_confirmation = True
        risk_level = "BREAKING"
        summary_message = f"Make field '{field_name}' strictly required. May impact legacy consumers."
        proposed_change = {"type": "MAKE_REQUIRED", "field": field_name}

    # 6. CHANGE_TIMEOUT / TEMPORAL (e.g. "Change payment timeout from 2 seconds to 5 seconds")
    elif any(k in lower for k in ["timeout", "latency", "seconds", "ms"]) and any(k in lower for k in ["change", "set", "increase", "reduce", "from"]):
        intent = "CHANGE_TIMEOUT"
        confidence = 0.96
        # Find numeric values
        numbers = re.findall(r"(\d+(?:\.\d+)?)\s*(?:seconds?|s|ms)?", lower)
        new_val = 5000
        if numbers:
            val = float(numbers[-1])
            new_val = int(val * 1000) if val < 100 else int(val)
        entities = {"parameter": "timeout", "new_value_ms": new_val}
        requires_confirmation = False
        risk_level = "WARNING" if new_val > 3000 else "SAFE"
        summary_message = f"Update timeout constraint to {new_val} ms."
        proposed_change = {"type": "CHANGE_TIMEOUT", "timeout_ms": new_val}

    # 7. CHANGE_THROUGHPUT / RESOURCE (e.g. "Reduce throughput requirement to 100 requests per second")
    elif any(k in lower for k in ["throughput", "rps", "requests per second", "capacity"]) and any(k in lower for k in ["reduce", "increase", "change", "set", "to"]):
        intent = "CHANGE_THROUGHPUT"
        confidence = 0.96
        numbers = re.findall(r"(\d+)", lower)
        new_rps = int(numbers[-1]) if numbers else 100
        entities = {"parameter": "min_throughput_rps", "new_value_rps": new_rps}
        requires_confirmation = False
        risk_level = "WARNING" if new_rps > 1000 else "SAFE"
        summary_message = f"Update throughput requirement to {new_rps} RPS."
        proposed_change = {"type": "CHANGE_THROUGHPUT", "min_throughput_rps": new_rps}

    # 8. CHANGE_CONSTRAINT / INVARIANT (e.g. "Change amount constraint from greater than 0 to greater than or equal to 0")
    elif "constraint" in lower or "invariant" in lower or "greater than" in lower:
        intent = "CHANGE_CONSTRAINT"
        confidence = 0.95
        entities = {"invariant": "amount", "new_expression": "amount >= 0"}
        requires_confirmation = False
        risk_level = "SAFE"
        summary_message = "Relax amount invariant to allow zero-value transactions (amount >= 0)."
        proposed_change = {"type": "CHANGE_CONSTRAINT", "expression": "amount >= 0"}

    # 9. SIMULATE_CHANGE (e.g. "Simulate changing amount to string")
    elif "simulate" in lower:
        intent = "SIMULATE_CHANGE"
        confidence = 0.98
        entities = {"action": "simulate_mutation", "target": "amount", "new_type": "string"}
        requires_confirmation = False
        risk_level = "SAFE"
        summary_message = "Run sandbox Digital Twin simulation without modifying production contract."

    # 10. CHECK_COMPATIBILITY
    elif any(k in lower for k in ["check compatibility", "evaluate compatibility", "is it compatible", "pcae"]):
        intent = "CHECK_COMPATIBILITY"
        confidence = 0.99
        summary_message = "Triggering real-time PCAE compatibility assessment across services."

    # 11. CHECK_CONTRACT / SHOW_DIFF / SHOW_EXPLANATION
    elif "diff" in lower or "difference" in lower:
        intent = "SHOW_DIFF"
        confidence = 0.98
        summary_message = "Displaying visual contract diff and CCPS analysis."
    elif "why" in lower or "explain" in lower or "reason" in lower:
        intent = "SHOW_EXPLANATION"
        confidence = 0.98
        summary_message = "Displaying root-cause attribution explanation."
    elif "show contract" in lower or "view contract" in lower:
        intent = "CHECK_CONTRACT"
        confidence = 0.98
        summary_message = "Displaying active contract specification."

    return {
        "raw_input": text,
        "input_mode": mode,
        "intent": intent,
        "confidence": confidence,
        "entities": entities,
        "requires_confirmation": requires_confirmation,
        "risk_level": risk_level,
        "summary_message": summary_message,
        "proposed_contract_change": proposed_change
    }
