import os
import joblib
import numpy as np
from datetime import datetime, timezone
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import Tuple, Optional
from .config import MODEL_FILE, SCALER_FILE, DEFAULT_CONTAMINATION, DEFAULT_N_ESTIMATORS, RANDOM_STATE

class AnomalyDetectionEngine:
    def __init__(self):
        self.model: Optional[IsolationForest] = None
        self.scaler: Optional[StandardScaler] = None
        self.last_trained: Optional[str] = None
        self.is_loaded = False

    def load_model(self) -> bool:
        """Loads trained Isolation Forest and Scaler from disk if present."""
        if MODEL_FILE.exists() and SCALER_FILE.exists():
            try:
                self.model = joblib.load(MODEL_FILE)
                self.scaler = joblib.load(SCALER_FILE)
                mtime = os.path.getmtime(MODEL_FILE)
                self.last_trained = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()
                self.is_loaded = True
                print(f"[ML-Engine] Successfully loaded Isolation Forest model from {MODEL_FILE}")
                return True
            except Exception as e:
                print(f"[ML-Engine] Error loading model from disk: {e}")
                self.is_loaded = False
                return False
        return False

    def train_and_save(self, X_train: np.ndarray, contamination: float = DEFAULT_CONTAMINATION) -> None:
        """Fits StandardScaler and Isolation Forest on training telemetry and saves to disk."""
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X_train)

        self.model = IsolationForest(
            n_estimators=DEFAULT_N_ESTIMATORS,
            contamination=contamination,
            random_state=RANDOM_STATE,
            n_jobs=-1
        )
        self.model.fit(X_scaled)

        joblib.dump(self.model, MODEL_FILE)
        joblib.dump(self.scaler, SCALER_FILE)

        self.last_trained = datetime.now(timezone.utc).isoformat()
        self.is_loaded = True
        print(f"[ML-Engine] Trained & persisted Isolation Forest on {len(X_train)} samples.")

    def score_samples(self, X: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calculates calibrated anomaly scores and binary outlier classifications.

        Score Interpretation:
        Raw Isolation Forest decision_function outputs values where lower/negative values indicate anomalies.
        We calibrate the score via:
            score = 1.0 / (1.0 + exp(decision_function * 3.5))
        This yields a smooth index in [0, 1] where:
            - < 0.35: Nominal baseline telemetry
            - 0.35 - 0.55: Mild distribution drift / observation recommended
            - >= 0.55: Multivariate anomaly detected
        """
        if not self.is_loaded or self.model is None or self.scaler is None:
            # Fallback heuristic if model not trained yet
            scores = np.full(len(X), 0.15)
            preds = np.ones(len(X))
            return scores, preds

        X_scaled = self.scaler.transform(X)
        decision = self.model.decision_function(X_scaled)
        preds = self.model.predict(X_scaled) # -1 for anomaly, 1 for inlier

        # Calibrate decision scores to continuous range [0.0, 1.0]
        # Lower decision => higher anomaly score
        calibrated_scores = 1.0 / (1.0 + np.exp(decision * 3.5))
        return calibrated_scores, preds

engine = AnomalyDetectionEngine()
