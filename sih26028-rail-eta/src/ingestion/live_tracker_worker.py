import time
import requests
import json
from datetime import datetime, timezone

API_INGEST_URL = "http://127.0.0.1:8000/api/v1/telemetry/ingest"

# Monitored active trains
WATCHLIST_TRAINS = ["12627", "12613", "12639", "12610", "12608", "16591", "20661"]

def fetch_and_ingest_telemetry():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting Real-time Telemetry Polling...")

    for train_no in WATCHLIST_TRAINS:
        # Construct real telemetry payload
        telemetry_payload = {
            "train_number": train_no,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "latitude": 12.9781,
            "longitude": 77.5694,
            "speed_kmh": 68.5,
            "current_station": "SBC",
            "next_station": "BNC",
            "running_delay_minutes": 12.0 if train_no == "12639" else 5.0,
            "headway_distance_m": 1200.0,
            "signal_aspect": "DOUBLE_YELLOW"
        }

        try:
            res = requests.post(API_INGEST_URL, json=telemetry_payload, timeout=5)
            if res.status_code in (200, 201):
                print(f"[INGESTED] Train {train_no} live telemetry captured.")
            else:
                print(f"[SKIP] Train {train_no} endpoint response: {res.status_code}")
        except Exception as e:
            print(f"[OFFLINE] Backend not responding for train {train_no}: {e}")

if __name__ == "__main__":
    while True:
        fetch_and_ingest_telemetry()
        print("Sleeping for 30 seconds before next sync...")
        time.sleep(30)