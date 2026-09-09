from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, 
    Enum, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from src.database import Base
from src.models.base import TimestampMixin
from src.models.enums import DataSourceType, TrainEventType, StationEventType


class LiveTrainEvent(Base, TimestampMixin):
    __tablename__ = "live_train_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("stations.id", ondelete="RESTRICT"), nullable=False, index=True)
    event_type = Column(Enum(TrainEventType), nullable=False)
    actual_event_timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    delay_minutes = Column(Float, nullable=False, default=0.0)
    platform_number = Column(Integer, nullable=True)
    source_type = Column(Enum(DataSourceType), default=DataSourceType.LIVE, nullable=False)
    batch_run_id = Column(String(50), nullable=True, index=True)

    train = relationship("Train", back_populates="live_events")
    station = relationship("Station")

    __table_args__ = (
        Index("ix_live_train_events_tracker", "train_id", "station_id", "actual_event_timestamp"),
    )


class StationEvent(Base, TimestampMixin):
    __tablename__ = "station_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(Integer, ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(Enum(StationEventType), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False, index=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    impact_severity = Column(Float, nullable=False, default=1.0)  # 1.0 (Normal) to 5.0 (Severe Gridlock)
    description = Column(String(255), nullable=True)
    source_type = Column(Enum(DataSourceType), default=DataSourceType.LIVE, nullable=False)

    station = relationship("Station")

    __table_args__ = (
        Index("ix_station_events_active", "station_id", "start_time", "end_time"),
    )


class WeatherObservation(Base, TimestampMixin):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(Integer, ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    observation_timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    temperature_celsius = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=False, default=0.0)
    visibility_meters = Column(Float, nullable=True)
    weather_condition = Column(String(50), default="CLEAR", nullable=False)
    source_type = Column(Enum(DataSourceType), default=DataSourceType.LIVE, nullable=False)

    station = relationship("Station")

    __table_args__ = (
        Index("ix_weather_station_time", "station_id", "observation_timestamp"),
    )