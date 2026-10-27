"""
Pre-Emptive Gating Engine.
Drives automated action states: ALLOW, DEGRADE, REROUTE, QUARANTINE with Hysteresis dampening.
"""

from typing import Dict, Any, List, Optional

def evaluate_gate_decision(
    p_fail: float,
    previous_gate: Optional[str] = "ALLOW",
    affected_genes: Optional[List[Dict[str, Any]]] = None,
    allow_threshold: float = 0.25,
    degrade_threshold: float = 0.50,
    reroute_threshold: float = 0.75,
    hysteresis_delta: float = 0.05
) -> Dict[str, Any]:
    """
    Computes gate state considering previous gate and hysteresis buffer to prevent flapping.
    
    Default prototype thresholds:
    P_fail < 0.25: ALLOW
    0.25 <= P_fail < 0.50: DEGRADE
    0.50 <= P_fail < 0.75: REROUTE
    P_fail >= 0.75: QUARANTINE
    """
    p_fail = max(0.0, min(1.0, float(p_fail)))
    hysteresis_applied = False
    
    # 1. Base classification
    if p_fail >= reroute_threshold:
        raw_gate = "QUARANTINE"
    elif p_fail >= degrade_threshold:
        raw_gate = "REROUTE"
    elif p_fail >= allow_threshold:
        raw_gate = "DEGRADE"
    else:
        raw_gate = "ALLOW"
        
    final_gate = raw_gate
    
    # 2. Hysteresis check when recovering to a milder state
    # If previously QUARANTINE, require p_fail < (reroute_threshold - hysteresis_delta) to drop
    if previous_gate == "QUARANTINE" and raw_gate in ["REROUTE", "DEGRADE", "ALLOW"]:
        if p_fail > (reroute_threshold - hysteresis_delta):
            final_gate = "QUARANTINE"
            hysteresis_applied = True
    elif previous_gate == "REROUTE" and raw_gate in ["DEGRADE", "ALLOW"]:
        if p_fail > (degrade_threshold - hysteresis_delta):
            final_gate = "REROUTE"
            hysteresis_applied = True
    elif previous_gate == "DEGRADE" and raw_gate == "ALLOW":
        if p_fail > (allow_threshold - hysteresis_delta):
            final_gate = "DEGRADE"
            hysteresis_applied = True
            
    # Formulate primary reason
    primary_reason = "Nominal system operation; all compatibility thresholds satisfied."
    if final_gate == "QUARANTINE":
        critical_genes = [g for g in (affected_genes or []) if g.get("severity") in ["BREAKING", "CRITICAL"]]
        if critical_genes:
            gene_names = ", ".join([g.get("path", g.get("gene_id")) for g in critical_genes[:2]])
            primary_reason = f"Severe structural/schema incompatibility detected on {gene_names}. High risk of runtime crash ({round(p_fail*100, 1)}% P_fail)."
        else:
            primary_reason = f"Predicted failure probability ({round(p_fail*100, 1)}%) exceeds safety threshold ({reroute_threshold*100}%)."
    elif final_gate == "REROUTE":
        primary_reason = f"Moderate compatibility risk ({round(p_fail*100, 1)}%). Traffic pre-emptively rerouted to secondary adapter or compatible fallback instance."
    elif final_gate == "DEGRADE":
        primary_reason = f"Temporal/resource envelope degradation detected ({round(p_fail*100, 1)}% P_fail). Fallback to cached responses or async queues recommended."

    return {
        "current_gate": final_gate,
        "raw_gate": raw_gate,
        "previous_gate": previous_gate,
        "p_fail": round(p_fail, 4),
        "hysteresis_applied": hysteresis_applied,
        "primary_reason": primary_reason,
        "affected_genes": affected_genes or [],
        "thresholds": {
            "allow": allow_threshold,
            "degrade": degrade_threshold,
            "reroute": reroute_threshold,
            "hysteresis_delta": hysteresis_delta
        }
    }
