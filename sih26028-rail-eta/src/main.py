from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router

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

app.include_router(router)


@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "service": "Bengaluru-Rail-ETA-Core"}