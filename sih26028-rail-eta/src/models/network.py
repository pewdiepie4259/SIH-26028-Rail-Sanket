from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, Time,
    UniqueConstraint, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from src.database import Base
from src.models.base import TimestampMixin


class Station(Base, TimestampMixin):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_code = Column(String(10), unique=True, nullable=False, index=True)
    station_name = Column(String(100), nullable=False)
    division = Column(String(20), default="SBC", nullable=False)
    zone = Column(String(10), default="SWR", nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    total_platforms = Column(Integer, nullable=False, default=1)
    is_junction = Column(Boolean, default=False, nullable=False)
    is_terminal = Column(Boolean, default=False, nullable=False)

    scheduled_stops = relationship("ScheduledStop", back_populates="station")
    outbound_sections = relationship("RouteSection", foreign_keys="RouteSection.from_station_id", back_populates="from_station")
    inbound_sections = relationship("RouteSection", foreign_keys="RouteSection.to_station_id", back_populates="to_station")


class Train(Base, TimestampMixin):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, autoincrement=True)
    train_number = Column(String(10), unique=True, nullable=False, index=True)
    train_name = Column(String(120), nullable=False)
    train_type = Column(String(40), nullable=False)  # VANDE_BHARAT, SUPERFAST, EXPRESS, PASSENGER, SUBURBAN
    priority_level = Column(Integer, nullable=False, default=3)  # 1 (Highest) to 5 (Lowest)
    origin_station_code = Column(String(10), nullable=False)
    destination_station_code = Column(String(10), nullable=False)

    routes = relationship("TrainRoute", back_populates="train")
    live_events = relationship("LiveTrainEvent", back_populates="train")


class TrainRoute(Base, TimestampMixin):
    __tablename__ = "train_routes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False, index=True)
    route_code = Column(String(50), nullable=False)  # e.g., "SBC-MAS-UP", "MAS-SBC-DOWN"
    direction = Column(String(10), nullable=False)    # UP, DOWN
    is_active = Column(Boolean, default=True, nullable=False)

    train = relationship("Train", back_populates="routes")
    scheduled_stops = relationship("ScheduledStop", back_populates="route", order_by="ScheduledStop.stop_sequence")
    sections = relationship("RouteSection", back_populates="route", order_by="RouteSection.section_sequence")

    __table_args__ = (
        UniqueConstraint("train_id", "route_code", name="uq_train_route_code"),
    )


class RouteSection(Base, TimestampMixin):
    __tablename__ = "route_sections"

    id = Column(Integer, primary_key=True, autoincrement=True)
    route_id = Column(Integer, ForeignKey("train_routes.id", ondelete="CASCADE"), nullable=False, index=True)
    from_station_id = Column(Integer, ForeignKey("stations.id", ondelete="RESTRICT"), nullable=False)
    to_station_id = Column(Integer, ForeignKey("stations.id", ondelete="RESTRICT"), nullable=False)
    section_sequence = Column(Integer, nullable=False)
    distance_km = Column(Float, nullable=False)
    max_sectional_speed_kmh = Column(Float, nullable=False, default=110.0)
    nominal_traversal_minutes = Column(Float, nullable=False)
    is_bidirectional = Column(Boolean, default=False, nullable=False)

    route = relationship("TrainRoute", back_populates="sections")
    from_station = relationship("Station", foreign_keys=[from_station_id], back_populates="outbound_sections")
    to_station = relationship("Station", foreign_keys=[to_station_id], back_populates="inbound_sections")

    __table_args__ = (
        UniqueConstraint("route_id", "section_sequence", name="uq_route_section_seq"),
        CheckConstraint("from_station_id != to_station_id", name="ck_route_section_distinct_stations"),
        Index("ix_route_sections_stations", "from_station_id", "to_station_id"),
    )


class ScheduledStop(Base, TimestampMixin):
    __tablename__ = "scheduled_stops"

    id = Column(Integer, primary_key=True, autoincrement=True)
    route_id = Column(Integer, ForeignKey("train_routes.id", ondelete="CASCADE"), nullable=False, index=True)
    station_id = Column(Integer, ForeignKey("stations.id", ondelete="RESTRICT"), nullable=False, index=True)
    stop_sequence = Column(Integer, nullable=False)
    scheduled_arrival_time = Column(Time, nullable=True)     # None if origin station
    scheduled_departure_time = Column(Time, nullable=True)   # None if terminus
    scheduled_dwell_minutes = Column(Integer, nullable=False, default=2)
    day_offset = Column(Integer, nullable=False, default=0)   # 0 = Start Day, 1 = Day+1

    route = relationship("TrainRoute", back_populates="scheduled_stops")
    station = relationship("Station", back_populates="scheduled_stops")

    __table_args__ = (
        UniqueConstraint("route_id", "stop_sequence", name="uq_route_stop_sequence"),
        UniqueConstraint("route_id", "station_id", name="uq_route_station"),
        Index("ix_scheduled_stops_lookup", "route_id", "station_id", "stop_sequence"),
    )