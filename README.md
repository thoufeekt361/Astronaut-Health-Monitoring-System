# 🚀 Cosmic Six – Astronaut Health Monitoring System

### AI-Powered Health Monitoring for Safer Space Missions

<p align="center">
  <strong>NASA Space Apps Challenge 2026</strong><br>
  Team: Cosmic Six
</p>

---

## 🌌 About the Project

**Cosmic Six** is an AI-powered Astronaut Health Monitoring System designed to monitor and analyze astronauts' health conditions during space missions.

Astronauts experience challenging conditions in space, including microgravity, isolation, and limited access to immediate medical assistance. Our project aims to support astronaut safety through continuous health monitoring, data visualization, automated alerts, and Machine Learning-based anomaly detection.

The system uses simulated astronaut health data to demonstrate how health indicators can be monitored and analyzed through a centralized dashboard.

## 🎯 Project Objectives

- Monitor important astronaut health indicators.
- Visualize health readings and historical trends.
- Detect unusual health patterns using Machine Learning.
- Generate alerts when readings exceed predefined safety limits.
- Provide mission teams with centralized health information.
- Support early identification of potential health concerns.

## ✨ Key Features

### 1. Health Monitoring Dashboard
A centralized dashboard displaying astronaut health information and overall monitoring status.

### 2. Real-Time Health Visualization
Visual representation of health indicators and their changes over time.

### 3. Multiple Health Parameters
The system monitors:

- ❤️ Heart Rate
- 🫁 Oxygen Saturation (SpO₂)
- 🌡️ Body Temperature
- 🩺 Blood Pressure
- 💨 Respiratory Rate

### 4. Automated Alert System
Generates alerts when monitored health readings cross predefined safety thresholds.

### 5. AI-Based Anomaly Detection
A Python-based Machine Learning service analyzes health readings and identifies unusual patterns using anomaly detection techniques.

### 6. Health Analytics
Provides charts, historical records, and health trend visualizations to support monitoring and analysis.

### 7. Simulated Health Data
Generates sample astronaut health readings and different health scenarios for testing and demonstration.

## 🛠️ Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, TypeScript, HTML, CSS |
| UI Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Database ODM | Mongoose |
| Machine Learning | Python, Scikit-learn |
| ML Service | FastAPI |
| Data Processing | NumPy, Pandas |
| Anomaly Detection | Isolation Forest |
| Data Visualization | Recharts |
| Real-Time Communication | Socket.IO |
| Development Environment | Visual Studio Code |
| Version Control | Git and GitHub |

## 🧠 How the System Works

1. **Data Generation:** The system generates simulated astronaut health readings.
2. **Data Processing:** Health readings are processed and organized for monitoring.
3. **Database Storage:** Health information can be stored for historical analysis.
4. **Health Monitoring:** The dashboard displays health parameters and trends.
5. **Rule-Based Alerts:** Predefined safety thresholds identify readings that require attention.
6. **ML Analysis:** The Machine Learning service analyzes readings to identify unusual patterns.
7. **Visualization:** Health trends, alerts, and anomaly results are presented through the dashboard.

## 🏗️ System Architecture

```text
       Simulated Health Data
                 |
                 v
       Node.js / Express Backend
                 |
          +------+------+
          |             |
          v             v
       MongoDB      Python ML Service
          |          (FastAPI)
          |             |
          |        Anomaly Detection
          |             |
          +------+------+
                 |
                 v
          React Dashboard
                 |
       Health Trends & Alerts
```

## 🤖 Machine Learning

The project uses **Isolation Forest**, an unsupervised Machine Learning algorithm designed to identify unusual observations in data.

The model analyzes selected astronaut health parameters and identifies readings that differ significantly from learned patterns.

Machine Learning anomaly detection complements the predefined rule-based alert system. It does not replace medical assessment or guarantee the prediction of health emergencies.

## 📊 Simulated Health Scenarios

The prototype can demonstrate different health conditions through simulated readings, such as:

- Normal health readings
- Increased heart rate
- Reduced oxygen saturation
- Elevated body temperature
- Abnormal respiratory rate
- Unusual blood pressure readings

These scenarios help demonstrate the monitoring and alert-generation capabilities of the system.

## ⚙️ Installation and Setup

### Prerequisites

Install the following software:

- Node.js and npm
- Python 3.10 or later
- MongoDB
- Git
- Visual Studio Code

### 1. Clone the Repository

```bash
git clone https://github.com/thoufeekt361/Astronaut-Health-Monitoring-System.git
```

```bash
cd Astronaut-Health-Monitoring-System
```

### 2. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
npm install
```

Configure the environment variables in `.env` using the provided `.env.example`, then start the backend using the start script defined in `package.json`.

### 4. Machine Learning Service Setup

Navigate to the ML service directory:

```bash
cd ml-service
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the ML service using the FastAPI application entry point configured in the project.

**Note:** The directory names and startup commands above should match the actual project structure. Check the project folders and configuration files before running them.

## 🔐 Data and Safety Considerations

- This prototype uses simulated health data.
- It does not connect to real astronaut medical sensors.
- Health thresholds are demonstration settings, not validated medical limits.
- ML anomaly results are experimental and are not medical diagnoses.
- The system is intended as a demonstration and decision-support research prototype.

## 🌍 Intended Impact

Cosmic Six aims to demonstrate how web technologies and Machine Learning can contribute to astronaut health monitoring.

By combining health visualization, automated alerts, and anomaly detection, the system explores ways to help mission teams identify unusual health patterns and make informed decisions during space missions.

Our long-term vision is to contribute to safer and more sustainable human space exploration.

## 👥 Team – Cosmic Six

**NASA Space Apps Challenge 2026**

Challenge: Create Health Monitoring Software for Astronauts on Space Missions.

## 📌 Project Information

- Project Name: Cosmic Six
- Category: Health Monitoring / Artificial Intelligence
- Development Approach: Full-Stack Web Application with Machine Learning
- Data Source: Simulated Health Data
- Challenge: NASA Space Apps Challenge 2026

## 📄 License

This project was developed for the NASA Space Apps Challenge 2026. Third-party libraries, tools, and resources remain subject to their respective licenses.

---

<p align="center">
  <strong>🚀 Cosmic Six – Supporting Healthier and Safer Space Missions</strong>
</p>
