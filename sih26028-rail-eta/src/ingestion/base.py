from abc import ABC, abstractmethod
from typing import AsyncGenerator
from src.schemas.telemetry import NormalizedTrainObservation


class BaseIngestionSource(ABC):
    """Abstract Base Class for all ingestion sources (API, Replay, Simulator)."""

    @abstractmethod
    async def stream_observations(self) -> AsyncGenerator[NormalizedTrainObservation, None]:
        """Stream normalized train observations asynchronously."""
        pass