import pytest
from backend.app.engines.gene_extractor import extract_genes_from_contract, calculate_canonical_genotype_hash

def test_gene_extraction_five_families():
    sample_contract = {
        "request_schema": {
            "type": "object",
            "required": ["user_id", "amount"],
            "properties": {
                "user_id": {"type": "string"},
                "amount": {"type": "number"}
            }
        },
        "response_schema": {
            "type": "object",
            "required": ["status"],
            "properties": {
                "status": {"type": "string"}
            }
        },
        "invariants": [
            {"id": "inv_amount", "expression": "amount > 0", "weight": 0.95}
        ],
        "temporal_constraints": {
            "max_latency_ms": 2000
        },
        "resource_constraints": {
            "min_throughput_rps": 500
        }
    }
    
    genes = extract_genes_from_contract(sample_contract)
    families = {g["family"] for g in genes}
    
    assert "SCHEMA_GENE" in families
    assert "INVARIANT_GENE" in families
    assert "TEMPORAL_GENE" in families
    assert "RESOURCE_GENE" in families
    assert "ERROR_TAXONOMY_GENE" in families
    
    # Check deterministic hashing
    hash1 = calculate_canonical_genotype_hash(genes, "1.0.0")
    hash2 = calculate_canonical_genotype_hash(genes, "1.0.0")
    assert hash1 == hash2
    assert len(hash1) == 64 # SHA-256
