import pytest
from datetime import datetime, timezone, time, timedelta
from src.models import (
    Station, Train, TrainRoute, ScheduledStop,
    ModelVersion, ETAPrediction, DelayPropagationPrediction,
    ModelType, DataSourceType
)
from src.ml.propagation import DelayPropagationEngine


def test_delay_propagation_and_decay(db_session):
    # 1. Setup corridor: SBC -> BNC -> BYPL -> KJM
    sbc = Station(station_code="SBC", station_name="KSR Bengaluru", division="SBC", zone="SWR", latitude=12.97, longitude=77.56)
    bnc = Station(station_code="BNC", station_name="Bengaluru Cantt", division="SBC", zone="SWR", latitude=12.99, longitude=77.59)
    bypl = Station(station_code="BYPL", station_name="Baiyyappanahalli", division="SBC", zone="SWR", latitude=12.99, longitude=77.65)
    kjm = Station(station_code="KJM", station_name="Krishnarajapuram", division="SBC", zone="SWR", latitude=13.00, longitude=77.67)
    db_session.add_all([sbc, bnc, bypl, kjm])
    db_session.commit()

    # Train 1: Vande Bharat (Priority 1)
    train1 = Train(train_number="20661", train_name="Vande Bharat", train_type="VANDE_BHARAT", priority_level=1, origin_station_code="SBC", destination_station_code="DWR")
    db_session.add(train1)
    db_session.commit()

    route1 = TrainRoute(train_id=train1.id, route_code="SBC-KJM-UP", direction="UP")
    db_session.add(route1)
    db_session.commit()

    stops1 = [
        ScheduledStop(route_id=route1.id, station_id=sbc.id, stop_sequence=1, scheduled_departure_time=time(6, 0)),
        ScheduledStop(route_id=route1.id, station_id=bnc.id, stop_sequence=2, scheduled_arrival_time=time(6, 8), scheduled_departure_time=time(6, 10)),
        ScheduledStop(route_id=route1.id, station_id=bypl.id, stop_sequence=3, scheduled_arrival_time=time(6, 17), scheduled_departure_time=time(6, 18)),
        ScheduledStop(route_id=route1.id, station_id=kjm.id, stop_sequence=4, scheduled_arrival_time=time(6, 25), scheduled_departure_time=time(6, 27)),
    ]
    db_session.add_all(stops1)

    # Train 2: Conflicting Passenger Train at BNC scheduled at 06:18
    train2 = Train(train_number="06563", train_name="BNC Passenger", train_type="PASSENGER", priority_level=4, origin_station_code="SBC", destination_station_code="BWT")
    db_session.add(train2)
    db_session.commit()

    route2 = TrainRoute(train_id=train2.id, route_code="SBC-BWT-UP", direction="UP")
    db_session.add(route2)
    db_session.commit()

    stop2 = ScheduledStop(route_id=route2.id, station_id=bnc.id, stop_sequence=2, scheduled_arrival_time=time(6, 18), scheduled_departure_time=time(6, 20))
    db_session.add(stop2)

    # Baseline Model
    model = ModelVersion(model_name="LGBM", model_type=ModelType.LIGHTGBM_REGRESSOR, version_tag="v-test", is_active=True)
    db_session.add(model)
    db_session.commit()

    # Primary delay: 10 minutes delay predicted at BNC
    # Scheduled BNC arrival was 06:08 -> Projected arrival is 06:18 (conflicts with 06563)
    now = datetime(2026, 9, 9, 6, 0, tzinfo=timezone.utc)
    eta_pred = ETAPrediction(
        model_version_id=model.id,
        train_id=train1.id,
        target_station_id=bnc.id,
        prediction_generated_at=now,
        scheduled_eta=datetime(2026, 9, 9, 6, 8, tzinfo=timezone.utc),
        predicted_eta=datetime(2026, 9, 9, 6, 18, tzinfo=timezone.utc),
        predicted_delay_minutes=10.0,
        confidence_score=0.90,
        source_type=DataSourceType.SIMULATED
    )
    db_session.add(eta_pred)
    db_session.commit()

    # 2. Run Propagation Engine
    engine = DelayPropagationEngine(db_session)
    result = engine.simulate_propagation(eta_pred)

    # 3. Assertions
    assert result.primary_train_number == "20661"
    assert len(result.projections) == 3  # BNC, BYPL, KJM
    
    # Check delay decay/recovery (Priority 1 train recovers slack)
    initial_hop_delay = result.projections[0].propagated_delay_minutes
    last_hop_delay = result.projections[-1].propagated_delay_minutes
    assert last_hop_delay < initial_hop_delay

    # Check database persistence
    saved_props = db_session.query(DelayPropagationPrediction).filter_by(eta_prediction_id=eta_pred.id).all()
    assert len(saved_props) == 3

    # Check Headway Conflict Detection
    assert len(result.detected_conflicts) >= 1
    conflict = result.detected_conflicts[0]
    assert conflict.station_code == "BNC"
    assert conflict.conflicting_train_number == "06563"
    assert "VANDE_BHARAT" in conflict.recommended_action