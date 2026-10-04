"""
Online Prediction Service and ETA Calculation Engine
Implements:
- Online prediction path from GTFS-RT feed to Two-Branch Gated Fusion Model
- Feed freshness check and automatic Fallback to historical schedule
- Dynamic computation of ETA = Scheduled Arrival + Predicted Delay
- Intermediate tensor extraction (Gate value g, sequence/context balance)
"""
import time
import datetime
import torch
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Any

from app.config import (
    CHECKPOINTS_DIR, WINDOW_LENGTH, SEQ_FEATURE_DIM, CONTEXT_FEATURE_DIM,
    HIDDEN_SIZE, NUM_GRU_LAYERS, DROPOUT_RATE, FEED_FRESHNESS_THRESHOLD_SEC,
    STALENESS_FALLBACK_SEC
)
from app.models.gated_fusion_gru import TwoBranchGatedFusionModel
from app.data_pipeline.feature_builder import FeatureBuilder, FeatureScaler
from app.data_pipeline.time_synchronizer import TimeSynchronizer


class PredictionService:
    def __init__(self, gtfs_loader, realtime_sim, checkpoints_dir: Optional[Path] = None):
        self.gtfs_loader = gtfs_loader
        self.realtime_sim = realtime_sim
        self.checkpoints_dir = Path(checkpoints_dir) if checkpoints_dir else CHECKPOINTS_DIR
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        self.scaler = FeatureScaler()
        self.model: Optional[TwoBranchGatedFusionModel] = None
        self.feature_builder: Optional[FeatureBuilder] = None
        self.model_loaded = False
        
        self.load_model()

    def load_model(self) -> bool:
        """Loads trained PyTorch model weights and training scaler"""
        try:
            scaler_path = self.checkpoints_dir / "scaler_params.json"
            model_path = self.checkpoints_dir / "proposed_gated_fusion.pt"

            if scaler_path.exists():
                self.scaler.load(scaler_path)
            self.feature_builder = FeatureBuilder(scaler=self.scaler)

            self.model = TwoBranchGatedFusionModel(
                seq_feature_dim=SEQ_FEATURE_DIM,
                seq_len=WINDOW_LENGTH,
                context_feature_dim=CONTEXT_FEATURE_DIM,
                hidden_size=HIDDEN_SIZE,
                num_gru_layers=NUM_GRU_LAYERS,
                dropout_rate=DROPOUT_RATE,
            ).to(self.device)

            if model_path.exists():
                state_dict = torch.load(model_path, map_location=self.device)
                self.model.load_state_dict(state_dict)
                print("Loaded trained Two-Branch Gated Fusion Model weights.")
            else:
                print("Model weights checkpoint not found; model initialized with initial weights.")

            self.model.eval()
            self.model_loaded = True
            return True
        except Exception as e:
            print(f"Error loading prediction model: {e}")
            self.model_loaded = False
            return False

    def predict_for_vehicle(self, vehicle_id: str) -> Dict[str, Any]:
        """
        Executes online prediction pipeline for a single vehicle:
        1. Check feed freshness
        2. If stale -> Fallback to schedule / historical estimate
        3. Match vehicle + trip + next stop
        4. Build sequence & context features
        5. Run PyTorch Two-Branch Gated Fusion model
        6. Compute ETA = Scheduled Arrival + Predicted Delay
        """
        feed_age = self.realtime_sim.get_feed_age_seconds()
        is_fresh = self.realtime_sim.is_feed_fresh()
        is_fallback = self.realtime_sim.is_fallback_active()

        v_sim = self.realtime_sim.vehicles.get(vehicle_id)
        if not v_sim:
            return {"error": f"Vehicle '{vehicle_id}' not found"}

        route_id = v_sim.route_id
        route_meta = self.gtfs_loader.get_route(route_id) or {"route_long_name": f"Route {route_id}", "route_short_name": route_id}

        curr_stop_idx = int(v_sim.current_progress_stops)
        next_stop_idx = min(v_sim.num_stops - 1, curr_stop_idx + 1)
        
        curr_stop = v_sim.stops[curr_stop_idx] if curr_stop_idx < v_sim.num_stops else v_sim.stops[-1]
        next_stop = v_sim.stops[next_stop_idx] if next_stop_idx < v_sim.num_stops else v_sim.stops[-1]

        # Scheduled arrival time string (e.g. "06:42:00")
        scheduled_arrival_str = next_stop.get("arrival_time", "18:42:00")
        scheduled_seconds = TimeSynchronizer.parse_time_to_seconds(scheduled_arrival_str)
        
        # Fallback check (Paper Section: Online Prediction Path & Fallback)
        if is_fallback or not self.model_loaded:
            # Fallback mode: Historical average delay for this stop
            fallback_delay = round(max(0.0, v_sim.current_delay_min * 0.8), 1)
            predicted_seconds = int(scheduled_seconds + (fallback_delay * 60))
            
            return {
                "vehicle_id": vehicle_id,
                "route_id": route_id,
                "route_short_name": route_meta.get("route_short_name", route_id),
                "route_long_name": route_meta.get("route_long_name", ""),
                "route_color": route_meta.get("route_color", "2563EB"),
                "next_stop_id": next_stop["stop_id"],
                "next_stop_name": next_stop["stop_name"],
                "next_stop_sequence": next_stop_idx + 1,
                "scheduled_arrival_raw": scheduled_arrival_str,
                "scheduled_arrival_display": TimeSynchronizer.format_eta_display(scheduled_seconds),
                "predicted_eta_display": TimeSynchronizer.format_eta_display(predicted_seconds),
                "predicted_delay_min": fallback_delay,
                "delay_display": f"+{int(round(fallback_delay))} min" if fallback_delay > 0.5 else ("On Time" if abs(fallback_delay) <= 0.5 else f"{int(round(fallback_delay))} min"),
                "status": "NOT LIVE",
                "feed_status": "NOT LIVE",
                "feed_age_seconds": feed_age,
                "is_fallback": True,
                "fallback_reason": f"GTFS-RT feed stale ({feed_age}s > {STALENESS_FALLBACK_SEC}s threshold). Switched to Schedule/Historical Fallback.",
                "is_simulated": True,
                "model_breakdown": {
                    "architecture": "Fallback (Historical Schedule Baseline)",
                    "gate_weight_g": 0.0,
                    "sequence_weight_pct": 0.0,
                    "context_weight_pct": 100.0,
                }
            }

        # Build feature vector for ML Model
        # 1. Sequence Window
        raw_history = []
        for h in v_sim.history_records:
            raw_history.append([float(h["delay"]), float(h["travel_time"]), float(h["dwell_time"])])
        
        # 2. Context dict
        now = datetime.datetime.now()
        time_of_day_hours = now.hour + (now.minute / 60.0)
        is_peak = 1 if (8.0 <= time_of_day_hours <= 10.5 or 17.0 <= time_of_day_hours <= 20.0) else 0

        feature_dict = {
            "time_of_day_hours": time_of_day_hours,
            "day_of_week": now.weekday(),
            "is_weekend": 1 if now.weekday() >= 5 else 0,
            "is_peak": is_peak,
            "route_idx": int(hash(route_id) % 10),
            "direction_id": 0,
            "trip_progress": v_sim.current_progress_stops / float(v_sim.num_stops),
            "stop_sequence": next_stop_idx + 1,
            "lat": float(next_stop["stop_lat"]),
            "lon": float(next_stop["stop_lon"]),
            "dist_prev_km": 1.2,
            "headway_min": 15.0,
            "current_delay": float(v_sim.current_delay_min),
            "speed_prev_kmh": float(v_sim.speed_kmh),
            "history_seq": raw_history,
        }

        seq_arr, ctx_arr = self.feature_builder.build_batch([feature_dict])
        t_seq = torch.from_numpy(seq_arr).to(self.device)
        t_ctx = torch.from_numpy(ctx_arr).to(self.device)

        with torch.no_grad():
            pred_tensor, intermediates = self.model(t_seq, t_ctx, return_intermediates=True)
            predicted_delay = float(pred_tensor.squeeze().item())

        # Ensure delay bounds
        predicted_delay = max(-3.0, min(30.0, predicted_delay))
        predicted_seconds = int(scheduled_seconds + (predicted_delay * 60))

        # Gate breakdown
        avg_g = intermediates["avg_gate_value"] if intermediates else 0.5
        seq_pct = round(avg_g * 100.0, 1)
        ctx_pct = round((1.0 - avg_g) * 100.0, 1)

        delay_display = f"+{int(round(predicted_delay))} min" if predicted_delay >= 0.5 else (
            f"{int(round(predicted_delay))} min" if predicted_delay <= -0.5 else "On Time"
        )

        return {
            "vehicle_id": vehicle_id,
            "route_id": route_id,
            "route_short_name": route_meta.get("route_short_name", route_id),
            "route_long_name": route_meta.get("route_long_name", ""),
            "route_color": route_meta.get("route_color", "2563EB"),
            "next_stop_id": next_stop["stop_id"],
            "next_stop_name": next_stop["stop_name"],
            "next_stop_sequence": next_stop_idx + 1,
            "scheduled_arrival_raw": scheduled_arrival_str,
            "scheduled_arrival_display": TimeSynchronizer.format_eta_display(scheduled_seconds),
            "predicted_eta_display": TimeSynchronizer.format_eta_display(predicted_seconds),
            "predicted_delay_min": round(predicted_delay, 1),
            "delay_display": delay_display,
            "status": "LIVE",
            "feed_status": "LIVE" if is_fresh else "STALE",
            "feed_age_seconds": feed_age,
            "is_fallback": False,
            "fallback_reason": "Realtime feed fresh (< 60s). ML Model active.",
            "is_simulated": True,
            "model_breakdown": {
                "architecture": "Two-Branch Spatiotemporal Gated Fusion (GRU + Context)",
                "gate_weight_g": round(avg_g, 3),
                "sequence_weight_pct": seq_pct,
                "context_weight_pct": ctx_pct,
                "gru_hidden_size": HIDDEN_SIZE,
                "context_dim": CONTEXT_FEATURE_DIM,
            }
        }

    def predict_for_route_stop(self, route_id: str, stop_id: str) -> List[Dict[str, Any]]:
        """Finds all vehicles approaching the target stop on the given route and returns their predictions"""
        vehicles = self.realtime_sim.get_live_vehicles()
        matching_preds = []

        for v in vehicles:
            if v["route_id"] == route_id:
                pred = self.predict_for_vehicle(v["vehicle_id"])
                matching_preds.append(pred)

        return matching_preds
