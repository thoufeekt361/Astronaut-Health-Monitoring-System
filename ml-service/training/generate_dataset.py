import numpy as np
import pandas as pd
from pathlib import Path
import sys

# Ensure parent directory is in path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.config import FEATURES, RANDOM_STATE, BASE_DIR

def generate_synthetic_telemetry(n_samples: int = 5000, anomaly_ratio: float = 0.05) -> pd.DataFrame:
    """
    Generates realistic synthetic astronaut physiological data for training and evaluating
    unsupervised anomaly detection algorithms.

    Label conventions:
        label = 0 -> Nominal baseline (rest, exercise, sleep)
        label = 1 -> Physiological outlier / anomaly
    """
    np.random.seed(RANDOM_STATE)
    n_anomalies = int(n_samples * anomaly_ratio)
    n_nominal = n_samples - n_anomalies

    # 1. Nominal sub-distributions
    # 60% Normal resting condition
    n_rest = int(n_nominal * 0.60)
    # 25% Physical workout (CEVIS cycle ergometer, T2 treadmill, ARED)
    n_exercise = int(n_nominal * 0.25)
    # 15% Deep sleep condition
    n_sleep = n_nominal - n_rest - n_exercise

    # Normal Rest: HR 60-85, SpO2 97-99.5, Temp 36.5-37.1, Sys 110-128, Dia 70-84, Resp 12-18, Act 1
    rest_data = {
        "heartRate": np.random.normal(72, 5, n_rest),
        "spo2": np.clip(np.random.normal(98.4, 0.5, n_rest), 95.0, 100.0),
        "temperature": np.random.normal(36.8, 0.2, n_rest),
        "systolicBP": np.random.normal(120, 5, n_rest),
        "diastolicBP": np.random.normal(80, 4, n_rest),
        "respiratoryRate": np.random.normal(15, 2, n_rest),
        "activityLevel": np.full(n_rest, 1.0),
        "label": np.zeros(n_rest, dtype=int),
        "scenario": ["Normal Rest"] * n_rest
    }

    # Exercise: HR 125-160, SpO2 96-98.5, Temp 37.1-37.6, Sys 135-155, Dia 82-92, Resp 22-30, Act 2 or 3
    exercise_data = {
        "heartRate": np.random.normal(140, 10, n_exercise),
        "spo2": np.clip(np.random.normal(97.2, 0.7, n_exercise), 94.0, 99.5),
        "temperature": np.random.normal(37.4, 0.25, n_exercise),
        "systolicBP": np.random.normal(145, 8, n_exercise),
        "diastolicBP": np.random.normal(86, 5, n_exercise),
        "respiratoryRate": np.random.normal(25, 3, n_exercise),
        "activityLevel": np.random.choice([2.0, 3.0], size=n_exercise, p=[0.7, 0.3]),
        "label": np.zeros(n_exercise, dtype=int),
        "scenario": ["Physical Activity"] * n_exercise
    }

    # Sleep: HR 48-62, SpO2 98-100, Temp 36.2-36.6, Sys 105-118, Dia 66-76, Resp 10-14, Act 0
    sleep_data = {
        "heartRate": np.random.normal(54, 4, n_sleep),
        "spo2": np.clip(np.random.normal(98.8, 0.4, n_sleep), 96.0, 100.0),
        "temperature": np.random.normal(36.4, 0.15, n_sleep),
        "systolicBP": np.random.normal(110, 4, n_sleep),
        "diastolicBP": np.random.normal(72, 3, n_sleep),
        "respiratoryRate": np.random.normal(12, 1.5, n_sleep),
        "activityLevel": np.full(n_sleep, 0.0),
        "label": np.zeros(n_sleep, dtype=int),
        "scenario": ["Sleep / Rest"] * n_sleep
    }

    # 2. Synthetic Anomalies (Outliers)
    # A) Hypoxia: Low SpO2, elevated respiration, moderate HR at rest
    n_a1 = int(n_anomalies * 0.35)
    anom_hypoxia = {
        "heartRate": np.random.normal(112, 10, n_a1),
        "spo2": np.clip(np.random.normal(88.0, 2.5, n_a1), 75.0, 92.5),
        "temperature": np.random.normal(36.8, 0.3, n_a1),
        "systolicBP": np.random.normal(132, 6, n_a1),
        "diastolicBP": np.random.normal(85, 4, n_a1),
        "respiratoryRate": np.random.normal(28, 3, n_a1),
        "activityLevel": np.full(n_a1, 1.0),
        "label": np.ones(n_a1, dtype=int),
        "scenario": ["Hypoxia Anomaly"] * n_a1
    }

    # B) Severe Tachycardia at rest: High HR (>160 BPM) while act = 0 or 1
    n_a2 = int(n_anomalies * 0.35)
    anom_tachy = {
        "heartRate": np.random.normal(168, 8, n_a2),
        "spo2": np.clip(np.random.normal(95.5, 1.2, n_a2), 91.0, 98.0),
        "temperature": np.random.normal(37.2, 0.3, n_a2),
        "systolicBP": np.random.normal(156, 8, n_a2),
        "diastolicBP": np.random.normal(98, 5, n_a2),
        "respiratoryRate": np.random.normal(26, 3, n_a2),
        "activityLevel": np.full(n_a2, 1.0),
        "label": np.ones(n_a2, dtype=int),
        "scenario": ["Resting Tachycardia"] * n_a2
    }

    # C) Hyperthermia / Heat strain: Temp > 38.5C
    n_a3 = n_anomalies - n_a1 - n_a2
    anom_temp = {
        "heartRate": np.random.normal(120, 8, n_a3),
        "spo2": np.clip(np.random.normal(96.2, 1.0, n_a3), 93.0, 98.5),
        "temperature": np.random.normal(39.2, 0.4, n_a3),
        "systolicBP": np.random.normal(138, 6, n_a3),
        "diastolicBP": np.random.normal(88, 4, n_a3),
        "respiratoryRate": np.random.normal(23, 2, n_a3),
        "activityLevel": np.full(n_a3, 1.0),
        "label": np.ones(n_a3, dtype=int),
        "scenario": ["Hyperthermia"] * n_a3
    }

    dfs = [
        pd.DataFrame(rest_data),
        pd.DataFrame(exercise_data),
        pd.DataFrame(sleep_data),
        pd.DataFrame(anom_hypoxia),
        pd.DataFrame(anom_tachy),
        pd.DataFrame(anom_temp)
    ]
    df = pd.concat(dfs, ignore_index=True)

    # Round integers
    df["heartRate"] = df["heartRate"].round().astype(int)
    df["systolicBP"] = df["systolicBP"].round().astype(int)
    df["diastolicBP"] = df["diastolicBP"].round().astype(int)
    df["respiratoryRate"] = df["respiratoryRate"].round().astype(int)
    df["spo2"] = df["spo2"].round(1)
    df["temperature"] = df["temperature"].round(1)

    # Shuffle
    df = df.sample(frac=1.0, random_state=RANDOM_STATE).reset_index(drop=True)
    return df

if __name__ == "__main__":
    out_dir = BASE_DIR / "models"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_csv = out_dir / "synthetic_astronaut_telemetry.csv"

    print(f"Generating synthetic telemetry dataset with seed {RANDOM_STATE}...")
    df = generate_synthetic_telemetry(n_samples=6000, anomaly_ratio=0.06)
    df.to_csv(out_csv, index=False)
    print(f"Saved {len(df)} telemetry records to {out_csv}")
    print(df["scenario"].value_counts())
