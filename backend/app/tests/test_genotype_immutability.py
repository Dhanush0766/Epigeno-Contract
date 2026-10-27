import pytest
from backend.app.engines.genotype_manager import create_genotype, verify_genotype_integrity

def test_genotype_immutability_and_hash():
    sample_contract = {
        "request_schema": {
            "type": "object",
            "required": ["user_id"],
            "properties": {"user_id": {"type": "string"}}
        }
    }
    
    gt = create_genotype("svc-payment-01", sample_contract, "1.0.0")
    assert verify_genotype_integrity(gt) is True
    
    # Tampering with gene definition must fail verification
    gt["genes"][0]["value_type"] = "tampered_value"
    assert verify_genotype_integrity(gt) is False
