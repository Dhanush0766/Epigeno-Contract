"""
Epigenome Manager.
Manages reversible gene methylation (mu in [0, 1]) and computes effective gene expression X_i(t) = w_i * (1 - mu_i).
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

def initialize_epigenome(genotype: Dict[str, Any], initial_methylation: float = 0.0) -> Dict[str, Any]:
    """
    Initializes an epigenome map for all genes in a genotype.
    """
    methylation_map = {}
    for gene in genotype.get("genes", []):
        gid = gene["gene_id"]
        methylation_map[gid] = {
            "gene_id": gid,
            "name": gene["name"],
            "family": gene["family"],
            "methylation": initial_methylation,
            "context": "nominal",
            "source": "initial_commit",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    return {
        "epigenome_id": f"EPI-{genotype['genotype_id']}",
        "genotype_id": genotype["genotype_id"],
        "methylation_map": methylation_map,
        "learning_rate": 0.02,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }

def express_genome(genotype: Dict[str, Any], epigenome: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Computes expressed genome:
    X_i(t) = w_i * (1 - mu_i(t))
    Returns a list of enriched gene schemas with expression values.
    """
    expressed = []
    methylation_map = epigenome.get("methylation_map", {}) if epigenome else {}
    
    for gene in genotype.get("genes", []):
        gid = gene["gene_id"]
        w = float(gene.get("weight", 1.0))
        epi_info = methylation_map.get(gid, {})
        mu = float(epi_info.get("methylation", 0.0))
        
        # Bound methylation strictly in [0, 1]
        mu = max(0.0, min(1.0, mu))
        
        # Expression formula
        expr = round(w * (1.0 - mu), 4)
        is_active = expr > 0.05
        
        expressed.append({
            "gene_id": gid,
            "family": gene["family"],
            "name": gene["name"],
            "path": gene["path"],
            "value_type": gene["value_type"],
            "weight": w,
            "methylation": mu,
            "expression": expr,
            "is_active": is_active,
            "context": epi_info.get("context", "nominal"),
            "raw_definition": gene.get("raw_definition", {})
        })
    return expressed

def update_methylation(
    epigenome: Dict[str, Any],
    gene_id: str,
    delta_mu: float,
    context: str = "runtime_feedback"
) -> Dict[str, Any]:
    """
    Applies bounded epigenetic learning update:
    mu_new = clamp(mu_old + delta_mu, 0.0, 1.0)
    Genotype remains completely untouched.
    """
    m_map = epigenome.setdefault("methylation_map", {})
    entry = m_map.setdefault(gene_id, {
        "gene_id": gene_id,
        "methylation": 0.0,
        "context": context
    })
    
    current_mu = float(entry.get("methylation", 0.0))
    new_mu = max(0.0, min(1.0, current_mu + delta_mu))
    
    entry["methylation"] = round(new_mu, 4)
    entry["context"] = context
    entry["updated_at"] = datetime.now(timezone.utc).isoformat()
    epigenome["updated_at"] = entry["updated_at"]
    return epigenome
