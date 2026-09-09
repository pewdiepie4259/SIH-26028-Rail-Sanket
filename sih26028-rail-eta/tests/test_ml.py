import pytest
from datetime import datetime, timezone
from src.models import Station, Train, RouteSection, TrainRoute, ModelType, DataSourceType
from src.ml.features import FeatureExtractor
from src.ml.predictor import LightGBMETAPredictor, StaticBaselineDeltaModel
from src.ml.service import ETAPredictionService


def test_feature_extractor_returns_complete_vector(db_session):
    sbc = Station(station_code="SBC", station_name="KSR Bengaluru", division="SBC", zone="SWR", latitude=12.9, longitude=77.5)
    bnc = Station(station_code="BNC", station_name="Bengaluru Cantt", division="SBC", zone="SWR", latitude=12.9, longitude=77.6)
    train = Train(train_number="20661", train_name="Vande Bharat", train_type="VANDE_BHARAT", priority_level=1, origin_station_code="SBC", destination_station_code="DWR")
    db_session.add_all([sbc, bnc, train])
    db_session.commit()

    route = TrainRoute(train_id=train.id, route_code="SBC-BNC-TEST", direction="UP")
    db_session.add(route)
    db_session.commit()

    sec = RouteSection(
        route_id=route.id,
        from_station_id=sbc.id,
        to_station_id=bnc.id,
        section_sequence=1,
        distance_km=4.3,
        max_sectional_speed_kmh=80.0,
        nominal_traversal_minutes=7.0
    )
    db_session.add(sec)
    db_session.commit()

    extractor = FeatureExtractor(db_session)
    vector = extractor.extract_features(
        train_id=train.id,
        from_station_id=sbc.id,
        to_station_id=bnc.id,
        current_delay_minutes=3.0,
        departure_time=datetime(2026, 9, 8, 9, 0, tzinfo=timezone.utc)
    )

    assert vector["current_delay_minutes"] == 3.0
    assert vector["nominal_traversal_minutes"] == 7.0
    assert vector["priority_level"] == 1
    assert vector["hour_of_day"] == 9


def test_lightgbm_predictor_fit_and_inference():
    predictor = LightGBMETAPredictor()
    metrics = predictor.fit_synthetic_corpus()

    assert "mae" in metrics
    assert metrics["mae"] < 2.0  # MAE must be realistic (under 2 minutes)

    features = {
        "current_delay_minutes": 5.0,
        "distance_km": 5.0,
        "max_sectional_speed_kmh": 80.0,
        "nominal_traversal_minutes": 6.0,
        "priority_level": 2,
        "hour_of_day": 8,
        "day_of_week": 2,
        "is_weekend": 0,
        "target_station_congestion": 0.0
    }
    pred_traversal, confidence = predictor.predict(features)
    assert pred_traversal > 0
    assert 0.0 <= confidence <= 1.0


def test_prediction_service_end_to_end(db_session):
    sbc = Station(station_code="SBC", station_name="KSR Bengaluru", division="SBC", zone="SWR", latitude=12.9, longitude=77.5)
    bnc = Station(station_code="BNC", station_name="Bengaluru Cantt", division="SBC", zone="SWR", latitude=12.9, longitude=77.6)
    train = Train(train_number="20661", train_name="Vande Bharat", train_type="VANDE_BHARAT", priority_level=1, origin_station_code="SBC", destination_station_code="DWR")
    db_session.add_all([sbc, bnc, train])
    db_session.commit()

    service = ETAPredictionService(db_session)
    pred_record = service.compute_and_store_eta(
        train_number="20661",
        current_station_code="SBC",
        next_station_code="BNC",
        current_delay_minutes=4.0,
        departure_timestamp=datetime.now(timezone.utc),
        source_type=DataSourceType.SIMULATED
    )

    assert pred_record.id is not None
    assert pred_record.predicted_delay_minutes >= 0.0
    assert pred_record.confidence_score > 0.0