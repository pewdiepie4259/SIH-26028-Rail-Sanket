import sys
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_all():
    print("========================================")
    print("Testing RailDrishti Unified Architecture")
    print("========================================")

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[OK] 1. Health Check:", res.json())

    # 2. Stations
    res = client.get("/api/v1/stations")
    assert res.status_code == 200, f"Stations failed: {res.text}"
    stations = res.json()
    assert len(stations) > 0, "No stations returned"
    print(f"[OK] 2. Stations: {len(stations)} loaded (e.g. {stations[0]['station_code']})")

    # 3. Trains
    res = client.get("/api/v1/trains")
    assert res.status_code == 200, f"Trains failed: {res.text}"
    trains = res.json()
    assert len(trains) > 0, "No trains returned"
    print(f"[OK] 3. Trains: {len(trains)} loaded (e.g. {trains[0]['train_number']} - {trains[0]['train_name']})")

    # 4. Corridor Topology
    res = client.get("/api/v1/corridors/bengaluru/topology")
    assert res.status_code == 200, f"Topology failed: {res.text}"
    topo = res.json()
    assert "nodes" in topo and len(topo["nodes"]) > 0, "No topology nodes"
    print(f"[OK] 4. Corridor Topology: {len(topo['nodes'])} nodes, {len(topo.get('links', []))} links")

    # 5. GNN Delay Prediction
    res = client.post("/api/v1/gnn/predict-corridor", json={
        "train_number": "12627",
        "active_station_delays": {"12627": 18.0}
    })
    assert res.status_code == 200, f"GNN prediction failed: {res.text}"
    gnn_data = res.json()
    print(f"[OK] 5. GNN Delay Propagation: model={gnn_data.get('model')}, bottleneck={gnn_data.get('bottleneck_node')}")

    # 6. Tabular ETA Calculation
    res = client.post("/api/v1/predictions/calculate?train_number=12627&from_station=SBC&to_station=KGI&delay_minutes=15")
    assert res.status_code == 200, f"ETA calculation failed: {res.text}"
    eta_data = res.json()
    pred_id = eta_data["prediction_id"]
    print(f"[OK] 6. LightGBM ETA: pred_id={pred_id}, delay={eta_data['predicted_delay_minutes']}m")

    # 7. Section Controller Copilot
    res = client.get(f"/api/v1/predictions/{pred_id}/copilot-explanation")
    assert res.status_code == 200, f"Copilot failed: {res.text}"
    copilot_data = res.json()
    print(f"[OK] 7. Controller AI Copilot: provider={copilot_data['provider']}, recommendation={copilot_data['recommendation'][:50]}...")

    # 8. GPS Location Update
    res = client.post("/api/v1/gps/update-location", json={
        "train_number": "12627",
        "latitude": 12.9781,
        "longitude": 77.5694,
        "speed_kmh": 72.5
    })
    assert res.status_code == 200, f"GPS update failed: {res.text}"
    gps_data = res.json()
    print(f"[OK] 8. GPS Geo-Fence Update: nearest={gps_data['nearest_station']}, status={gps_data['tracking_status']}")

    # 9. WhatsApp Query API
    res = client.post("/api/v1/whatsapp/query", json={"message": "12627"})
    assert res.status_code == 200, f"WhatsApp query failed: {res.text}"
    wa_data = res.json()
    assert "reply" in wa_data and len(wa_data["reply"]) > 0, "No reply from bot"
    print(f"[OK] 9. WhatsApp Bot Query: received {len(wa_data['reply'])} chars reply")

    print("\nALL 9 END-TO-END INTEGRATION TESTS PASSED!")

if __name__ == "__main__":
    test_all()
