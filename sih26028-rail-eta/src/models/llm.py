from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON, Text, Index
from sqlalchemy.orm import relationship
from src.database import Base
from src.models.base import TimestampMixin


class LLMExplanation(Base, TimestampMixin):
    __tablename__ = "llm_explanations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    eta_prediction_id = Column(Integer, ForeignKey("eta_predictions.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(30), nullable=False)  # GEMINI, GROQ, OPENAI
    prompt_template_version = Column(String(30), nullable=False)
    structured_input_payload = Column(JSON, nullable=False)
    natural_language_explanation = Column(Text, nullable=False)
    actionable_dispatch_recommendation = Column(Text, nullable=True)
    generation_latency_ms = Column(Integer, nullable=True)

    eta_prediction = relationship("ETAPrediction", back_populates="llm_explanations")

    __table_args__ = (
        Index("ix_llm_explanations_pred", "eta_prediction_id", "created_at"),
    )