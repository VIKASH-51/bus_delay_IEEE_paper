"""
GTFS Static Data Loader and Schema Parser
Loads routes, trips, stops, stop_times, and calendar data following the GTFS standard specification.
"""
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Any
from app.config import GTFS_DIR


class GTFSLoader:
    def __init__(self, gtfs_dir: Optional[Path] = None):
        self.gtfs_dir = Path(gtfs_dir) if gtfs_dir else GTFS_DIR
        self.routes_df: pd.DataFrame = pd.DataFrame()
        self.trips_df: pd.DataFrame = pd.DataFrame()
        self.stops_df: pd.DataFrame = pd.DataFrame()
        self.stop_times_df: pd.DataFrame = pd.DataFrame()
        self.agency_df: pd.DataFrame = pd.DataFrame()
        self.calendar_df: pd.DataFrame = pd.DataFrame()
        self.loaded = False

    def load_all(self) -> bool:
        """Load all GTFS static CSV/text files"""
        try:
            routes_file = self.gtfs_dir / "routes.txt"
            trips_file = self.gtfs_dir / "trips.txt"
            stops_file = self.gtfs_dir / "stops.txt"
            stop_times_file = self.gtfs_dir / "stop_times.txt"
            agency_file = self.gtfs_dir / "agency.txt"
            calendar_file = self.gtfs_dir / "calendar.txt"

            if not (routes_file.exists() and trips_file.exists() and stops_file.exists() and stop_times_file.exists()):
                return False

            self.routes_df = pd.read_csv(routes_file, dtype=str)
            self.trips_df = pd.read_csv(trips_file, dtype=str)
            self.stops_df = pd.read_csv(stops_file, dtype={"stop_id": str, "stop_sequence": "Int64", "stop_lat": float, "stop_lon": float})
            self.stop_times_df = pd.read_csv(stop_times_file, dtype={"trip_id": str, "stop_id": str, "stop_sequence": int})
            
            if agency_file.exists():
                self.agency_df = pd.read_csv(agency_file, dtype=str)
            if calendar_file.exists():
                self.calendar_df = pd.read_csv(calendar_file, dtype=str)

            # Convert stop_times stop_sequence to integer and sort
            self.stop_times_df["stop_sequence"] = self.stop_times_df["stop_sequence"].astype(int)
            self.stop_times_df = self.stop_times_df.sort_values(by=["trip_id", "stop_sequence"])

            self.loaded = True
            return True
        except Exception as e:
            print(f"Error loading GTFS static data: {e}")
            return False

    def get_routes(self) -> List[Dict[str, Any]]:
        if not self.loaded:
            return []
        return self.routes_df.to_dict(orient="records")

    def get_route(self, route_id: str) -> Optional[Dict[str, Any]]:
        if not self.loaded:
            return None
        match = self.routes_df[self.routes_df["route_id"] == route_id]
        if match.empty:
            return None
        return match.iloc[0].to_dict()

    def get_stops_for_route(self, route_id: str, direction_id: str = "0") -> List[Dict[str, Any]]:
        """Get ordered list of stops for a specific route and direction"""
        if not self.loaded:
            return []
        
        # Find trips for this route
        matching_trips = self.trips_df[self.trips_df["route_id"] == route_id]
        if "direction_id" in matching_trips.columns:
            matching_trips = matching_trips[matching_trips["direction_id"] == str(direction_id)]
        
        if matching_trips.empty:
            return []

        rep_trip_id = matching_trips.iloc[0]["trip_id"]
        rep_stop_times = self.stop_times_df[self.stop_times_df["trip_id"] == rep_trip_id].sort_values("stop_sequence")
        
        merged = rep_stop_times.merge(self.stops_df, on="stop_id", how="left")
        return merged.to_dict(orient="records")

    def get_all_stops(self) -> List[Dict[str, Any]]:
        if not self.loaded:
            return []
        return self.stops_df.to_dict(orient="records")
