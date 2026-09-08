import asyncio
import httpx
from datetime import datetime, timezone

async def run_simulation():
    url = "http://127.0.0.1:8000/api/v1/telemetry/rtis"
    print("\n--- Streaming Bengaluru Division RTIS Telemetry (SBC -> BWT) ---")

    # Train 1: 06527 Bangarapet MEMU (Leading passenger)
    t1_lat, t1_lon, t1_speed = 12.9800, 77.5800, 45.0
    # Train 2: 20608 Vande Bharat Express (Trailing premium rake)
    t2_lat, t2_lon, t2_speed = 12.9750, 77.5650, 75.0

    async with httpx.AsyncClient() as client:
        for step in range(10):
            # Advance coordinates along the eastward SBC-KJM-BWT alignment
            t1_lat += 0.0025
            t1_lon += 0.065
            t2_lat += 0.0028
            t2_lon += 0.070

            # Traffic restriction: MEMU slows down mid-corridor
            sig1 = "YELLOW" if step >= 4 else "GREEN"
            t1_speed = 25.0 if step >= 4 else 45.0

            p1 = {
                "loco_id": "WAP7_30450",
                "train_number": "06527",
                "latitude": round(t1_lat, 4),
                "longitude": round(t1_lon, 4),
                "speed_kmh": t1_speed,
                "heading": 85.0,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "signal_aspect": sig1
            }

            # Trailing Vande Bharat experiences headway compression
            sig2 = "YELLOW" if step >= 5 else "GREEN"
            t2_speed = 30.0 if step >= 5 else 80.0

            p2 = {
                "loco_id": "VB_20608",
                "train_number": "20608",
                "latitude": round(t2_lat, 4),
                "longitude": round(t2_lon, 4),
                "speed_kmh": t2_speed,
                "heading": 85.0,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "signal_aspect": sig2
            }

            for payload in [p1, p2]:
                try:
                    resp = await client.post(url, json=payload, timeout=5)
                    data = resp.json()
                    top_fc = data["forecasts"][0] if data["forecasts"] else {
                        "station": "TERM", "dynamic_eta": "-", "predicted_delay_min": 0, "cascade_risk": 0
                    }
                    print(f"[{payload['train_number']}] Block: {data['current_block']:<4} | Spd: {payload['speed_kmh']:>4.1f} km/h | Next: {top_fc['station']} (+{top_fc['predicted_delay_min']}m, Risk: {top_fc['cascade_risk']})")

                    alert = data.get("copilot_alert")
                    if alert:
                        print(f"   🚨 [ALERT -> LLM] Bottleneck: {alert['bottleneck_station']} | Train: {alert['delayed_train']} | Delay: +{alert['predicted_delay_min']}m | Risk: {alert['downstream_cascade_risk']} | Trailing Impacted: {alert['affected_trains']}")
                except Exception as e:
                    print(f"Telemetry error: {e}")

            print("-" * 75)
            await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(run_simulation())