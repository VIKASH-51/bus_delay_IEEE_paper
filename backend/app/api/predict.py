"""
Real-time Delay Prediction and ETA API Router
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional

router = APIRouter(prefix="/api/predict", tags=["Delay Prediction & ETA"])


@router.get("/vehicle/{vehicle_id}")
def predict_vehicle_eta(vehicle_id: str):
    """
    Run online prediction pipeline for a specific bus:
    1. Check feed freshness
    2. Fallback to schedule if stale (NOT LIVE)
    3. Generate sequence & context features
    4. Two-Branch Gated Fusion Model inference
    5. Compute ETA = Scheduled Arrival + Predicted Delay
    """
    from app.main import prediction_service
    result = prediction_service.predict_for_vehicle(vehicle_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/stop/{stop_id}")
def predict_stop_arrivals(stop_id: str, route_id: Optional[str] = None):
    """
    Predict arrival ETAs for all buses approaching a specific stop
    """
    from app.main import realtime_sim, prediction_service, gtfs_loader
    vehicles = realtime_sim.get_live_vehicles()
    arrivals = []

    for v in vehicles:
        if route_id and v["route_id"] != route_id:
            continue
        
        # Check if vehicle is approaching or scheduled for this stop
        pred = prediction_service.predict_for_vehicle(v["vehicle_id"])
        if "error" not in pred:
            arrivals.append(pred)

    return {
        "status": "success",
        "stop_id": stop_id,
        "count": len(arrivals),
        "arrivals": arrivals,
    }


@router.get("/all")
def get_all_predictions():
    """Returns real-time predictions for all active buses in the network"""
    from app.main import realtime_sim, prediction_service
    vehicles = realtime_sim.get_live_vehicles()
    preds = []
    for v in vehicles:
        p = prediction_service.predict_for_vehicle(v["vehicle_id"])
        if "error" not in p:
            preds.append(p)
    return {"status": "success", "count": len(preds), "predictions": preds}
