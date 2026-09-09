import sys
import os
from datetime import time, timedelta

sys.path.insert(0, os.path.abspath("."))

from src.database import SessionLocal
from src.models import (
    Station, Train, TrainRoute, RouteSection, ScheduledStop,
    ModelVersion, ETAPrediction, DelayPropagationPrediction,
    LiveTrainEvent, DataSourceType, TrainEventType, ModelType
)
from src.utils.time import utc_now


def run_dev_seed():
    db = SessionLocal()
    print("Seeding development topology for Bengaluru metropolitan rail network...")
    
    try:
        # Check if already seeded
        if db.query(Station).filter_by(station_code="SBC").first():
            print("Database already contains seed data. Skipping.")
            return

        # 1. Bengaluru Stations
        stations = [
            Station(station_code="SBC", station_name="KSR Bengaluru City", division="SBC", zone="SWR", latitude=12.9781, longitude=77.5694, total_platforms=10, is_junction=True, is_terminal=True),
            Station(station_code="BNC", station_name="Bengaluru Cantt", division="SBC", zone="SWR", latitude=12.9934, longitude=77.5982, total_platforms=3, is_junction=False, is_terminal=False),
            Station(station_code="BYPL", station_name="Baiyyappanahalli", division="SBC", zone="SWR", latitude=12.9928, longitude=77.6525, total_platforms=2, is_junction=True, is_terminal=False),
            Station(station_code="KJM", station_name="Krishnarajapuram", division="SBC", zone="SWR", latitude=13.0012, longitude=77.6766, total_platforms=4, is_junction=True, is_terminal=False),
            Station(station_code="YPR", station_name="Yesvantpur Junction", division="SBC", zone="SWR", latitude=13.0238, longitude=77.5501, total_platforms=6, is_junction=True, is_terminal=True),
            Station(station_code="SMVB", station_name="Sir M. Visvesvaraya Terminal", division="SBC", zone="SWR", latitude=13.0033, longitude=77.6542, total_platforms=7, is_junction=False, is_terminal=True),
        ]
        db.add_all(stations)
        db.commit()

        sbc = db.query(Station).filter_by(station_code="SBC").first()
        bnc = db.query(Station).filter_by(station_code="BNC").first()
        bypl = db.query(Station).filter_by(station_code="BYPL").first()
        kjm = db.query(Station).filter_by(station_code="KJM").first()

        # 2. Test Train: 20661 (SBC - DWR Vande Bharat Express)
        train = Train(
            train_number="20661",
            train_name="SBC-DWR Vande Bharat Express",
            train_type="VANDE_BHARAT",
            priority_level=1,
            origin_station_code="SBC",
            destination_station_code="DWR",
        )
        db.add(train)
        db.commit()

        # 3. Train Route
        route = TrainRoute(
            train_id=train.id,
            route_code="SBC-KJM-DEV",
            direction="UP",
            is_active=True,
        )
        db.add(route)
        db.commit()

        # 4. Route Sections (SBC -> BNC -> BYPL -> KJM)
        sections = [
            RouteSection(route_id=route.id, from_station_id=sbc.id, to_station_id=bnc.id, section_sequence=1, distance_km=4.3, max_sectional_speed_kmh=80.0, nominal_traversal_minutes=7.0),
            RouteSection(route_id=route.id, from_station_id=bnc.id, to_station_id=bypl.id, section_sequence=2, distance_km=5.9, max_sectional_speed_kmh=100.0, nominal_traversal_minutes=6.0),
            RouteSection(route_id=route.id, from_station_id=bypl.id, to_station_id=kjm.id, section_sequence=3, distance_km=3.2, max_sectional_speed_kmh=100.0, nominal_traversal_minutes=4.0),
        ]
        db.add_all(sections)

        # 5. Scheduled Stops
        stops = [
            ScheduledStop(route_id=route.id, station_id=sbc.id, stop_sequence=1, scheduled_arrival_time=None, scheduled_departure_time=time(5, 45), scheduled_dwell_minutes=0, day_offset=0),
            ScheduledStop(route_id=route.id, station_id=bnc.id, stop_sequence=2, scheduled_arrival_time=time(5, 52), scheduled_departure_time=time(5, 54), scheduled_dwell_minutes=2, day_offset=0),
            ScheduledStop(route_id=route.id, station_id=bypl.id, stop_sequence=3, scheduled_arrival_time=time(6, 0), scheduled_departure_time=time(6, 1), scheduled_dwell_minutes=1, day_offset=0),
            ScheduledStop(route_id=route.id, station_id=kjm.id, stop_sequence=4, scheduled_arrival_time=time(6, 6), scheduled_departure_time=time(6, 8), scheduled_dwell_minutes=2, day_offset=0),
        ]
        db.add_all(stops)

        # 6. Baseline Model Version
        model_v1 = ModelVersion(
            model_name="StaticBaselineDelta",
            model_type=ModelType.BASELINE_DELTA,
            version_tag="v0.1.0-dev",
            artifact_path="models/baseline_delta.py",
            metrics={"mae_minutes": 2.8, "rmse_minutes": 4.1},
            is_active=True
        )
        db.add(model_v1)
        db.commit()

        # 7. Sample Simulated Event & Prediction (Clearly marked SIMULATED)
        now = utc_now()
        sim_event = LiveTrainEvent(
            train_id=train.id,
            station_id=sbc.id,
            event_type=TrainEventType.DEPARTURE,
            actual_event_timestamp=now,
            delay_minutes=4.5,
            platform_number=8,
            source_type=DataSourceType.SIMULATED,
            batch_run_id="DEV_SEED_RUN_001"
        )
        db.add(sim_event)
        db.commit()

        pred = ETAPrediction(
            model_version_id=model_v1.id,
            train_id=train.id,
            target_station_id=bnc.id,
            prediction_generated_at=now,
            scheduled_eta=now + timedelta(minutes=7),
            predicted_eta=now + timedelta(minutes=11, seconds=30),
            predicted_delay_minutes=4.5,
            confidence_score=0.92,
            features_snapshot={"current_delay": 4.5, "weather": "CLEAR", "platform_conflict": False},
            source_type=DataSourceType.SIMULATED
        )
        db.add(pred)
        db.commit()

        prop = DelayPropagationPrediction(
            eta_prediction_id=pred.id,
            downstream_station_id=kjm.id,
            hop_order=2,
            propagated_delay_minutes=3.8,
            confidence_interval_low=2.5,
            confidence_interval_high=5.1,
            conflict_risk_score=0.15
        )
        db.add(prop)
        db.commit()

        print("[OK] Seeded 6 Bengaluru stations, 1 route, 3 sections, 4 stops, 1 model version, and 1 simulated prediction pipeline.")
    except Exception as e:
        db.rollback()
        print(f"[FAIL] Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_dev_seed()