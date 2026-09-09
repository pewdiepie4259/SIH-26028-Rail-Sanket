from datetime import datetime, timezone, timedelta
from typing import List, Tuple
from sqlalchemy.orm import Session
from src.models import (
    Train, Station, TrainRoute, ScheduledStop, RouteSection,
    ETAPrediction, DelayPropagationPrediction
)
from src.schemas.propagation import (
    StationDelayProjection, ConflictDetail, PropagationAnalysisResult
)


class DelayPropagationEngine:
    # Minimum required headway separation in minutes between trains on same platform/block
    SAFE_HEADWAY_MINUTES = 5.0

    def __init__(self, db: Session):
        self.db = db

    def simulate_propagation(
        self,
        eta_prediction: ETAPrediction
    ) -> PropagationAnalysisResult:
        """
        Takes an ETAPrediction and computes:
        1. Downstream station-by-station delay absorption/accumulation.
        2. Platform & sectional conflict risks with downstream trains.
        3. Persists records to delay_propagation_predictions.
        """
        primary_train = self.db.query(Train).filter_by(id=eta_prediction.train_id).first()
        target_station = self.db.query(Station).filter_by(id=eta_prediction.target_station_id).first()

        # Find active route for this train
        route = self.db.query(TrainRoute).filter_by(
            train_id=primary_train.id,
            is_active=True
        ).first()
        if not route:
            raise ValueError(f"No active route found for train {primary_train.train_number}")

        # Get all stops ordered by sequence
        stops = self.db.query(ScheduledStop).filter_by(
            route_id=route.id
        ).order_by(ScheduledStop.stop_sequence).all()

        # Locate the stop corresponding to target_station
        target_idx = next((i for i, s in enumerate(stops) if s.station_id == target_station.id), None)
        if target_idx is None:
            # Default to looking forward from the beginning if target stop not found directly
            target_idx = 0

        downstream_stops = stops[target_idx:]
        current_delay = eta_prediction.predicted_delay_minutes
        projections: List[StationDelayProjection] = []
        conflicts: List[ConflictDetail] = []

        base_time = eta_prediction.predicted_eta
        current_virtual_time = base_time

        for hop, stop in enumerate(downstream_stops, start=1):
            st = self.db.query(Station).filter_by(id=stop.station_id).first()
            
            # Timetable slack absorption: high priority trains can recover up to 15% slack per hop
            # Express/Passenger trains absorb 5-8%
            recovery_rate = 0.12 if primary_train.priority_level <= 2 else 0.05
            recovered = current_delay * recovery_rate
            current_delay = max(0.0, current_delay - recovered)

            # Confidence interval widens with distance/hops
            margin = hop * 1.2
            ci_low = max(0.0, current_delay - margin)
            ci_high = current_delay + margin

            # Calculate projected arrival
            sched_dt = None
            if stop.scheduled_arrival_time:
                sched_dt = datetime.combine(base_time.date(), stop.scheduled_arrival_time).replace(tzinfo=timezone.utc)

            projected_arrival = (sched_dt + timedelta(minutes=current_delay)) if sched_dt else current_virtual_time

            # Compute conflict risk at this station
            station_conflicts, conflict_score = self._detect_station_conflicts(
                primary_train=primary_train,
                station=st,
                projected_arrival=projected_arrival,
                duration_minutes=float(stop.scheduled_dwell_minutes or 2)
            )
            conflicts.extend(station_conflicts)

            projection = StationDelayProjection(
                station_id=st.id,
                station_code=st.station_code,
                hop_order=hop,
                scheduled_arrival=sched_dt,
                projected_arrival=projected_arrival,
                propagated_delay_minutes=round(current_delay, 2),
                confidence_interval_low=round(ci_low, 2),
                confidence_interval_high=round(ci_high, 2),
                conflict_risk_score=round(conflict_score, 2)
            )
            projections.append(projection)

            # Persist downstream propagation prediction
            prop_record = DelayPropagationPrediction(
                eta_prediction_id=eta_prediction.id,
                downstream_station_id=st.id,
                hop_order=hop,
                propagated_delay_minutes=projection.propagated_delay_minutes,
                confidence_interval_low=projection.confidence_interval_low,
                confidence_interval_high=projection.confidence_interval_high,
                conflict_risk_score=projection.conflict_risk_score
            )
            self.db.add(prop_record)

            current_virtual_time += timedelta(minutes=8 + (stop.scheduled_dwell_minutes or 2))

        self.db.commit()

        return PropagationAnalysisResult(
            primary_train_number=primary_train.train_number,
            origin_delay_minutes=eta_prediction.predicted_delay_minutes,
            projections=projections,
            detected_conflicts=conflicts
        )

    def _detect_station_conflicts(
        self,
        primary_train: Train,
        station: Station,
        projected_arrival: datetime,
        duration_minutes: float
    ) -> Tuple[List[ConflictDetail], float]:
        """
        Scans other train scheduled stops at this station within the arrival window.
        Flags warnings if arrival interval is less than SAFE_HEADWAY_MINUTES.
        """
        conflicts: List[ConflictDetail] = []
        max_severity = 0.0

        target_time = projected_arrival.time()
        window_start = (projected_arrival - timedelta(minutes=self.SAFE_HEADWAY_MINUTES)).time()
        window_end = (projected_arrival + timedelta(minutes=duration_minutes + self.SAFE_HEADWAY_MINUTES)).time()

        # Query stops for other trains within headway window at this station
        other_stops = self.db.query(ScheduledStop).join(
            TrainRoute, ScheduledStop.route_id == TrainRoute.id
        ).filter(
            ScheduledStop.station_id == station.id,
            TrainRoute.train_id != primary_train.id
        ).all()

        for stop in other_stops:
            if not stop.scheduled_arrival_time:
                continue

            # Check time-of-day overlap
            other_arr = stop.scheduled_arrival_time
            if window_start <= other_arr <= window_end:
                other_train = stop.route.train
                overlap = self.SAFE_HEADWAY_MINUTES
                severity = 0.85 if other_train.priority_level <= primary_train.priority_level else 0.45
                max_severity = max(max_severity, severity)

                action = (
                    f"Prioritize Train {other_train.train_number} ({other_train.train_type}); hold Train {primary_train.train_number} at outer signal"
                    if other_train.priority_level < primary_train.priority_level
                    else f"Clear platform for Train {primary_train.train_number} ({primary_train.train_type}); regulate Train {other_train.train_number}"
                )

                conflicts.append(ConflictDetail(
                    conflict_type="PLATFORM_HEADWAY",
                    station_code=station.station_code,
                    conflicting_train_number=other_train.train_number,
                    affected_train_number=primary_train.train_number,
                    scheduled_conflict_time=datetime.combine(projected_arrival.date(), other_arr).replace(tzinfo=timezone.utc),
                    projected_overlap_minutes=overlap,
                    severity_score=severity,
                    recommended_action=action
                ))

        return conflicts, max_severity