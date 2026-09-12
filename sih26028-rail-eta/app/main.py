import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.graph_engine import (
    predict_cascade,
    format_bottleneck_payload,
    ACTIVE_TRAIN_POSITIONS,
    CORRIDOR_NODES,
    BENCHMARK_LOGS,
    DISPATCHER_DIRECTIVES_LOG
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rail_drishti")

app = FastAPI(
    title="RailDrishti Real-Time ETA & Bottleneck Engine",
    description="All-India ST-GNN inference, dynamic precedence advisory, and Section Controller DSS",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TelemetryPayload(BaseModel):
    train_number: str = Field(..., example="12246")
    lat: float = Field(..., example=12.9934)
    lon: float = Field(..., example=77.5980)
    speed: float = Field(..., example=75.0, description="Speed in km/h")
    signal: str = Field(default="GREEN", example="GREEN", description="Aspect: GREEN, YELLOW, DOUBLE_YELLOW, RED")

class DirectiveExecutionPayload(BaseModel):
    action_code: str = Field(..., example="PRECEDENCE_OVERTAKE_RECOMMENDED")
    priority_train: str = Field(..., example="20608")
    preempted_train: str = Field(..., example="06527")
    loop_station: str = Field(..., example="BWT")
    approved_by: str = Field(default="Section Controller - Active Division")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(f"Error broadcasting WebSocket message: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

manager = ConnectionManager()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RailDrishti All-India ST-GNN Core & Section Controller DSS",
        "active_trains": len(ACTIVE_TRAIN_POSITIONS),
        "total_network_nodes": len(CORRIDOR_NODES)
    }

@app.get("/api/v1/corridor/topology")
def get_corridor_topology():
    return {
        "scope": "Indian Railways National Rail Network",
        "node_count": len(CORRIDOR_NODES),
        "nodes": CORRIDOR_NODES
    }

@app.post("/api/v1/telemetry")
async def ingest_telemetry(data: TelemetryPayload):
    try:
        prediction = predict_cascade(
            train_number=data.train_number,
            lat=data.lat,
            lon=data.lon,
            speed=data.speed,
            signal=data.signal
        )
        await manager.broadcast(prediction)
        return {"status": "success", "prediction": prediction}
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/copilot/active-alerts")
def get_active_copilot_alerts():
    alerts = []
    for train_id, train_data in ACTIVE_TRAIN_POSITIONS.items():
        payload = format_bottleneck_payload(
            source_train=train_id,
            current_node_idx=train_data.get("block_idx", 0),
            forecasts=train_data.get("forecasts", []),
            threshold=0.15
        )
        if payload:
            alerts.append(payload)

    return {
        "status": "ok",
        "active_bottlenecks_count": len(alerts),
        "bottlenecks": alerts
    }

@app.post("/api/v1/copilot/execute-directive")
async def execute_dispatcher_directive(directive: DirectiveExecutionPayload):
    event = {
        "event_type": "DISPATCHER_DIRECTIVE_APPROVED",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "directive": directive.dict(),
        "interlocking_command": f"SET_ROUTE {directive.loop_station} LOOP_LINE LINE_CLEAR FOR {directive.priority_train}"
    }
    
    DISPATCHER_DIRECTIVES_LOG.append(event)
    await manager.broadcast(event)
    
    return {
        "status": "DIRECTIVE_EXECUTED",
        "event": event
    }

@app.get("/api/v1/copilot/directive-history")
def get_directive_history():
    return {
        "total_directives": len(DISPATCHER_DIRECTIVES_LOG),
        "history": DISPATCHER_DIRECTIVES_LOG
    }

@app.get("/api/v1/metrics/eval")
def get_benchmark_metrics():
    total_samples = len(BENCHMARK_LOGS)
    if total_samples == 0:
        return {"status": "waiting_for_telemetry", "sample_count": 0}

    delays = [log["gnn_predicted_delay_min"] for log in BENCHMARK_LOGS]
    avg_foresight_delay = round(sum(delays) / total_samples, 2)
    max_foresight_delay = round(max(delays), 2)

    return {
        "status": "ok",
        "evaluation_samples": total_samples,
        "metrics_summary": {
            "baseline_approach": "Static Kinematic Timetable (Speed/Distance)",
            "proposed_approach": "ST-GNN Spatio-Temporal Attention (National Scope)",
            "avg_cascade_foresight_captured_min": avg_foresight_delay,
            "peak_bottleneck_delay_predicted_min": max_foresight_delay,
            "foresight_advantage": "ST-GNN captures spatial network propagation before physical queueing occurs"
        },
        "recent_snapshots": BENCHMARK_LOGS[-10:]
    }

@app.websocket("/ws/telemetry")
async def websocket_telemetry_stream(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket client disconnected: {e}")
        manager.disconnect(websocket)