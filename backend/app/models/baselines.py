"""
Baseline Models for Benchmark Comparison (Paper Table 1)
- Historical Average
- Linear Regression
- Random Forest
- XGBoost
- Standard GRU
"""
import numpy as np
from typing import Dict, Any, Optional
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb


class HistoricalAverageBaseline:
    """Historical Average Delay baseline conditioned on (route_id, stop_sequence, time_bucket)"""
    def __init__(self):
        self.lookup_table: Dict[Tuple, float] = {}
        self.global_mean: float = 2.5

    def fit(self, X_context: np.ndarray, y: np.ndarray, route_ids: np.ndarray, stop_seqs: np.ndarray, hour_buckets: np.ndarray):
        table = {}
        counts = {}
        self.global_mean = float(np.mean(y)) if len(y) > 0 else 2.5

        for r_id, s_seq, h_b, target in zip(route_ids, stop_seqs, hour_buckets, y):
            key = (r_id, s_seq, h_b)
            table[key] = table.get(key, 0.0) + target
            counts[key] = counts.get(key, 0) + 1

        for key in table:
            self.lookup_table[key] = float(table[key] / counts[key])

    def predict(self, route_ids: np.ndarray, stop_seqs: np.ndarray, hour_buckets: np.ndarray) -> np.ndarray:
        preds = []
        for r_id, s_seq, h_b in zip(route_ids, stop_seqs, hour_buckets):
            key = (r_id, s_seq, h_b)
            if key in self.lookup_table:
                preds.append(self.lookup_table[key])
            else:
                preds.append(self.global_mean)
        return np.array(preds, dtype=np.float32)


class SklearnRegressorBaseline:
    """Wrapper for Scikit-Learn / XGBoost baseline regressors on flattened features"""
    def __init__(self, model_type: str = "linear_regression"):
        self.model_type = model_type
        if model_type == "linear_regression":
            self.model = Ridge(alpha=1.0)
        elif model_type == "random_forest":
            self.model = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
        elif model_type == "xgboost":
            self.model = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.05, random_state=42, n_jobs=-1)
        else:
            raise ValueError(f"Unknown model_type: {model_type}")

    def fit(self, X_features: np.ndarray, y: np.ndarray):
        self.model.fit(X_features, y)

    def predict(self, X_features: np.ndarray) -> np.ndarray:
        return self.model.predict(X_features).astype(np.float32)
