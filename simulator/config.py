import os

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000/api/v1")
TELEMETRY_ENDPOINT = f"{BACKEND_URL}/health/readings"
DEFAULT_INTERVAL_SECONDS = 3.0

ASTRONAUTS = [
    {"id": "AST-001", "name": "Alex Vance", "missionId": "MIS-ARTEMIS-VI"},
    {"id": "AST-002", "name": "Sarah Connor", "missionId": "MIS-ARTEMIS-VI"},
    {"id": "AST-003", "name": "Elena Rostova", "missionId": "MIS-ARTEMIS-VI"},
    {"id": "AST-004", "name": "Kenji Sato", "missionId": "MIS-ARTEMIS-VI"},
    {"id": "AST-005", "name": "Marcus Brody", "missionId": "MIS-GATEWAY-IV"},
    {"id": "AST-006", "name": "Nadia Chen", "missionId": "MIS-GATEWAY-IV"},
]
