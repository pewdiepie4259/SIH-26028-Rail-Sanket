from datetime import datetime
from typing import Dict, Any
import pandas as pd
from sqlalchemy.orm import Session
from src.models import Train, RouteSection, ScheduledStop, StationEvent


class FeatureExtractor:
    def __init__(self, db_session: Session):
        self.db = db_session

    def extract_features(
        self,
        train_id: int,
        from_station_id: int,
        to_station_id: int,
        current_delay_minutes: float,
        departure_time: datetime
    ) -> Dict[str, Any]:
        """
        Builds a tabular feature vector to forecast transit duration 
        and incremental delay between adjacent or downstream stations.
        """
        train = self.db.query(Train).filter_by(id=train_id).first()
        if not train:
            raise ValueError(f"Train ID {train_id} not found.")

        section = self.db.query(RouteSection).filter_by(
            from_station_id=from_station_id,
            to_station_id=to_station_id
        ).first()

        # Fallback defaults if exact direct section isn't indexed
        distance_km = section.distance_km if section else 5.0
        max_speed = section.max_sectional_speed_kmh if section else 80.0
        nominal_traversal = section.nominal_traversal_minutes if section else (distance_km / (max_speed / 60))

        # Check for active congestion/halts at the target station
        active_events = self.db.query(StationEvent).filter(
            StationEvent.station_id == to_station_id,
            StationEvent.start_time <= departure_time,
            (StationEvent.end_time == None) | (StationEvent.end_time >= departure_time)
        ).all()
        target_station_congestion = sum(e.impact_severity for e in active_events) if active_events else 0.0

        features = {
            "current_delay_minutes": float(current_delay_minutes),
            "distance_km": float(distance_km),
            "max_sectional_speed_kmh": float(max_speed),
            "nominal_traversal_minutes": float(nominal_traversal),
            "priority_level": int(train.priority_level),
            "hour_of_day": int(departure_time.hour),
            "day_of_week": int(departure_time.weekday()),
            "is_weekend": 1 if departure_time.weekday() in [5, 6] else 0,
            "target_station_congestion": float(target_station_congestion)
        }
        return features

    def to_dataframe(self, feature_dict: Dict[str, Any]) -> pd.DataFrame:
        return pd.DataFrame([feature_dict])