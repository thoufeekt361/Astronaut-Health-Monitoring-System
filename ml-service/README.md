# COSMIC SIX - Machine Learning Microservice
### Unsupervised Anomaly Detection via Isolation Forest

## Overview
This Python FastAPI microservice detects multi-dimensional physiological outliers in synthetic astronaut telemetry.

### Input Features (7 Vectors)
1. `heartRate`: Beats per minute (BPM)
2. `spo2`: Arterial blood oxygen saturation (%)
3. `temperature`: Core body temperature (°C)
4. `systolicBP`: Systolic arterial pressure (mmHg)
5. `diastolicBP`: Diastolic arterial pressure (mmHg)
6. `respiratoryRate`: Breaths per minute (bpm)
7. `activityLevel`: MET index (0: rest, 1: nominal, 2: active, 3: strenuous)

### Anomaly Score Calibration
Raw Isolation Forest tree path lengths (`decision_function`) are calibrated through an inverse-logistic sigmoid mapping:
$$\text{Score} = \frac{1}{1 + e^{3.5 \times \text{decision\_function}}}$$

- **Score < 0.35**: Nominal baseline
- **Score 0.35 - 0.55**: Mild telemetry drift
- **Score >= 0.55**: Anomaly detected

### Quick Start
```bash
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate # Unix

pip install -r requirements.txt
python training/train_model.py
python training/evaluate_model.py
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
