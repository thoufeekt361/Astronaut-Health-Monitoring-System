import unittest
import numpy as np
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.model import engine
from app.schemas import TelemetryInput
from app.prediction import predict_single

class TestIsolationForestModel(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        loaded = engine.load_model()
        assert loaded, "Isolation Forest model must be loaded for tests"

    def test_nominal_reading_prediction(self):
        reading = TelemetryInput(
            astronautId="AST-001",
            heartRate=72.0,
            spo2=98.5,
            temperature=36.8,
            systolicBP=120.0,
            diastolicBP=80.0,
            respiratoryRate=15.0,
            activityLevel=1.0
        )
        result = predict_single(reading)
        self.assertFalse(result.isAnomaly, "Nominal reading should not be flagged as anomaly")
        self.assertLess(result.anomalyScore, 0.50, "Nominal score must be below 0.50")
        self.assertIn("baseline", result.explanation.lower())

    def test_hypoxia_outlier_prediction(self):
        reading = TelemetryInput(
            astronautId="AST-002",
            heartRate=114.0,
            spo2=86.5, # Critically low
            temperature=36.8,
            systolicBP=134.0,
            diastolicBP=88.0,
            respiratoryRate=28.0, # Rapid
            activityLevel=1.0
        )
        result = predict_single(reading)
        self.assertTrue(result.isAnomaly, "Hypoxia vector should be detected as anomaly")
        self.assertGreaterEqual(result.anomalyScore, 0.50)
        self.assertIn("oxygen", result.explanation.lower())

    def test_resting_tachycardia_outlier(self):
        reading = TelemetryInput(
            astronautId="AST-003",
            heartRate=172.0, # Very high HR at rest
            spo2=95.0,
            temperature=37.1,
            systolicBP=158.0,
            diastolicBP=98.0,
            respiratoryRate=26.0,
            activityLevel=0.0 # Sleep / Rest state
        )
        result = predict_single(reading)
        self.assertTrue(result.isAnomaly, "Resting tachycardia should be detected as anomaly")
        self.assertIn("heart rate", result.explanation.lower())

if __name__ == "__main__":
    unittest.main()
