import time
import requests
import sys
import argparse
from datetime import datetime
from config import TELEMETRY_ENDPOINT, DEFAULT_INTERVAL_SECONDS, ASTRONAUTS
from scenarios import generate_telemetry_packet

def run_simulation(interval: float = DEFAULT_INTERVAL_SECONDS, scenario: str = "normal", target_astro: str = None):
    print("=================================================================")
    print("       COSMIC SIX - SYNTHETIC HEALTH TELEMETRY SIMULATOR         ")
    print("           NASA Space Apps Challenge 2026 Prototype              ")
    print("=================================================================")
    print(f"Target Ingestion URL : {TELEMETRY_ENDPOINT}")
    print(f"Transmission Interval: {interval} seconds")
    print(f"Scenario Active      : {scenario}")
    print(f"Astronauts Monitored : {len(ASTRONAUTS)} Crew Members")
    print("=================================================================")
    print("Streaming packets... Press Ctrl+C to terminate.")

    cycle = 0
    while True:
        for astro in ASTRONAUTS:
            astro_id = astro["id"]
            mission_id = astro["missionId"]

            # Apply scenario to chosen astronaut or all
            active_sc = scenario if (target_astro is None or target_astro == astro_id) else "normal"
            packet = generate_telemetry_packet(astro_id, mission_id, active_sc)

            try:
                resp = requests.post(TELEMETRY_ENDPOINT, json=packet, timeout=3.0)
                status_code = resp.status_code
                status_mark = "[OK]" if status_code in (200, 201) else f"[ERR {status_code}]"
            except Exception as e:
                status_mark = f"[CONN FAIL: {str(e)[:30]}]"

            ts = datetime.now().strftime("%H:%M:%S")
            print(f"[{ts}] {status_mark} {astro_id} ({astro['name']}) -> HR: {packet['heartRate']:3d} BPM | SpO2: {packet['spo2']:4.1f}% | Temp: {packet['temperature']:4.1f}C | BP: {packet['systolicBP']}/{packet['diastolicBP']} | Sc: {active_sc}")

            time.sleep(interval / len(ASTRONAUTS))

        cycle += 1

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="COSMIC SIX Astronaut Telemetry Simulator")
    parser.add_argument("--interval", type=float, default=DEFAULT_INTERVAL_SECONDS, help="Cadence in seconds")
    parser.add_argument("--scenario", type=str, default="normal", help="normal, exercise, sleep, tachycardia, hypoxia, hyperthermia, disconnect")
    parser.add_argument("--astro", type=str, default=None, help="Target specific astronaut (e.g. AST-001)")

    args = parser.parse_args()
    try:
        run_simulation(interval=args.interval, scenario=args.scenario, target_astro=args.astro)
    except KeyboardInterrupt:
        print("\n[Simulator] Safely disconnected from telemetry feed.")
        sys.exit(0)
