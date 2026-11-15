# COSMIC SIX - Installation and Setup Guide

## System Prerequisites
- **Node.js**: v18.x or v20.x or v24.x
- **Python**: 3.10+ (tested with Python 3.11 and 3.12)
- **MongoDB**: Local MongoDB instance (default `mongodb://127.0.0.1:27017/cosmic-six`) OR automatic in-memory DB fallback.

---

## 1. Quick Start (Step-by-Step)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
npm run build
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
npm run build
```

### Step 3: Install Python ML Service Dependencies
```bash
cd ../ml-service
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Unix/macOS:
source venv/bin/activate

pip install -r requirements.txt
python training/train_model.py
```

### Step 4: Run Services
You can run the components in separate terminals:

1. **Terminal 1 - Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   *Runs at `http://localhost:5000`*

2. **Terminal 2 - ML Service**:
   ```bash
   cd ml-service
   # Activate venv
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   *Runs at `http://localhost:8000`*

3. **Terminal 3 - Frontend Dashboard**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs at `http://localhost:5173` or `http://localhost:3000`*

4. **Terminal 4 - Telemetry Simulator**:
   ```bash
   cd simulator
   python simulator.py
   ```

---

## 2. Docker Deployment
To spin up all services including MongoDB:
```bash
docker-compose up --build
```
This builds and connects:
- MongoDB at `localhost:27017`
- Python FastAPI ML microservice at `localhost:8000`
- Node.js & Express API + Socket.IO at `localhost:5000`
- React Vite Dashboard at `localhost:3000`

---

## 3. Demo Credentials
The system automatically seeds a demo astronaut crew, active missions, and administrative credentials upon initial database connection:
- **Email**: `operator@cosmic.nasa.gov`
- **Password**: `CosmicSix2026!`
- **Role**: `Mission Operator`
