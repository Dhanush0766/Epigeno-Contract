"""
ECG-IR Engine (Intermediate Representation).
Compiles expressed genes into executable bytecode validation instructions.
"""

from typing import List, Dict, Any

def compile_genes_to_ir(expressed_genes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Translates expressed contract genes into a linear stream of validation bytecode opcodes:
    - CHECK_TYPE
    - CHECK_REQUIRED
    - CHECK_RANGE
    - CHECK_ENUM
    - CHECK_LATENCY
    - CHECK_THROUGHPUT
    - TRAP_ERROR
    """
    instructions = []
    pc = 0
    
    for g in expressed_genes:
        family = g["family"]
        name = g["name"]
        path = g["path"]
        raw = g.get("raw_definition", {})
        expr = g.get("expression", 1.0)
        
        if family == "SCHEMA_GENE":
            field = raw.get("field", name)
            ftype = raw.get("type", "string")
            is_req = raw.get("required", False)
            
            if is_req:
                instructions.append({
                    "pc": pc,
                    "opcode": "CHECK_REQUIRED",
                    "operand": path,
                    "gene_id": g["gene_id"],
                    "weight": expr,
                    "comment": f"Ensure '{field}' exists in payload"
                })
                pc += 1
                
            instructions.append({
                "pc": pc,
                "opcode": "CHECK_TYPE",
                "operand": f"{path}:{ftype}",
                "gene_id": g["gene_id"],
                "weight": expr,
                "comment": f"Validate {field} matches expected primitive type '{ftype}'"
            })
            pc += 1
            
            if raw.get("enum"):
                instructions.append({
                    "pc": pc,
                    "opcode": "CHECK_ENUM",
                    "operand": f"{path}:{raw['enum']}",
                    "gene_id": g["gene_id"],
                    "weight": expr,
                    "comment": f"Enforce allowed enum set {raw['enum']}"
                })
                pc += 1
                
        elif family == "INVARIANT_GENE":
            instructions.append({
                "pc": pc,
                "opcode": "CHECK_RANGE",
                "operand": g["value_type"],
                "gene_id": g["gene_id"],
                "weight": expr,
                "comment": f"Verify mathematical constraint '{g['value_type']}'"
            })
            pc += 1
            
        elif family == "TEMPORAL_GENE":
            instructions.append({
                "pc": pc,
                "opcode": "CHECK_LATENCY",
                "operand": g["value_type"],
                "gene_id": g["gene_id"],
                "weight": expr,
                "comment": f"Enforce deadline envelope {g['value_type']}"
            })
            pc += 1
            
        elif family == "RESOURCE_GENE":
            instructions.append({
                "pc": pc,
                "opcode": "CHECK_THROUGHPUT",
                "operand": g["value_type"],
                "gene_id": g["gene_id"],
                "weight": expr,
                "comment": f"Enforce capacity envelope {g['value_type']}"
            })
            pc += 1

    instructions.append({
        "pc": pc,
        "opcode": "EMIT_COMPLIANCE_PROOF",
        "operand": "0x00",
        "gene_id": "SYS-TERMINATE",
        "weight": 1.0,
        "comment": "Finalize validation pipeline"
    })
    
    return instructions
