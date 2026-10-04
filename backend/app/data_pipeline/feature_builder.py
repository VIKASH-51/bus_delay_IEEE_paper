"""
Feature Builder for Spatiotemporal Two-Branch Delay Prediction Model
Constructs:
- Sequence Features (12 stops x 3 dimensions: delay, travel time, dwell time)
- Context Features (14 dimensions: time-of-day, peak, headway, coords, route, stop progress, etc.)
- Strict training-only scaling statistics to prevent temporal data leakage
"""
import numpy as np
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Any
from app.config import WINDOW_LENGTH, SEQ_FEATURE_DIM, CONTEXT_FEATURE_DIM, CHECKPOINTS_DIR


class FeatureScaler:
    """
    Standard / MinMax feature scaler that stores mean and std computed
    strictly from training set data.
    """
    def __init__(self):
        self.means: Dict[str, float] = {}
        self.stds: Dict[str, float] = {}
        self.fitted = False

    def fit(self, seq_array: np.ndarray, ctx_array: np.ndarray):
        """Fit scaler on training data only"""
        # seq_array: (N, 12, 3)
        self.seq_mean = np.mean(seq_array, axis=(0, 1)).tolist()
        self.seq_std = (np.std(seq_array, axis=(0, 1)) + 1e-6).tolist()

        # ctx_array: (N, 14)
        self.ctx_mean = np.mean(ctx_array, axis=0).tolist()
        self.ctx_std = (np.std(ctx_array, axis=0) + 1e-6).tolist()
        self.fitted = True

    def transform_seq(self, seq_array: np.ndarray) -> np.ndarray:
        if not self.fitted:
            return seq_array.astype(np.float32)
        res = (seq_array - np.array(self.seq_mean, dtype=np.float32)) / np.array(self.seq_std, dtype=np.float32)
        return res.astype(np.float32)

    def transform_ctx(self, ctx_array: np.ndarray) -> np.ndarray:
        if not self.fitted:
            return ctx_array.astype(np.float32)
        res = (ctx_array - np.array(self.ctx_mean, dtype=np.float32)) / np.array(self.ctx_std, dtype=np.float32)
        return res.astype(np.float32)

    def save(self, filepath: Path):
        data = {
            "seq_mean": self.seq_mean,
            "seq_std": self.seq_std,
            "ctx_mean": self.ctx_mean,
            "ctx_std": self.ctx_std,
            "fitted": self.fitted,
        }
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)

    def load(self, filepath: Path) -> bool:
        if not Path(filepath).exists():
            return False
        with open(filepath, "r") as f:
            data = json.load(f)
            self.seq_mean = data["seq_mean"]
            self.seq_std = data["seq_std"]
            self.ctx_mean = data["ctx_mean"]
            self.ctx_std = data["ctx_std"]
            self.fitted = data["fitted"]
        return True


class FeatureBuilder:
    def __init__(self, scaler: Optional[FeatureScaler] = None):
        self.scaler = scaler or FeatureScaler()

    @staticmethod
    def extract_context_vector(row_or_dict: Dict[str, Any]) -> List[float]:
        """
        Extracts 14-dim context feature vector strictly using information
        available at prediction time.
        """
        time_of_day_hours = float(row_or_dict.get("time_of_day_hours", 12.0))
        time_norm = time_of_day_hours / 24.0
        
        day_of_week = float(row_or_dict.get("day_of_week", 2))
        day_norm = day_of_week / 6.0
        
        is_weekend = float(row_or_dict.get("is_weekend", 0))
        is_peak = float(row_or_dict.get("is_peak", 0))
        
        route_idx = float(row_or_dict.get("route_idx", 0))
        route_norm = route_idx / 10.0
        
        direction_id = float(row_or_dict.get("direction_id", 0))
        trip_progress = float(row_or_dict.get("trip_progress", 0.5))
        
        stop_sequence = float(row_or_dict.get("stop_sequence", 1))
        stop_seq_norm = stop_sequence / 30.0
        
        lat = float(row_or_dict.get("lat", 11.0))
        lon = float(row_or_dict.get("lon", 77.0))
        lat_norm = (lat - 10.0) / 2.0
        lon_norm = (lon - 76.0) / 2.0
        
        dist_prev_km = float(row_or_dict.get("dist_prev_km", 1.0))
        headway_min = float(row_or_dict.get("headway_min", 15.0))
        current_delay = float(row_or_dict.get("current_delay", 0.0))
        speed_prev_kmh = float(row_or_dict.get("speed_prev_kmh", 25.0))

        return [
            time_norm,
            day_norm,
            is_weekend,
            is_peak,
            route_norm,
            direction_id,
            trip_progress,
            stop_seq_norm,
            lat_norm,
            lon_norm,
            dist_prev_km,
            headway_min,
            current_delay,
            speed_prev_kmh,
        ]

    @staticmethod
    def extract_sequence_window(history_list: List[List[float]], target_len: int = WINDOW_LENGTH) -> List[List[float]]:
        """
        Extracts or pads sequence of last 12 stops:
        Each step: [delay, travel_time, dwell_time]
        """
        seq = []
        if len(history_list) < target_len:
            pad_needed = target_len - len(history_list)
            for _ in range(pad_needed):
                seq.append([0.0, 2.0, 0.75])
            seq.extend(history_list)
        else:
            seq = history_list[-target_len:]
        return seq

    def build_batch(self, records: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """
        Converts list of records into normalized (X_seq, X_ctx) numpy arrays
        """
        seq_list = []
        ctx_list = []

        for rec in records:
            raw_seq = rec.get("history_seq", [])
            seq = self.extract_sequence_window(raw_seq)
            ctx = self.extract_context_vector(rec)
            seq_list.append(seq)
            ctx_list.append(ctx)

        seq_array = np.array(seq_list, dtype=np.float32)  # (N, 12, 3)
        ctx_array = np.array(ctx_list, dtype=np.float32)  # (N, 14)

        if self.scaler.fitted:
            seq_array = self.scaler.transform_seq(seq_array)
            ctx_array = self.scaler.transform_ctx(ctx_array)

        return seq_array, ctx_array
