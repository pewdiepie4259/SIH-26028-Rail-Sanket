from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from src.database import get_db
from src.models import Station, Train, ETAPrediction, DataSourceType
from src.ml.service import ETAPredictionService
from src.llm.copilot import ControllerCopilotService
from src.schemas.telemetry import NormalizedTrainObservation
from src.ingestion.pipeline import IngestionPipeline

router = APIRouter(prefix="/api/v1")


@router.get("/stations")
def get_stations(db: Session = Depends(get_db)):
    """Fetch all stations in the Bengaluru metropolitan railway network."""
    stations = db.query(Station).all()
    return [
        {
            "id": s.id,
            "station_code": s.station_code,
            "station_name": s.station_name,
            "platforms": s.total_platforms,
            "is_junction": s.is_junction,
            "is_terminal": s.is_terminal,
            "latitude": s.latitude,
            "longitude": s.longitude
        }
        for s in stations
    ]


@router.get("/trains")
def get_trains(db: Session = Depends(get_db)):
    """Fetch all registered train schedules and priority classes."""
    trains = db.query(Train).all()
    return [
        {
            "id": t.id,
            "train_number": t.train_number,
            "train_name": t.train_name,
            "train_type": t.train_type,
            "priority_level": t.priority_level,
            "origin": t.origin_station_code,
            "destination": t.destination_station_code
        }
        for t in trains
    ]


@router.post("/telemetry/ingest")
def ingest_train_event(obs: NormalizedTrainObservation, db: Session = Depends(get_db)):
    """Ingest observation from real API, replayer, or simulator into PostgreSQL."""
    pipeline = IngestionPipeline(db)
    try:
        event = pipeline.process_observation(obs)
        return {"status": "SUCCESS", "event_id": event.id, "source_type": event.source_type.value}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/predictions/calculate")
def calculate_eta(
    train_number: str = Query(..., examples=["20661"]),
    from_station: str = Query(..., examples=["SBC"]),
    to_station: str = Query(..., examples=["BNC"]),
    delay_minutes: float = Query(0.0, examples=[5.0]),
    db: Session = Depends(get_db)
):
    """Generate dynamic LightGBM ETA and persist prediction to database."""
    service = ETAPredictionService(db)
    try:
        pred = service.compute_and_store_eta(
            train_number=train_number,
            current_station_code=from_station,
            next_station_code=to_station,
            current_delay_minutes=delay_minutes,
            departure_timestamp=datetime.now(timezone.utc),
            source_type=DataSourceType.SIMULATED
        )
        return {
            "prediction_id": pred.id,
            "train_number": train_number,
            "scheduled_eta": pred.scheduled_eta.isoformat(),
            "predicted_eta": pred.predicted_eta.isoformat(),
            "predicted_delay_minutes": pred.predicted_delay_minutes,
            "confidence_score": pred.confidence_score,
            "features_snapshot": pred.features_snapshot
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/predictions/{prediction_id}/copilot-explanation")
async def get_copilot_explanation(prediction_id: int, db: Session = Depends(get_db)):
    """Orchestrates structured delay and conflict metrics into an LLM Controller summary."""
    copilot = ControllerCopilotService(db)
    try:
        explanation = await copilot.explain_prediction(prediction_id)
        return explanation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))