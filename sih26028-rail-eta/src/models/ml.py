from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, 
    Enum, Index, JSON, Boolean
)
from sqlalchemy.orm import relationship
from src.database import Base
from src.models.base import TimestampMixin
from src.models.enums import DataSourceType, ModelType


class ModelVersion(Base, TimestampMixin):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(50), nullable=False)
    model_type = Column(Enum(ModelType), nullable=False)
    version_tag = Column(String(30), unique=True, nullable=False)
    artifact_path = Column(String(255), nullable=True)
    metrics = Column(JSON, nullable=True)  # Store {"mae": 2.1, "rmse": 3.4}
    is_active = Column(Boolean, default=False, nullable=False)

    eta_predictions = relationship("ETAPrediction", back_populates="model_version")


class ETAPrediction(Base, TimestampMixin):
    __tablename__ = "eta_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id", ondelete="RESTRICT"), nullable=False, index=True)
    train_id = Column(Integer, ForeignKey("trains.id", ondelete="CASCADE"), nullable=False, index=True)
    target_station_id = Column(Integer, ForeignKey("stations.id", ondelete="RESTRICT"), nullable=False, index=True)
    prediction_generated_at = Column(DateTime(timezone=True), nullable=False, index=True)
    scheduled_eta = Column(DateTime(timezone=True), nullable=False)
    predicted_eta = Column(DateTime(timezone=True), nullable=False)
    predicted_delay_minutes = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.00 to 1.00
    features_snapshot = Column(JSON, nullable=True)
    source_type = Column(Enum(DataSourceType), default=DataSourceType.LIVE, nullable=False)

    model_version = relationship("ModelVersion", back_populates="eta_predictions")
    train = relationship("Train")
    target_station = relationship("Station")
    propagation_records = relationship("DelayPropagationPrediction", back_populates="eta_prediction")
    llm_explanations = relationship("LLMExplanation", back_populates="eta_prediction")

    __table_args__ = (
        Index("ix_eta_preds_train_target", "train_id", "target_station_id", "prediction_generated_at"),
    )


class DelayPropagationPrediction(Base, TimestampMixin):
    __tablename__ = "delay_propagation_predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    eta_prediction_id = Column(Integer, ForeignKey("eta_predictions.id", ondelete="CASCADE"), nullable=False, index=True)
    downstream_station_id = Column(Integer, ForeignKey("stations.id", ondelete="RESTRICT"), nullable=False)
    hop_order = Column(Integer, nullable=False)  # 1st downstream stop, 2nd, etc.
    propagated_delay_minutes = Column(Float, nullable=False)
    confidence_interval_low = Column(Float, nullable=False)
    confidence_interval_high = Column(Float, nullable=False)
    conflict_risk_score = Column(Float, nullable=False, default=0.0)

    eta_prediction = relationship("ETAPrediction", back_populates="propagation_records")
    downstream_station = relationship("Station")

    __table_args__ = (
        Index("ix_delay_prop_pred_lookup", "eta_prediction_id", "hop_order"),
    )