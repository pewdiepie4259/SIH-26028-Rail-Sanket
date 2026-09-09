import enum


class DataSourceType(str, enum.Enum):
    LIVE = "LIVE"
    REPLAY = "REPLAY"
    SIMULATED = "SIMULATED"


class TrainEventType(str, enum.Enum):
    ARRIVAL = "ARRIVAL"
    DEPARTURE = "DEPARTURE"
    PASS_THROUGH = "PASS_THROUGH"
    HOLD = "HOLD"


class StationEventType(str, enum.Enum):
    CONGESTION = "CONGESTION"
    PLATFORM_OCCUPIED = "PLATFORM_OCCUPIED"
    SIGNAL_HALT = "SIGNAL_HALT"
    MAINTENANCE = "MAINTENANCE"


class ModelType(str, enum.Enum):
    BASELINE_DELTA = "BASELINE_DELTA"
    LIGHTGBM_REGRESSOR = "LIGHTGBM_REGRESSOR"
    XGBOOST_REGRESSOR = "XGBOOST_REGRESSOR"