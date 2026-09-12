import time
import requests
import json

API_URL = "http://127.0.0.1:8000/api/v1/telemetry"

SIMULATION_STEPS = [
    # Step 1: Normal corridor running out of SBC
    [
        {"train_number": "06527", "lat": 12.9784, "lon": 77.5680, "speed": 45.0, "signal": "GREEN"},
        {"train_number": "20608", "lat": 12.9784, "lon": 77.5680, "speed": 80.0, "signal": "GREEN"}
    ],
    # Step 2: Passing Bengaluru Cantt (BNC)
    [
        {"train_number": "06527", "lat": 12.9934, "lon": 77.5980, "speed": 45.0, "signal": "GREEN"},
        {"train_number": "20608", "lat": 12.9784, "lon": 77.5680, "speed": 85.0, "signal": "GREEN"}
    ],
    # Step 3: Approaching Whitefield (WFD)
    [
        {"train_number": "06527", "lat": 12.9934, "lon": 77.7500, "speed": 45.0, "signal": "GREEN"},
        {"train_number": "20608", "lat": 12.9934, "lon": 77.6603, "speed": 95.0, "signal": "GREEN"}
    ],
    # Step 4: Congestion starts at Malur (MLO) - MEMU drops to 25 km/h under Yellow Signal
    [
        {"train_number": "06527", "lat": 13.0034, "lon": 77.9380, "speed": 25.0, "signal": "YELLOW"},
        {"train_number": "20608", "lat": 12.9934, "lon": 77.7500, "speed": 80.0, "signal": "DOUBLE_YELLOW"}
    ],
    # Step 5: Heavy cascade at Bangarapet (BWT) approach - Vande Bharat slowed down by MEMU
    [
        {"train_number": "06527", "lat": 12.9860, "lon": 78.1970, "speed": 20.0, "signal": "RED"},
        {"train_number": "20608", "lat": 13.0034, "lon": 77.9380, "speed": 30.0, "signal": "YELLOW"}
    ]
]

import sys

def run_simulation(loop: bool = False):
    print("==================================================================")
    print("[SIMULATOR] Starting RailDrishti Corridor Simulation: SBC -> BWT")
    print("   Tracking: MEMU (06527) & Vande Bharat Express (20608)")
    print(f"   Mode: {'Continuous Stream' if loop else 'Single Pass (5 Steps)'}")
    print("==================================================================")

    iteration = 1
    while True:
        for step_idx, step in enumerate(SIMULATION_STEPS, 1):
            print(f"\n--- [CYCLE {iteration} | STEP {step_idx}] Corridor Block Scan ---")
            for rake in step:
                try:
                    res = requests.post(API_URL, json=rake, timeout=3.0)
                    if res.status_code == 200:
                        data = res.json()["prediction"]
                        t_num = data["train_number"]
                        block = data["current_block"]
                        spd = data["telemetry"]["speed_kmh"]
                        forecasts = data.get("forecasts", [])
                        next_stn = forecasts[0]["station"] if forecasts else "TERM"
                        next_delay = forecasts[0]["predicted_delay_min"] if forecasts else 0.0
                        risk = forecasts[0]["cascade_risk"] if forecasts else 0.0

                        print(f"[{t_num}] Block: {block:<4} | Spd: {spd:4.1f} km/h | Next: {next_stn} (+{next_delay}m, Risk: {risk})")

                        alert = data.get("copilot_alert")
                        if alert:
                            print(f"   [BOTTLENECK] Choke Station: {alert['bottleneck_station']} | Train: {t_num} | Delay: +{alert['predicted_delay_min']}m")
                            action = alert.get("dispatcher_precedence_action")
                            if action:
                                print(f"   [DISPATCHER ADVISORY]: {action['advisory_directive']}")
                                print(f"   [TRADE-OFF GAIN]: {action['tradeoff_analysis']['net_system_efficiency_gain']}")
                    else:
                        print(f"Failed to post telemetry for {rake['train_number']}: {res.text}")
                except Exception as e:
                    print(f"Connection error: {e}")

            time.sleep(3)

        if not loop:
            break
        iteration += 1
        print("\n--- Cycling Corridor Telemetry Stream ---")
        time.sleep(2)

if __name__ == "__main__":
    is_continuous = "--continuous" in sys.argv or "--loop" in sys.argv
    run_simulation(loop=is_continuous)