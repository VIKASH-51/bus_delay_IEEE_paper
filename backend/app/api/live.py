"""
Live GTFS-RT Telemetry and Simulation Control Router
"""
from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/live", tags=["Live Vehicles & Simulation"])


class StalenessPayload(BaseModel):
    enable: bool
    forced_age_seconds: Optional[float] = 120.0


class SimulationControlPayload(BaseModel):
    running: Optional[bool] = None
    traffic_multiplier: Optional[float] = None


@router.get("/vehicles")
def get_live_vehicles():
    """Retrieve positions and telemetry for all active buses in the network"""
    from app.main import realtime_sim
    vehicles = realtime_sim.get_live_vehicles()
    feed_age = realtime_sim.get_feed_age_seconds()
    is_fresh = realtime_sim.is_feed_fresh()
    is_fallback = realtime_sim.is_fallback_active()

    return {
        "status": "success",
        "feed_status": "NOT LIVE" if is_fallback else ("STALE" if not is_fresh else "LIVE"),
        "feed_age_seconds": feed_age,
        "is_fallback": is_fallback,
        "is_stale_injected": realtime_sim.is_stale_injected,
        "count": len(vehicles),
        "vehicles": vehicles,
    }


@router.post("/staleness")
def set_staleness(payload: StalenessPayload):
    """Toggle staleness injection to test fallback mode ('NOT LIVE')"""
    from app.main import realtime_sim
    realtime_sim.set_staleness_injection(payload.enable, payload.forced_age_seconds or 120.0)
    feed_age = realtime_sim.get_feed_age_seconds()
    return {
        "status": "success",
        "is_stale_injected": realtime_sim.is_stale_injected,
        "feed_age_seconds": feed_age,
        "feed_status": "NOT LIVE" if realtime_sim.is_fallback_active() else "LIVE",
    }


@router.post("/simulation")
def control_simulation(payload: SimulationControlPayload):
    """Control background simulation (pause/resume, traffic density)"""
    from app.main import realtime_sim
    if payload.running is not None:
        realtime_sim.simulation_running = payload.running
    if payload.traffic_multiplier is not None:
        realtime_sim.traffic_multiplier = max(0.5, min(3.0, payload.traffic_multiplier))

    return {
        "status": "success",
        "simulation_running": realtime_sim.simulation_running,
        "traffic_multiplier": realtime_sim.traffic_multiplier,
    }
