from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
import os
import numpy as np
import pandas as pd
import lightgbm as lgb
from sklearn.metrics import mean_absolute_error, root_mean_squared_error


class BaseETAModel(ABC):
    @abstractmethod
    def predict(self, features: Dict[str, Any]) -> Tuple[float, float]:
        """Returns (predicted_traversal_minutes, confidence_score [0.0 - 1.0])"""
        pass


class StaticBaselineDeltaModel(BaseETAModel):
    """
    Standard railway baseline: Scheduled travel time + current running delay.
    Acts as the benchmark against which ML is evaluated.
    """
    def predict(self, features: Dict[str, Any]) -> Tuple[float, float]:
        nominal = features.get("nominal_traversal_minutes", 10.0)
        # Baseline assumes no delay recovery or acceleration
        predicted_traversal = nominal
        confidence = 0.70  # Static baseline confidence
        return round(predicted_traversal, 2), confidence


class LightGBMETAPredictor(BaseETAModel):
    """
    GBDT model trained to estimate traversal time and recovery/loss dynamics.
    """
    def __init__(self, model: lgb.LGBMRegressor = None):
        self.model = model
        self.feature_order = [
            "current_delay_minutes",
            "distance_km",
            "max_sectional_speed_kmh",
            "nominal_traversal_minutes",
            "priority_level",
            "hour_of_day",
            "day_of_week",
            "is_weekend",
            "target_station_congestion"
        ]

    def fit_synthetic_corpus(self) -> Dict[str, float]:
        """
        Bootstraps initial weights using realistic railway kinetics 
        (e.g., high priority recovers faster; peak hours add dwell friction).
        """
        np.random.seed(42)
        n_samples = 1200

        current_delay = np.random.uniform(0, 45, n_samples)
        distance = np.random.uniform(3, 25, n_samples)
        max_speed = np.random.choice([60.0, 80.0, 100.0, 110.0], n_samples)
        nominal = distance / (max_speed / 60.0)
        priority = np.random.choice([1, 2, 3, 4], n_samples, p=[0.1, 0.4, 0.4, 0.1])
        hour = np.random.randint(0, 24, n_samples)
        dow = np.random.randint(0, 7, n_samples)
        weekend = (dow >= 5).astype(int)
        congestion = np.random.choice([0.0, 1.0, 2.5], n_samples, p=[0.7, 0.2, 0.1])

        # Realistic physics: peak hour adds 15-30% traversal time, priority 1 sheds 10%
        peak_factor = np.where((hour >= 8) & (hour <= 11) | (hour >= 17) & (hour <= 20), 1.2, 1.0)
        priority_recovery = np.where(priority == 1, 0.92, 1.05)
        
        target_traversal = (nominal * peak_factor * priority_recovery) + (congestion * 1.5) + np.random.normal(0, 0.5, n_samples)
        target_traversal = np.maximum(target_traversal, nominal * 0.85)

        X = pd.DataFrame({
            "current_delay_minutes": current_delay,
            "distance_km": distance,
            "max_sectional_speed_kmh": max_speed,
            "nominal_traversal_minutes": nominal,
            "priority_level": priority,
            "hour_of_day": hour,
            "day_of_week": dow,
            "is_weekend": weekend,
            "target_station_congestion": congestion
        })
        y = target_traversal

        split_idx = int(n_samples * 0.8)
        X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
        y_train, y_test = y[:split_idx], y[split_idx:]

        self.model = lgb.LGBMRegressor(
            n_estimators=80,
            learning_rate=0.08,
            num_leaves=15,
            random_state=42,
            verbosity=-1
        )
        self.model.fit(X_train, y_train)

        preds = self.model.predict(X_test)
        metrics = {
            "mae": float(round(mean_absolute_error(y_test, preds), 3)),
            "rmse": float(round(root_mean_squared_error(y_test, preds), 3))
        }
        return metrics

    def predict(self, features: Dict[str, Any]) -> Tuple[float, float]:
        if self.model is None:
            raise RuntimeError("Model has not been fitted or loaded.")
        
        df = pd.DataFrame([features])[self.feature_order]
        predicted_traversal = float(self.model.predict(df)[0])
        
        # Calculate confidence metric: higher uncertainty during congestion or long delay
        uncertainty = (features["current_delay_minutes"] * 0.005) + (features["target_station_congestion"] * 0.08)
        confidence = float(np.clip(0.95 - uncertainty, 0.45, 0.98))

        return round(predicted_traversal, 2), round(confidence, 2)