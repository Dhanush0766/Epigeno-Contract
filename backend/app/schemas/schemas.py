"""
Pydantic Validation and Serialization Schemas for ACO / ECG Platform.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# --- Gene & Genome Schemas ---
class GeneSchema(BaseModel):
    gene_id: str
    family: str # SCHEMA_GENE, INVARIANT_GENE, TEMPORAL_GENE, RESOURCE_GENE, ERROR_TAXONOMY_GENE
    name: str
    path: str
    value_type: str
    weight: float = 1.0
    is_immutable: bool = True
    raw_definition: Optional[Dict[str, Any]] = None

class ExpressedGeneSchema(GeneSchema):
    methylation: float = 0.0
    expression: float = 1.0
    is_active: bool = True
    context: str = "nominal"

class GenotypeSchema(BaseModel):
    genotype_id: str
    service_id: str
    version_tag: str
    parent_genotype_id: Optional[str] = None
    hash_sha256: str
    gene_count: int
    genes: List[GeneSchema] = []
    created_at: Optional[datetime] = None

class EpigenomeStateSchema(BaseModel):
    genotype_id: str
    methylation_map: Dict[str, Dict[str, Any]] = {}
    learning_rate: float = 0.01

# --- Contract Schemas ---
class ContractCreateSchema(BaseModel):
    contract_id: str
    service_id: str
    name: str
    endpoint: str
    method: str = "POST"
    version: str = "1.0.0"
    request_schema: Dict[str, Any]
    response_schema: Dict[str, Any]
    invariants: List[Dict[str, Any]] = []
    temporal_constraints: Dict[str, Any] = {}
    resource_constraints: Dict[str, Any] = {}

class ContractDiffRequest(BaseModel):
    contract_id: str
    original_version: str
    proposed_schema: Dict[str, Any]

class ContractDiffResponse(BaseModel):
    contract_id: str
    from_version: str
    to_version: str
    changes: List[Dict[str, Any]]
    impact_level: str # SAFE, WARNING, BREAKING, CRITICAL
    original_cs: float
    changed_cs: float
    delta_cs: float
    ccps: float
    predicted_risk: float
    gate_action: str
    explanation: Dict[str, Any]

# --- PCAE Schemas ---
class PcaeEvaluationRequest(BaseModel):
    consumer_genotype_id: str
    provider_genotype_id: str
    alpha: float = 0.25
    beta: float = 0.25
    gamma: float = 0.25
    delta: float = 0.25

class PcaeScoreBreakdown(BaseModel):
    scs: float
    semcs: float
    tcs: float
    rcs: float
    cs: float
    alpha: float
    beta: float
    gamma: float
    delta: float
    affected_genes: List[Dict[str, Any]] = []
    details: Dict[str, Any] = {}

class PredictionResponse(BaseModel):
    cs_score: float
    p_fail: float
    trend: float
    k: float
    m: float
    tau: float
    confidence: float

class GateDecisionResponse(BaseModel):
    current_gate: str # ALLOW, DEGRADE, REROUTE, QUARANTINE
    p_fail: float
    previous_gate: Optional[str] = None
    hysteresis_applied: bool = False
    primary_reason: str
    affected_genes: List[Dict[str, Any]] = []
    thresholds: Dict[str, float] = {"allow": 0.25, "degrade": 0.50, "reroute": 0.75}

# --- NLP & Voice Schemas ---
class NlpParseRequest(BaseModel):
    text: str
    mode: str = "TEXT" # TEXT or VOICE

class NlpParseResponse(BaseModel):
    raw_input: str
    intent: str
    confidence: float
    entities: Dict[str, Any]
    requires_confirmation: bool
    risk_level: str
    summary_message: str
    proposed_contract_change: Optional[Dict[str, Any]] = None

class NlpExecuteRequest(BaseModel):
    command_id: Optional[str] = None
    intent: str
    entities: Dict[str, Any]
    confirmed: bool = True

# --- Metrics Schemas ---
class SoftwareMetricsResponse(BaseModel):
    nlp_metrics: Dict[str, Any]
    pcae_metrics: Dict[str, Any]
    system_metrics: Dict[str, Any]
    project_metrics: Dict[str, Any]
    reference_benchmarks: Dict[str, Any]

# --- Sync & Proof Schemas ---
class QuorumSyncRequest(BaseModel):
    genome_version: str
    source_node: str = "Node-A"
    simulate_failure: bool = False

class QuorumSyncResponse(BaseModel):
    genome_version: str
    delta_hash: str
    source_node: str
    votes_approved: int
    votes_total: int
    quorum_reached: bool
    status: str
    nodes_detail: List[Dict[str, Any]]

class ProofCertificateResponse(BaseModel):
    certificate_id: str
    contract_version: str
    compatibility_score: float
    max_consumer_impact: float
    migration_safe: bool
    invariants_preserved: bool
    certificate_score: float
    proof_hash: str
    status: str
