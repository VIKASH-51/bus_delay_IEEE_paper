import React from 'react';
import { useBus } from '../context/BusContext';
import { AlertCircle, CheckCircle2, Clock, Activity, Info, RefreshCw } from 'lucide-react';

export default function StatusBanner() {
  const { feedStatus, feedAge, isFallback, isStaleInjected, toggleStaleness, refreshData } = useBus();

  return (
    <div className="w-full space-y-2 mb-6">
      {/* Fallback Banner if NOT LIVE */}
      {isFallback ? (
        <div className="w-full p-4 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-400 dark:border-amber-700/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500 text-white flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-xs font-black uppercase rounded bg-amber-500 text-white tracking-wider">
                  NOT LIVE
                </span>
                <span className="font-semibold text-sm text-amber-900 dark:text-amber-200">
                  Real-time Feed Stale (Age: {feedAge}s) — Schedule / Historical Fallback Active
                </span>
              </div>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                Real-time GTFS-RT telemetry exceeded freshness threshold (90s). Predictions automatically fell back to historical schedule averages to guarantee passenger safety.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
            <button
              onClick={() => toggleStaleness(false)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition shadow-sm"
            >
              Restore Live Feed
            </button>
          </div>
        </div>
      ) : null}

      {/* Top Telemetry & Simulation Meta Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isFallback ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              System Feed Status:
            </span>
            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              isFallback ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
            }`}>
              {feedStatus}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

          <div className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Feed Freshness: <strong className="font-mono text-slate-900 dark:text-white">{feedAge}s ago</strong></span>
          </div>

          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

          <div className="flex items-center space-x-1.5">
            <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium text-[11px] border border-blue-200 dark:border-blue-800">
              SIMULATED DATA
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden md:inline">
              (High-fidelity GTFS / GTFS-RT spatiotemporal simulator)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => refreshData()}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition text-[11px]"
            title="Refresh Feed Telemetry"
          >
            <RefreshCw className="w-3 h-3 text-blue-500" />
            <span>Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
}
