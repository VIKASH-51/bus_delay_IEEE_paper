"""
Realistic Spatiotemporal GTFS Dataset Generator
Generates GTFS static files (routes.txt, trips.txt, stops.txt, stop_times.txt, agency.txt, calendar.txt)
and multi-day chronological vehicle stop-event historical datasets with spatiotemporal delay propagation.
"""
import math
import random
import datetime
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
from app.config import GTFS_DIR

# Set seed for reproducible realistic datasets
np.random.seed(42)
random.seed(42)


# Realistic sample transit network definitions (Centred in a metropolitan urban corridor)
SAMPLE_ROUTES = [
    {
        "route_id": "21A",
        "route_short_name": "21A",
        "route_long_name": "Gandhipuram - Ukkadam Express Corridor",
        "route_type": "3",  # Bus
        "route_color": "2563EB", # Blue
        "route_text_color": "FFFFFF",
        "stops": [
            ("STP_01", "Gandhipuram Central Bus Terminus", 11.0183, 76.9656),
            ("STP_02", "Cross Cut Road Commercial Hub", 11.0210, 76.9634),
            ("STP_03", "100 Feet Road Junction", 11.0255, 76.9610),
            ("STP_04", "Ram Nagar North", 11.0160, 76.9580),
            ("STP_05", "Flyover South Terminal", 11.0090, 76.9615),
            ("STP_06", "Railway Station Main Gate", 11.0005, 76.9665),
            ("STP_07", "Collectorate Campus", 10.9980, 76.9680),
            ("STP_08", "Town Hall South", 10.9950, 76.9620),
            ("STP_09", "Big Bazaar Street", 10.9920, 76.9585),
            ("STP_10", "Valankulam Lake Boulevard", 10.9880, 76.9600),
            ("STP_11", "Sungam Bypass Junction", 10.9850, 76.9650),
            ("STP_12", "Al-Ameen Colony", 10.9790, 76.9610),
            ("STP_13", "Ukkadam Lake Promenade", 10.9740, 76.9550),
            ("STP_14", "Ukkadam Central Bus Stand", 10.9710, 76.9510),
            ("STP_15", "South Bypass Interchange", 10.9660, 76.9470),
            ("STP_16", "Kuniyamuthur Depot", 10.9580, 76.9410),
        ]
    },
    {
        "route_id": "45B",
        "route_short_name": "45B",
        "route_long_name": "Tech Park - Airport Metro Connector",
        "route_type": "3",
        "route_color": "10B981", # Emerald Green
        "route_text_color": "FFFFFF",
        "stops": [
            ("STP_20", "TIDEL Park IT Special Zone", 11.0280, 77.0250),
            ("STP_21", "Aerodrome Road West", 11.0310, 77.0320),
            ("STP_22", "Airport Terminal 1", 11.0340, 77.0390),
            ("STP_23", "Civil Aerodrome Station", 11.0305, 77.0450),
            ("STP_24", "SITRA Technology Circle", 11.0260, 77.0420),
            ("STP_25", "Avinashi Road Express Corridor", 11.0220, 77.0340),
            ("STP_26", "Goldwins Commercial Area", 11.0200, 77.0260),
            ("STP_27", "Peelamedu Metro Gate", 11.0180, 77.0170),
            ("STP_28", "PSG Tech Campus Gate", 11.0150, 77.0030),
            ("STP_29", "Hope College Junction", 11.0130, 76.9920),
            ("STP_30", "Fun Republic Mall Boulevard", 11.0110, 76.9850),
            ("STP_31", "Nava India Square", 11.0090, 76.9770),
            ("STP_32", "Lakshmi Mills Corporate Park", 11.0070, 76.9710),
            ("STP_33", "Women's Polytechnic", 11.0050, 76.9680),
            ("STP_34", "Anna Salai Terminal", 11.0020, 76.9640),
        ]
    },
    {
        "route_id": "12C",
        "route_short_name": "12C",
        "route_long_name": "Vadavalli - Singanallur Cross City Link",
        "route_type": "3",
        "route_color": "8B5CF6", # Purple
        "route_text_color": "FFFFFF",
        "stops": [
            ("STP_40", "Vadavalli Bus Terminal", 11.0290, 76.9020),
            ("STP_41", "Mullai Nagar", 11.0260, 76.9150),
            ("STP_42", "Agriculture University Gate", 11.0180, 76.9280),
            ("STP_43", "Lawley Road Junction", 11.0150, 76.9360),
            ("STP_44", "RS Puram Post Office", 11.0110, 76.9450),
            ("STP_45", "DB Road Shopping Complex", 11.0090, 76.9520),
            ("STP_46", "Brooke Bond Road", 11.0060, 76.9590),
            ("STP_47", "Railway Station East Entrance", 11.0010, 76.9670),
            ("STP_48", "Sungam Lake View", 10.9940, 76.9780),
            ("STP_49", "Ramanathapuram Circle", 10.9910, 76.9890),
            ("STP_50", "Olympus Central", 10.9880, 77.0010),
            ("STP_51", "Singanallur Boat House", 10.9850, 77.0150),
            ("STP_52", "Singanallur Bus Terminal", 10.9820, 77.0260),
        ]
    },
    {
        "route_id": "78",
        "route_short_name": "78",
        "route_long_name": "Saravanampatti Tech Zone - Railway Junction",
        "route_type": "3",
        "route_color": "F59E0B", # Amber
        "route_text_color": "FFFFFF",
        "stops": [
            ("STP_60", "Saravanampatti IT Corridor", 11.0790, 76.9990),
            ("STP_61", "KGISL Campus Gate", 11.0710, 76.9940),
            ("STP_62", "CHIL SEZ Entrance", 11.0630, 76.9900),
            ("STP_63", "Sivanandapuram", 11.0550, 76.9850),
            ("STP_64", "Vilankurichi Road Crossing", 11.0470, 76.9810),
            ("STP_65", "Ganapathy Bus Stand", 11.0390, 76.9760),
            ("STP_66", "Textool Flyover North", 11.0310, 76.9720),
            ("STP_67", "Sathy Road Junction", 11.0250, 76.9680),
            ("STP_68", "Gandhipuram Cross Cut", 11.0210, 76.9650),
            ("STP_69", "Central Park Roundabout", 11.0140, 76.9655),
            ("STP_70", "Collector Office", 10.9980, 76.9680),
            ("STP_71", "Railway Main Junction", 11.0005, 76.9665),
        ]
    }
]


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two GPS points"""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def generate_gtfs_static_files(target_dir: Path):
    """Generate standardized GTFS Static .txt files"""
    target_dir.mkdir(parents=True, exist_ok=True)

    # 1. agency.txt
    agency_df = pd.DataFrame([{
        "agency_id": "AGY_TRANSIT_01",
        "agency_name": "Metropolitan Smart City Bus Transit Authority",
        "agency_url": "https://smarttransit.transport.gov",
        "agency_timezone": "Asia/Kolkata",
        "agency_lang": "en",
        "agency_phone": "+91-422-2244000"
    }])
    agency_df.to_csv(target_dir / "agency.txt", index=False)

    # 2. routes.txt
    routes_rows = []
    for r in SAMPLE_ROUTES:
        routes_rows.append({
            "route_id": r["route_id"],
            "agency_id": "AGY_TRANSIT_01",
            "route_short_name": r["route_short_name"],
            "route_long_name": r["route_long_name"],
            "route_type": r["route_type"],
            "route_color": r["route_color"],
            "route_text_color": r["route_text_color"],
        })
    pd.DataFrame(routes_rows).to_csv(target_dir / "routes.txt", index=False)

    # 3. stops.txt
    stops_dict = {}
    for r in SAMPLE_ROUTES:
        for stop_id, stop_name, lat, lon in r["stops"]:
            if stop_id not in stops_dict:
                stops_dict[stop_id] = {
                    "stop_id": stop_id,
                    "stop_name": stop_name,
                    "stop_lat": lat,
                    "stop_lon": lon,
                    "zone_id": "ZONE_1",
                    "location_type": "0"
                }
    pd.DataFrame(list(stops_dict.values())).to_csv(target_dir / "stops.txt", index=False)

    # 4. calendar.txt
    calendar_df = pd.DataFrame([{
        "service_id": "SERV_ALL_WEEK",
        "monday": "1", "tuesday": "1", "wednesday": "1", "thursday": "1",
        "friday": "1", "saturday": "1", "sunday": "1",
        "start_date": "20260101", "end_date": "20261231"
    }])
    calendar_df.to_csv(target_dir / "calendar.txt", index=False)

    # 5. trips.txt and stop_times.txt
    trips_rows = []
    stop_times_rows = []

    # Generate scheduled departures every 15 minutes from 06:00 to 22:00
    for r in SAMPLE_ROUTES:
        route_id = r["route_id"]
        stops = r["stops"]

        # Schedule trips throughout day
        trip_counter = 1
        for start_hour in range(6, 23):
            for start_min in [0, 15, 30, 45]:
                if start_hour == 22 and start_min > 0:
                    continue

                trip_id = f"TRIP_{route_id}_{start_hour:02d}{start_min:02d}"
                trips_rows.append({
                    "route_id": route_id,
                    "service_id": "SERV_ALL_WEEK",
                    "trip_id": trip_id,
                    "trip_headsign": stops[-1][1],
                    "direction_id": "0",
                    "block_id": f"BLK_{route_id}_{trip_counter % 6}",
                    "shape_id": f"SHP_{route_id}_0"
                })
                trip_counter += 1

                # Generate scheduled arrival and departure for each stop
                current_time = datetime.datetime(2026, 1, 1, start_hour, start_min, 0)
                for seq_idx, (stop_id, stop_name, lat, lon) in enumerate(stops, start=1):
                    if seq_idx > 1:
                        prev_lat, prev_lon = stops[seq_idx - 2][2], stops[seq_idx - 2][3]
                        dist_km = haversine_distance(prev_lat, prev_lon, lat, lon)
                        # Scheduled transit speed ~ 25 km/h
                        travel_minutes = max(1.5, (dist_km / 25.0) * 60.0)
                        current_time += datetime.timedelta(minutes=travel_minutes)

                    arr_time_str = current_time.strftime("%H:%M:%S")
                    # Scheduled dwell time is 45 seconds (0.75 min)
                    current_time += datetime.timedelta(seconds=45)
                    dep_time_str = current_time.strftime("%H:%M:%S")

                    stop_times_rows.append({
                        "trip_id": trip_id,
                        "arrival_time": arr_time_str,
                        "departure_time": dep_time_str,
                        "stop_id": stop_id,
                        "stop_sequence": seq_idx,
                        "pickup_type": "0",
                        "drop_off_type": "0"
                    })

    pd.DataFrame(trips_rows).to_csv(target_dir / "trips.txt", index=False)
    pd.DataFrame(stop_times_rows).to_csv(target_dir / "stop_times.txt", index=False)
    print(f"Generated GTFS Static files in {target_dir}")


def generate_spatiotemporal_historical_dataset(
    num_days: int = 14,
    trips_per_day: int = 40,
) -> pd.DataFrame:
    """
    Simulates multi-day chronological vehicle stop-event dataset for ML training & evaluation.
    Simulates spatiotemporal physics:
    - Peak congestion hours: 08:00-10:30 & 17:00-20:00 (higher delay and higher variance)
    - Autoregressive delay propagation along sequence
    - Dwell time fluctuations due to boarding demand
    - Headway irregularity
    """
    records = []
    base_date = datetime.date(2026, 9, 1)

    for day_idx in range(num_days):
        current_date = base_date + datetime.timedelta(days=day_idx)
        day_of_week = current_date.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0

        for r_idx, r in enumerate(SAMPLE_ROUTES):
            route_id = r["route_id"]
            stops = r["stops"]
            num_stops = len(stops)

            # Pick scheduled departure hours
            dept_hours = np.linspace(6.0, 22.0, trips_per_day)

            for t_idx, dep_h in enumerate(dept_hours):
                hour = int(dep_h)
                minute = int((dep_h - hour) * 60)
                trip_id = f"HIST_{route_id}_D{day_idx:02d}_T{t_idx:02d}"

                # Initial departure delay at origin (often small: 0 to 2 mins)
                current_delay = max(-1.0, np.random.normal(loc=0.5, scale=1.0))
                sched_time = datetime.datetime.combine(current_date, datetime.time(hour, minute, 0))
                actual_time = sched_time + datetime.timedelta(minutes=current_delay)

                # History buffer of (delay, segment_time, dwell_time) for sequence branch
                history_seq = []

                for seq in range(1, num_stops + 1):
                    stop_id, stop_name, lat, lon = stops[seq - 1]

                    # Segment travel calculation
                    if seq == 1:
                        dist_km = 0.5
                        sched_travel_time = 0.0
                        actual_travel_time = 0.0
                    else:
                        prev_lat, prev_lon = stops[seq - 2][2], stops[seq - 2][3]
                        dist_km = haversine_distance(prev_lat, prev_lon, lat, lon)
                        sched_travel_time = max(1.5, (dist_km / 25.0) * 60.0)

                    # Scheduled dwell time
                    sched_dwell = 0.75  # 45 seconds

                    # Time of day calculation
                    time_of_day_hours = actual_time.hour + (actual_time.minute / 60.0) + (actual_time.second / 3600.0)
                    is_peak = 1 if (8.0 <= time_of_day_hours <= 10.5 or 17.0 <= time_of_day_hours <= 20.0) else 0

                    # Spatiotemporal delay disturbance generator
                    # Peak hours increase travel time and dwell delay
                    congestion_factor = 1.45 if (is_peak and not is_weekend) else (1.15 if is_weekend else 1.0)
                    # Core bottleneck near central corridors (around middle stops)
                    bottleneck = 1.3 if (num_stops // 3 <= seq <= 2 * num_stops // 3) else 1.0

                    # Actual dwell time (minutes)
                    actual_dwell = max(0.3, np.random.normal(
                        loc=sched_dwell * (1.3 if is_peak else 1.0),
                        scale=0.25
                    ))

                    # Actual travel time
                    if seq > 1:
                        actual_travel_time = max(
                            1.0,
                            np.random.normal(
                                loc=sched_travel_time * congestion_factor * bottleneck,
                                scale=0.4 * congestion_factor
                            )
                        )
                        # Autoregressive delay propagation:
                        # delay_delta = (actual_travel - sched_travel) + (actual_dwell - sched_dwell)
                        delay_delta = (actual_travel_time - sched_travel_time) + (actual_dwell - sched_dwell)
                        # Mean reversion damping
                        current_delay = max(-3.0, (current_delay * 0.92) + delay_delta)

                    # Advance actual and scheduled times
                    sched_time += datetime.timedelta(minutes=(sched_travel_time + sched_dwell))
                    actual_time = sched_time + datetime.timedelta(minutes=current_delay)

                    # Progress ratio
                    trip_progress = seq / float(num_stops)

                    # Headway in minutes
                    headway_min = 15.0 + np.random.normal(0, 2.5)

                    # Prev speed
                    speed_prev = (dist_km / (actual_travel_time / 60.0)) if actual_travel_time > 0 else 25.0

                    # Append to history sequence (delay, travel_time, dwell_time)
                    step_tuple = (float(current_delay), float(actual_travel_time), float(actual_dwell))
                    history_seq.append(step_tuple)

                    # To predict the delay at the NEXT stop (Horizon = 1)
                    # Next stop actual delay is target y
                    # Create sequence window of length 12
                    padded_seq = []
                    # If history < 12, pad with earlier values or zeros
                    pad_count = max(0, 12 - len(history_seq))
                    for _ in range(pad_count):
                        padded_seq.append([0.0, 2.0, 0.75])
                    for item in history_seq[-12:]:
                        padded_seq.append([item[0], item[1], item[2]])

                    records.append({
                        "observation_timestamp": actual_time.isoformat(),
                        "day_index": day_idx,
                        "date_str": current_date.isoformat(),
                        "time_of_day_hours": time_of_day_hours,
                        "day_of_week": day_of_week,
                        "is_weekend": is_weekend,
                        "is_peak": is_peak,
                        "route_id": route_id,
                        "route_idx": r_idx,
                        "direction_id": 0,
                        "trip_id": trip_id,
                        "stop_sequence": seq,
                        "stop_id": stop_id,
                        "lat": lat,
                        "lon": lon,
                        "dist_prev_km": dist_km,
                        "headway_min": headway_min,
                        "current_delay": float(current_delay),
                        "speed_prev_kmh": float(speed_prev),
                        "trip_progress": float(trip_progress),
                        "scheduled_time": sched_time.strftime("%H:%M:%S"),
                        "actual_time": actual_time.strftime("%H:%M:%S"),
                        "history_seq": padded_seq, # 12 x 3 list
                    })

    df = pd.DataFrame(records)

    # Compute target next_stop_delay (Horizon = 1) for each trip
    df["target_delay"] = df.groupby("trip_id")["current_delay"].shift(-1)
    # Fill last stop with current_delay + small random noise for completeness
    df["target_delay"] = df["target_delay"].fillna(df["current_delay"])

    # Sort strictly chronologically to prevent temporal leakage
    df = df.sort_values(by="observation_timestamp").reset_index(drop=True)
    return df
