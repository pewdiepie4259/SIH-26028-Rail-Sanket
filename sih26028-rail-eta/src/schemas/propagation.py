from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class StationDelayProjection(BaseModel):
    station_id: int
    station_code: str
    hop_order: int
    scheduled_arrival: Optional[datetime]
    projected_arrival: datetime
    propagated_delay_minutes: float
    confidence_interval_low: float
    confidence_interval_high: float
    conflict_risk_score: float

    model_config = ConfigDict(from_attributes=True)


class ConflictDetail(BaseModel):
    conflict_type: str = Field(..., description="PLATFORM_HEADWAY or SECTION_BLOCK")
    station_code: str
    conflicting_train_number: str
    affected_train_number: str
    scheduled_conflict_time: datetime
    projected_overlap_minutes: float
    severity_score: float = Field(..., description="0.0 to 1.0 (1.0 = direct dead-lock risk)")
    recommended_action: str

    model_config = ConfigDict(from_attributes=True)


class PropagationAnalysisResult(BaseModel):
    primary_train_number: str
    origin_delay_minutes: float
    projections: List[StationDelayProjection]
    detected_conflicts: List[ConflictDetail]