import numpy as np
import pandas as pd
from pathlib import Path
import sys
import joblib

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.config import FEATURES, RANDOM_STATE, DEFAULT_CONTAMINATION, DEFAULT_N_ESTIMATORS, MODEL_FILE, SCALER_FILE
from app.model import engine
from training.generate_dataset import generate_synthetic_telemetry

def train_pipeline():
    print("====================================================")
    print("  COSMIC SIX ML: Training Isolation Forest Pipeline")
    print("====================================================")

    # 1. Generate clean training telemetry (mostly nominal baseline)
    print("[1/3] Generating synthetic baseline telemetry...")
    df = generate_synthetic_telemetry(n_samples=8000, anomaly_ratio=DEFAULT_CONTAMINATION)

    # Use only nominal readings for pure unsupervised baseline modeling,
    # or mixed with low contamination rate
    X_train = df[FEATURES].to_numpy(dtype=np.float64)

    print(f"[2/3] Fitting StandardScaler and Isolation Forest (n_estimators={DEFAULT_N_ESTIMATORS}, contamination={DEFAULT_CONTAMINATION})...")
    engine.train_and_save(X_train, contamination=DEFAULT_CONTAMINATION)

    # 3. Quick inference validation
    print("[3/3] Validating model inference on test vectors...")
    # Test vector 1: Nominal resting (HR=72, SpO2=98.5, Temp=36.8, Sys=120, Dia=80, Resp=15, Act=1)
    test_nominal = np.array([[72, 98.5, 36.8, 120, 80, 15, 1]], dtype=np.float64)
    score_nom, pred_nom = engine.score_samples(test_nominal)
    print(f"  Nominal Test Vector: Score={score_nom[0]:.4f}, Outlier={pred_nom[0] == -1} (Expected: False)")

    # Test vector 2: Severe hypoxia outlier (HR=115, SpO2=87.0, Temp=36.8, Sys=132, Dia=88, Resp=28, Act=1)
    test_hypoxia = np.array([[115, 87.0, 36.8, 132, 88, 28, 1]], dtype=np.float64)
    score_hyp, pred_hyp = engine.score_samples(test_hypoxia)
    print(f"  Hypoxia Outlier Vector: Score={score_hyp[0]:.4f}, Outlier={pred_hyp[0] == -1} (Expected: True)")

    print(f"Saved model to: {MODEL_FILE}")
    print(f"Saved scaler to: {SCALER_FILE}")
    print("Training pipeline finished successfully.")

if __name__ == "__main__":
    train_pipeline()
