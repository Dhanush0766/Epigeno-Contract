import pytest
from backend.app.engines.epigenome_manager import initialize_epigenome, express_genome, update_methylation

def test_epigenome_methylation_and_expression():
    genotype = {
        "genotype_id": "GT-TEST-1",
        "genes": [
            {"gene_id": "G-SCH-01", "family": "SCHEMA_GENE", "name": "field_amount", "path": "request.amount", "value_type": "number", "weight": 1.0},
            {"gene_id": "G-TMP-01", "family": "TEMPORAL_GENE", "name": "latency", "path": "temporal.latency", "value_type": "<= 2000ms", "weight": 0.8}
        ]
    }
    
    epi = initialize_epigenome(genotype, initial_methylation=0.0)
    expressed = express_genome(genotype, epi)
    
    # Fully unmethylated expression equals weight: X = w * (1 - 0) = w
    assert expressed[0]["expression"] == 1.0
    assert expressed[1]["expression"] == 0.8
    
    # Apply methylation mu = 0.5 to G-SCH-01
    update_methylation(epi, "G-SCH-01", 0.5, context="degradation_test")
    expressed_after = express_genome(genotype, epi)
    
    # X = 1.0 * (1 - 0.5) = 0.5
    assert expressed_after[0]["expression"] == 0.5
    assert expressed_after[1]["expression"] == 0.8
