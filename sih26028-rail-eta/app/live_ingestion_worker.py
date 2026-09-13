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
NODE_API_BASE = "http://localhost:5000/api"

# Pre-configured Waypoint routes across National & Corridor networks
CORRIDOR_ROUTES = {
    # 12246: SMVT Bengaluru - Howrah Duronto Express
    "12246": [
        {"lat": 13.0117, "lon": 77.6534, "speed": 65.0, "signal": "GREEN"},
        {"lat": 13.0432, "lon": 77.5623, "speed": 75.0, "signal": "GREEN"},
        {"lat": 13.0005, "lon": 77.6740, "speed": 85.0, "signal": "GREEN"},
        {"lat": 12.9953, "lon": 77.7613, "speed": 95.0, "signal": "GREEN"},
        {"lat": 13.6288, "lon": 79.4192, "speed": 100.0, "signal": "GREEN"},
        {"lat": 16.5186, "lon": 80.6198, "speed": 110.0, "signal": "GREEN"},
        {"lat": 17.7214, "lon": 83.2907, "speed": 105.0, "signal": "DOUBLE_YELLOW"},
        {"lat": 20.2666, "lon": 85.8436, "speed": 98.0, "signal": "GREEN"},
        {"lat": 22.5841, "lon": 88.3410, "speed": 40.0, "signal": "DOUBLE_YELLOW"}
    ],

    # 12245: Howrah - SMVT Bengaluru Duronto Express
    "12245": [
        {"lat": 22.5841, "lon": 88.3410, "speed": 70.0, "signal": "GREEN"},
        {"lat": 20.2666, "lon": 85.8436, "speed": 105.0, "signal": "GREEN"},
        {"lat": 17.7214, "lon": 83.2907, "speed": 110.0, "signal": "GREEN"},
        {"lat": 16.5186, "lon": 80.6198, "speed": 115.0, "signal": "GREEN"},
        {"lat": 13.6288, "lon": 79.4192, "speed": 90.0, "signal": "GREEN"},
        {"lat": 13.0117, "lon": 77.6534, "speed": 35.0, "signal": "DOUBLE_YELLOW"}
    ],

    # 20608: Vande Bharat Express (SBC-MAS)
    "20608": [
        {"lat": 12.9784, "lon": 77.5680, "speed": 105.0, "signal": "GREEN"},
        {"lat": 12.9934, "lon": 77.5980, "speed": 110.0, "signal": "GREEN"},
        {"lat": 12.9912, "lon": 77.6525, "speed": 95.0, "signal": "GREEN"},
        {"lat": 13.0012, "lon": 77.6880, "speed": 100.0, "signal": "GREEN"},
        {"lat": 12.9934, "lon": 77.7500, "speed": 115.0, "signal": "GREEN"},
        {"lat": 12.9860, "lon": 78.1970, "speed": 120.0, "signal": "GREEN"},
        {"lat": 12.5694, "lon": 78.5833, "speed": 125.0, "signal": "GREEN"},
        {"lat": 12.9698, "lon": 79.1384, "speed": 110.0, "signal": "GREEN"},
        {"lat": 13.0827, "lon": 80.2755, "speed": 45.0, "signal": "DOUBLE_YELLOW"}
    ],

    # 12627: Karnataka Express (SBC-NDLS)
    "12627": [
        {"lat": 12.9781, "lon": 77.5695, "speed": 85.0, "signal": "GREEN"},
        {"lat": 13.0238, "lon": 77.5516, "speed": 90.0, "signal": "GREEN"},
        {"lat": 15.3600, "lon": 75.1400, "speed": 100.0, "signal": "GREEN"},
        {"lat": 17.4344, "lon": 78.5017, "speed": 105.0, "signal": "GREEN"},
        {"lat": 21.1500, "lon": 79.0900, "speed": 110.0, "signal": "GREEN"},
        {"lat": 23.2600, "lon": 77.4100, "speed": 115.0, "signal": "GREEN"},
        {"lat": 25.4500, "lon": 78.5800, "speed": 110.0, "signal": "YELLOW"},
        {"lat": 28.6415, "lon": 77.2207, "speed": 40.0, "signal": "DOUBLE_YELLOW"}
    ],

    # 12301: Howrah Rajdhani Express (HWH-NDLS)
    "12301": [
        {"lat": 22.5839, "lon": 88.3426, "speed": 115.0, "signal": "GREEN"},
        {"lat": 23.6800, "lon": 86.9800, "speed": 125.0, "signal": "GREEN"},
        {"lat": 25.2818, "lon": 83.1234, "speed": 130.0, "signal": "GREEN"},
        {"lat": 25.4484, "lon": 81.8286, "speed": 120.0, "signal": "GREEN"},
        {"lat": 26.4547, "lon": 80.3507, "speed": 110.0, "signal": "GREEN"},
        {"lat": 28.6415, "lon": 77.2207, "speed": 45.0, "signal": "DOUBLE_YELLOW"}
    ],

    # 06527: Bangarapet MEMU Commuter
    "06527": [
        {"lat": 12.9781, "lon": 77.5695, "speed": 45.0, "signal": "GREEN"},
        {"lat": 12.9912, "lon": 77.6525, "speed": 40.0, "signal": "GREEN"},
        {"lat": 13.0012, "lon": 77.6880, "speed": 35.0, "signal": "YELLOW"},
        {"lat": 12.9934, "lon": 77.7500, "speed": 25.0, "signal": "YELLOW"},
        {"lat": 12.9860, "lon": 78.1970, "speed": 15.0, "signal": "RED"}
    ],

    # 12639: Brindavan Express
    "12639": [
        {"lat": 12.9781, "lon": 77.5695, "speed": 80.0, "signal": "GREEN"},
        {"lat": 12.9934, "lon": 77.5980, "speed": 85.0, "signal": "GREEN"},
        {"lat": 12.9860, "lon": 78.1970, "speed": 95.0, "signal": "GREEN"},
        {"lat": 12.9698, "lon": 79.1384, "speed": 90.0, "signal": "GREEN"},
        {"lat": 13.0827, "lon": 80.2755, "speed": 50.0, "signal": "GREEN"}
    ],

    # 12613: Bengaluru - Mysuru Tippu Express
    "12613": [
        {"lat": 12.9781, "lon": 77.5695, "speed": 90.0, "signal": "GREEN"},
        {"lat": 12.7000, "lon": 77.2000, "speed": 95.0, "signal": "GREEN"},
        {"lat": 12.5200, "lon": 76.8900, "speed": 100.0, "signal": "GREEN"},
        {"lat": 12.3100, "lon": 76.6500, "speed": 40.0, "signal": "DOUBLE_YELLOW"}
    ],

    # 12608: Lalbagh Express
    "12608": [
        {"lat": 13.0827, "lon": 80.2755, "speed": 85.0, "signal": "GREEN"},
        {"lat": 12.9698, "lon": 79.1384, "speed": 95.0, "signal": "GREEN"},
        {"lat": 12.9860, "lon": 78.1970, "speed": 90.0, "signal": "GREEN"},
        {"lat": 12.9781, "lon": 77.5695, "speed": 40.0, "signal": "DOUBLE_YELLOW"}
    ],

    # 10111: Konkan Kanya Express
    "10111": [
        {"lat": 18.9400, "lon": 72.8355, "speed": 75.0, "signal": "GREEN"},
        {"lat": 18.9894, "lon": 73.1175, "speed": 85.0, "signal": "GREEN"},
        {"lat": 16.9800, "lon": 73.3300, "speed": 80.0, "signal": "GREEN"},
        {"lat": 15.2740, "lon": 73.9800, "speed": 45.0, "signal": "DOUBLE_YELLOW"}
    ],

    # 04601: Jammu Tawi - Udhampur Express
    "04601": [
        {"lat": 32.7058, "lon": 74.8778, "speed": 60.0, "signal": "GREEN"},
        {"lat": 32.7485, "lon": 74.9620, "speed": 65.0, "signal": "GREEN"},
        {"lat": 32.9268, "lon": 75.1416, "speed": 50.0, "signal": "GREEN"}
    ]
}

