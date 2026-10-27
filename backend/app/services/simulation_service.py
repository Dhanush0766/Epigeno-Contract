"""
Digital Twin Simulation Service.
Runs hypothetical contract changes in a non-mutating isolated sandbox to forecast system impact.
"""

from typing import Dict, Any
import copy
from backend.app.services.contract_service import contract_service
from backend.app.engines.genotype_manager import create_genotype
from backend.app.engines.pcae_engine import evaluate_pcae
from backend.app.engines.prediction_engine import predict_failure_probability
from backend.app.engines.gating_engine import evaluate_gate_decision
from backend.app.engines.explanation_engine import generate_gating_explanation
from backend.app.engines.metrics_engine import calculate_ccps

def run_digital_twin_simulation(simulated_contract: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates prospective changes on copies without altering production state.
    """
    live_contract = contract_service.active_provider_contract
    live_pcae = contract_service.last_pcae
    live_pred = contract_service.last_prediction
    live_gate = contract_service.last_gate
    
    # 1. Build virtual genotype
    virtual_gt = create_genotype("svc-payment-01", simulated_contract, "simulated-twin-v")
    
    # 2. Virtual PCAE
    virtual_pcae = evaluate_pcae(contract_service.active_consumer_genotype, virtual_gt)
    
    # 3. Virtual Prediction
    virtual_pred = predict_failure_probability(virtual_pcae["cs"], contract_service.compatibility_history)
    
    # 4. Virtual Gating
    virtual_gate = evaluate_gate_decision(
        virtual_pred["p_fail"],
        previous_gate=live_gate.get("current_gate", "ALLOW"),
        affected_genes=virtual_pcae["affected_genes"]
    )
    
    # 5. Virtual Explanation
    virtual_expl = generate_gating_explanation(virtual_gate, virtual_pcae, live_pcae, live_pred.get("p_fail", 0.041))
    
    orig_cs = live_pcae.get("cs", 0.976)
    sim_cs = virtual_pcae["cs"]
    ccps = calculate_ccps(orig_cs, sim_cs)
    
    return {
        "status": "SIMULATION_COMPLETED",
        "live_state": {
            "version": live_contract.get("version", "1.0.0"),
            "cs": orig_cs,
            "p_fail": live_pred.get("p_fail", 0.041),
            "gate": live_gate.get("current_gate", "ALLOW")
        },
        "simulated_state": {
            "version": "simulated-candidate",
            "cs": sim_cs,
            "scs": virtual_pcae["scs"],
            "semcs": virtual_pcae["semcs"],
            "tcs": virtual_pcae["tcs"],
            "rcs": virtual_pcae["rcs"],
            "p_fail": virtual_pred["p_fail"],
            "gate": virtual_gate["current_gate"],
            "ccps": ccps,
            "affected_genes": virtual_pcae["affected_genes"]
        },
        "explanation": virtual_expl,
        "is_safe_to_apply": virtual_gate["current_gate"] == "ALLOW"
    }
