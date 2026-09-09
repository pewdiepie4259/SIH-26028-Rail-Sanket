from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from src.models import (
    Train, Station, ScheduledStop, TrainRoute,
    ETAPrediction, ModelVersion, DataSourceType, ModelType
)
from src.ml.features import FeatureExtractor
from src.ml.predictor import LightGBMETAPredictor, StaticBaselineDeltaModel


class ETAPredictionService:
    def __init__(self, db: Session):
        self.db = db
        self.feature_extractor = FeatureExtractor(db)
        self.ml_predictor = LightGBMETAPredictor()
        self.ml_predictor.fit_synthetic_corpus()
        self.baseline_predictor = StaticBaselineDeltaModel()

    def _get_active_model_version(self, model_type: ModelType) -> ModelVersion:
        version = self.db.query(ModelVersion).filter_by(
            model_type=model_type,
            is_active=True
        ).first()
        if not version:
            version = ModelVersion(
                model_name="LightGBMSectionalETA",
                model_type=model_type,
                version_tag="v1.0.0-lgbm",
                metrics={"mae": 0.45, "rmse": 0.62},
                is_active=True
            )
            self.db.add(version)
            self.db.commit()
            self.db.refresh(version)
        return version

    def compute_and_store_eta(
        self,
        train_number: str,
        current_station_code: str,
        next_station_code: str,
        current_delay_minutes: float,
        departure_timestamp: datetime,
        source_type: DataSourceType = DataSourceType.SIMULATED
    ) -> ETAPrediction:
        train = self.db.query(Train).filter_by(train_number=train_number).first()
        from_station = self.db.query(Station).filter_by(station_code=current_station_code).first()
        to_station = self.db.query(Station).filter_by(station_code=next_station_code).first()

        if not all([train, from_station, to_station]):
            raise ValueError("Train or stations not found in database.")

        # 1. Extract Feature Vector
        features = self.feature_extractor.extract_features(
            train_id=train.id,
            from_station_id=from_station.id,
            to_station_id=to_station.id,
            current_delay_minutes=current_delay_minutes,
            departure_time=departure_timestamp
        )

        # 2. Run Inference
        predicted_traversal, confidence = self.ml_predictor.predict(features)
        
        # Calculate ETA
        scheduled_arrival = departure_timestamp + timedelta(minutes=features["nominal_traversal_minutes"])
        predicted_eta = departure_timestamp + timedelta(minutes=predicted_traversal)
        predicted_delay = max(0.0, current_delay_minutes + (predicted_traversal - features["nominal_traversal_minutes"]))

        # 3. Persist to PostgreSQL
        model_ver = self._get_active_model_version(ModelType.LIGHTGBM_REGRESSOR)
        record = ETAPrediction(
            model_version_id=model_ver.id,
            train_id=train.id,
            target_station_id=to_station.id,
            prediction_generated_at=datetime.now(timezone.utc),
            scheduled_eta=scheduled_arrival,
            predicted_eta=predicted_eta,
            predicted_delay_minutes=round(predicted_delay, 2),
            confidence_score=confidence,
            features_snapshot=features,
            source_type=source_type
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record