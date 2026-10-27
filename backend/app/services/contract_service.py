"""
Contract Service.
Orchestrates contract lifecycle, immutable versioning, diff calculation, gene synchronization, and rollback.
"""

from typing import Dict, Any, List, Optional
import copy
import json
from datetime import datetime, timezone
import uuid

from backend.app.engines.gene_extractor import extract_genes_from_contract
from backend.app.engines.genotype_manager import create_genotype
from backend.app.engines.epigenome_manager import initialize_epigenome, express_genome
from backend.app.engines.pcae_engine import evaluate_pcae
from backend.app.engines.prediction_engine import predict_failure_probability
from backend.app.engines.gating_engine import evaluate_gate_decision
from backend.app.engines.explanation_engine import generate_gating_explanation
from backend.app.engines.metrics_engine import calculate_ccps

class ContractServiceManager:
    """
    In-memory and DB-backed contract state orchestrator.
    """
    def __init__(self):
        self.active_provider_contract: Dict[str, Any] = {}
        self.active_consumer_contract: Dict[str, Any] = {}
        self.active_provider_genotype: Dict[str, Any] = {}
        self.active_consumer_genotype: Dict[str, Any] = {}
        self.active_provider_epigenome: Dict[str, Any] = {}
        self.active_consumer_epigenome: Dict[str, Any] = {}
        
        self.contract_history: List[Dict[str, Any]] = [] # [ { version: "1.0.0", contract: ..., genotype: ... } ]
        self.compatibility_history: List[Dict[str, Any]] = []
        self.last_pcae: Dict[str, Any] = {}
        self.last_prediction: Dict[str, Any] = {}
        self.last_gate: Dict[str, Any] = {}
        self.last_explanation: Dict[str, Any] = {}
        self.contract_changes: List[Dict[str, Any]] = []
        self.event_log: List[Dict[str, Any]] = []
        self.nlp_commands: List[Dict[str, Any]] = []
        self.sync_history: List[Dict[str, Any]] = []

    def record_event(self, event_type: str, payload: Dict[str, Any], severity: str = "INFO", service_id: str = "svc-payment-01"):
        event = {
            "event_id": f"EVT-{uuid.uuid4().hex[:8].upper()}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "service_id": service_id,
            "severity": severity,
            "payload": payload
        }
        self.event_log.append(event)
        return event

    def initialize_system(self, provider_contract: Dict[str, Any], consumer_contract: Dict[str, Any]):
        """Initializes default baseline system contracts and engines."""
        self.active_provider_contract = copy.deepcopy(provider_contract)
        self.active_consumer_contract = copy.deepcopy(consumer_contract)
        
        # Build initial genotypes
        p_gt = create_genotype("svc-payment-01", self.active_provider_contract, self.active_provider_contract.get("version", "1.0.0"))
        c_gt = create_genotype("svc-order-01", self.active_consumer_contract, self.active_consumer_contract.get("version", "1.0.0"))
        
        self.active_provider_genotype = p_gt
        self.active_consumer_genotype = c_gt
        
        self.active_provider_epigenome = initialize_epigenome(p_gt)
        self.active_consumer_epigenome = initialize_epigenome(c_gt)
        
        self.contract_history = [{
            "version": self.active_provider_contract.get("version", "1.0.0"),
            "contract": copy.deepcopy(self.active_provider_contract),
            "genotype": copy.deepcopy(self.active_provider_genotype),
            "epigenome": copy.deepcopy(self.active_provider_epigenome),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }]
        
        self.run_full_evaluation_pipeline(record_history=True)
        self.record_event("CONTRACT_INITIALIZED", {"version": "1.0.0", "status": "ACTIVE"})

    def run_full_evaluation_pipeline(self, record_history: bool = True) -> Dict[str, Any]:
        """Runs PCAE -> Prediction -> Gating -> Explanation -> Metrics."""
        prev_pcae = copy.deepcopy(self.last_pcae) if self.last_pcae else None
        prev_gate = self.last_gate.get("current_gate", "ALLOW") if self.last_gate else "ALLOW"
        prev_p_fail = self.last_prediction.get("p_fail", 0.041) if self.last_prediction else 0.041
        
        # 1. PCAE
        pcae_res = evaluate_pcae(
            consumer_genotype=self.active_consumer_genotype,
            provider_genotype=self.active_provider_genotype,
            consumer_epigenome=self.active_consumer_epigenome,
            provider_epigenome=self.active_provider_epigenome
        )
        self.last_pcae = pcae_res
        
        # 2. Prediction
        pred_res = predict_failure_probability(
            current_cs=pcae_res["cs"],
            history_records=self.compatibility_history
        )
        self.last_prediction = pred_res
        
        # 3. Gating with Hysteresis
        gate_res = evaluate_gate_decision(
            p_fail=pred_res["p_fail"],
            previous_gate=prev_gate,
            affected_genes=pcae_res["affected_genes"]
        )
        self.last_gate = gate_res
        
        # 4. Explanation
        expl_res = generate_gating_explanation(
            gate_decision=gate_res,
            pcae_evaluation=pcae_res,
            previous_pcae=prev_pcae,
            previous_p_fail=prev_p_fail
        )
        self.last_explanation = expl_res
        
        if record_history:
            history_entry = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "cs_composite": pcae_res["cs"],
                "scs": pcae_res["scs"],
                "semcs": pcae_res["semcs"],
                "tcs": pcae_res["tcs"],
                "rcs": pcae_res["rcs"],
                "p_fail": pred_res["p_fail"],
                "gate": gate_res["current_gate"]
            }
            self.compatibility_history.append(history_entry)
            
        return {
            "pcae": pcae_res,
            "prediction": pred_res,
            "gate": gate_res,
            "explanation": expl_res
        }

    def compute_diff(self, proposed_contract: Dict[str, Any]) -> Dict[str, Any]:
        """Compares current active contract against proposed contract."""
        original = self.active_provider_contract
        changes = []
        
        # Check Request Schema
        orig_req = original.get("request_schema", {}).get("properties", {})
        prop_req = proposed_contract.get("request_schema", {}).get("properties", {})
        orig_req_list = set(original.get("request_schema", {}).get("required", []))
        prop_req_list = set(proposed_contract.get("request_schema", {}).get("required", []))
        
        for k, p_def in prop_req.items():
            if k not in orig_req:
                changes.append({
                    "type": "FIELD_ADDED",
                    "field": k,
                    "new_type": p_def.get("type"),
                    "required": k in prop_req_list,
                    "description": f"New field '{k}' added ({p_def.get('type')})"
                })
            else:
                o_def = orig_req[k]
                if o_def.get("type") != p_def.get("type"):
                    changes.append({
                        "type": "TYPE_CHANGED",
                        "field": k,
                        "old_type": o_def.get("type"),
                        "new_type": p_def.get("type"),
                        "description": f"Field '{k}' type changed: {o_def.get('type')} -> {p_def.get('type')}"
                    })
                if (k in orig_req_list) != (k in prop_req_list):
                    changes.append({
                        "type": "REQUIRED_STATUS_CHANGED",
                        "field": k,
                        "old_required": k in orig_req_list,
                        "new_required": k in prop_req_list,
                        "description": f"Field '{k}' requiredness changed: {k in orig_req_list} -> {k in prop_req_list}"
                    })

        for k in orig_req:
            if k not in prop_req:
                changes.append({
                    "type": "FIELD_REMOVED",
                    "field": k,
                    "description": f"Field '{k}' was removed"
                })
                
        # Compute virtual genotype for proposed contract to evaluate impact
        virt_gt = create_genotype("svc-payment-01", proposed_contract, "virtual-eval")
        virt_pcae = evaluate_pcae(self.active_consumer_genotype, virt_gt)
        virt_pred = predict_failure_probability(virt_pcae["cs"], self.compatibility_history)
        virt_gate = evaluate_gate_decision(virt_pred["p_fail"], self.last_gate.get("current_gate", "ALLOW"), virt_pcae["affected_genes"])
        
        orig_cs = self.last_pcae.get("cs", 0.976)
        changed_cs = virt_pcae["cs"]
        delta_cs = round(changed_cs - orig_cs, 4)
        ccps = calculate_ccps(orig_cs, changed_cs)
        
        # Assign impact level based on actual PCAE result
        if virt_gate["current_gate"] == "QUARANTINE":
            impact = "CRITICAL"
        elif virt_gate["current_gate"] == "REROUTE":
            impact = "BREAKING"
        elif virt_gate["current_gate"] == "DEGRADE":
            impact = "WARNING"
        else:
            impact = "SAFE"
            
        virt_expl = generate_gating_explanation(virt_gate, virt_pcae, self.last_pcae, self.last_prediction.get("p_fail", 0.041))
        
        return {
            "contract_id": original.get("contract_id", "CTR-PAYMENT-001"),
            "from_version": original.get("version", "1.0.0"),
            "to_version": proposed_contract.get("version", "2.0.0"),
            "changes": changes,
            "impact_level": impact,
            "original_cs": orig_cs,
            "changed_cs": changed_cs,
            "delta_cs": delta_cs,
            "ccps": ccps,
            "predicted_risk": virt_pred["p_fail"],
            "gate_action": virt_gate["current_gate"],
            "explanation": virt_expl,
            "proposed_contract": proposed_contract
        }

    def apply_contract_mutation(self, proposed_contract: Dict[str, Any], new_version_tag: str) -> Dict[str, Any]:
        """Applies and commits a new contract version immutably."""
        old_version = self.active_provider_contract.get("version", "1.0.0")
        diff_info = self.compute_diff(proposed_contract)
        
        # Mutate contract metadata
        proposed_contract["version"] = new_version_tag
        parent_gt_id = self.active_provider_genotype.get("genotype_id")
        
        # Create immutable new genotype
        new_gt = create_genotype("svc-payment-01", proposed_contract, new_version_tag, parent_genotype_id=parent_gt_id)
        new_epi = initialize_epigenome(new_gt)
        
        self.active_provider_contract = copy.deepcopy(proposed_contract)
        self.active_provider_genotype = new_gt
        self.active_provider_epigenome = new_epi
        
        # Save to history
        self.contract_history.append({
            "version": new_version_tag,
            "contract": copy.deepcopy(self.active_provider_contract),
            "genotype": copy.deepcopy(self.active_provider_genotype),
            "epigenome": copy.deepcopy(self.active_provider_epigenome),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # Record change log
        change_record = {
            "id": f"CHG-{uuid.uuid4().hex[:8].upper()}",
            "contract_id": proposed_contract.get("contract_id", "CTR-PAYMENT-001"),
            "from_version": old_version,
            "to_version": new_version_tag,
            "diff_payload": diff_info["changes"],
            "impact_level": diff_info["impact_level"],
            "original_cs": diff_info["original_cs"],
            "changed_cs": diff_info["changed_cs"],
            "ccps_score": diff_info["ccps"],
            "status": "COMMITTED",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.contract_changes.append(change_record)
        
        # Run pipeline
        eval_result = self.run_full_evaluation_pipeline(record_history=True)
        
        self.record_event("CONTRACT_MUTATED", {
            "from_version": old_version,
            "to_version": new_version_tag,
            "impact": diff_info["impact_level"],
            "cs": eval_result["pcae"]["cs"],
            "gate": eval_result["gate"]["current_gate"]
        }, severity="WARNING" if diff_info["impact_level"] != "SAFE" else "INFO")
        
        return {
            "success": True,
            "from_version": old_version,
            "new_version": new_version_tag,
            "genotype_id": new_gt["genotype_id"],
            "genotype_hash": new_gt["hash_sha256"],
            "diff": diff_info,
            "evaluation": eval_result
        }

    def rollback_to_version(self, target_version: Optional[str] = None) -> Dict[str, Any]:
        """Rolls back active contract to a previous version in history without deleting history."""
        if len(self.contract_history) <= 1:
            return {"success": False, "message": "No previous contract version available for rollback"}
            
        current_version = self.active_provider_contract.get("version", "1.0.0")
        
        if not target_version or target_version == "previous":
            target_entry = self.contract_history[-2] # One before current
        else:
            matches = [h for h in self.contract_history if h["version"] == target_version]
            if not matches:
                return {"success": False, "message": f"Version '{target_version}' not found in history"}
            target_entry = matches[-1]
            
        # Re-activate
        self.active_provider_contract = copy.deepcopy(target_entry["contract"])
        self.active_provider_genotype = copy.deepcopy(target_entry["genotype"])
        self.active_provider_epigenome = copy.deepcopy(target_entry["epigenome"])
        
        eval_result = self.run_full_evaluation_pipeline(record_history=True)
        
        self.record_event("ROLLBACK_EXECUTED", {
            "from_version": current_version,
            "restored_version": target_entry["version"],
            "restored_cs": eval_result["pcae"]["cs"],
            "restored_gate": eval_result["gate"]["current_gate"]
        }, severity="INFO")
        
        return {
            "success": True,
            "restored_version": target_entry["version"],
            "genotype_id": self.active_provider_genotype["genotype_id"],
            "evaluation": eval_result
        }

# Global singleton manager
contract_service = ContractServiceManager()
