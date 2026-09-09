import pytest
from datetime import datetime, timezone
from src.models import Station, Train, LiveTrainEvent, DataSourceType, TrainEventType
from src.schemas.telemetry import NormalizedTrainObservation
from src.ingestion.pipeline import IngestionPipeline
from src.ingestion.simulator import SyntheticLiveSimulator


def test_ingestion_pipeline_persists_event(db_session):
    station = Station(
        station_code="SBC",
        station_name="Bangalore City",
        division="SBC",
        zone="SWR",
        latitude=12.9781,
        longitude=77.5694,
    )
    train = Train(
        train_number="20661",
        train_name="Vande Bharat",
        train_type="VANDE_BHARAT",
        origin_station_code="SBC",
        destination_station_code="DWR",
    )
    db_session.add_all([station, train])
    db_session.commit()

    pipeline = IngestionPipeline(db_session)
    obs = NormalizedTrainObservation(
        train_number="20661",
        station_code="SBC",
        event_type=TrainEventType.DEPARTURE,
        actual_event_timestamp=datetime.now(timezone.utc),
        delay_minutes=3.5,
        platform_number=1,
        source_type=DataSourceType.SIMULATED,
        batch_run_id="UNIT_TEST_BATCH_01",
    )

    event = pipeline.process_observation(obs)
    assert event.id is not None
    assert event.delay_minutes == 3.5
    assert event.source_type == DataSourceType.SIMULATED

    persisted = db_session.query(LiveTrainEvent).filter_by(batch_run_id="UNIT_TEST_BATCH_01").first()
    assert persisted is not None
    assert persisted.train_id == train.id


def test_ingestion_rejects_unknown_train(db_session):
    pipeline = IngestionPipeline(db_session)
    obs = NormalizedTrainObservation(
        train_number="99999",
        station_code="SBC",
        event_type=TrainEventType.ARRIVAL,
        actual_event_timestamp=datetime.now(timezone.utc),
        delay_minutes=0.0,
        source_type=DataSourceType.LIVE,
    )
    with pytest.raises(ValueError, match="Unknown train_number"):
        pipeline.process_observation(obs)


@pytest.mark.asyncio
async def test_synthetic_simulator_stream():
    simulator = SyntheticLiveSimulator(
        train_number="20661",
        initial_delay=1.0,
        time_step_seconds=0.001,
        stations_sequence=["SBC", "BNC", "BYPL", "KJM"],
    )
    observations = []
    async for obs in simulator.stream_observations():
        observations.append(obs)

    # 1 origin departure + 3 station arrivals + 3 station departures = 7 events
    assert len(observations) == 7
    assert observations[0].station_code == "SBC"
    assert observations[0].event_type == TrainEventType.DEPARTURE
    assert observations[-1].station_code == "KJM"
    assert observations[-1].delay_minutes > 1.0
    assert all(o.source_type == DataSourceType.SIMULATED for o in observations)