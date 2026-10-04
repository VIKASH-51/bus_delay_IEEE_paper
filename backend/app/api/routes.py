"""
Routes and Stops API Router
Provides static transit network information: routes, stops, and schedules.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/api/routes", tags=["Routes & Stops"])


@router.get("")
def get_all_routes():
    """Retrieve list of all transit routes"""
    from app.main import gtfs_loader
    routes = gtfs_loader.get_routes()
    return {"status": "success", "count": len(routes), "routes": routes}


@router.get("/{route_id}")
def get_route_details(route_id: str):
    """Retrieve specific route details and its stop sequence"""
    from app.main import gtfs_loader
    route = gtfs_loader.get_route(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found")
    
    stops = gtfs_loader.get_stops_for_route(route_id)
    return {
        "status": "success",
        "route": route,
        "stops_count": len(stops),
        "stops": stops,
    }


@router.get("/{route_id}/stops")
def get_route_stops(route_id: str, direction_id: str = "0"):
    """Retrieve ordered stops for a route"""
    from app.main import gtfs_loader
    stops = gtfs_loader.get_stops_for_route(route_id, direction_id)
    return {"status": "success", "route_id": route_id, "stops": stops}
