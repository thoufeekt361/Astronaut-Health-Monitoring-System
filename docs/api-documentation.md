# COSMIC SIX - REST API & WebSocket Specification

All REST endpoints are namespaced under prefix `/api/v1`.

## 1. Authentication & Users
- `POST /api/v1/auth/register` : Register user (name, email, password, role)
- `POST /api/v1/auth/login` : Authenticate user & return JWT token + user profile
- `GET /api/v1/auth/me` : Get current authenticated user profile [Requires JWT]
- `POST /api/v1/auth/logout` : Invalidate user session

## 2. Astronaut Management
- `GET /api/v1/astronauts` : List astronauts with optional filtering by status/mission
- `POST /api/v1/astronauts` : Create astronaut record [Admin/Medical Officer]
- `GET /api/v1/astronauts/:id` : Get single astronaut profile
- `PUT /api/v1/astronauts/:id` : Update astronaut profile [Admin/Medical Officer]
- `DELETE /api/v1/astronauts/:id` : Delete astronaut record [Admin]

## 3. Mission Management
- `GET /api/v1/missions` : List missions
- `POST /api/v1/missions` : Create new space mission [Admin]
- `GET /api/v1/missions/:id` : Get mission details & assigned crew
- `PUT /api/v1/missions/:id` : Update mission status or crew [Admin]
- `DELETE /api/v1/missions/:id` : Delete mission [Admin]

## 4. Health Telemetry & Readings
- `POST /api/v1/health/readings` : Ingest telemetry reading (invokes rule checker & ML forward-pass)
- `GET /api/v1/health/readings` : Query health readings with pagination & filtering
- `GET /api/v1/health/latest/:astronautId` : Fetch most recent telemetry snapshot
- `GET /api/v1/health/history/:astronautId` : Fetch historical time-series data
- `GET /api/v1/health/summary` : Aggregate health metrics across crew
- `GET /api/v1/health/trends/:astronautId` : Aggregate trend metrics (hourly/daily averages)

## 5. Alerts & Safety Management
- `GET /api/v1/alerts` : List alerts with severity, status, and astronaut filters
- `POST /api/v1/alerts` : Manually dispatch or inject an alert
- `GET /api/v1/alerts/:id` : Get alert details
- `PUT /api/v1/alerts/:id` : Update alert attributes
- `PATCH /api/v1/alerts/:id/acknowledge` : Mark alert as acknowledged
- `PATCH /api/v1/alerts/:id/resolve` : Mark alert as resolved
- `GET /api/v1/alerts/summary` : Count active critical/warning alerts

## 6. Analytics
- `GET /api/v1/analytics/dashboard` : High-level telemetry aggregates, vital averages, and crew states
- `GET /api/v1/analytics/astronauts` : Comparative astronaut risk ratings
- `GET /api/v1/analytics/missions` : Mission-level vital summaries
- `GET /api/v1/analytics/trends` : Longitudinal telemetry trend analysis

## 7. Machine Learning Gateway
- `POST /api/v1/ml/analyze` : Proxy direct telemetry analysis to FastAPI ML engine
- `GET /api/v1/ml/predictions` : Retrieve logged predictions and anomaly scoring logs
- `GET /api/v1/ml/model-status` : Health and metadata of the active Isolation Forest model
- `POST /api/v1/ml/retrain` : Request retraining trigger on recent baseline telemetry

## 8. Simulator Controller
- `POST /api/v1/simulator/start` : Activate simulated streaming
- `POST /api/v1/simulator/stop` : Pause simulated streaming
- `GET /api/v1/simulator/status` : Get simulator engine state
- `POST /api/v1/simulator/scenario` : Trigger dynamic scenario (e.g. Hypoxia, High Exertion, Arrhythmia)

## 9. Reports & Exports
- `GET /api/v1/reports/health` : Generate crew health status report
- `GET /api/v1/reports/alerts` : Generate alert incident log report
- `GET /api/v1/reports/mission` : Generate end-of-mission or transit health summary
- `GET /api/v1/reports/export/csv` : Stream CSV file of health readings
- `GET /api/v1/reports/export/pdf` : Generate printable HTML/PDF health report

---

## 10. Real-Time Socket.IO Events

| Event Name | Direction | Payload | Description |
|------------|-----------|---------|-------------|
| `health:update` | Server -> Client | HealthReading Object | Streamed vital reading |
| `health:status` | Server -> Client | Status Object | Aggregate crew health snapshot |
| `alert:new` | Server -> Client | Alert Object | High-priority safety or ML alert |
| `alert:updated` | Server -> Client | Alert Object | Acknowledged / Resolved status |
| `ml:anomaly` | Server -> Client | Prediction Object | Multivariate anomaly notification |
| `sensor:status` | Server -> Client | SensorDevice Object | Sensor connection / packet loss event |
| `mission:update` | Server -> Client | Mission Object | Mission status or crew change |
