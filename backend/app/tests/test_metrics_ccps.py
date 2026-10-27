import pytest
from backend.app.engines.metrics_engine import calculate_ccps, calculate_pcg, calculate_age

def test_ccps_calculation():
    # Original CS = 0.976, Changed CS = 0.958
    # CCPS = 0.958 / 0.976 * 100 = 98.16%
    score = calculate_ccps(0.976, 0.958)
    assert score == pytest.approx(98.16, 0.05)
    
    # Severe drop: Original 0.976, Changed 0.60
    score_drop = calculate_ccps(0.976, 0.60)
    assert score_drop == pytest.approx(61.48, 0.05)

def test_pcg_and_age_metrics():
    pcg = calculate_pcg(averted_faults=98, false_positives=2, total_incompatibilities=100)
    assert pcg == 96.0
    
    age = calculate_age([0.1, 0.2], [1.0, 0.8], decision_latency_ms=10.0, storage_growth_bytes=1024)
    assert age > 0.0
