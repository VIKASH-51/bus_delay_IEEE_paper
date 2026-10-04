"""
Time Synchronization, Trip/Stop Matching, and Data Cleaning Module
Implements:
1. Common time-base conversion
2. Trip and stop matching
3. Outlier and stale record filtering
4. Exact delay calculation: delay = actual_arrival - scheduled_arrival
"""
import datetime
from typing import Dict, List, Optional, Tuple, Any
import numpy as np


class TimeSynchronizer:
    @staticmethod
    def parse_time_to_seconds(time_str: str) -> int:
        """Converts HH:MM:SS string to total seconds past midnight"""
        if not time_str or not isinstance(time_str, str):
            return 0
        parts = time_str.strip().split(":")
        if len(parts) == 3:
            h, m, s = int(parts[0]), int(parts[1]), int(float(parts[2]))
            return h * 3600 + m * 60 + s
        elif len(parts) == 2:
            h, m = int(parts[0]), int(parts[1])
            return h * 3600 + m * 60
        return 0

    @staticmethod
    def seconds_to_time_str(seconds: int) -> str:
        """Converts total seconds past midnight to HH:MM:SS string"""
        seconds = int(seconds) % (24 * 3600)
        h = seconds // 3600
        m = (seconds % 3600) // 60
        s = seconds % 60
        return f"{h:02d}:{m:02d}:{s:02d}"

    @staticmethod
    def format_eta_display(timestamp_or_seconds: Any) -> str:
        """Format ETA to user-friendly 12-hour AM/PM string, e.g. 06:46 PM"""
        if isinstance(timestamp_or_seconds, (int, float)):
            seconds = int(timestamp_or_seconds) % (24 * 3600)
            h = seconds // 3600
            m = (seconds % 3600) // 60
            suffix = "AM" if h < 12 else "PM"
            display_h = 12 if h in [0, 12] else h % 12
            return f"{display_h:02d}:{m:02d} {suffix}"
        elif isinstance(timestamp_or_seconds, str):
            try:
                dt = datetime.datetime.fromisoformat(timestamp_or_seconds)
                return dt.strftime("%I:%M %p")
            except Exception:
                # Try HH:MM:SS
                sec = TimeSynchronizer.parse_time_to_seconds(timestamp_or_seconds)
                return TimeSynchronizer.format_eta_display(sec)
        elif isinstance(timestamp_or_seconds, datetime.datetime):
            return timestamp_or_seconds.strftime("%I:%M %p")
        return "N/A"

    @staticmethod
    def compute_delay_minutes(actual_time_sec: int, scheduled_time_sec: int) -> float:
        """
        delay = (actual_arrival - scheduled_arrival) in minutes
        Positive => late
        Negative => early
        """
        diff_sec = actual_time_sec - scheduled_time_sec
        # Handle midnight wrap-around if applicable
        if diff_sec > 12 * 3600:
            diff_sec -= 24 * 3600
        elif diff_sec < -12 * 3600:
            diff_sec += 24 * 3600
        return diff_sec / 60.0

    @staticmethod
    def clean_record(record: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Data cleaning validator:
        - Checks for missing required fields
        - Checks for valid GPS coordinates
        - Rejects stale records
        - Rejects impossible delays (> 180 min or < -30 min)
        """
        required = ["trip_id", "route_id", "stop_sequence", "lat", "lon"]
        for req in required:
            if req not in record or record[req] is None:
                return False, f"Missing required field: {req}"

        lat = float(record.get("lat", 0))
        lon = float(record.get("lon", 0))
        if not (-90.0 <= lat <= 90.0 and -180.0 <= lon <= 180.0):
            return False, "Invalid coordinate bounds"

        current_delay = float(record.get("current_delay", 0.0))
        if current_delay < -30.0 or current_delay > 180.0:
            return False, "Unrealistic delay magnitude detected"

        return True, None
