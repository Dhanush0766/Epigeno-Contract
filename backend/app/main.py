"""
Main FastAPI Application Entrypoint.
Mounts all REST routers, WebSockets, DB initialization, and static assets.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import logging

from backend.app.db.session import engine, Base
from backend.app.services.seed_data import load_initial_seed_data
from backend.app.api.websocket import ws_hub

# Import API Routers
from backend.app.api.contracts import router as contracts_router
from backend.app.api.genotypes import router as genotypes_router
from backend.app.api.pcae import router as pcae_router
from backend.app.api.gating import router as gating_router
from backend.app.api.nlp import router as nlp_router
from backend.app.api.metrics import router as metrics_router
from backend.app.api.sync import router as sync_router
from backend.app.api.simulation import router as simulation_router
from backend.app.api.evolution import router as evolution_router
from backend.app.api.events import router as events_router
from backend.app.api.demo import router as demo_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aco.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables and load seeds
    logger.info("Initializing SQLite/PostgreSQL schema...")
    Base.metadata.create_all(bind=engine)
    logger.info("Loading initial seed data and baseline contracts...")
    load_initial_seed_data()
    logger.info("ACO / ECG Platform is ready.")
    yield
    # Shutdown
    logger.info("Shutting down ACO / ECG Platform...")

app = FastAPI(
    title="ACO / ECG Autonomous Contract Organism API",
    description="Predictive Contract Compatibility Assessment & Pre-Emptive Behavior Gating Platform.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(contracts_router)
app.include_router(genotypes_router)
app.include_router(pcae_router)
app.include_router(gating_router)
app.include_router(nlp_router)
app.include_router(metrics_router)
app.include_router(sync_router)
app.include_router(simulation_router)
app.include_router(evolution_router)
app.include_router(events_router)
app.include_router(demo_router)

# WebSocket Endpoint
@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await ws_hub.connect(websocket)
    try:
        while True:
            # Keep-alive receive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_hub.disconnect(websocket)
    except Exception as e:
        ws_hub.disconnect(websocket)

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "aco-ecg-core-engine",
        "version": "1.0.0"
    }

# Serve React SPA static files (built frontend)
_static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))
_frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
_spa_dir = _static_dir if os.path.isdir(_static_dir) else (_frontend_dist if os.path.isdir(_frontend_dist) else None)

if _spa_dir and os.path.isdir(_spa_dir):
    from fastapi.responses import FileResponse

    assets_dir = os.path.join(_spa_dir, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Exclude API, WebSocket, and docs routes
        if full_path.startswith("api") or full_path.startswith("ws") or full_path in ["docs", "redoc", "openapi.json", "health"]:
            return {"error": "Not Found"}
        target_file = os.path.join(_spa_dir, full_path)
        if os.path.isfile(target_file):
            return FileResponse(target_file)
        index = os.path.join(_spa_dir, "index.html")
        return FileResponse(index)

# Standalone run helper
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), reload=False)
