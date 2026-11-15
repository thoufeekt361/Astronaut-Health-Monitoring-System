# COSMIC SIX - System Architecture
## NASA Space Apps Challenge 2026: Health Monitoring Software for Astronauts

### 1. Executive Overview
**COSMIC SIX** is an integrated mission-critical telemetry and predictive health platform engineered to monitor real-time vital signs of astronauts during long-duration orbital and interplanetary missions.

```
+-----------------------------------------------------------------------------------+
|                            COSMIC SIX PLATFORM ARCHITECTURE                       |
+-----------------------------------------------------------------------------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
         [WebSocket / Socket.IO]                      [REST API (Axios)]
                   |                                         |
                   v                                         v
+-----------------------------------------------------------------------------------+
|                        REACT 18 + TYPESCRIPT FRONTEND (Vite)                      |
|  - Mission Control Dashboard                 - Live Vitals Monitor & Charts       |
|  - Astronaut & Mission Management            - Dual-Engine Alert Center           |
|  - AI Predictive Analysis View               - Health Records & PDF/CSV Export    |
+-----------------------------------------------------------------------------------+
                   ^                                         |
                   | Full Duplex Push                        | REST Ingestion / Control
                   v                                         v
+-----------------------------------------------------------------------------------+
|                      NODE.JS & EXPRESS BACKEND SERVICE                            |
|  - JWT & RBAC Auth (Admin/Medic/Operator)    - Rule-Based Alert Safety Engine     |
|  - MongoDB Persistence (Mongoose)            - Socket.IO Gateway & Rooms          |
|  - ML Gateway Client                         - In-Memory & Atlas DB Adapter       |
+-----------------------------------------------------------------------------------+
        |                                                            |
        | [Inter-Service HTTP]                                       | [Mongoose Driver]
        v                                                            v
+------------------------------------+             +--------------------------------+
|     PYTHON FASTAPI ML SERVICE      |             |       MONGODB DATABASE         |
|  - Isolation Forest Anomaly Engine |             |  - Users & Astronaut Profiles  |
|  - Baseline Feature Scaler         |             |  - Missions & Health Readings  |
|  - Telemetry Scoring & Evaluation  |             |  - Safety & ML Anomaly Alerts  |
|  - Anomaly Calibration Layer       |             |  - Analytical Predictions      |
+------------------------------------+             +--------------------------------+
                   ^
                   | [Simulated Telemetry Stream]
+-----------------------------------------------------------------------------------+
|                   HEALTH DATA TELEMETRY SIMULATOR (Python)                        |
|  - Multi-Astronaut Streaming                 - Configurable Cadence (2-5 sec)     |
|  - Dynamic Scenarios: Rest, Exercise, Hypoxia, Tachycardia, Hyperthermia, etc.    |
|  - Sensor Disconnection & Packet Drop Simulation                                  |
+-----------------------------------------------------------------------------------+
```

### 2. Design Principles
1. **Separation of Safety Concerns (Dual-Alert System)**:
   - **Deterministic Rule-Based Engine**: Evaluates physiological bounds (e.g., HR > 150 BPM, SpO2 < 90%) with zero latency. Always remains operational even if AI microservices are offline.
   - **Unsupervised ML Engine (Isolation Forest)**: Detects subtle multivariate deviations and correlation shifts that univariate thresholds miss.
2. **Decoupled Machine Learning Service**:
   - Machine learning algorithms are isolated in a Python FastAPI microservice, preserving the Node.js backend's event loop and the frontend's bundle size.
3. **Telemetry Resilience & Mocking Grace**:
   - The platform includes a Python telemetry generator capable of streaming multi-astronaut telemetry across varied physiological profiles.
4. **Mission Protocol Security**:
   - Strict Role-Based Access Control (RBAC): `Admin`, `Medical Officer`, and `Mission Operator`.
   - Token-based authentication with cryptographically signed JWTs and bcrypt salt hashing.

### 3. Network Ports & Protocols
| Component | Protocol | Default Port | Description |
|-----------|----------|--------------|-------------|
| Frontend | HTTP / WS | 3000 / 5173 | Vite Dev Server / Nginx Production |
| Backend | HTTP / WS | 5000 | Express API & Socket.IO Gateway |
| ML Service | HTTP | 8000 | FastAPI Anomaly Detection Engine |
| MongoDB | TCP | 27017 | Database Server (or Embedded Mongo) |
