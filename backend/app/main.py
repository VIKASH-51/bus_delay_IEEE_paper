"""
FastAPI Application Entry Point
Initializes GTFS static & realtime engines, ML services, background simulation ticker, and API routers.
"""
import asyncio
import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import GTFS_DIR, CHECKPOINTS_DIR
from app.data_pipeline.gtfs_loader import GTFSLoader
from app.data_pipeline.dataset_generator import generate_gtfs_static_files, generate_spatiotemporal_historical_dataset
from app.data_pipeline.gtfs_realtime_sim import GTFSRealtimeSimulator
from app.models.model_trainer import ModelTrainer
from app.services.prediction_service import PredictionService
from app.services.monitoring_service import MonitoringService
from app.services.benchmark_service import BenchmarkService

from app.api.routes import router as routes_router
from app.api.live import router as live_router
from app.api.predict import router as predict_router
from app.api.analytics import router as analytics_router
from app.api.architecture import router as architecture_router
from app.api.monitoring import router as monitoring_router

# Global Service Instances
gtfs_loader = GTFSLoader(GTFS_DIR)
realtime_sim: GTFSRealtimeSimulator = None
prediction_service: PredictionService = None
monitoring_service: MonitoringService = None
benchmark_service: BenchmarkService = None

# Background simulation task handle
sim_background_task = None


async def run_simulation_loop():
    """Background coroutine that advances simulated bus positions and telemetry every second"""
    while True:
        try:
            if realtime_sim:
                realtime_sim.tick(delta_sec=1.0)
            await asyncio.sleep(1.0)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in simulation loop: {e}")
            await asyncio.sleep(1.0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global realtime_sim, prediction_service, monitoring_service, benchmark_service, sim_background_task

    print("--- Starting Spatiotemporal Bus Delay Prediction Engine ---")

    # 1. Ensure GTFS Static files exist
    if not (GTFS_DIR / "routes.txt").exists():
        print("Generating GTFS Static files...")
        generate_gtfs_static_files(GTFS_DIR)

    gtfs_loader.load_all()
    print(f"GTFS Static loaded: {len(gtfs_loader.get_routes())} routes, {len(gtfs_loader.get_all_stops())} stops.")

    # 2. Check and train ML model if checkpoint doesn't exist
    model_ckpt = CHECKPOINTS_DIR / "proposed_gated_fusion.pt"
    if not model_ckpt.exists():
        print("Model checkpoint not found. Generating spatiotemporal training dataset and training model...")
        hist_df = generate_spatiotemporal_historical_dataset(num_days=10, trips_per_day=30)
        trainer = ModelTrainer(CHECKPOINTS_DIR)
        trainer.train_pipeline(hist_df)
        print("Model training complete.")

    # 3. Initialize Simulators and Services
    realtime_sim = GTFSRealtimeSimulator(gtfs_loader)
    prediction_service = PredictionService(gtfs_loader, realtime_sim, CHECKPOINTS_DIR)
    monitoring_service = MonitoringService(realtime_sim, prediction_service)
    benchmark_service = BenchmarkService(CHECKPOINTS_DIR)

    # 4. Start background simulation loop
    sim_background_task = asyncio.create_task(run_simulation_loop())
    print("Background GTFS-RT Telemetry simulation started.")

    yield

    # Teardown
    if sim_background_task:
        sim_background_task.cancel()
    print("Spatiotemporal Bus Delay Prediction Engine shutdown complete.")


app = FastAPI(
    title="Spatiotemporal Bus Delay Prediction API",
    description="Context-Aware Machine Learning for Real-Time Passenger Information & ETA Prediction",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(routes_router)
app.include_router(live_router)
app.include_router(predict_router)
app.include_router(analytics_router)
app.include_router(architecture_router)
app.include_router(monitoring_router)


@app.get("/")
def root():
    return {
        "title": "Spatiotemporal Bus Delay Prediction API",
        "paper": "Spatiotemporal Bus Delay Prediction Using Context-Aware Machine Learning for Real-Time Passenger Information",
        "status": "online",
        "docs": "/docs",
    }
