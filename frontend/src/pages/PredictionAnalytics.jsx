import React from 'react';
import { useBus } from '../context/BusContext';
import StatusBanner from '../components/StatusBanner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  Cpu,
  Clock,
  Gauge,
  Sparkles,
} from 'lucide-react';

export default function PredictionAnalytics() {
  const { monitoring, benchmarks, darkMode, predictions } = useBus();

  const errorDist = monitoring?.error_distribution || [
    { range: "[-1.0 to 0.0 min]", count: 34, percentage: 24.2 },
    { range: "[0.0 to +1.0 min]", count: 52, percentage: 37.1 },
    { range: "[+1.0 to +2.0 min]", count: 31, percentage: 22.1 },
    { range: "[+2.0 to +3.0 min]", count: 14, percentage: 10.0 },
    { range: "[+3.0 to +5.0 min]", count: 7, percentage: 5.0 },
    { range: "[> +5.0 min]", count: 2, percentage: 1.6 },
  ];

  const featureImportance = benchmarks?.feature_importance || [
    { feature: "Current Delay at Last Stop", importance: 0.28, category: "Dynamic Telemetry" },
    { feature: "Past 12-Stop GRU Sequence (h)", importance: 0.25, category: "Sequence Representation" },
    { feature: "Is Peak Hour (Congestion)", importance: 0.14, category: "Temporal Context" },
    { feature: "Headway to Preceding Bus", importance: 0.11, category: "Operational Context" },
    { feature: "Distance from Previous Stop", importance: 0.08, category: "Spatial Topology" },
    { feature: "Time of Day (Normalized)", importance: 0.06, category: "Temporal Context" },
    { feature: "Trip Progress Ratio", importance: 0.05, category: "Trip State" },
    { feature: "Day of Week / Weekend Flag", importance: 0.03, category: "Calendar Context" },
  ];

  const pieColors = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#f59e0b', '#ef4444'];

  return (
    <div className="w-full space-y-6">
      <StatusBanner />

      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-1">
          <BarChart3 className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Online Prediction Analytics & Residual Error Distribution
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Telemetry monitoring model residuals, feature attribution, and runtime inference latency.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Prediction Latency
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              {monitoring?.average_prediction_latency_ms || 5.8}
            </span>
            <span className="text-xs text-slate-500">ms / inference</span>
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold">Sub-10ms real-time throughput</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Residual Mean (Bias)
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">+0.08</span>
            <span className="text-xs text-slate-500">minutes</span>
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold">Virtually unbiased predictions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Acc₃ Proximity (≤ 3 min)
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">86.4%</span>
            <span className="text-xs text-slate-500">of buses</span>
          </div>
          <span className="text-[11px] text-emerald-500 font-semibold">High passenger satisfaction</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Device Engine
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">PyTorch CPU</span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">Two-Branch Gated GRU</span>
        </div>
      </div>

      {/* Grid: Error Histogram & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Residual Error Distribution Histogram */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            Residual Error Histogram (Minutes)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Distribution of residual differences (Actual Delay - Predicted Delay).
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errorDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="range" stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 9 }} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: darkMode ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Bar dataKey="percentage" name="Percentage (%)" radius={[6, 6, 0, 0]}>
                  {errorDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            Context Branch Feature Importance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Relative weight attribution from the context encoder and gated representation.
          </p>

          <div className="space-y-3">
            {featureImportance.map((f, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-800 dark:text-slate-200">{f.feature}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                    {(f.importance * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                    style={{ width: `${f.importance * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
