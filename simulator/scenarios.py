import random
from typing import Dict, Any

def jitter(magnitude: float) -> float:
    return (random.random() - 0.5) * 2 * magnitude

def generate_telemetry_packet(astronaut_id: str, mission_id: str, scenario: str = "normal") -> Dict[str, Any]:
    """
    Generates synthetic telemetry data corresponding to a specified scenario.
    All outputs are explicitly marked as synthetic demonstration data.
    """
    hr = 72.0 + jitter(4.0)
    spo2 = 98.4 + jitter(0.6)
    temp = 36.8 + jitter(0.2)
    sys = 120.0 + jitter(5.0)
    dia = 80.0 + jitter(4.0)
    resp = 15.0 + jitter(2.0)
    act = 1.0
    status = "Connected"

    s_lower = scenario.lower()

    if "exercise" in s_lower or "activity" in s_lower:
        hr = 138.0 + jitter(12.0)
        spo2 = 97.2 + jitter(0.8)
        temp = 37.4 + jitter(0.3)
        sys = 144.0 + jitter(8.0)
        dia = 86.0 + jitter(5.0)
        resp = 25.0 + jitter(3.0)
        act = 2.0

    elif "sleep" in s_lower or "rest" in s_lower and "normal" not in s_lower:
        hr = 52.0 + jitter(3.0)
        spo2 = 98.8 + jitter(0.4)
        temp = 36.4 + jitter(0.15)
        sys = 110.0 + jitter(4.0)
        dia = 70.0 + jitter(3.0)
        resp = 11.0 + jitter(1.5)
        act = 0.0

    elif "tachy" in s_lower or "heart" in s_lower:
        hr = 168.0 + jitter(8.0)
        spo2 = 95.0 + jitter(1.2)
        temp = 37.1 + jitter(0.2)
        sys = 155.0 + jitter(6.0)
        dia = 96.0 + jitter(4.0)
        resp = 26.0 + jitter(3.0)
        act = 1.0

    elif "hypoxia" in s_lower or "spo2" in s_lower:
        hr = 108.0 + jitter(6.0)
        spo2 = 88.0 + jitter(2.0)
        temp = 36.8 + jitter(0.2)
        sys = 132.0 + jitter(5.0)
        dia = 84.0 + jitter(4.0)
        resp = 28.0 + jitter(3.0)
        act = 1.0

    elif "temp" in s_lower or "hyperthermia" in s_lower:
        hr = 118.0 + jitter(6.0)
        spo2 = 96.0 + jitter(0.8)
        temp = 39.3 + jitter(0.4)
        sys = 136.0 + jitter(6.0)
        dia = 88.0 + jitter(4.0)
        resp = 22.0 + jitter(2.0)
        act = 1.0

    elif "disconnect" in s_lower or "drop" in s_lower:
        hr = 0
        spo2 = 0
        temp = 0
        sys = 0
        dia = 0
        resp = 0
        status = "Disconnected"

    return {
        "astronautId": astronaut_id,
        "missionId": mission_id,
        "heartRate": int(round(hr)),
        "spo2": round(min(100.0, max(0.0, spo2)), 1),
        "temperature": round(temp, 1),
        "systolicBP": int(round(sys)),
        "diastolicBP": int(round(dia)),
        "respiratoryRate": int(round(resp)),
        "activityLevel": act,
        "sensorStatus": status,
        "source": "Python-Telemetry-Simulator"
    }
