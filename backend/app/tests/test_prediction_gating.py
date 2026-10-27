import pytest
from backend.app.engines.prediction_engine import predict_failure_probability
from backend.app.engines.gating_engine import evaluate_gate_decision

def test_prediction_and_gating_levels():
    # Nominal case: CS = 0.98 -> Low risk -> ALLOW
    p1 = predict_failure_probability(current_cs=0.98, history_records=[])
    assert p1["p_fail"] < 0.25
    g1 = evaluate_gate_decision(p1["p_fail"])
    assert g1["current_gate"] == "ALLOW"
    
    # Degraded case: CS = 0.60 -> High risk -> QUARANTINE
    p2 = predict_failure_probability(current_cs=0.60, history_records=[])
    assert p2["p_fail"] >= 0.75
    g2 = evaluate_gate_decision(p2["p_fail"])
    assert g2["current_gate"] == "QUARANTINE"

def test_gating_hysteresis():
    # When recovering from QUARANTINE with marginal improvement (p_fail = 0.72)
    # Reroute threshold is 0.75, hysteresis delta is 0.05.
    # Because 0.72 > (0.75 - 0.05 = 0.70), it remains QUARANTINE to prevent flapping.
    gate = evaluate_gate_decision(p_fail=0.72, previous_gate="QUARANTINE")
    assert gate["current_gate"] == "QUARANTINE"
    assert gate["hysteresis_applied"] is True
