"""
Contract-as-Genome Gene Extractor.
Parses OpenAPI/JSON Schema contracts into discrete atomic genes across 5 families.
"""

from typing import List, Dict, Any
import hashlib
import json

def extract_genes_from_contract(contract_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Decomposes an API contract into its constituent Gene definitions.
    Gene families:
    1. SCHEMA_GENE
    2. INVARIANT_GENE
    3. TEMPORAL_GENE
    4. RESOURCE_GENE
    5. ERROR_TAXONOMY_GENE
    """
    genes = []
    gene_idx = 1
    
    # 1. SCHEMA_GENES from Request Schema
    req_schema = contract_data.get("request_schema", {})
    req_props = req_schema.get("properties", {})
    required_fields = set(req_schema.get("required", []))
    
    for field_name, field_def in req_props.items():
        is_req = field_name in required_fields
        field_type = field_def.get("type", "any")
        
        genes.append({
            "gene_id": f"G-SCH-{gene_idx:02d}",
            "family": "SCHEMA_GENE",
            "name": f"req_field_{field_name}",
            "path": f"request.{field_name}",
            "value_type": f"{field_type}, required={str(is_req).lower()}",
            "raw_definition": {
                "field": field_name,
                "type": field_type,
                "required": is_req,
                "enum": field_def.get("enum"),
                "minimum": field_def.get("minimum"),
                "maximum": field_def.get("maximum")
            },
            "weight": 1.0 if is_req else 0.6,
            "is_immutable": True
        })
        gene_idx += 1
        
    # SCHEMA_GENES from Response Schema
    res_schema = contract_data.get("response_schema", {})
    res_props = res_schema.get("properties", {})
    res_required = set(res_schema.get("required", []))
    
    for field_name, field_def in res_props.items():
        is_req = field_name in res_required
        field_type = field_def.get("type", "any")
        
        genes.append({
            "gene_id": f"G-SCH-{gene_idx:02d}",
            "family": "SCHEMA_GENE",
            "name": f"res_field_{field_name}",
            "path": f"response.{field_name}",
            "value_type": f"{field_type}, required={str(is_req).lower()}",
            "raw_definition": {
                "field": field_name,
                "type": field_type,
                "required": is_req,
                "enum": field_def.get("enum")
            },
            "weight": 0.9 if is_req else 0.5,
            "is_immutable": True
        })
        gene_idx += 1

    # 2. INVARIANT_GENES
    inv_idx = 1
    for inv in contract_data.get("invariants", []):
        genes.append({
            "gene_id": f"G-INV-{inv_idx:02d}",
            "family": "INVARIANT_GENE",
            "name": inv.get("id", f"invariant_{inv_idx}"),
            "path": f"invariant.{inv.get('id', inv_idx)}",
            "value_type": inv.get("expression", "true"),
            "raw_definition": inv,
            "weight": float(inv.get("weight", 0.90)),
            "is_immutable": True
        })
        inv_idx += 1

    # 3. TEMPORAL_GENES
    temporal = contract_data.get("temporal_constraints", {})
    tmp_idx = 1
    if "max_latency_ms" in temporal:
        genes.append({
            "gene_id": f"G-TMP-{tmp_idx:02d}",
            "family": "TEMPORAL_GENE",
            "name": "max_latency_ms",
            "path": "temporal.latency",
            "value_type": f"<= {temporal['max_latency_ms']}ms",
            "raw_definition": {"max_latency_ms": temporal["max_latency_ms"]},
            "weight": 0.85,
            "is_immutable": True
        })
        tmp_idx += 1
    if "timeout_ms" in temporal:
        genes.append({
            "gene_id": f"G-TMP-{tmp_idx:02d}",
            "family": "TEMPORAL_GENE",
            "name": "timeout_ms",
            "path": "temporal.timeout",
            "value_type": f"<= {temporal['timeout_ms']}ms",
            "raw_definition": {"timeout_ms": temporal["timeout_ms"]},
            "weight": 0.80,
            "is_immutable": True
        })
        tmp_idx += 1

    # 4. RESOURCE_GENES
    resource = contract_data.get("resource_constraints", {})
    res_idx = 1
    if "min_throughput_rps" in resource:
        genes.append({
            "gene_id": f"G-RES-{res_idx:02d}",
            "family": "RESOURCE_GENE",
            "name": "min_throughput_rps",
            "path": "resource.throughput",
            "value_type": f">= {resource['min_throughput_rps']} RPS",
            "raw_definition": {"min_throughput_rps": resource["min_throughput_rps"]},
            "weight": 0.80,
            "is_immutable": True
        })
        res_idx += 1
    if "max_payload_kb" in resource:
        genes.append({
            "gene_id": f"G-RES-{res_idx:02d}",
            "family": "RESOURCE_GENE",
            "name": "max_payload_kb",
            "path": "resource.payload",
            "value_type": f"<= {resource['max_payload_kb']} KB",
            "raw_definition": {"max_payload_kb": resource["max_payload_kb"]},
            "weight": 0.60,
            "is_immutable": True
        })
        res_idx += 1

    # 5. ERROR_TAXONOMY_GENES
    genes.append({
        "gene_id": "G-ERR-01",
        "family": "ERROR_TAXONOMY_GENE",
        "name": "standard_error_taxonomy",
        "path": "error.taxonomy",
        "value_type": "HTTP 400/422/500/503",
        "raw_definition": {"taxonomy": ["BAD_REQUEST", "UNPROCESSABLE_ENTITY", "INTERNAL_ERROR"]},
        "weight": 0.50,
        "is_immutable": True
    })

    return genes

def calculate_canonical_genotype_hash(genes: List[Dict[str, Any]], version_tag: str) -> str:
    """
    Computes a deterministic SHA-256 hash over canonical representation of genes.
    """
    normalized = []
    for g in sorted(genes, key=lambda x: x["gene_id"]):
        normalized.append({
            "gene_id": g["gene_id"],
            "family": g["family"],
            "name": g["name"],
            "path": g["path"],
            "value_type": g["value_type"],
            "weight": g.get("weight", 1.0)
        })
    content = json.dumps({"version": version_tag, "genes": normalized}, sort_keys=True)
    return hashlib.sha256(content.encode("utf-8")).hexdigest()
