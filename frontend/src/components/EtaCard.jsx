import React, { useState } from 'react';
import { useBus } from '../context/BusContext';
import {
  Bus,
  Clock,
  MapPin,
  Radio,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function EtaCard({ prediction, onSelectVehicle }) {
  const [showDetails, setShowDetails] = useState(false);
  const { isFallback } = useBus();

  if (!prediction) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <Bus className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-bounce" />
        <p className="text-sm font-medium text-slate-300">
          Select an active bus to inspect real-time delay & ETA predictions.
        </p>
      </div>
    );
  }

  const {
    vehicle_id,
    route_id,
    route_short_name,
    route_long_name,
    next_stop_name,
    scheduled_arrival_display,
    predicted_eta_display,
    predicted_delay_min,
    delay_display,
    status,
    feed_age_seconds,
    model_breakdown,
  } = prediction;

  const isLate = predicted_delay_min > 0.5;
  const isEarly = predicted_delay_min < -0.5;
  const isOnTime = !isLate && !isEarly;

  const delayBgColor = isLate
    ? (predicted_delay_min > 3 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950 font-black')
    : (isOnTime ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-blue-500 text-white');

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all overflow-hidden">
      {/* Top Header */}
      <div className="p-5 pb-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="px-3.5 py-1 rounded-xl bg-white/20 backdrop-blur-md text-white font-black text-lg tracking-wide border border-white/30 shadow-inner">
              Route {route_short_name || route_id}
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white leading-tight">
                {route_long_name || `Corridor ${route_id}`}
              </h3>
              <p className="text-[11px] text-blue-100 font-mono">
                Vehicle ID: {vehicle_id}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center space-x-1 ${
              status === 'LIVE' ? 'bg-emerald-400 text-slate-950 shadow-sm' : 'bg-amber-400 text-slate-950 shadow-sm'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-1 ${status === 'LIVE' ? 'bg-slate-950 animate-ping' : 'bg-slate-950'}`} />
              <span>{status}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Passenger Information Card Body */}
      <div className="p-5 space-y-4">
        {/* Next Stop Callout */}
        <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex-shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Approaching Next Stop
            </span>
            <p className="font-bold text-base text-slate-900 dark:text-white truncate">
              {next_stop_name}
            </p>
          </div>
        </div>

        {/* Schedule vs Predicted ETA Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Scheduled Arrival */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Scheduled
            </span>
            <span className="font-mono font-bold text-base text-slate-800 dark:text-slate-100">
              {scheduled_arrival_display}
            </span>
          </div>

          {/* Predicted ETA */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-700 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Predicted ETA
            </span>
            <span className="font-mono font-black text-lg text-blue-600 dark:text-blue-300">
              {predicted_eta_display}
            </span>
          </div>

          {/* Delay in Minutes */}
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Delay
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shadow-sm ${delayBgColor}`}>
              {delay_display}
            </span>
          </div>
        </div>

        {/* Passenger Meta Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-500" />
            <span>Feed age: <strong className="font-mono text-slate-800 dark:text-slate-200">{feed_age_seconds} sec</strong></span>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            <span>{showDetails ? 'Hide Model Details' : 'Research ML Breakdown'}</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Model Gated Fusion Breakdown Drawer */}
        {showDetails && model_breakdown && (
          <div className="p-4 rounded-xl bg-slate-950 text-slate-200 border border-slate-800 space-y-3 text-xs animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5 text-blue-400 font-semibold">
                <Cpu className="w-4 h-4" />
                <span>Gated Fusion Latent Representation</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                z = g·h + (1-g)·c
              </span>
            </div>

            {/* Dynamic Gate g Balance Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-blue-300">
                  Branch 1: Sequence GRU (h): <strong>{model_breakdown.sequence_weight_pct || 50}%</strong>
                </span>
                <span className="text-indigo-300">
                  Branch 2: Context MLP (c): <strong>{model_breakdown.context_weight_pct || 50}%</strong>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{ width: `${model_breakdown.sequence_weight_pct || 50}%` }}
                />
                <div
                  className="bg-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${model_breakdown.context_weight_pct || 50}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Gate Factor g = {model_breakdown.gate_weight_g ?? 0.50}</span>
                <span>Dim: h ∈ ℝ⁶⁴, c ∈ ℝ⁶⁴, z ∈ ℝ⁶⁴</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dynamic element-wise gate vector <code>g = σ(W_g[h;c]+b_g)</code> dynamically modulates temporal delay history against spatial & traffic conditions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