# State trackers for waypoint navigation
ROUTE_INDICES = {t: 0 for t in CORRIDOR_ROUTES}

def run_kinematic_stream(interval_seconds: int = 3):
    logger.info("Starting Dynamic Multi-Corridor Telemetry Stream for All Fleet Rakes...")

    while True:
        train_list = list(CORRIDOR_ROUTES.keys())

        for train_no in train_list:
            waypoints = CORRIDOR_ROUTES[train_no]
            if not waypoints:
                continue

            curr_idx = ROUTE_INDICES.get(train_no, 0)
            wp = waypoints[curr_idx]

            # Add minor GPS noise to mimic physical sensors
            lat_jitter = wp["lat"] + float(np.random.uniform(-0.0003, 0.0003))
            lon_jitter = wp["lon"] + float(np.random.uniform(-0.0003, 0.0003))
            speed_jitter = max(5.0, wp["speed"] + float(np.random.uniform(-2.0, 2.0)))

            payload = {
                "train_number": str(train_no),
                "lat": round(lat_jitter, 5),
                "lon": round(lon_jitter, 5),
                "speed": round(speed_jitter, 1),
                "signal": wp["signal"]
            }

            try:
                res = requests.post(LOCAL_INGEST_URL, json=payload, timeout=10.0)
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
    run_kinematic_stream(interval_seconds=3)