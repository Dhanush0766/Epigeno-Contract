"""
Behavior Morphing & Dynamic Request Adapter Engine.
Simulates runtime request transformation and adapter insertion to reconcile incompatible interactions.
"""

from typing import Dict, Any, Tuple

def attempt_behavior_morph(
    original_payload: Dict[str, Any],
    source_schema: Dict[str, Any],
    target_schema: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Demonstrates behavior morphing:
    If consumer sends amount as number, but provider expects string (or vice-versa),
    the adapter morphs the payload and evaluates post-morph compatibility.
    """
    morphed_payload = dict(original_payload)
    transformations_applied = []
    
    target_props = target_schema.get("properties", {})
    
    for field, val in original_payload.items():
        if field in target_props:
            target_type = target_props[field].get("type")
            
            # Case 1: Number to String
            if target_type == "string" and isinstance(val, (int, float)):
                morphed_payload[field] = str(val)
                transformations_applied.append({
                    "field": field,
                    "operation": "CAST_FLOAT_TO_STRING",
                    "before": val,
                    "after": str(val)
                })
            # Case 2: String to Float
            elif target_type in ["number", "float"] and isinstance(val, str):
                try:
                    num_val = float(val)
                    morphed_payload[field] = num_val
                    transformations_applied.append({
                        "field": field,
                        "operation": "PARSE_STRING_TO_FLOAT",
                        "before": val,
                        "after": num_val
                    })
                except ValueError:
                    pass
                    
    post_morph_cs = 0.98 if transformations_applied else 0.45
    accepted = post_morph_cs >= 0.85
    
    return {
        "status": "MORPHED_SUCCESS" if accepted else "MORPH_FAILED",
        "original_payload": original_payload,
        "morphed_payload": morphed_payload,
        "transformations_applied": transformations_applied,
        "pre_morph_cs": 0.41,
        "post_morph_cs": post_morph_cs,
        "adapter_accepted": accepted,
        "decision": "REROUTE_THROUGH_MORPH_ADAPTER" if accepted else "QUARANTINE"
    }
