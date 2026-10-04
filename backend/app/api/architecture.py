"""
Model Architecture Metadata & Equation Specifications Router
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/architecture", tags=["Model Architecture"])


@router.get("/spec")
def get_architecture_spec():
    """Returns neural network layer dimensions, tensor formulas, and gated fusion equations"""
    from app.main import benchmark_service
    return {
        "status": "success",
        "spec": benchmark_service.get_architecture_spec(),
    }
