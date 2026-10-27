"""
Predictive Risk Engine.
Estimates near-future failure probability P_fail using stored compatibility history and trend analysis:
P_fail = sigmoid( k * (tau - CS) + m * trend )
"""

import math
from typing import List, Dict, Any, Optional

def calculate_sigmoid(x: float) -> float:
    """Standard numerical stable sigmoid function."""
    if x < -45.0:
        return 0.0
    if x > 45.0:
        return 1.0
    return 1.0 / (1.0 + math.exp(-x))

def calculate_historical_trend(history_records: List[Dict[str, Any]], current_cs: Optional[float] = None) -> float:
    """
    Computes slope / rate of change over recent compatibility history.
    trend > 0 indicates recent degradation (falling CS).
    trend < 0 indicates improving CS.
    """
    scores = [r.get("cs_composite", r.get("cs", 1.0)) for r in (history_records or [])]
    if current_cs is not None:
        scores.append(current_cs)
        
    if len(scores) < 2:
        return 0.0
    
    recent = scores[-5:] # lookback window of 5
    
    # Linear difference between newest and oldest in lookback window
    delta = recent[-1] - recent[0]
    # Negative delta in CS means positive degradation trend
    trend = -delta
    return round(trend, 4)

def predict_failure_probability(
    current_cs: float,
    history_records: Optional[List[Dict[str, Any]]] = None,
    k: float = 8.0,
    m: float = 3.5,
    tau: float = 0.80
) -> Dict[str, Any]:
    """
    Calculates P_fail based on active composite score and history.
    Never generates random risk numbers.
    """
    trend = calculate_historical_trend(history_records or [], current_cs=current_cs)
    
    # Logit calculation: k * (tau - CS) + m * trend
    logit = k * (tau - current_cs) + m * trend
    p_fail = calculate_sigmoid(logit)
    
    # Confidence is high when based on empirical records
    conf = 0.95 if (history_records and len(history_records) >= 3) else 0.85
    
    return {
        "cs_score": round(current_cs, 4),
        "p_fail": round(p_fail, 4),
        "trend": round(trend, 4),
        "k": k,
        "m": m,
        "tau": tau,
        "confidence": conf
    }
