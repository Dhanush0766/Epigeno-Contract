"""
Relational Database Models for ACO / ECG Platform.
"""

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, JSON, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from backend.app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class Service(Base):
    __tablename__ = "services"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    service_id = Column(String(64), unique=True, index=True, nullable=False) # e.g. svc-payment-01
    name = Column(String(128), nullable=False)
    role = Column(String(32), default="PROVIDER") # CONSUMER or PROVIDER
    base_url = Column(String(256), nullable=True)
    status = Column(String(32), default="ACTIVE")
    created_at = Column(DateTime, default=get_utc_now)
    
    contracts = relationship("Contract", back_populates="service", cascade="all, delete-orphan")
    genotypes = relationship("Genotype", back_populates="service", cascade="all, delete-orphan")

class Contract(Base):
    __tablename__ = "contracts"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    contract_id = Column(String(64), unique=True, index=True, nullable=False) # CTR-PAYMENT-001
    service_id = Column(String(64), ForeignKey("services.service_id"), nullable=False)
    name = Column(String(128), nullable=False)
    endpoint = Column(String(128), nullable=False)
    method = Column(String(16), default="POST")
    active_version = Column(String(32), default="1.0.0")
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
    
    service = relationship("Service", back_populates="contracts")
    versions = relationship("ContractVersion", back_populates="contract", cascade="all, delete-orphan")

class ContractVersion(Base):
    __tablename__ = "contract_versions"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    contract_id = Column(String(64), ForeignKey("contracts.contract_id"), nullable=False)
    version = Column(String(32), nullable=False) # 1.0.0, 2.0.0
    request_schema = Column(JSON, nullable=False)
    response_schema = Column(JSON, nullable=False)
    invariants = Column(JSON, default=list)
    temporal_constraints = Column(JSON, default=dict)
    resource_constraints = Column(JSON, default=dict)
    version_hash = Column(String(64), nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)
    
    contract = relationship("Contract", back_populates="versions")
    genotype = relationship("Genotype", uselist=False, back_populates="contract_version")

class Genotype(Base):
    __tablename__ = "genotypes"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    genotype_id = Column(String(64), unique=True, index=True, nullable=False)
    service_id = Column(String(64), ForeignKey("services.service_id"), nullable=False)
    contract_version_id = Column(String(64), ForeignKey("contract_versions.id"), nullable=True)
    version_tag = Column(String(32), nullable=False)
    parent_genotype_id = Column(String(64), nullable=True)
    hash_sha256 = Column(String(64), nullable=False)
    gene_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
    
    service = relationship("Service", back_populates="genotypes")
    contract_version = relationship("ContractVersion", back_populates="genotype")
    genes = relationship("Gene", back_populates="genotype", cascade="all, delete-orphan")
    epigenome = relationship("Epigenome", uselist=False, back_populates="genotype", cascade="all, delete-orphan")

class Gene(Base):
    __tablename__ = "genes"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    gene_id = Column(String(64), index=True, nullable=False) # e.g. G-SCH-01
    genotype_id = Column(String(64), ForeignKey("genotypes.genotype_id"), nullable=False)
    family = Column(String(32), nullable=False) # SCHEMA_GENE, INVARIANT_GENE, TEMPORAL_GENE, RESOURCE_GENE, ERROR_TAXONOMY_GENE
    name = Column(String(128), nullable=False)
    path = Column(String(256), nullable=False)
    value_type = Column(String(64), nullable=False)
    raw_definition = Column(JSON, default=dict)
    weight = Column(Float, default=1.0)
    is_immutable = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
    
    genotype = relationship("Genotype", back_populates="genes")

class Epigenome(Base):
    __tablename__ = "epigenomes"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    epigenome_id = Column(String(64), unique=True, index=True, nullable=False)
    genotype_id = Column(String(64), ForeignKey("genotypes.genotype_id"), nullable=False)
    methylation_map = Column(JSON, default=dict) # { gene_id: { "methylation": 0.05, "context": "nominal", "updated_at": ... } }
    learning_rate = Column(Float, default=0.01)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)
    
    genotype = relationship("Genotype", back_populates="epigenome")

class CompatibilityEvaluation(Base):
    __tablename__ = "compatibility_evaluations"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    consumer_service_id = Column(String(64), nullable=False)
    provider_service_id = Column(String(64), nullable=False)
    consumer_genotype_id = Column(String(64), nullable=False)
    provider_genotype_id = Column(String(64), nullable=False)
    
    scs_score = Column(Float, nullable=False) # Structural
    semcs_score = Column(Float, nullable=False) # Semantic
    tcs_score = Column(Float, nullable=False) # Temporal
    rcs_score = Column(Float, nullable=False) # Resource
    cs_composite = Column(Float, nullable=False) # Composite CS
    
    alpha = Column(Float, default=0.25)
    beta = Column(Float, default=0.25)
    gamma = Column(Float, default=0.25)
    delta = Column(Float, default=0.25)
    
    breakdown = Column(JSON, default=dict)
    created_at = Column(DateTime, default=get_utc_now)

