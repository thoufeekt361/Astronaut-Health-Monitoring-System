from pydantic import BaseModel, Field
from typing import List, Optional

class TelemetryInput(BaseModel):
    astronautId: str = Field(..., description="Unique astronaut identifier, e.g. AST-001")
    heartRate: float = Field(..., ge=0, le=260, description="Heart rate in beats per minute")
    spo2: float = Field(..., ge=0, le=100, description="Blood oxygen saturation percentage")
    temperature: float = Field(..., ge=0, le=50, description="Core body temperature in Celsius")
    systolicBP: float = Field(..., ge=0, le=260, description="Systolic blood pressure in mmHg")
    diastolicBP: float = Field(..., ge=0, le=160, description="Diastolic blood pressure in mmHg")
    respiratoryRate: float = Field(..., ge=0, le=60, description="Respiration in breaths per minute")
    activityLevel: float = Field(1.0, ge=0, le=3, description="Physical activity index (0: rest, 1: nominal, 2: active, 3: strenuous)")

class BatchTelemetryInput(BaseModel):
    readings: List[TelemetryInput]

class PredictionOutput(BaseModel):
    astronautId: str
    model: str = "IsolationForest"
    anomalyScore: float = Field(..., description="Calibrated anomaly indicator between 0.0 (baseline) and 1.0 (severe outlier)")
    isAnomaly: bool = Field(..., description="True if telemetry pattern diverges significantly from learned baseline")
    status: str
    explanation: str
    timestamp: str

class BatchPredictionOutput(BaseModel):
    results: List[PredictionOutput]
    totalProcessed: int

class ModelStatusResponse(BaseModel):
    status: str
    model: str
    features: List[str]
    nEstimators: int
    contamination: float
    isTrained: bool
    lastTrained: Optional[str] = None
    modelFilePath: str
