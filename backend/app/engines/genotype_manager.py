"""
Genotype Manager.
Guarantees Genotype immutability, SHA-256 lineage tracking, and version provenance.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid

from backend.app.engines.gene_extractor import extract_genes_from_contract, calculate_canonical_genotype_hash

def create_genotype(
    service_id: str,
    contract_data: Dict[str, Any],
    version_tag: str,
    parent_genotype_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates an immutable Genotype version from contract data.
    Never modifies existing genotypes in place.
    """
    genes = extract_genes_from_contract(contract_data)
    hash_sha256 = calculate_canonical_genotype_hash(genes, version_tag)
    genotype_id = f"GT-{service_id.upper()}-{version_tag.upper().replace('.', '_')}"
    
    return {
        "genotype_id": genotype_id,
        "service_id": service_id,
        "version_tag": version_tag,
        "parent_genotype_id": parent_genotype_id,
        "hash_sha256": hash_sha256,
        "gene_count": len(genes),
        "genes": genes,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

def verify_genotype_integrity(genotype: Dict[str, Any]) -> bool:
    """
    Verifies that the stored SHA-256 matches the re-computed gene list hash.
    """
    genes = genotype.get("genes", [])
    expected_hash = calculate_canonical_genotype_hash(genes, genotype.get("version_tag", ""))
    return genotype.get("hash_sha256") == expected_hash
