"""
Configuration and Hyperparameters for Spatiotemporal Bus Delay Prediction System
Reflecting the research paper specifications.
"""
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
GTFS_DIR = DATA_DIR / "gtfs"
CHECKPOINTS_DIR = DATA_DIR / "checkpoints"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
GTFS_DIR.mkdir(parents=True, exist_ok=True)
CHECKPOINTS_DIR.mkdir(parents=True, exist_ok=True)

# Model Hyperparameters (Paper Section 3 & 4)
WINDOW_LENGTH = 12       # Last 12 stops sequence
SEQ_FEATURE_DIM = 3      # [Delay, Segment Travel Time, Dwell Time]
HIDDEN_SIZE = 64         # GRU hidden units and Context dense units
NUM_GRU_LAYERS = 2       # 2-layer GRU
DROPOUT_RATE = 0.20      # Dropout 0.20
HORIZON = 1              # Predict 1 stop ahead

# Training Hyperparameters
BATCH_SIZE = 128
LEARNING_RATE = 0.001
MAX_EPOCHS = 50
EARLY_STOPPING_PATIENCE = 7
LOSS_WEIGHT_MSE = 0.5    # Loss = MAE + 0.5 * MSE

# Data Split (Paper chronological evaluation)
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# Realtime & Monitoring Config
FEED_FRESHNESS_THRESHOLD_SEC = 60  # Feeds older than 60s are flagged stale
STALENESS_FALLBACK_SEC = 90        # Switch to historical fallback if feed age > 90s
SIMULATION_TICK_SEC = 2            # Update interval for simulated GTFS-RT vehicles

# Context Feature Dimensions
# [time_of_day_norm, day_of_week_norm, is_weekend, is_peak, route_idx_norm, 
#  direction_id, trip_progress, stop_seq_norm, lat_norm, lon_norm, 
#  dist_prev_km, headway_min, current_delay_min, speed_prev_kmh]
CONTEXT_FEATURE_DIM = 14