class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    evaluation_id = Column(String(64), nullable=False)
    cs_score = Column(Float, nullable=False)
    p_fail = Column(Float, nullable=False)
    trend = Column(Float, default=0.0)
    k_param = Column(Float, default=8.0)
    m_param = Column(Float, default=3.5)
    tau_param = Column(Float, default=0.80)
    prediction_confidence = Column(Float, default=0.95)
    created_at = Column(DateTime, default=get_utc_now)

class GateDecision(Base):
    __tablename__ = "gate_decisions"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    p_fail = Column(Float, nullable=False)
    gate_action = Column(String(32), nullable=False) # ALLOW, DEGRADE, REROUTE, QUARANTINE
    previous_gate = Column(String(32), nullable=True)
    hysteresis_applied = Column(Boolean, default=False)
    primary_reason = Column(String(256), nullable=False)
    affected_genes = Column(JSON, default=list)
    explanation_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

class ContractChange(Base):
    __tablename__ = "contract_changes"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    contract_id = Column(String(64), nullable=False)
    from_version = Column(String(32), nullable=False)
    to_version = Column(String(32), nullable=False)
    diff_payload = Column(JSON, default=dict)
    impact_level = Column(String(32), default="SAFE") # SAFE, WARNING, BREAKING, CRITICAL
    original_cs = Column(Float, default=1.0)
    changed_cs = Column(Float, default=1.0)
    ccps_score = Column(Float, default=100.0)
    status = Column(String(32), default="COMMITTED") # PROPOSED, COMMITTED, ROLLED_BACK
    created_at = Column(DateTime, default=get_utc_now)

class NlpCommand(Base):
    __tablename__ = "nlp_commands"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    raw_input = Column(Text, nullable=False)
    input_mode = Column(String(16), default="TEXT") # TEXT or VOICE
    intent = Column(String(64), nullable=False)
    confidence = Column(Float, default=0.95)
    entities = Column(JSON, default=dict)
    requires_confirmation = Column(Boolean, default=False)
    is_executed = Column(Boolean, default=False)
    execution_result = Column(JSON, default=dict)
    created_at = Column(DateTime, default=get_utc_now)

class MetricRecord(Base):
    __tablename__ = "metrics"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    metric_category = Column(String(32), nullable=False) # NLP, PCAE, SYSTEM, CONTRACT, PROJECT
    metric_name = Column(String(64), nullable=False)
    metric_value = Column(Float, nullable=False)
    source_type = Column(String(32), default="MEASURED") # MEASURED, DEMO DATA, REFERENCE
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=get_utc_now)

class EventLog(Base):
    __tablename__ = "events"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    event_id = Column(String(64), index=True, default=generate_uuid)
    event_type = Column(String(64), nullable=False)
    service_id = Column(String(64), nullable=True)
    correlation_id = Column(String(64), nullable=True)
    severity = Column(String(16), default="INFO") # INFO, WARNING, ERROR, CRITICAL
    payload = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=get_utc_now)

class SyncEvent(Base):
    __tablename__ = "sync_events"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    genome_version = Column(String(32), nullable=False)
    delta_hash = Column(String(64), nullable=False)
    source_node = Column(String(32), default="Node-A")
    votes_approved = Column(Integer, default=3)
    votes_total = Column(Integer, default=3)
    status = Column(String(32), default="ATTESTED") # PENDING, ATTESTED, REJECTED
    nodes_detail = Column(JSON, default=list)
    timestamp = Column(DateTime, default=get_utc_now)

class ProofCertificate(Base):
    __tablename__ = "proof_certificates"
    
    id = Column(String(64), primary_key=True, default=generate_uuid)
    certificate_id = Column(String(64), unique=True, index=True, default=lambda: f"CERT-{uuid.uuid4().hex[:8].upper()}")
    contract_version = Column(String(32), nullable=False)
    compatibility_score = Column(Float, nullable=False)
    max_consumer_impact = Column(Float, default=0.0)
    migration_safe = Column(Boolean, default=True)
    invariants_preserved = Column(Boolean, default=True)
    certificate_score = Column(Float, default=1.0)
    proof_hash = Column(String(64), nullable=False)
    status = Column(String(32), default="VERIFIED")
    issued_at = Column(DateTime, default=get_utc_now)
