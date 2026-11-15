import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

MODEL_FILE = MODELS_DIR / "isolation_forest.joblib"
SCALER_FILE = MODELS_DIR / "scaler.joblib"
METRICS_FILE = MODELS_DIR / "metrics.json"

FEATURES = [
    "heartRate",
    "spo2",
    "temperature",
    "systolicBP",
    "diastolicBP",
    "respiratoryRate",
    "activityLevel"
]

RANDOM_STATE = 42
DEFAULT_CONTAMINATION = 0.05
DEFAULT_N_ESTIMATORS = 100
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
