import pytest
from backend.app.services.seed_data import load_initial_seed_data
from backend.app.services.contract_service import contract_service
from backend.app.engines.nlp_engine import parse_nlp_command
import copy

def test_full_e2e_mutation_pcae_gating_rollback_pipeline():
    # 1. Initialize Baseline
    load_initial_seed_data()
    
    initial_cs = contract_service.last_pcae["cs"]
    initial_gate = contract_service.last_gate["current_gate"]
    assert initial_cs >= 0.95
    assert initial_gate == "ALLOW"
    
    # 2. NLP Input: "Change amount from number to string."
    nlp_parsed = parse_nlp_command("Change amount from number to string.")
    assert nlp_parsed["intent"] == "CHANGE_TYPE"
    assert nlp_parsed["requires_confirmation"] is True
    
    # 3. Apply Contract Mutation
    proposed = copy.deepcopy(contract_service.active_provider_contract)
    proposed["request_schema"]["properties"]["amount"]["type"] = "string"
    mutation_res = contract_service.apply_contract_mutation(proposed, "2.0.0")
    
    # 4. Verify PCAE drop & QUARANTINE gate
    assert mutation_res["new_version"] == "2.0.0"
    assert contract_service.last_pcae["scs"] <= 0.60
    assert contract_service.last_prediction["p_fail"] >= 0.75
    assert contract_service.last_gate["current_gate"] == "QUARANTINE"
    
    # 5. Verify Structured Explanation
    expl = contract_service.last_explanation
    assert expl["decision"] == "QUARANTINE"
    assert "amount" in expl["summary"].lower() or "schema" in expl["summary"].lower()
    
    # 6. Execute Rollback
    rollback_res = contract_service.rollback_to_version("1.0.0")
    assert rollback_res["success"] is True
    assert rollback_res["restored_version"] == "1.0.0"
    
    # 7. Verify Restoration to ALLOW
    assert contract_service.last_pcae["cs"] >= 0.95
    assert contract_service.last_gate["current_gate"] == "ALLOW"
