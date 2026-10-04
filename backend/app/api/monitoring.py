"""
System Monitoring and Feed Telemetry Router
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/monitoring", tags=["Monitoring & Telemetry"])


@router.get("/status")
def get_monitoring_status():
    """Retrieve feed age, fallback state, unmatched trips, prediction errors, and uptime"""
    from app.main import monitoring_service
    return {
        "status": "success",
        "monitoring": monitoring_service.get_system_health(),
    }
