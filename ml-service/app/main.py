import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

from .config import FEATURES, DEFAULT_CONTAMINATION, DEFAULT_N_ESTIMATORS, MODEL_FILE, METRICS_FILE
from .model import engine
from .schemas import (
    TelemetryInput,
    BatchTelemetryInput,
    PredictionOutput,
    BatchPredictionOutput,
    ModelStatusResponse,
)
from .prediction import predict_single

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load model or auto-train baseline if missing
    loaded = engine.load_model()
    if not loaded:
        print("[FastAPI] No saved model found on disk. Auto-training baseline Isolation Forest...")
        from training.generate_dataset import generate_synthetic_telemetry
        df = generate_synthetic_telemetry(n_samples=5000, anomaly_ratio=DEFAULT_CONTAMINATION)
        X_train = df[FEATURES].to_numpy(dtype=float)
        engine.train_and_save(X_train)
    yield
    # Shutdown

app = FastAPI(
    title="COSMIC SIX - Telemetry Machine Learning Microservice",
    description="Unsupervised Isolation Forest Anomaly Detection Engine for Astronaut Health (NASA Space Apps Challenge 2026)",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "COSMIC SIX ML Inference Engine",
        "modelLoaded": engine.is_loaded,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/model/status", response_model=ModelStatusResponse, tags=["Model"])
def model_status():
    return ModelStatusResponse(
        status="ONLINE" if engine.is_loaded else "STANDBY",
        model="Isolation Forest (scikit-learn)",
        features=FEATURES,
        nEstimators=DEFAULT_N_ESTIMATORS,
        contamination=DEFAULT_CONTAMINATION,
        isTrained=engine.is_loaded,
        lastTrained=engine.last_trained,
        modelFilePath=str(MODEL_FILE)
    )

@app.post("/predict", response_model=PredictionOutput, tags=["Inference"])
def predict_telemetry(telemetry: TelemetryInput):
    """
    Evaluates individual astronaut vital signs and outputs calibrated anomaly score.
    """
    try:
        return predict_single(telemetry)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.post("/predict/batch", response_model=BatchPredictionOutput, tags=["Inference"])
def predict_batch(batch: BatchTelemetryInput):
    """
    Evaluates a batch of telemetry packets across multiple astronauts.
    """
    results = [predict_single(item) for item in batch.readings]
    return BatchPredictionOutput(
        results=results,
        totalProcessed=len(results)
    )

@app.post("/train", tags=["Model"])
def train_model():
    """
    Triggers automated retraining of the Isolation Forest on synthetic telemetry baseline.
    """
    try:
        from training.generate_dataset import generate_synthetic_telemetry
        df = generate_synthetic_telemetry(n_samples=6000, anomaly_ratio=DEFAULT_CONTAMINATION)
        X_train = df[FEATURES].to_numpy(dtype=float)
        engine.train_and_save(X_train)
        return {
            "success": True,
            "message": "Isolation Forest model successfully trained and saved.",
            "trainedSamples": len(X_train),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

@app.get("/metrics", tags=["Model"])
def get_metrics():
    """
    Retrieves the latest ROC-AUC, Precision, Recall, and confusion matrix evaluation.
    """
    if METRICS_FILE.exists():
        with open(METRICS_FILE, "r") as f:
            return json.load(f)
    return {
        "status": "No metrics file generated yet. Run evaluate_model.py to benchmark."
    }

if __name__ == "__main__":
    import uvicorn
    from .config import HOST, PORT
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
