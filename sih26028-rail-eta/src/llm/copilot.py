import time
from typing import Dict, Any
from sqlalchemy.orm import Session
from src.models import ETAPrediction, LLMExplanation, Train, Station
from src.ml.propagation import DelayPropagationEngine
from src.llm.provider import get_llm_provider


class ControllerCopilotService:
    def __init__(self, db: Session):
        self.db = db
        self.provider = get_llm_provider()
        self.prop_engine = DelayPropagationEngine(db)

    async def explain_prediction(self, eta_prediction_id: int) -> Dict[str, Any]:
        pred = self.db.query(ETAPrediction).filter_by(id=eta_prediction_id).first()
        if not pred:
            raise ValueError(f"ETAPrediction ID {eta_prediction_id} not found.")

        train = self.db.query(Train).filter_by(id=pred.train_id).first()
        station = self.db.query(Station).filter_by(id=pred.target_station_id).first()

        # Run propagation & conflict analysis for context
        propagation_analysis = self.prop_engine.simulate_propagation(pred)

        context_payload = {
            "train_number": train.train_number,
            "train_name": train.train_name,
            "train_type": train.train_type,
            "priority_level": train.priority_level,
            "target_station": station.station_code,
            "scheduled_eta": pred.scheduled_eta.isoformat(),
            "predicted_eta": pred.predicted_eta.isoformat(),
            "predicted_delay_minutes": pred.predicted_delay_minutes,
            "confidence_score": pred.confidence_score,
            "features": pred.features_snapshot,
            "downstream_projections": [p.model_dump(mode="json") for p in propagation_analysis.projections],
            "conflicts": [c.model_dump(mode="json") for c in propagation_analysis.detected_conflicts]
        }

        start_time = time.time()
        result = await self.provider.generate_explanation(context_payload)
        latency_ms = int((time.time() - start_time) * 1000)

        explanation_record = LLMExplanation(
            eta_prediction_id=pred.id,
            provider=result.get("provider", "UNKNOWN"),
            prompt_template_version="v1.0.0-controller",
            structured_input_payload=context_payload,
            natural_language_explanation=result.get("explanation", ""),
            actionable_dispatch_recommendation=result.get("recommendation", ""),
            generation_latency_ms=latency_ms
        )
        self.db.add(explanation_record)
        self.db.commit()
        self.db.refresh(explanation_record)

        return {
            "eta_prediction_id": pred.id,
            "train_number": train.train_number,
            "explanation": explanation_record.natural_language_explanation,
            "recommendation": explanation_record.actionable_dispatch_recommendation,
            "provider": explanation_record.provider,
            "latency_ms": latency_ms,
            "raw_context": context_payload
        }