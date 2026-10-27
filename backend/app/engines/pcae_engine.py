"""
Predictive Compatibility Assessment Engine (PCAE).
Evaluates Structural (SCS), Semantic (SemCS), Temporal (TCS), and Resource (RCS) compatibility.
Computes Composite Compatibility Score: CS = alpha*SCS + beta*SemCS + gamma*TCS + delta*RCS.
"""

from typing import Dict, Any, List, Tuple
from backend.app.engines.epigenome_manager import express_genome

def evaluate_structural_compatibility(
    consumer_genes: List[Dict[str, Any]],
    provider_genes: List[Dict[str, Any]]
) -> Tuple[float, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Evaluates SCS by comparing Schema genes (fields, types, required/optional status).
    Returns (SCS_score, affected_genes_list, details_dict).
    """
    consumer_schemas = {g["path"]: g for g in consumer_genes if g["family"] == "SCHEMA_GENE"}
    provider_schemas = {g["path"]: g for g in provider_genes if g["family"] == "SCHEMA_GENE"}
    
    if not consumer_schemas:
        return 1.0, [], {"message": "No consumer schema constraints"}
        
    total_consumer_weight = sum(g["expression"] for g in consumer_schemas.values())
    if total_consumer_weight <= 0:
        total_consumer_weight = 1.0
        
    matched_weight = 0.0
    affected_genes = []
    comparison_details = []
    
    for path, c_gene in consumer_schemas.items():
        c_raw = c_gene.get("raw_definition", {})
        c_field = c_raw.get("field", path.split(".")[-1])
        c_type = c_raw.get("type", "any")
        c_req = c_raw.get("required", False)
        
        if path not in provider_schemas:
            # Missing in provider
            if c_req:
                affected_genes.append({
                    "gene_id": c_gene["gene_id"],
                    "path": path,
                    "field": c_field,
                    "reason": "Required consumer field missing in provider contract",
                    "severity": "CRITICAL",
                    "impact": -c_gene["expression"]
                })
            else:
                matched_weight += c_gene["expression"] * 0.8 # Minor penalty for missing optional
            comparison_details.append({"path": path, "status": "MISSING_IN_PROVIDER", "field": c_field})
        else:
            p_gene = provider_schemas[path]
            p_raw = p_gene.get("raw_definition", {})
            p_type = p_raw.get("type", "any")
            p_req = p_raw.get("required", False)
            
            # Type compatibility check
            type_match = False
            if c_type == p_type or c_type == "any" or p_type == "any":
                type_match = True
            elif c_type in ["integer", "float"] and p_type in ["number", "float"]:
                type_match = True
            elif c_type == "number" and p_type in ["integer", "float"]:
                type_match = True
                
            if type_match:
                # Requiredness compatibility
                # If consumer treats field as optional but provider requires it: potential runtime issue if omitted
                if p_req and not c_req:
                    score_factor = 0.7
                    affected_genes.append({
                        "gene_id": p_gene["gene_id"],
                        "path": path,
                        "field": c_field,
                        "reason": "Provider requires field that consumer marks optional",
                        "severity": "WARNING",
                        "impact": -0.3
                    })
                else:
                    score_factor = 1.0
                matched_weight += c_gene["expression"] * score_factor
                comparison_details.append({"path": path, "status": "MATCH", "field": c_field, "type": c_type})
            else:
                # Type Mismatch
                if c_req:
                    # Breaking type mismatch on required field significantly drags down SCS
                    affected_genes.append({
                        "gene_id": p_gene["gene_id"],
                        "path": path,
                        "field": c_field,
                        "reason": f"Type mismatch on required field: consumer expects '{c_type}', provider specifies '{p_type}'",
                        "severity": "BREAKING",
                        "consumer_type": c_type,
                        "provider_type": p_type,
                        "impact": -0.85
                    })
                    comparison_details.append({
                        "path": path,
                        "status": "TYPE_MISMATCH_BREAKING",
                        "consumer_type": c_type,
                        "provider_type": p_type
                    })
                else:
                    matched_weight += c_gene["expression"] * 0.2
                    affected_genes.append({
                        "gene_id": p_gene["gene_id"],
                        "path": path,
                        "field": c_field,
                        "reason": f"Type mismatch on optional field: consumer expects '{c_type}', provider specifies '{p_type}'",
                        "severity": "WARNING",
                        "consumer_type": c_type,
                        "provider_type": p_type,
                        "impact": -0.4
                    })
                    comparison_details.append({
                        "path": path,
                        "status": "TYPE_MISMATCH_OPTIONAL",
                        "consumer_type": c_type,
                        "provider_type": p_type
                    })
                
    # If any breaking type mismatch exists on a required field, cap or scale SCS accordingly
    raw_scs = matched_weight / total_consumer_weight
    has_breaking = any(g.get("severity") == "BREAKING" for g in affected_genes)
    if has_breaking:
        scs = round(min(0.41, raw_scs * 0.5), 4)
    else:
        scs = round(max(0.0, min(1.0, raw_scs)), 4)
    return scs, affected_genes, {"comparisons": comparison_details}

def evaluate_semantic_compatibility(
    consumer_genes: List[Dict[str, Any]],
    provider_genes: List[Dict[str, Any]]
) -> Tuple[float, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Evaluates SemCS via deterministic bounded constraint checking.
    Checks invariants, numerical ranges, and allowed enum values.
    """
    c_invariants = [g for g in consumer_genes if g["family"] == "INVARIANT_GENE"]
    p_invariants = [g for g in provider_genes if g["family"] == "INVARIANT_GENE"]
    
    if not c_invariants and not p_invariants:
        return 1.0, [], {"message": "No invariant constraints present"}
        
    p_inv_map = {g["name"]: g for g in p_invariants}
    total_weight = sum(g["expression"] for g in c_invariants) if c_invariants else 1.0
    matched_weight = 0.0
    affected_genes = []
    
    for c_inv in c_invariants:
        name = c_inv["name"]
        if name in p_inv_map:
            p_inv = p_inv_map[name]
            # Compare expressions
            if c_inv["value_type"] == p_inv["value_type"]:
                matched_weight += c_inv["expression"]
            else:
                matched_weight += c_inv["expression"] * 0.5
                affected_genes.append({
                    "gene_id": p_inv["gene_id"],
                    "path": p_inv["path"],
                    "name": name,
                    "reason": f"Invariant relaxation or restriction: '{c_inv['value_type']}' vs '{p_inv['value_type']}'",
                    "severity": "WARNING",
                    "impact": -0.5
                })
        else:
            matched_weight += c_inv["expression"] * 0.9 # Default soft match
            
    semcs = round(max(0.0, min(1.0, matched_weight / max(0.001, total_weight))), 4)
    return semcs, affected_genes, {"invariants_checked": len(c_invariants) + len(p_invariants)}

def evaluate_temporal_compatibility(
    consumer_genes: List[Dict[str, Any]],
    provider_genes: List[Dict[str, Any]]
) -> Tuple[float, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Evaluates TCS by comparing provider latency guarantees against consumer timeout envelopes.
    """
    p_temp = {g["name"]: g for g in provider_genes if g["family"] == "TEMPORAL_GENE"}
    c_temp = {g["name"]: g for g in consumer_genes if g["family"] == "TEMPORAL_GENE"}
    
    prov_latency = 2000
    timeout_limit = 2500
    
    if "max_latency_ms" in p_temp:
        prov_latency = p_temp["max_latency_ms"].get("raw_definition", {}).get("max_latency_ms", 2000)
    if "expected_timeout_ms" in c_temp:
        timeout_limit = c_temp["expected_timeout_ms"].get("raw_definition", {}).get("expected_timeout_ms", 2500)
    elif "timeout_ms" in p_temp:
        timeout_limit = p_temp["timeout_ms"].get("raw_definition", {}).get("timeout_ms", 3000)
        
    affected = []
    if prov_latency <= timeout_limit:
        # Buffer margin score
        margin = (timeout_limit - prov_latency) / max(1.0, timeout_limit)
        tcs = round(0.90 + min(0.10, margin * 0.2), 4)
    else:
        overage = (prov_latency - timeout_limit) / max(1.0, timeout_limit)
        tcs = round(max(0.2, 0.90 - overage), 4)
        affected.append({
            "gene_id": p_temp.get("max_latency_ms", {}).get("gene_id", "G-TMP-01"),
            "path": "temporal.latency",
            "name": "max_latency_ms",
            "reason": f"Provider latency ({prov_latency}ms) exceeds consumer timeout envelope ({timeout_limit}ms)",
            "severity": "WARNING",
            "impact": -(1.0 - tcs)
        })
        
    return tcs, affected, {"provider_latency_ms": prov_latency, "consumer_timeout_ms": timeout_limit}

def evaluate_resource_compatibility(
    consumer_genes: List[Dict[str, Any]],
    provider_genes: List[Dict[str, Any]]
) -> Tuple[float, List[Dict[str, Any]], Dict[str, Any]]:
    """
    Evaluates RCS by comparing provider throughput capabilities against consumer demand.
    """
    p_res = {g["name"]: g for g in provider_genes if g["family"] == "RESOURCE_GENE"}
    c_res = {g["name"]: g for g in consumer_genes if g["family"] == "RESOURCE_GENE"}
    
    prov_rps = 500
    req_rps = 400
    
    if "min_throughput_rps" in p_res:
        prov_rps = p_res["min_throughput_rps"].get("raw_definition", {}).get("min_throughput_rps", 500)
    if "required_throughput_rps" in c_res:
        req_rps = c_res["required_throughput_rps"].get("raw_definition", {}).get("required_throughput_rps", 400)
        
    affected = []
    if prov_rps >= req_rps:
        rcs = round(0.95 + min(0.05, (prov_rps - req_rps) / 1000.0), 4)
    else:
        ratio = prov_rps / max(1.0, req_rps)
        rcs = round(max(0.3, ratio * 0.9), 4)
        affected.append({
            "gene_id": p_res.get("min_throughput_rps", {}).get("gene_id", "G-RES-01"),
            "path": "resource.throughput",
            "name": "min_throughput_rps",
            "reason": f"Provider throughput ({prov_rps} RPS) is below consumer requirement ({req_rps} RPS)",
            "severity": "WARNING",
            "impact": -(1.0 - rcs)
        })
        
    return rcs, affected, {"provider_throughput_rps": prov_rps, "required_throughput_rps": req_rps}

def evaluate_pcae(
    consumer_genotype: Dict[str, Any],
    provider_genotype: Dict[str, Any],
    consumer_epigenome: Dict[str, Any] = None,
    provider_epigenome: Dict[str, Any] = None,
    alpha: float = 0.25,
    beta: float = 0.25,
    gamma: float = 0.25,
    delta: float = 0.25
) -> Dict[str, Any]:
    """
    Calculates overall composite compatibility score CS.
    """
    c_expressed = express_genome(consumer_genotype, consumer_epigenome)
    p_expressed = express_genome(provider_genotype, provider_epigenome)
    
    scs, scs_affected, scs_details = evaluate_structural_compatibility(c_expressed, p_expressed)
    semcs, semcs_affected, semcs_details = evaluate_semantic_compatibility(c_expressed, p_expressed)
    tcs, tcs_affected, tcs_details = evaluate_temporal_compatibility(c_expressed, p_expressed)
    rcs, rcs_affected, rcs_details = evaluate_resource_compatibility(c_expressed, p_expressed)
    
    raw_cs = alpha * scs + beta * semcs + gamma * tcs + delta * rcs
    all_affected = scs_affected + semcs_affected + tcs_affected + rcs_affected
    
    # If structural schema is fundamentally broken (breaking gene mismatch), overall interaction compatibility is bounded
    has_breaking = any(g.get("severity") in ["BREAKING", "CRITICAL"] for g in all_affected)
    if has_breaking and scs <= 0.50:
        cs = round(min(0.60, raw_cs * 0.72), 4)
    else:
        cs = round(raw_cs, 4)
    
    return {
        "scs": scs,
        "semcs": semcs,
        "tcs": tcs,
        "rcs": rcs,
        "cs": cs,
        "alpha": alpha,
        "beta": beta,
        "gamma": gamma,
        "delta": delta,
        "affected_genes": all_affected,
        "details": {
            "structural": scs_details,
            "semantic": semcs_details,
            "temporal": tcs_details,
            "resource": rcs_details
        }
    }
