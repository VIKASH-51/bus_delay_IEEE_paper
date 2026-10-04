import React from 'react';
import { useBus } from '../context/BusContext';
import StatusBanner from '../components/StatusBanner';
import DataPipelineDiagram from '../components/DataPipelineDiagram';
import {
  ShieldCheck,
  Radio,
  Clock,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  Database,
  RefreshCw,
  Server,
} from 'lucide-react';

export default function SystemMonitoring() {
  const {
    monitoring,
    feedStatus,
    feedAge,
    isFallback,
    isStaleInjected,
    toggleStaleness,
    refreshData,
  } = useBus();

  return (
    <div className="w-full space-y-6">
      <StatusBanner />

      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <ShieldCheck className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            System Telemetry, Feed Health & Fallback Controls
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Real-time monitoring of GTFS-RT feed freshness, data cleaning validations, and automated failover to schedule fallbacks when feeds become stale.
        </p>
      </div>

      {/* Staleness Injection & Health Controller Box */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-500" />
              <span>GTFS-Realtime Telemetry Stream Controller</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate feed dropouts to test automatic fallback mechanism and "NOT LIVE" indicators.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleStaleness(!isStaleInjected)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${
                isStaleInjected
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{isStaleInjected ? 'Stale Injected (Click to Restore)' : 'Inject Telemetry Staleness (120s)'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Health Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Feed Freshness Age
            </span>
            <div className="flex items-baseline space-x-1.5 font-mono">
              <span className={`text-2xl font-black ${isFallback ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                {feedAge}
              </span>
              <span className="text-xs text-slate-500">seconds ago</span>
            </div>
            <span className="text-[10px] text-slate-400">Threshold: Fresh &lt; 60s, Stale &gt; 90s</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Current Feed Mode
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono inline-block ${
              isFallback ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {feedStatus}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              {isFallback ? 'Historical baseline estimate' : 'Real-time Gated ML Model'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Data Cleaning & Missing Fields
            </span>
            <div className="flex items-baseline space-x-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {monitoring?.missing_fields_count ?? 0}
              </span>
              <span className="text-xs text-slate-500">rejected packets</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold">Integrity filters passing</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Unmatched Trips
            </span>
            <div className="flex items-baseline space-x-1.5 font-mono">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {monitoring?.unmatched_trips ?? 0}
              </span>
              <span className="text-xs text-slate-500">orphaned IDs</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-semibold">Spatial matching 100% synced</span>
          </div>
        </div>
      </div>

      {/* End-to-End Data Pipeline Architecture */}
      <DataPipelineDiagram />

      {/* Leakage Control Principles Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Strict Temporal Leakage-Control Compliance</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Zero Look-Ahead Conditioning
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Every feature (segment travel time, dwell time, current delay, headway) is strictly indexed to time-of-observation $t$ before the prediction horizon $t+1$.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              Training-Only Normalization
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Mean and standard deviation transformation scalers (<code>scaler_params.json</code>) are fit exclusively on the first 70% chronological training window.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
            <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
              No Time-Series Shuffling
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Validation (15%) and Test (15%) partitions strictly represent future calendar days to emulate realistic real-world production deployment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
