export type GateAction = 'ALLOW' | 'DEGRADE' | 'REROUTE' | 'QUARANTINE';
export type ImpactLevel = 'SAFE' | 'WARNING' | 'BREAKING' | 'CRITICAL';
export type GeneFamily = 'SCHEMA_GENE' | 'INVARIANT_GENE' | 'TEMPORAL_GENE' | 'RESOURCE_GENE' | 'ERROR_TAXONOMY_GENE';

export interface Gene {
  gene_id: string;
  family: GeneFamily;
  name: string;
  path: string;
  value_type: string;
  weight: number;
  is_immutable: boolean;
  raw_definition?: Record<string, any>;
  methylation?: number;
  expression?: number;
  is_active?: boolean;
  context?: string;
}

export interface Genotype {
  genotype_id: string;
  service_id: string;
  version_tag: string;
  parent_genotype_id?: string;
  hash_sha256: string;
  gene_count: number;
  genes: Gene[];
  is_active: boolean;
  created_at?: string;
}

export interface Epigenome {
  epigenome_id: string;
  genotype_id: string;
  methylation_map: Record<string, {
    gene_id: string;
    methylation: number;
    context: string;
    source?: string;
    updated_at: string;
  }>;
  learning_rate: number;
  updated_at: string;
}

export interface PcaeEvaluation {
  scs: number;
  semcs: number;
  tcs: number;
  rcs: number;
  cs: number;
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
  affected_genes: Array<{
    gene_id: string;
    path: string;
    field?: string;
    name?: string;
    reason: string;
    severity: 'SAFE' | 'WARNING' | 'BREAKING' | 'CRITICAL';
    impact: number;
    consumer_type?: string;
    provider_type?: string;
  }>;
  details: {
    structural?: any;
    semantic?: any;
    temporal?: any;
    resource?: any;
  };
}

export interface PredictionData {
  cs_score: number;
  p_fail: number;
  trend: number;
  k: number;
  m: number;
  tau: number;
  confidence: number;
}

export interface GateDecisionData {
  current_gate: GateAction;
  raw_gate?: GateAction;
  previous_gate?: GateAction;
  p_fail: number;
  hysteresis_applied: boolean;
  primary_reason: string;
  affected_genes: any[];
  thresholds?: {
    allow: number;
    degrade: number;
    reroute: number;
    hysteresis_delta: number;
  };
}

export interface GatingExplanation {
  explanation_id: string;
  decision: GateAction;
  primary_reason: string;
  dominant_dimension: string;
  affected_gene: string;
  affected_gene_id: string;
  structural_compatibility_shift: string;
  overall_compatibility_shift: string;
  predicted_failure_shift: string;
  threshold_evaluated: number;
  final_action: GateAction;
  summary: string;
  gene_breakdown: any[];
}

export interface ContractDiff {
  contract_id: string;
  from_version: string;
  to_version: string;
  changes: Array<{
    type: string;
    field?: string;
    old_type?: string;
    new_type?: string;
    required?: boolean;
    description: string;
  }>;
  impact_level: ImpactLevel;
  original_cs: number;
  changed_cs: number;
  delta_cs: number;
  ccps: number;
  predicted_risk: number;
  gate_action: GateAction;
  explanation: GatingExplanation;
  proposed_contract?: any;
}

export interface NlpCommandItem {
  id: string;
  raw_input: string;
  input_mode: 'TEXT' | 'VOICE';
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  requires_confirmation: boolean;
  is_executed: boolean;
  created_at?: string;
}

export interface SoftwareMetrics {
  nlp_metrics: Record<string, { value: number; label: string; description: string }>;
  pcae_metrics: Record<string, { value: number; label: string; description: string }>;
  system_metrics: Record<string, { value: number; label: string; unit?: string; description: string }>;
  project_metrics: Record<string, { value: number; label: string; unit?: string; description: string }>;
  reference_benchmarks: Record<string, { value: number; label: string; description: string }>;
}

export interface QuorumNode {
  node_id: string;
  role: string;
  vote: string;
  verified_hash: string;
  latency_ms: number;
  reason?: string;
}

export interface QuorumSyncResult {
  genome_version: string;
  delta_hash: string;
  source_node: string;
  votes_approved: number;
  votes_total: number;
  quorum_threshold: string;
  quorum_reached: boolean;
  status: 'ATTESTED' | 'REJECTED' | 'PENDING';
  attestation_timestamp: number;
  nodes_detail: QuorumNode[];
}

export interface EventLogItem {
  event_id: string;
  timestamp: string;
  event_type: string;
  service_id?: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  payload: Record<string, any>;
}

export interface EcgIrInstruction {
  pc: number;
  opcode: string;
  operand: string;
  gene_id: string;
  weight: number;
  comment: string;
}
