import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.database import get_db
from src.models import Station, Train, TrainRoute, ScheduledStop
from datetime import time


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "HEALTHY"


def test_api_full_flow(client, db_session):
    # Setup stations and train
    sbc = Station(station_code="SBC", station_name="KSR Bengaluru", division="SBC", zone="SWR", latitude=12.97, longitude=77.56)
    bnc = Station(station_code="BNC", station_name="Bengaluru Cantt", division="SBC", zone="SWR", latitude=12.99, longitude=77.59)
    train = Train(train_number="20661", train_name="Vande Bharat", train_type="VANDE_BHARAT", priority_level=1, origin_station_code="SBC", destination_station_code="DWR")
    db_session.add_all([sbc, bnc, train])
    db_session.commit()

    route = TrainRoute(train_id=train.id, route_code="SBC-BNC-API", direction="UP")
    db_session.add(route)
    db_session.commit()

    stop = ScheduledStop(route_id=route.id, station_id=bnc.id, stop_sequence=1, scheduled_arrival_time=time(6, 15))
    db_session.add(stop)
    db_session.commit()

    # 1. Fetch stations
    res_st = client.get("/api/v1/stations")
    assert res_st.status_code == 200
    assert any(s["station_code"] == "SBC" for s in res_st.json())

    # 2. Compute ETA prediction
    res_pred = client.post("/api/v1/predictions/calculate?train_number=20661&from_station=SBC&to_station=BNC&delay_minutes=6.0")
    assert res_pred.status_code == 200
    pred_data = res_pred.json()
    assert "prediction_id" in pred_data
    pred_id = pred_data["prediction_id"]

    # 3. Call Controller Copilot explanation
    res_copilot = client.get(f"/api/v1/predictions/{pred_id}/copilot-explanation")
    assert res_copilot.status_code == 200
    copilot_data = res_copilot.json()
    assert "explanation" in copilot_data
    assert "recommendation" in copilot_data
    assert copilot_data["train_number"] == "20661"