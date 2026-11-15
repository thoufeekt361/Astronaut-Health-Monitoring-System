import json
import numpy as np
import pandas as pd
from pathlib import Path
import sys
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.config import FEATURES, METRICS_FILE
from app.model import engine
from training.generate_dataset import generate_synthetic_telemetry

def evaluate_pipeline():
    print("====================================================")
    print("  COSMIC SIX ML: Isolation Forest Model Evaluation")
    print("====================================================")

    if not engine.load_model():
        print("[!] Model files not found. Run train_model.py first.")
        return

    # Generate labelled synthetic test set with 15% anomalies
    test_df = generate_synthetic_telemetry(n_samples=2000, anomaly_ratio=0.15)
    X_test = test_df[FEATURES].to_numpy(dtype=np.float64)
    y_true = test_df["label"].to_numpy() # 0 = inlier, 1 = outlier

    scores, preds = engine.score_samples(X_test)
    # IsolationForest outputs 1 for inlier and -1 for outlier. Map -1 -> 1, 1 -> 0
    y_pred = np.where(preds == -1, 1, 0)

    # Metrics
    auc = roc_auc_score(y_true, scores)
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()

    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    accuracy = (tp + tn) / len(y_true)

    metrics = {
        "evaluationDatasetSize": len(test_df),
        "anomalyRatio": 0.15,
        "rocAucScore": round(float(auc), 4),
        "accuracy": round(float(accuracy), 4),
        "precision": round(float(precision), 4),
        "recall": round(float(recall), 4),
        "f1Score": round(float(f1), 4),
        "confusionMatrix": {
            "trueNegatives": int(tn),
            "falsePositives": int(fp),
            "falseNegatives": int(fn),
            "truePositives": int(tp)
        },
        "modelArchitecture": "IsolationForest (scikit-learn)",
        "featuresEvaluated": FEATURES
    }

    print("\nEvaluation Metrics:")
    print(f"  ROC-AUC:   {metrics['rocAucScore']:.4f}")
    print(f"  Accuracy:  {metrics['accuracy']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall:    {metrics['recall']:.4f}")
    print(f"  F1-Score:  {metrics['f1Score']:.4f}")
    print(f"  Confusion Matrix: TP={tp}, FP={fp}, TN={tn}, FN={fn}")

    with open(METRICS_FILE, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nSaved metrics summary to: {METRICS_FILE}")

if __name__ == "__main__":
    evaluate_pipeline()
