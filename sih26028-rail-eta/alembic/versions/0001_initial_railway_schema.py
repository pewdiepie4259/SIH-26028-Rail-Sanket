"""Initial railway schema

Revision ID: 0001_initial_railway_schema
Revises: 
Create Date: 2026-09-07 19:55:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '0001_initial_railway_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Stations
    op.create_table(
        'stations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('station_code', sa.String(length=10), nullable=False),
        sa.Column('station_name', sa.String(length=100), nullable=False),
        sa.Column('division', sa.String(length=20), nullable=False),
        sa.Column('zone', sa.String(length=10), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('total_platforms', sa.Integer(), nullable=False),
        sa.Column('is_junction', sa.Boolean(), nullable=False),
        sa.Column('is_terminal', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('station_code')
    )
    op.create_index(op.f('ix_stations_station_code'), 'stations', ['station_code'], unique=True)

    # 2. Trains
    op.create_table(
        'trains',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('train_number', sa.String(length=10), nullable=False),
        sa.Column('train_name', sa.String(length=120), nullable=False),
        sa.Column('train_type', sa.String(length=40), nullable=False),
        sa.Column('priority_level', sa.Integer(), nullable=False),
        sa.Column('origin_station_code', sa.String(length=10), nullable=False),
        sa.Column('destination_station_code', sa.String(length=10), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('train_number')
    )
    op.create_index(op.f('ix_trains_train_number'), 'trains', ['train_number'], unique=True)

    # 3. Train Routes
    op.create_table(
        'train_routes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('train_id', sa.Integer(), nullable=False),
        sa.Column('route_code', sa.String(length=50), nullable=False),
        sa.Column('direction', sa.String(length=10), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['train_id'], ['trains.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('train_id', 'route_code', name='uq_train_route_code')
    )
    op.create_index(op.f('ix_train_routes_train_id'), 'train_routes', ['train_id'], unique=False)

    # 4. Route Sections
    op.create_table(
        'route_sections',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('route_id', sa.Integer(), nullable=False),
        sa.Column('from_station_id', sa.Integer(), nullable=False),
        sa.Column('to_station_id', sa.Integer(), nullable=False),
        sa.Column('section_sequence', sa.Integer(), nullable=False),
        sa.Column('distance_km', sa.Float(), nullable=False),
        sa.Column('max_sectional_speed_kmh', sa.Float(), nullable=False),
        sa.Column('nominal_traversal_minutes', sa.Float(), nullable=False),
        sa.Column('is_bidirectional', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('from_station_id != to_station_id', name='ck_route_section_distinct_stations'),
        sa.ForeignKeyConstraint(['from_station_id'], ['stations.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['route_id'], ['train_routes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['to_station_id'], ['stations.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('route_id', 'section_sequence', name='uq_route_section_seq')
    )
    op.create_index('ix_route_sections_stations', 'route_sections', ['from_station_id', 'to_station_id'], unique=False)
    op.create_index(op.f('ix_route_sections_route_id'), 'route_sections', ['route_id'], unique=False)

    # 5. Scheduled Stops
    op.create_table(
        'scheduled_stops',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('route_id', sa.Integer(), nullable=False),
        sa.Column('station_id', sa.Integer(), nullable=False),
        sa.Column('stop_sequence', sa.Integer(), nullable=False),
        sa.Column('scheduled_arrival_time', sa.Time(), nullable=True),
        sa.Column('scheduled_departure_time', sa.Time(), nullable=True),
        sa.Column('scheduled_dwell_minutes', sa.Integer(), nullable=False),
        sa.Column('day_offset', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['route_id'], ['train_routes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['station_id'], ['stations.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('route_id', 'station_id', name='uq_route_station'),
        sa.UniqueConstraint('route_id', 'stop_sequence', name='uq_route_stop_sequence')
    )
    op.create_index('ix_scheduled_stops_lookup', 'scheduled_stops', ['route_id', 'station_id', 'stop_sequence'], unique=False)
    op.create_index(op.f('ix_scheduled_stops_route_id'), 'scheduled_stops', ['route_id'], unique=False)
    op.create_index(op.f('ix_scheduled_stops_station_id'), 'scheduled_stops', ['station_id'], unique=False)

    # 6. Live Train Events
    op.create_table(
        'live_train_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('train_id', sa.Integer(), nullable=False),
        sa.Column('station_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.Enum('ARRIVAL', 'DEPARTURE', 'PASS_THROUGH', 'HOLD', name='traineventtype'), nullable=False),
        sa.Column('actual_event_timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('delay_minutes', sa.Float(), nullable=False),
        sa.Column('platform_number', sa.Integer(), nullable=True),
        sa.Column('source_type', sa.Enum('LIVE', 'REPLAY', 'SIMULATED', name='datasourcetype'), nullable=False),
        sa.Column('batch_run_id', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['station_id'], ['stations.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['train_id'], ['trains.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_live_train_events_tracker', 'live_train_events', ['train_id', 'station_id', 'actual_event_timestamp'], unique=False)
    op.create_index(op.f('ix_live_train_events_actual_event_timestamp'), 'live_train_events', ['actual_event_timestamp'], unique=False)
    op.create_index(op.f('ix_live_train_events_batch_run_id'), 'live_train_events', ['batch_run_id'], unique=False)

    # 7. Station Events
    op.create_table(
        'station_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('station_id', sa.Integer(), nullable=False),
        sa.Column('event_type', sa.Enum('CONGESTION', 'PLATFORM_OCCUPIED', 'SIGNAL_HALT', 'MAINTENANCE', name='stationeventtype'), nullable=False),
        sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('impact_severity', sa.Float(), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('source_type', sa.Enum('LIVE', 'REPLAY', 'SIMULATED', name='datasourcetype'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['station_id'], ['stations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_station_events_active', 'station_events', ['station_id', 'start_time', 'end_time'], unique=False)

    # 8. Weather Observations
    op.create_table(
        'weather_observations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('station_id', sa.Integer(), nullable=False),
        sa.Column('observation_timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('temperature_celsius', sa.Float(), nullable=True),
        sa.Column('rainfall_mm', sa.Float(), nullable=False),
        sa.Column('visibility_meters', sa.Float(), nullable=True),
        sa.Column('weather_condition', sa.String(length=50), nullable=False),
        sa.Column('source_type', sa.Enum('LIVE', 'REPLAY', 'SIMULATED', name='datasourcetype'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['station_id'], ['stations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_weather_station_time', 'weather_observations', ['station_id', 'observation_timestamp'], unique=False)

    # 9. Historical Delay Observations
    op.create_table(
        'historical_delay_observations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('train_id', sa.Integer(), nullable=False),
        sa.Column('route_id', sa.Integer(), nullable=False),
        sa.Column('station_id', sa.Integer(), nullable=False),
        sa.Column('observation_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('scheduled_arrival', sa.DateTime(timezone=True), nullable=True),
        sa.Column('actual_arrival', sa.DateTime(timezone=True), nullable=True),
        sa.Column('arrival_delay_minutes', sa.Float(), nullable=False),
        sa.Column('scheduled_departure', sa.DateTime(timezone=True), nullable=True),
        sa.Column('actual_departure', sa.DateTime(timezone=True), nullable=True),
        sa.Column('departure_delay_minutes', sa.Float(), nullable=False),
        sa.Column('source_type', sa.Enum('LIVE', 'REPLAY', 'SIMULATED', name='datasourcetype'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['route_id'], ['train_routes.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['station_id'], ['stations.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['train_id'], ['trains.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_hist_delays_train_station', 'historical_delay_observations', ['train_id', 'station_id', 'observation_date'], unique=False)

    # 10. Model Versions
    op.create_table(
        'model_versions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('model_name', sa.String(length=50), nullable=False),
        sa.Column('model_type', sa.Enum('BASELINE_DELTA', 'LIGHTGBM_REGRESSOR', 'XGBOOST_REGRESSOR', name='modeltype'), nullable=False),
        sa.Column('version_tag', sa.String(length=30), nullable=False),
        sa.Column('artifact_path', sa.String(length=255), nullable=True),
        sa.Column('metrics', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('version_tag')
    )

    # 11. ETA Predictions
    op.create_table(
        'eta_predictions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('model_version_id', sa.Integer(), nullable=False),
        sa.Column('train_id', sa.Integer(), nullable=False),
        sa.Column('target_station_id', sa.Integer(), nullable=False),
        sa.Column('prediction_generated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('scheduled_eta', sa.DateTime(timezone=True), nullable=False),
        sa.Column('predicted_eta', sa.DateTime(timezone=True), nullable=False),
        sa.Column('predicted_delay_minutes', sa.Float(), nullable=False),
        sa.Column('confidence_score', sa.Float(), nullable=False),
        sa.Column('features_snapshot', sa.JSON(), nullable=True),
        sa.Column('source_type', sa.Enum('LIVE', 'REPLAY', 'SIMULATED', name='datasourcetype'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['model_version_id'], ['model_versions.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['target_station_id'], ['stations.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['train_id'], ['trains.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_eta_preds_train_target', 'eta_predictions', ['train_id', 'target_station_id', 'prediction_generated_at'], unique=False)

    # 12. Delay Propagation Predictions
    op.create_table(
        'delay_propagation_predictions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('eta_prediction_id', sa.Integer(), nullable=False),
        sa.Column('downstream_station_id', sa.Integer(), nullable=False),
        sa.Column('hop_order', sa.Integer(), nullable=False),
        sa.Column('propagated_delay_minutes', sa.Float(), nullable=False),
        sa.Column('confidence_interval_low', sa.Float(), nullable=False),
        sa.Column('confidence_interval_high', sa.Float(), nullable=False),
        sa.Column('conflict_risk_score', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['downstream_station_id'], ['stations.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['eta_prediction_id'], ['eta_predictions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_delay_prop_pred_lookup', 'delay_propagation_predictions', ['eta_prediction_id', 'hop_order'], unique=False)

    # 13. LLM Explanations
    op.create_table(
        'llm_explanations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('eta_prediction_id', sa.Integer(), nullable=False),
        sa.Column('provider', sa.String(length=30), nullable=False),
        sa.Column('prompt_template_version', sa.String(length=30), nullable=False),
        sa.Column('structured_input_payload', sa.JSON(), nullable=False),
        sa.Column('natural_language_explanation', sa.Text(), nullable=False),
        sa.Column('actionable_dispatch_recommendation', sa.Text(), nullable=True),
        sa.Column('generation_latency_ms', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['eta_prediction_id'], ['eta_predictions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_llm_explanations_pred', 'llm_explanations', ['eta_prediction_id', 'created_at'], unique=False)


def downgrade() -> None:
    op.drop_table('llm_explanations')
    op.drop_table('delay_propagation_predictions')
    op.drop_table('eta_predictions')
    op.drop_table('model_versions')
    op.drop_table('historical_delay_observations')
    op.drop_table('weather_observations')
    op.drop_table('station_events')
    op.drop_table('live_train_events')
    op.drop_table('scheduled_stops')
    op.drop_table('route_sections')
    op.drop_table('train_routes')
    op.drop_table('trains')
    op.drop_table('stations')
    
    op.execute("DROP TYPE IF EXISTS modeltype")
    op.execute("DROP TYPE IF EXISTS stationeventtype")
    op.execute("DROP TYPE IF EXISTS traineventtype")
    op.execute("DROP TYPE IF EXISTS datasourcetype")