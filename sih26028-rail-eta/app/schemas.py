from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel

class RTISTelemetry(BaseModel):
    loco_id: str
    train_number: str
    latitude: float
    longitude: float
    speed_kmh: float
    heading: float
    timestamp: datetime
    signal_aspect: Optional[str] = "GREEN"

class StationForecast(BaseModel):
    station: str
    dynamic_eta: str
    predicted_delay_min: float
    cascade_risk: float

class TrainStatusResponse(BaseModel):
    train_number: str
    current_block: str
    telemetry: dict
    forecasts: List[StationForecast]