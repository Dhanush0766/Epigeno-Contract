import pytest
from backend.app.engines.gene_extractor import extract_genes_from_contract
from backend.app.engines.genotype_manager import create_genotype
from backend.app.engines.pcae_engine import evaluate_pcae

def test_pcae_compatible_baseline():
    prov_contract = {
        "request_schema": {"type": "object", "required": ["user_id", "amount"], "properties": {"user_id": {"type": "string"}, "amount": {"type": "number"}}},
        "response_schema": {"type": "object", "required": ["status"], "properties": {"status": {"type": "string"}}},
        "temporal_constraints": {"max_latency_ms": 2000},
        "resource_constraints": {"min_throughput_rps": 500}
    }
    cons_contract = {
        "request_schema": {"type": "object", "required": ["user_id", "amount"], "properties": {"user_id": {"type": "string"}, "amount": {"type": "number"}}},
        "temporal_constraints": {"expected_timeout_ms": 2500},
        "resource_constraints": {"required_throughput_rps": 400}
    }
    
    p_gt = create_genotype("svc-payment", prov_contract, "1.0.0")
    c_gt = create_genotype("svc-order", cons_contract, "1.0.0")
    
    res = evaluate_pcae(c_gt, p_gt)
    assert res["scs"] >= 0.95
    assert res["cs"] >= 0.90

def test_pcae_type_mutation_incompatibility():
    prov_breaking = {
        "request_schema": {"type": "object", "required": ["user_id", "amount"], "properties": {"user_id": {"type": "string"}, "amount": {"type": "string"}}}, # mutated to string
    }
    cons_contract = {
        "request_schema": {"type": "object", "required": ["user_id", "amount"], "properties": {"user_id": {"type": "string"}, "amount": {"type": "number"}}},
    }
    
    p_gt = create_genotype("svc-payment", prov_breaking, "2.0.0")
    c_gt = create_genotype("svc-order", cons_contract, "1.0.0")
    
    res = evaluate_pcae(c_gt, p_gt)
    # SCS should drop significantly due to amount type mismatch
    assert res["scs"] <= 0.60
    assert any(g["field"] == "amount" and g["severity"] == "BREAKING" for g in res["affected_genes"])
