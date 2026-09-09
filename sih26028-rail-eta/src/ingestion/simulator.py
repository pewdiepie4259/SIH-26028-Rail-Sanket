import asyncio
from datetime import datetime, timezone, timedelta
from typing import AsyncGenerator, List
from src.ingestion.base import BaseIngestionSource
from src.schemas.telemetry import NormalizedTrainObservation
from src.models.enums import DataSourceType, TrainEventType


class SyntheticLiveSimulator(BaseIngestionSource):
    """
    Simulates train progression across the Bengaluru corridor with realistic
    dwell variances and headway holds for offline demonstration and testing.
    """

    def __init__(
        self,
        train_number: str = "20661",
        initial_delay: float = 2.0,
        time_step_seconds: float = 0.5,
        stations_sequence: List[str] = None,
    ):
        self.train_number = train_number
        self.current_delay = initial_delay
        self.time_step_seconds = time_step_seconds
        self.stations_sequence = stations_sequence or ["SBC", "BNC", "BYPL", "KJM"]

    async def stream_observations(self) -> AsyncGenerator[NormalizedTrainObservation, None]:
        sim_time = datetime.now(timezone.utc)
        batch_id = f"SIM-{int(sim_time.timestamp())}"

        for idx, station in enumerate(self.stations_sequence):
            # Arrival Event (not applicable for origin station SBC)
            if idx > 0:
                sim_time += timedelta(minutes=6)
                # Simulate signal congestion delay growth
                self.current_delay += 1.5
                yield NormalizedTrainObservation(
                    train_number=self.train_number,
                    station_code=station,
                    event_type=TrainEventType.ARRIVAL,
                    actual_event_timestamp=sim_time,
                    delay_minutes=round(self.current_delay, 1),
                    platform_number=(idx % 3) + 1,
                    source_type=DataSourceType.SIMULATED,
                    batch_run_id=batch_id,
                    speed_kmh=42.0,
                    signal_status="YELLOW" if self.current_delay > 5 else "GREEN",
                )
                await asyncio.sleep(self.time_step_seconds)

            # Departure Event
            sim_time += timedelta(minutes=2)
            yield NormalizedTrainObservation(
                train_number=self.train_number,
                station_code=station,
                event_type=TrainEventType.DEPARTURE,
                actual_event_timestamp=sim_time,
                delay_minutes=round(self.current_delay, 1),
                platform_number=(idx % 3) + 1,
                source_type=DataSourceType.SIMULATED,
                batch_run_id=batch_id,
                speed_kmh=0.0,
                signal_status="GREEN",
            )
            await asyncio.sleep(self.time_step_seconds)