"""
GTFS-Realtime Simulator and Streaming Engine
Simulates real-time VehiclePositions and TripUpdates feeds with:
- Spatiotemporal bus movement across route stops
- Delay propagation, dwelling, and headway variation
- Feed freshness tracking (feed age in seconds)
- Manual / Automatic Staleness injection for fallback testing
"""
import time
import datetime
import random
import numpy as np
from typing import Dict, List, Optional, Any
from app.config import FEED_FRESHNESS_THRESHOLD_SEC, STALENESS_FALLBACK_SEC


class VehicleSimulator:
    def __init__(self, vehicle_id: str, route_id: str, trip_id: str, stops: List[Dict[str, Any]], start_offset_stops: float = 0.0):
        self.vehicle_id = vehicle_id
        self.route_id = route_id
        self.trip_id = trip_id
        self.stops = stops  # List of dicts with stop_id, stop_name, stop_lat, stop_lon, stop_sequence, arrival_time
        self.num_stops = len(stops)

        # Simulation state
        self.current_progress_stops = float(start_offset_stops)  # e.g. 3.4 means between stop 3 and stop 4
        self.speed_kmh = 24.0
        self.current_delay_min = random.uniform(0.5, 3.5)
        self.status = "IN_TRANSIT_TO"  # or STOPPED_AT
        self.last_update_time = time.time()
        self.history_records: List[Dict[str, Any]] = []

        # Initialize synthetic history for sequence branch
        for s_idx in range(1, max(2, int(start_offset_stops) + 1)):
            if s_idx <= len(stops):
                st = stops[s_idx - 1]
                self.history_records.append({
                    "stop_id": st["stop_id"],
                    "stop_sequence": s_idx,
                    "delay": max(0.0, self.current_delay_min - random.uniform(0, 1)),
                    "travel_time": random.uniform(1.8, 3.5),
                    "dwell_time": random.uniform(0.5, 0.9),
                })

    def update_position(self, delta_sec: float, traffic_multiplier: float = 1.0):
        """Advances vehicle along its route trajectory"""
        # Speed in stops per second (average 1.5 - 2.5 min per stop segment)
        stops_per_sec = (1.0 / (120.0 * traffic_multiplier)) * (self.speed_kmh / 24.0)
        self.current_progress_stops += stops_per_sec * delta_sec

        # Loop route when reaching terminal
        if self.current_progress_stops >= self.num_stops:
            self.current_progress_stops = 0.0
            self.current_delay_min = random.uniform(0.0, 1.5)
            self.history_records.clear()

        curr_stop_idx = int(self.current_progress_stops)
        next_stop_idx = min(self.num_stops - 1, curr_stop_idx + 1)
        sub_progress = self.current_progress_stops - curr_stop_idx

        # Calculate current GPS coords via linear interpolation
        stop_a = self.stops[curr_stop_idx]
        stop_b = self.stops[next_stop_idx]

        lat_a, lon_a = float(stop_a["stop_lat"]), float(stop_a["stop_lon"])
        lat_b, lon_b = float(stop_b["stop_lat"]), float(stop_b["stop_lon"])

        self.current_lat = lat_a + (lat_b - lat_a) * sub_progress
        self.current_lon = lon_a + (lon_b - lon_a) * sub_progress

        # Spatiotemporal delay fluctuations
        delay_drift = random.gauss(0.0, 0.08 * traffic_multiplier)
        self.current_delay_min = max(-2.0, min(25.0, self.current_delay_min + delay_drift))

        # Check if crossed a stop to record history
        if len(self.history_records) < curr_stop_idx:
            st = self.stops[curr_stop_idx - 1]
            self.history_records.append({
                "stop_id": st["stop_id"],
                "stop_sequence": curr_stop_idx,
                "delay": float(self.current_delay_min),
                "travel_time": random.uniform(2.0, 3.8),
                "dwell_time": random.uniform(0.5, 1.1),
            })


