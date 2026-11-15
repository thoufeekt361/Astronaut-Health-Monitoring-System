import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, List
from .model import engine
from .preprocessing import prepare_feature_array, clean_and_impute
from .schemas import TelemetryInput, PredictionOutput

def generate_explanation(raw_values: dict, score: float, is_anomaly: bool) -> str:
    """
    Constructs an interpretive explanation of which physiological parameters
    most likely drove the multi-dimensional anomaly detection.
    """
    if not is_anomaly:
        return "The combination of submitted vitals aligns with the model's learned baseline in microgravity."

    reasons: List[str] = []
    hr = raw_values.get("heartRate", 70)
    spo2 = raw_values.get("spo2", 98)
    temp = raw_values.get("temperature", 36.8)
    act = raw_values.get("activityLevel", 1)
    resp = raw_values.get("respiratoryRate", 16)
    sys = raw_values.get("systolicBP", 120)

    if hr > 110 and act <= 1:
        reasons.append(f"Elevated heart rate ({int(hr)} BPM) disproportionate to low activity index ({int(act)})")
    elif hr < 48:
        reasons.append(f"Pronounced bradycardia ({int(hr)} BPM)")

    if spo2 < 93.0:
        reasons.append(f"Sub-baseline blood oxygen saturation ({spo2:.1f}%)")

    if temp > 38.0:
        reasons.append(f"Elevated core temperature ({temp:.1f}°C)")
    elif temp < 35.8:
        reasons.append(f"Reduced core temperature ({temp:.1f}°C)")

    if resp > 24 and act <= 1:
        reasons.append(f"Elevated respiratory frequency ({int(resp)} bpm) without physical exertion")

    if sys > 145:
        reasons.append(f"High systolic blood pressure ({int(sys)} mmHg)")

    if not reasons:
        reasons.append("The joint multivariate correlation between physiological vectors diverges from baseline training manifold.")

    return f"Multivariate outlier identified [Deviation Index: {score:.2f}]: " + "; ".join(reasons) + "."

def predict_single(telemetry: TelemetryInput) -> PredictionOutput:
    data_dict = telemetry.model_dump()
    raw_arr = prepare_feature_array(data_dict)
    cleaned_arr = clean_and_impute(raw_arr)

    scores, preds = engine.score_samples(cleaned_arr)
    score = float(scores[0])
    is_anomaly = bool(preds[0] == -1 or score >= 0.55)

    status = "Anomaly detected" if is_anomaly else "Nominal baseline"
    explanation = generate_explanation(data_dict, score, is_anomaly)

    return PredictionOutput(
        astronautId=telemetry.astronautId,
        model="IsolationForest",
        anomalyScore=round(score, 4),
        isAnomaly=is_anomaly,
        status=status,
        explanation=explanation,
        timestamp=datetime.now(timezone.utc).isoformat()
    )
