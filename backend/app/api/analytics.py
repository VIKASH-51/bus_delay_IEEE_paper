"""
Analytics, Benchmark Comparison, and Ablation Study Router
"""
from fastapi import APIRouter

router = APIRouter(prefix="/api/analytics", tags=["Research & Analytics"])


@router.get("/benchmarks")
def get_benchmarks():
    """Retrieve full model comparison benchmark results (MAE, RMSE, MAPE, R2, Acc1, Acc3, Acc5)"""
    from app.main import benchmark_service
    return benchmark_service.get_benchmark_metrics()


@router.get("/ablation")
def get_ablation_results():
    """Retrieve ablation study results (Sequence Only, Context Only, Concat No Gate, Full Gated Fusion)"""
    from app.main import benchmark_service
    data = benchmark_service.get_benchmark_metrics()
    return {
        "status": "success",
        "ablation_table": data["ablation_table"],
    }


@router.get("/feature-importance")
def get_feature_importance():
    """Retrieve feature importance weights from the context branch"""
    from app.main import benchmark_service
    data = benchmark_service.get_benchmark_metrics()
    return {
        "status": "success",
        "feature_importance": data["feature_importance"],
    }
