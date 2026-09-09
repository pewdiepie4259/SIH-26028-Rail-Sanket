from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Enum, Index
from sqlalchemy.orm import relationship
from src.database import Base
from src.models.base import TimestampMixin
from src.models.enums import DataSourceType


class HistoricalDelayObservation(Base, TimestampMixin):
    __tablename__ = "historical_delay_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False, index=True)
    route_id = Column(Integer, ForeignKey("train_routes.id", ondelete="CASCADE"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("stations.id", ondelete="RESTRICT"), nullable=False, index=True)
    observation_date = Column(DateTime(timezone=True), nullable=False, index=True)
    scheduled_arrival = Column(DateTime(timezone=True), nullable=True)
    actual_arrival = Column(DateTime(timezone=True), nullable=True)
    arrival_delay_minutes = Column(Float, nullable=False, default=0.0)
    scheduled_departure = Column(DateTime(timezone=True), nullable=True)
    actual_departure = Column(DateTime(timezone=True), nullable=True)
    departure_delay_minutes = Column(Float, nullable=False, default=0.0)
    source_type = Column(Enum(DataSourceType), default=DataSourceType.REPLAY, nullable=False)

    train = relationship("Train")
    route = relationship("TrainRoute")
    station = relationship("Station")

    __table_args__ = (
        Index("ix_hist_delays_train_station", "train_id", "station_id", "observation_date"),
    )