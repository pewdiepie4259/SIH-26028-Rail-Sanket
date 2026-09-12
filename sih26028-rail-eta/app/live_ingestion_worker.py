import time
import logging
import requests
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("dynamic_ingestion")

LOCAL_INGEST_URL = "http://127.0.0.1:8000/api/v1/telemetry"

# Waypoint routes across the network corridors
CORRIDOR_ROUTES = {
    # SBC to BWT corridor (Bengaluru - Bangarapet)
    "20608": [  # Vande Bharat (Fast express)
        {"lat": 12.9784, "lon": 77.5680, "speed": 105.0, "signal": "GREEN"},
        {"lat": 12.9934, "lon": 77.5980, "speed": 110.0, "signal": "GREEN"},
        {"lat": 12.9912, "lon": 77.6525, "speed": 95.0, "signal": "GREEN"},
        {"lat": 13.0012, "lon": 77.6880, "speed": 100.0, "signal": "GREEN"},
        {"lat": 12.9934, "lon": 77.7500, "speed": 115.0, "signal": "GREEN"},
        {"lat": 13.0034, "lon": 77.9380, "speed": 120.0, "signal": "GREEN"},
        {"lat": 12.9860, "lon": 78.1970, "speed": 80.0, "signal": "DOUBLE_YELLOW"}
    ],
    "06527": [  # Bangarapet MEMU (Slow commuter causing downstream cascade)
        {"lat": 12.9912, "lon": 77.6525, "speed": 40.0, "signal": "GREEN"},
        {"lat": 13.0012, "lon": 77.6880, "speed": 35.0, "signal": "YELLOW"},
        {"lat": 12.9934, "lon": 77.7500, "speed": 20.0, "signal": "YELLOW"},
        {"lat": 13.0034, "lon": 77.9380, "speed": 10.0, "signal": "RED"}
    ],
    # NDLS to CNB corridor (Northern Trunk)
    "12301": [  # Howrah Rajdhani Express
        {"lat": 28.6140, "lon": 77.2090, "speed": 125.0, "signal": "GREEN"},
        {"lat": 28.5355, "lon": 77.3910, "speed": 130.0, "signal": "GREEN"},
        {"lat": 27.8974, "lon": 78.0880, "speed": 120.0, "signal": "GREEN"},
        {"lat": 27.1767, "lon": 78.0081, "speed": 110.0, "signal": "GREEN"},
        {"lat": 26.4547, "lon": 80.3507, "speed": 90.0, "signal": "DOUBLE_YELLOW"}
    ]
}

# State trackers for waypoint navigation
ROUTE_INDICES = {t: 0 for t in CORRIDOR_ROUTES}

def run_kinematic_stream(interval_seconds: int = 4):
    logger.info("Starting Dynamic Multi-Corridor Telemetry Stream...")

    while True:
        for train_no, waypoints in CORRIDOR_ROUTES.items():
            curr_idx = ROUTE_INDICES[train_no]
            wp = waypoints[curr_idx]

            # Add minor GPS noise to mimic physical sensors
            lat_jitter = wp["lat"] + np.random.uniform(-0.0005, 0.0005)
            lon_jitter = wp["lon"] + np.random.uniform(-0.0005, 0.0005)
            speed_jitter = max(5.0, wp["speed"] + np.random.uniform(-2.0, 2.0))

            payload = {
                "train_number": train_no,
                "lat": round(lat_jitter, 5),
                "lon": round(lon_jitter, 5),
                "speed": round(speed_jitter, 1),
                "signal": wp["signal"]
            }

            try:
                res = requests.post(LOCAL_INGEST_URL, json=payload, timeout=2.5)
                if res.status_code == 200:
                    pred = res.json().get("prediction", {})
                    block = pred.get("current_block", "N/A")
                    alert = pred.get("copilot_alert")
                    alert_str = " [⚠️ COPILOT OVERTAKE ADVISORY]" if alert else ""
                    logger.info(f"Rake {train_no} -> Block: {block} | Speed: {payload['speed']} km/h{alert_str}")
            except Exception as e:
                logger.error(f"Failed transmission for {train_no}: {e}")

            # Advance along route or loop back
            ROUTE_INDICES[train_no] = (curr_idx + 1) % len(waypoints)

        time.sleep(interval_seconds)

if __name__ == "__main__":
    run_kinematic_stream(interval_seconds=4)