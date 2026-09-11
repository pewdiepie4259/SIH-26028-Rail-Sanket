import json
import logging
from typing import List, Dict, Any
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from src.database import init_db
from src.api.routes import router
from src.api.gps_tracker import router as gps_router
from src.api.whatsapp_bot import router as whatsapp_router

logger = logging.getLogger("rail_drishti")


class ConnectionManager:
    """Manages real-time WebSocket dashboard connections."""
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        dead_connections = []
        for conn in self.active_connections:
            try:
                await conn.send_text(json.dumps(message))
            except Exception as e:
                logger.warning(f"Error streaming to WebSocket client: {e}")
                dead_connections.append(conn)

        for dead in dead_connections:
            self.disconnect(dead)


ws_manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database and auto-seed tables
    logger.info("Starting up RailDrishti Unified Engine...")
    init_db()
    yield
    logger.info("Shutting down RailDrishti Unified Engine...")


app = FastAPI(
    title="Bengaluru Rail Dynamic ETA & Controller Copilot API",
    version="1.0.0",
    description="Dynamic ETA forecasting, propagation modeling, GNN bottleneck prediction, and Section Controller AI Copilot.",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routers
app.include_router(router)
app.include_router(gps_router)
app.include_router(whatsapp_router)


# Real-time WebSocket Telemetry Stream
@app.websocket("/ws/telemetry")
async def websocket_telemetry_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep socket alive and receive any client ping
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket connection error: {e}")
        ws_manager.disconnect(websocket)


@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "Bengaluru-Rail-ETA-Core",
        "ws_active_subscribers": len(ws_manager.active_connections)
    }