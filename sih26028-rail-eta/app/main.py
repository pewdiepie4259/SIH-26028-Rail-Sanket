from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import RTISTelemetry
from app.graph_engine import predict_cascade

app = FastAPI(title="SIH26028 Rail-Drishti ETA Engine", version="1.0.0")

# Enable CORS for frontend and copilot integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

@app.get("/")
def health_check():
    return {"status": "healthy", "module": "ST-GNN Delay Engine"}

@app.websocket("/ws/telemetry")
async def websocket_telemetry_stream(websocket: WebSocket):
    """Real-time pipe consumed by the Frontend map and the LLM Copilot."""
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/v1/telemetry/rtis")
async def ingest_telemetry(data: RTISTelemetry):
    prediction = predict_cascade(
        train_number=data.train_number,
        lat=data.latitude,
        lon=data.longitude,
        speed=data.speed_kmh,
        signal=data.signal_aspect or "GREEN"
    )
    # Broadcast predictions to all connected clients (Dashboard + Copilot)
    await manager.broadcast(prediction)
    return prediction