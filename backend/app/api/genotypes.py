"""
Genotypes & Epigenome REST API Router.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional

from backend.app.services.contract_service import contract_service
from backend.app.engines.epigenome_manager import express_genome, update_methylation
from backend.app.engines.ecg_ir_engine import compile_genes_to_ir
from backend.app.api.websocket import ws_hub

router = APIRouter(prefix="/api/genotypes", tags=["Genotypes"])

@router.get("/active")
def get_active_genotype():
    p_expressed = express_genome(contract_service.active_provider_genotype, contract_service.active_provider_epigenome)
    ir_instructions = compile_genes_to_ir(p_expressed)
    
    return {
        "provider_genotype": contract_service.active_provider_genotype,
        "consumer_genotype": contract_service.active_consumer_genotype,
        "provider_epigenome": contract_service.active_provider_epigenome,
        "expressed_genes": p_expressed,
        "ecg_ir": ir_instructions,
        "lineage": [
            {
                "version": h["version"],
                "genotype_id": h["genotype"]["genotype_id"],
                "parent_id": h["genotype"].get("parent_genotype_id"),
                "hash_sha256": h["genotype"]["hash_sha256"],
                "gene_count": h["genotype"]["gene_count"],
                "timestamp": h["timestamp"]
            }
            for h in contract_service.contract_history
        ]
    }

@router.post("/methylate")
async def methylate_gene(payload: Dict[str, Any]):
    """
    Applies epigenetic methylation shift to a specific gene.
    """
    gene_id = payload.get("gene_id")
    delta_mu = float(payload.get("delta_mu", 0.05))
    context = payload.get("context", "operator_tuning")
    
    if not gene_id:
        raise HTTPException(status_code=400, detail="Missing gene_id")
        
    updated_epi = update_methylation(contract_service.active_provider_epigenome, gene_id, delta_mu, context)
    contract_service.active_provider_epigenome = updated_epi
    
    # Re-evaluate pipeline with new methylation
    eval_res = contract_service.run_full_evaluation_pipeline(record_history=True)
    
    contract_service.record_event("METHYLATION_UPDATED", {
        "gene_id": gene_id,
        "delta_mu": delta_mu,
        "context": context,
        "new_cs": eval_res["pcae"]["cs"]
    })
    
    await ws_hub.broadcast_event("epigenome.updated", {
        "gene_id": gene_id,
        "epigenome": updated_epi,
        "pcae": eval_res["pcae"]
    })
    
    return {
        "success": True,
        "gene_id": gene_id,
        "epigenome": updated_epi,
        "evaluation": eval_res
    }
