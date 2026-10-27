"""
Genome Exchange Protocol & Quorum Synchronization Engine.
Simulates distributed consensus and multi-node genome delta attestation across cluster peers (Node-A, Node-B, Node-C).
"""

from typing import Dict, Any, List
import hashlib
import json
import time

def simulate_quorum_exchange(
    genome_version: str,
    changed_genes: List[Dict[str, Any]],
    source_node: str = "Node-A",
    simulate_byzantine_failure: bool = False
) -> Dict[str, Any]:
    """
    Executes a 3-node Quorum Synchronization round (2-of-3 majority required).
    """
    delta_payload = {
        "genome_version": genome_version,
        "changed_genes": changed_genes,
        "timestamp": int(time.time())
    }
    delta_hash = hashlib.sha256(json.dumps(delta_payload, sort_keys=True).encode("utf-8")).hexdigest()
    
    nodes = ["Node-A", "Node-B", "Node-C"]
    node_votes = []
    
    for node in nodes:
        if node == source_node:
            node_votes.append({
                "node_id": node,
                "role": "LEADER",
                "vote": "APPROVE",
                "verified_hash": delta_hash,
                "latency_ms": 4.2
            })
        elif simulate_byzantine_failure and node == "Node-C":
            node_votes.append({
                "node_id": node,
                "role": "OBSERVER",
                "vote": "REJECT",
                "reason": "Hash mismatch simulated",
                "verified_hash": "0x000000",
                "latency_ms": 12.8
            })
        else:
            node_votes.append({
                "node_id": node,
                "role": "VALIDATOR",
                "vote": "APPROVE",
                "verified_hash": delta_hash,
                "latency_ms": round(6.5 + (hash(node) % 5), 1)
            })
            
    approvals = sum(1 for n in node_votes if n["vote"] == "APPROVE")
    quorum_reached = approvals >= 2
    
    return {
        "genome_version": genome_version,
        "delta_hash": delta_hash,
        "source_node": source_node,
        "votes_approved": approvals,
        "votes_total": len(nodes),
        "quorum_threshold": "2/3 (66.7%)",
        "quorum_reached": quorum_reached,
        "status": "ATTESTED" if quorum_reached else "REJECTED",
        "attestation_timestamp": time.time(),
        "nodes_detail": node_votes
    }
