import React, { useState } from 'react';
import {
  Database,
  Radio,
  Clock,
  Filter,
  Layers,
  Cpu,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

export default function DataPipelineDiagram() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "gtfs_ingest",
      title: "1. GTFS Static & Realtime Ingestion",
      icon: Database,
      badge: "Ingestion",
      color: "blue",
      inputs: "routes.txt, trips.txt, stops.txt, stop_times.txt, VehiclePositions, TripUpdates",
      description: "Asynchronously parses static transit schedules and ingests streaming protobuf GTFS-RT vehicle telemetry (GPS coordinates, timestamps, vehicle IDs).",
    },
    {
      id: "time_sync",
      title: "2. Common Time-Base Conversion",
      icon: Clock,
      badge: "Synchronization",
      color: "indigo",
      inputs: "UTC Epoch timestamps, Local time zones, GTFS HH:MM:SS format",
      description: "Standardizes disparate feed clocks, GPS device timestamps, and static scheduled times into a unified chronological time-base.",
    },
    {
      id: "matching_cleaning",
      title: "3. Trip/Stop Matching & Data Cleaning",
      icon: Filter,
      badge: "Validation",
      color: "violet",
      inputs: "Raw coordinates, vehicle assignments, speed thresholds",
      description: "Spatiotemporally matches vehicle GPS positions to trip IDs and sequence stop IDs. Rejects invalid GPS bounds, negative dwell times, duplicate packets, and stale records (>60s).",
    },
    {
      id: "delay_calc",
      title: "4. Ground Truth Delay Calculation",
      icon: Zap,
      badge: "Target Definition",
      color: "amber",
      inputs: "Actual arrival timestamp - Scheduled arrival timestamp",
      description: "Computes exact ground truth delay: delay = actual_arrival - scheduled_arrival. Positive values indicate delays; negative values indicate early arrivals.",
    },
    {
      id: "feature_engineering",
      title: "5. Dual-Branch Feature Construction",
      icon: Layers,
      badge: "Feature Engineering",
      color: "emerald",
      inputs: "12-stop history buffer [delay, travel time, dwell time] + 14-dim context vector",
      description: "Constructs Branch 1 sequence window (12 stops × 3 features) and Branch 2 spatiotemporal context vector. Scaler statistics are computed strictly on training data to prevent look-ahead leakage.",
    },
    {
      id: "chronological_split",
      title: "6. Chronological 70/15/15 Data Split",
      icon: Calendar,
      badge: "Leakage Control",
      color: "cyan",
      inputs: "Strict time-ordered partition (70% Train / 15% Val / 15% Test)",
      description: "Preserves temporal ordering without random shuffling, ensuring models are strictly evaluated on unseen future time horizons.",
    },
    {
      id: "model_inference",
      title: "7. Two-Branch Gated Fusion Model",
      icon: Cpu,
      badge: "ML Execution",
      color: "blue",
      inputs: "Sequence tensor X_seq (B, 12, 3) and Context tensor X_ctx (B, 14)",
      description: "Passes sequences through 2-layer GRU (h) and context through Dense+ReLU (c). Element-wise gate g = σ(Wg[h;c]+bg) creates fused vector z = g*h + (1-g)*c for linear delay prediction.",
    },
    {
      id: "eta_delivery",
      title: "8. ETA API & Real-Time Passenger Display",
      icon: CheckCircle2,
      badge: "Delivery",
      color: "green",
      inputs: "Scheduled arrival time + Predicted delay",
      description: "Computes final passenger ETA = Scheduled Arrival + Predicted Delay. If RT feed exceeds freshness thresholds, seamlessly activates fallback to historical schedule estimate with NOT LIVE notice.",
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
          End-to-End Spatiotemporal Data & Prediction Pipeline
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Interactive workflow following the exact data processing, leakage-controlled split, and inference methodology from the research paper.
        </p>

        {/* Step-by-Step Interactive Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:border-blue-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300'}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {step.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs leading-tight mb-1">
                    {step.title}
                  </h4>
                </div>
                <span className={`text-[10px] mt-2 font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  Step {idx + 1} of {steps.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Detail Inspector */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>Detailed Architecture of {steps[activeStep].title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
              Input Streams / Variables
            </span>
            <p className="font-mono text-slate-800 dark:text-slate-200 font-semibold bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
              {steps[activeStep].inputs}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
              Processing & Leakage Safeguards
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {steps[activeStep].description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
