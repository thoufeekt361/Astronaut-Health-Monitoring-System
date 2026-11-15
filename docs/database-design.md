# COSMIC SIX - Database Schema Design (MongoDB / Mongoose)

## 1. Overview
The database layer uses MongoDB schemas via Mongoose with strict validation, UTC timestamping, and indexed query optimizations.

---

## 2. Entity Schemas

### 2.1 User (`users`)
```json
{
  "_id": "ObjectId",
  "name": "Commander Sarah Connor",
  "email": "sarah.connor@cosmic.nasa.gov",
  "password": "hashed_bcrypt_password",
  "role": "Admin | Medical Officer | Mission Operator",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
- **Indexes**: `{ email: 1 }` (unique)

---

### 2.2 Astronaut (`astronauts`)
```json
{
  "_id": "ObjectId",
  "astronautId": "AST-001",
  "name": "Dr. Alex Vance",
  "age": 38,
  "gender": "Non-Binary | Female | Male",
  "country": "United States",
  "role": "Payload Specialist",
  "missionId": "MIS-ARTEMIS-VI",
  "profileImage": "https://...",
  "status": "Healthy | Warning | Critical | Off-duty",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
- **Indexes**: `{ astronautId: 1 }` (unique), `{ missionId: 1 }`, `{ status: 1 }`

---

### 2.3 Mission (`missions`)
```json
{
  "_id": "ObjectId",
  "missionId": "MIS-ARTEMIS-VI",
  "missionName": "Artemis VI Mars Transit",
  "description": "Deep space transit testing closed-loop life support habitats.",
  "startDate": "2026-06-01T00:00:00.000Z",
  "endDate": "2027-12-15T00:00:00.000Z",
  "status": "Active | Scheduled | Completed | Aborted",
  "astronautIds": ["AST-001", "AST-002", "AST-003"],
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
- **Indexes**: `{ missionId: 1 }` (unique), `{ status: 1 }`

---

### 2.4 HealthReading (`health_readings`)
```json
{
  "_id": "ObjectId",
  "astronautId": "AST-001",
  "missionId": "MIS-ARTEMIS-VI",
  "heartRate": 82.5,
  "spo2": 98.2,
  "temperature": 36.8,
  "systolicBP": 122,
  "diastolicBP": 78,
  "respiratoryRate": 16,
  "activityLevel": 1,
  "sensorStatus": "Connected | Degraded | Disconnected",
  "source": "BioHarness-Pro-V3",
  "timestamp": "2026-11-13T14:22:00.000Z",
  "createdAt": "ISODate"
}
```
- **Compound Indexes**: 
  - `{ astronautId: 1, timestamp: -1 }` (critical for latest queries & historical charts)
  - `{ missionId: 1, timestamp: -1 }`

---

### 2.5 Alert (`alerts`)
```json
{
  "_id": "ObjectId",
  "alertId": "ALT-20261113-0091",
  "astronautId": "AST-001",
  "missionId": "MIS-ARTEMIS-VI",
  "title": "Severe Acute Tachycardia",
  "description": "Heart rate sustained above 160 BPM under low physical workload.",
  "severity": "Critical | Warning | Informational",
  "source": "Rule-Based | ML-Anomaly",
  "status": "Active | Acknowledged | Resolved",
  "createdAt": "ISODate",
  "acknowledgedAt": "ISODate | null",
  "resolvedAt": "ISODate | null"
}
```
- **Indexes**: `{ status: 1 }`, `{ severity: 1 }`, `{ astronautId: 1, createdAt: -1 }`

---

### 2.6 Prediction (`predictions`)
```json
{
  "_id": "ObjectId",
  "astronautId": "AST-001",
  "missionId": "MIS-ARTEMIS-VI",
  "modelName": "IsolationForest-v1",
  "anomalyScore": 0.84,
  "anomalyStatus": "Anomaly Detected | Normal Baseline",
  "explanation": "High respiratory rate (28 bpm) and reduced SpO2 (91%) during resting state.",
  "timestamp": "ISODate",
  "createdAt": "ISODate"
}
```
- **Indexes**: `{ astronautId: 1, timestamp: -1 }`

---

### 2.7 SensorDevice (`sensor_devices`)
```json
{
  "_id": "ObjectId",
  "sensorId": "SNS-001-ECG",
  "astronautId": "AST-001",
  "sensorType": "ECG | PulseOximeter | CoreTemp | BloodPressure",
  "connectionStatus": "Connected | Disconnected | Syncing",
  "lastUpdated": "ISODate"
}
```

---

### 2.8 Report (`reports`)
```json
{
  "_id": "ObjectId",
  "reportId": "REP-2026-1101",
  "reportType": "Daily | Weekly | Mission | Alerts",
  "astronautId": "AST-001",
  "missionId": "MIS-ARTEMIS-VI",
  "fileUrl": "/reports/...",
  "createdAt": "ISODate"
}
```
