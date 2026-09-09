from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from src.models.enums import DataSourceType, TrainEventType


class NormalizedTrainObservation(BaseModel):
    """Standardized schema consumed by database and downstream ETA engine."""
    train_number: str = Field(..., description="Unique train number, e.g., '20661'")
    station_code: str = Field(..., description="Target station code, e.g., 'SBC'")
    event_type: TrainEventType = Field(..., description="ARRIVAL, DEPARTURE, PASS_THROUGH, HOLD")
    actual_event_timestamp: datetime = Field(..., description="Aware UTC event timestamp")
    delay_minutes: float = Field(0.0, description="Delay relative to schedule in minutes")
    platform_number: Optional[int] = Field(None, description="Assigned or detected platform")
    source_type: DataSourceType = Field(..., description="LIVE, REPLAY, or SIMULATED")
    batch_run_id: Optional[str] = Field(None, description="Run or batch session identifier")
    speed_kmh: Optional[float] = Field(None, description="Speed at observation time")
    signal_status: Optional[str] = Field(None, description="GREEN, DOUBLE_YELLOW, YELLOW, RED")

    model_config = ConfigDict(from_attributes=True)


class StationCongestionObservation(BaseModel):
    station_code: str
    occupied_platforms: int
    total_platforms: int
    waiting_trains_count: int
    source_type: DataSourceType
    recorded_at: datetime

    model_config = ConfigDict(from_attributes=True)