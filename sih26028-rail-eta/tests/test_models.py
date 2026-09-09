import pytest
from datetime import time, timedelta, timezone
from sqlalchemy.exc import IntegrityError
from src.models import (
    Station, Train, TrainRoute, RouteSection, ScheduledStop,
    ModelVersion, ETAPrediction, DataSourceType, ModelType
)
from src.utils.time import utc_now, utc_to_ist, ist_to_utc


def test_station_creation_and_timezone_handling(db_session):
    station = Station(
        station_code="SBC",
        station_name="KSR Bengaluru City",
        division="SBC",
        zone="SWR",
        latitude=12.9781,
        longitude=77.5694,
        total_platforms=10,
        is_junction=True,
        is_terminal=True
    )
    db_session.add(station)
    db_session.commit()

    saved = db_session.query(Station).filter_by(station_code="SBC").first()
    assert saved.id is not None
    assert saved.station_code == "SBC"
    
    # Check that created_at is aware or in UTC
    assert saved.created_at is not None
    ist_time = utc_to_ist(saved.created_at)
    assert ist_time.tzinfo.zone == "Asia/Kolkata"


def test_station_code_unique_constraint(db_session):
    s1 = Station(station_code="YPR", station_name="Yesvantpur", division="SBC", zone="SWR", latitude=13.0, longitude=77.5)
    s2 = Station(station_code="YPR", station_name="Duplicate", division="SBC", zone="SWR", latitude=13.0, longitude=77.5)
    db_session.add(s1)
    db_session.commit()

    db_session.add(s2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_route_section_and_check_constraint(db_session):
    sbc = Station(station_code="SBC", station_name="Bangalore City", division="SBC", zone="SWR", latitude=12.9, longitude=77.5)
    bnc = Station(station_code="BNC", station_name="Bangalore Cantt", division="SBC", zone="SWR", latitude=12.9, longitude=77.6)
    train = Train(train_number="12658", train_name="Chennai Mail", train_type="SUPERFAST", origin_station_code="SBC", destination_station_code="MAS")
    db_session.add_all([sbc, bnc, train])
    db_session.commit()

    route = TrainRoute(train_id=train.id, route_code="SBC-MAS", direction="UP")
    db_session.add(route)
    db_session.commit()

    # Valid section
    sec = RouteSection(
        route_id=route.id,
        from_station_id=sbc.id,
        to_station_id=bnc.id,
        section_sequence=1,
        distance_km=4.3,
        nominal_traversal_minutes=7.0
    )
    db_session.add(sec)
    db_session.commit()
    assert sec.id is not None

    # Invalid section: from_station == to_station (violates ck_route_section_distinct_stations)
    invalid_sec = RouteSection(
        route_id=route.id,
        from_station_id=sbc.id,
        to_station_id=sbc.id,
        section_sequence=2,
        distance_km=0.0,
        nominal_traversal_minutes=0.0
    )
    db_session.add(invalid_sec)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_eta_prediction_pipeline(db_session):
    sbc = Station(station_code="SBC", station_name="Bangalore City", division="SBC", zone="SWR", latitude=12.9, longitude=77.5)
    train = Train(train_number="20661", train_name="Vande Bharat", train_type="VANDE_BHARAT", origin_station_code="SBC", destination_station_code="DWR")
    model = ModelVersion(model_name="Baseline", model_type=ModelType.BASELINE_DELTA, version_tag="v1.0", is_active=True)
    db_session.add_all([sbc, train, model])
    db_session.commit()

    now = utc_now()
    pred = ETAPrediction(
        model_version_id=model.id,
        train_id=train.id,
        target_station_id=sbc.id,
        prediction_generated_at=now,
        scheduled_eta=now + timedelta(minutes=10),
        predicted_eta=now + timedelta(minutes=15),
        predicted_delay_minutes=5.0,
        confidence_score=0.88,
        source_type=DataSourceType.SIMULATED
    )
    db_session.add(pred)
    db_session.commit()

    assert pred.id is not None
    assert pred.source_type == DataSourceType.SIMULATED
    assert pred.confidence_score == 0.88