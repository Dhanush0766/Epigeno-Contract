"""
Root-Cause Explanation Engine.
Generates human and machine-readable explanations for gating decisions and compatibility shifts.
"""

from typing import Dict, Any, List, Optional
import uuid

def generate_gating_explanation(
    gate_decision: Dict[str, Any],
    pcae_evaluation: Dict[str, Any],
    previous_pcae: Optional[Dict[str, Any]] = None,
    previous_p_fail: Optional[float] = 0.041
) -> Dict[str, Any]:
    """
    Produces structured machine-readable attribution breakdown.
    """
    gate_action = gate_decision.get("current_gate", "ALLOW")
    p_fail = gate_decision.get("p_fail", 0.0)
    current_cs = pcae_evaluation.get("cs", 1.0)
    current_scs = pcae_evaluation.get("scs", 1.0)
    
    prev_cs = previous_pcae.get("cs", 0.976) if previous_pcae else 0.976
    prev_scs = previous_pcae.get("scs", 1.0) if previous_pcae else 1.0
    
    affected_genes = pcae_evaluation.get("affected_genes", [])
    primary_gene = affected_genes[0] if affected_genes else None
    
    # Determine dominant dimension
    deltas = {
        "structural": (prev_scs - current_scs),
        "temporal": (previous_pcae.get("tcs", 0.95) - pcae_evaluation.get("tcs", 0.95)) if previous_pcae else 0.0,
        "resource": (previous_pcae.get("rcs", 0.97) - pcae_evaluation.get("rcs", 0.97)) if previous_pcae else 0.0,
        "semantic": (previous_pcae.get("semcs", 0.98) - pcae_evaluation.get("semcs", 0.98)) if previous_pcae else 0.0
    }
    
    dominant_factor = max(deltas, key=deltas.get)
    
    explanation_text = []
    if gate_action == "QUARANTINE":
        explanation_text.append(f"Gate Action: QUARANTINE (P_fail: {round(p_fail*100, 1)}% >= 75.0% threshold).")
        if primary_gene:
            explanation_text.append(f"Primary Root Cause: {primary_gene.get('reason', 'Schema violation')} on '{primary_gene.get('path', 'unknown')}'.")
        explanation_text.append(f"Compatibility Drop: CS fell from {round(prev_cs*100, 1)}% to {round(current_cs*100, 1)}% (SCS: {round(prev_scs, 2)} -> {round(current_scs, 2)}).")
    elif gate_action == "REROUTE":
        explanation_text.append(f"Gate Action: REROUTE (P_fail: {round(p_fail*100, 1)}% between 50%-75%). Traffic diverted to adapter proxy.")
    elif gate_action == "DEGRADE":
        explanation_text.append(f"Gate Action: DEGRADE (P_fail: {round(p_fail*100, 1)}% between 25%-50%). Asynchronous fallback activated.")
    else:
        explanation_text.append(f"Gate Action: ALLOW. All compatibility envelopes nominal (CS: {round(current_cs*100, 1)}%, P_fail: {round(p_fail*100, 1)}%).")
        
    return {
        "explanation_id": f"EXP-{uuid.uuid4().hex[:8].upper()}",
        "decision": gate_action,
        "primary_reason": gate_decision.get("primary_reason", ""),
        "dominant_dimension": dominant_factor,
        "affected_gene": primary_gene.get("path") if primary_gene else "None",
        "affected_gene_id": primary_gene.get("gene_id") if primary_gene else "None",
        "structural_compatibility_shift": f"{round(prev_scs, 3)} -> {round(current_scs, 3)}",
        "overall_compatibility_shift": f"{round(prev_cs, 3)} -> {round(current_cs, 3)}",
        "predicted_failure_shift": f"{round(previous_p_fail or 0.041, 3)} -> {round(p_fail, 3)}",
        "threshold_evaluated": 0.75 if gate_action == "QUARANTINE" else (0.50 if gate_action == "REROUTE" else 0.25),
        "final_action": gate_action,
        "summary": " ".join(explanation_text),
        "gene_breakdown": affected_genes
    }
