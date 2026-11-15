# COSMIC SIX
### Astronaut Health Monitoring and Intelligent Prediction System
**NASA Space Apps Challenge 2026**
*Challenge: Create Health Monitoring Software for Astronauts on Space Missions*

---

> **IMPORTANT SAFETY NOTICE**:  
> COSMIC SIX is a mission prototype engineered for research, simulation, and demonstration purposes using synthetic astronaut telemetry. It is not approved by NASA or any regulatory body as a diagnostic medical device. Model outputs are experimental decision-support telemetry and must not supersede clinical human judgment.

---

## Overview
**COSMIC SIX** provides continuous real-time monitoring of astronaut vital indicators, predictive anomaly detection via unsupervised Machine Learning (Isolation Forest), automated safety rule alerts, and space-grade mission control visualizations.

### Key Capabilities
- **Real-Time Telemetry Stream**: Monitored vitals include Heart Rate (BPM), Blood Oxygen Saturation ($SpO_2$), Core Body Temperature (°C), Systolic & Diastolic Blood Pressure (mmHg), Respiratory Rate (BPM), and Activity Level index.
- **Dual Safety Engine**:
  - **Deterministic Safety Guards**: Millisecond-level threshold alerts for critical physiological thresholds.
  - **Unsupervised ML Anomaly Detection**: Isolation Forest model detects multi-dimensional correlation drift (e.g., elevated respiratory rate and drop in $SpO_2$ despite low kinetic activity).
- **Mission Control Space Dashboard**: Modern dark-navy theme with glassmorphism, responsive charts, live telemetry counters, crew rosters, and incident remediation workflows.
- **Dynamic Telemetry Simulator**: Reproducible scenarios (Normal Rest, Microgravity Exercise, Hypoxia Incident, Acute Tachycardia, Sensor Disconnection).

---

## System Architecture

```
                       [Telemetry Simulator]
                                 │
                         (HTTP Ingestion)
                                 ▼
                     ┌───────────────────────┐
                     │  Node.js / Express    │
                     │  Mission Backend      │
                     └───────┬───────┬───────┘
                             │       │
       ┌─────────────────────┘       └─────────────────────┐
       │ (REST / JSON)                                     │ (Socket.IO / Push)
       ▼                                                   ▼
┌──────────────┐                               ┌───────────────────────┐
│ FastAPI ML   │                               │ React 18 + TSX        │
│ Microservice │                               │ Mission Control UI    │
└──────────────┘                               └───────────────────────┘
```

---

## Directory Structure
- `frontend/`: React 18, Vite, TypeScript, Tailwind CSS, Lucide icons, Recharts, Socket.IO client.
- `backend/`: Node.js, Express, MongoDB (Mongoose), JWT, Socket.IO, Helmet, Express-Validator.
- `ml-service/`: Python 3, FastAPI, Scikit-learn (Isolation Forest), NumPy, Pandas, Joblib.
- `simulator/`: Python telemetry simulator with configurable scenarios.
- `docs/`: In-depth architecture, database schema, REST API, and setup documentation.

---

## Quick Start
Refer to [`docs/setup-guide.md`](docs/setup-guide.md) for full commands.
1. Run backend: `cd backend && npm install && npm run dev`
2. Run frontend: `cd frontend && npm install && npm run dev`
3. Run ML service: `cd ml-service && pip install -r requirements.txt && uvicorn app.main:app --port 8000 --reload`
4. Run simulator: `cd simulator && python simulator.py`
