import logging
from sqlalchemy.orm import Session
from src.models import Train, Station, LiveTrainEvent
from src.schemas.telemetry import NormalizedTrainObservation

logger = logging.getLogger(__name__)


class IngestionPipeline:
    def __init__(self, db_session: Session):
        self.db = db_session

    def process_observation(self, obs: NormalizedTrainObservation) -> LiveTrainEvent:
        """
        Validates entity foreign keys, persists event to PostgreSQL,
        and returns the SQLAlchemy instance for downstream workers.
        """
        train = self.db.query(Train).filter_by(train_number=obs.train_number).first()
        if not train:
            raise ValueError(f"Unknown train_number: '{obs.train_number}'. Register train first.")

        station = self.db.query(Station).filter_by(station_code=obs.station_code).first()
        if not station:
            raise ValueError(f"Unknown station_code: '{obs.station_code}'. Register station first.")

        event = LiveTrainEvent(
            train_id=train.id,
            station_id=station.id,
            event_type=obs.event_type,
            actual_event_timestamp=obs.actual_event_timestamp,
            delay_minutes=obs.delay_minutes,
            platform_number=obs.platform_number,
            source_type=obs.source_type,
            batch_run_id=obs.batch_run_id,
        )

        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        
        logger.info(
            f"[{obs.source_type.value}] Ingested event {obs.event_type.value} for Train {obs.train_number} "
            f"at {obs.station_code} | Delay: {obs.delay_minutes}m"
        )
        return event