class GTFSRealtimeSimulator:
    def __init__(self, gtfs_loader):
        self.gtfs_loader = gtfs_loader
        self.vehicles: Dict[str, VehicleSimulator] = {}
        self.is_stale_injected: bool = False
        self.stale_injection_timestamp: Optional[float] = None
        self.stale_seconds_offset: float = 0.0
        self.last_feed_timestamp = time.time()
        self.simulation_running = True
        self.traffic_multiplier = 1.0  # 1.0 normal, 1.5 peak congestion
        self.init_vehicles()

    def init_vehicles(self):
        """Spawns simulated active vehicles across all routes"""
        routes = self.gtfs_loader.get_routes()
        v_id_counter = 101

        for r in routes:
            route_id = r["route_id"]
            stops = self.gtfs_loader.get_stops_for_route(route_id)
            if not stops:
                continue

            num_buses = 3  # 3 buses per route staggered
            for b_idx in range(num_buses):
                offset = (len(stops) / num_buses) * b_idx
                vehicle_id = f"BUS_{route_id}_{v_id_counter}"
                trip_id = f"TRIP_{route_id}_LIVE_{b_idx+1}"
                sim = VehicleSimulator(vehicle_id, route_id, trip_id, stops, start_offset_stops=offset)
                self.vehicles[vehicle_id] = sim
                v_id_counter += 1

    def tick(self, delta_sec: float = 2.0):
        """Simulates time step advancement"""
        if not self.simulation_running:
            return

        now = time.time()
        if not self.is_stale_injected:
            self.last_feed_timestamp = now
        else:
            # When stale is injected, feed timestamp stays frozen
            pass

        for sim in self.vehicles.values():
            sim.update_position(delta_sec, traffic_multiplier=self.traffic_multiplier)

    def set_staleness_injection(self, enable: bool, forced_age_seconds: float = 120.0):
        """Toggle staleness injection to test fallback mode"""
        self.is_stale_injected = enable
        if enable:
            self.stale_seconds_offset = forced_age_seconds
            self.last_feed_timestamp = time.time() - forced_age_seconds
        else:
            self.stale_seconds_offset = 0.0
            self.last_feed_timestamp = time.time()

    def get_feed_age_seconds(self) -> int:
        """Returns age of current GTFS-RT feed in seconds"""
        if self.is_stale_injected:
            return int(time.time() - self.last_feed_timestamp)
        # Normal feed jitter (3 to 14 seconds)
        return int((time.time() - self.last_feed_timestamp) + random.randint(2, 8))

    def is_feed_fresh(self) -> bool:
        return self.get_feed_age_seconds() < FEED_FRESHNESS_THRESHOLD_SEC

    def is_fallback_active(self) -> bool:
        return self.get_feed_age_seconds() >= STALENESS_FALLBACK_SEC

    def get_live_vehicles(self) -> List[Dict[str, Any]]:
        """Returns current list of all live vehicle positions and telemetry"""
        feed_age = self.get_feed_age_seconds()
        is_fresh = self.is_feed_fresh()
        is_fallback = self.is_fallback_active()

        results = []
        for v_id, v in self.vehicles.items():
            curr_stop_idx = int(v.current_progress_stops)
            next_stop_idx = min(v.num_stops - 1, curr_stop_idx + 1)
            
            curr_stop = v.stops[curr_stop_idx] if curr_stop_idx < v.num_stops else v.stops[-1]
            next_stop = v.stops[next_stop_idx] if next_stop_idx < v.num_stops else v.stops[-1]

            # Determine scheduled arrival for next stop
            sched_time_str = next_stop.get("arrival_time", "06:42:00")

            results.append({
                "vehicle_id": v.vehicle_id,
                "route_id": v.route_id,
                "trip_id": v.trip_id,
                "latitude": round(v.current_lat, 6),
                "longitude": round(v.current_lon, 6),
                "speed_kmh": round(v.speed_kmh, 1),
                "current_delay_min": round(v.current_delay_min, 1),
                "current_stop_id": curr_stop["stop_id"],
                "current_stop_name": curr_stop["stop_name"],
                "current_stop_sequence": curr_stop_idx + 1,
                "next_stop_id": next_stop["stop_id"],
                "next_stop_name": next_stop["stop_name"],
                "next_stop_sequence": next_stop_idx + 1,
                "next_stop_scheduled_time": sched_time_str,
                "trip_progress": round(v.current_progress_stops / float(v.num_stops), 3),
                "feed_age_seconds": feed_age,
                "feed_fresh": is_fresh,
                "is_fallback": is_fallback,
                "feed_status": "NOT LIVE" if is_fallback else ("STALE" if not is_fresh else "LIVE"),
                "is_simulated": True,
                "history_length": len(v.history_records),
            })
        return results
