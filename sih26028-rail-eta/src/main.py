from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router
from src.api.gps_tracker import router as gps_router
from src.api.whatsapp_bot import router as whatsapp_router

app = FastAPI(
    title="Bengaluru Rail Dynamic ETA & Controller Copilot API",
    version="1.0.0",
    description="Dynamic ETA forecasting, propagation modeling, and Section Controller AI Copilot."
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


@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "service": "Bengaluru-Rail-ETA-Core"}