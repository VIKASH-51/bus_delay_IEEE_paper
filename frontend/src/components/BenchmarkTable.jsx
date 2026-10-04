import React, { useState } from 'react';
import { useBus } from '../context/BusContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { Trophy, TrendingUp, CheckCircle, BarChart3, Star } from 'lucide-react';

export default function BenchmarkTable() {
  const { benchmarks, darkMode } = useBus();
  const [activeChartMetric, setActiveChartMetric] = useState('mae');

  const defaultBenchmark = [
    { model: "Historical Avg", mae: 3.42, rmse: 4.91, mape: 18.6, r2: 0.71, acc1: 38.5, acc3: 68.2, acc5: 85.1, type: "Baseline" },
    { model: "Linear Regression", mae: 3.08, rmse: 4.46, mape: 16.9, r2: 0.76, acc1: 43.1, acc3: 72.6, acc5: 88.4, type: "Baseline" },
    { model: "Random Forest", mae: 2.74, rmse: 4.02, mape: 15.1, r2: 0.81, acc1: 49.8, acc3: 77.9, acc5: 91.2, type: "Baseline" },
    { model: "XGBoost", mae: 2.51, rmse: 3.71, mape: 13.8, r2: 0.84, acc1: 54.2, acc3: 81.5, acc5: 93.6, type: "Baseline" },
    { model: "GRU", mae: 2.43, rmse: 3.58, mape: 13.4, r2: 0.85, acc1: 56.1, acc3: 82.7, acc5: 94.3, type: "Deep Learning" },
    { model: "Proposed", mae: 2.18, rmse: 3.29, mape: 12.1, r2: 0.89, acc1: 62.4, acc3: 86.4, acc5: 96.2, type: "Proposed Architecture" },
  ];

  const data = benchmarks?.benchmark_table || defaultBenchmark;

  const chartData = data.map((d) => ({
    name: d.model,
    MAE: d.mae,
    RMSE: d.rmse,
    MAPE: d.mape,
    R2: d.r2,
    Acc3: d.acc3,
    Acc1: d.acc1,
    isProposed: d.model.includes('Proposed'),
  }));

  return (
    <div className="w-full space-y-6">
      {/* Benchmark Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Proposed MAE
            </span>
            <Trophy className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">2.18</span>
            <span className="text-xs text-slate-500">minutes</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            -36.3% error vs Historical Avg
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Proposed Acc₃
            </span>
            <Star className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">86.4%</span>
            <span className="text-xs text-slate-500">within 3 min</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            +18.2% accuracy improvement
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Proposed R²
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">0.89</span>
            <span className="text-xs text-slate-500">explained var</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Highest among all models
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Proposed Acc₁
            </span>
            <CheckCircle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">62.4%</span>
            <span className="text-xs text-slate-500">within 1 min</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            Sub-minute high precision
          </p>
        </div>
      </div>

      {/* Model Benchmark Table */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Model Performance Comparison (Chronological Test Set)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exact benchmark metrics matching Table 1 of the published research paper.
            </p>
          </div>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4">Model Architecture</th>
              <th className="py-3 px-3 text-right">MAE (min) ↓</th>
              <th className="py-3 px-3 text-right">RMSE (min) ↓</th>
              <th className="py-3 px-3 text-right">MAPE (%) ↓</th>
              <th className="py-3 px-3 text-right">R² ↑</th>
              <th className="py-3 px-3 text-right">Acc₁ (≤1m) ↑</th>
              <th className="py-3 px-3 text-right">Acc₃ (≤3m) ↑</th>
              <th className="py-3 px-3 text-right">Acc₅ (≤5m) ↑</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, idx) => {
              const isProposed = row.model.includes("Proposed");
              return (
                <tr
                  key={idx}
                  className={`transition-colors font-mono ${
                    isProposed
                      ? 'bg-blue-500/10 dark:bg-blue-950/40 font-bold text-blue-900 dark:text-blue-200'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <td className="py-3.5 px-4 font-sans font-semibold flex items-center gap-2">
                    {isProposed && <Trophy className="w-4 h-4 text-amber-500" />}
                    <span>{row.model}</span>
                    {isProposed && (
                      <span className="px-2 py-0.5 text-[9px] uppercase font-black rounded-full bg-blue-600 text-white font-sans">
                        Proposed
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">{row.mae.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-right">{row.rmse.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-right">{row.mape.toFixed(1)}%</td>
                  <td className="py-3.5 px-3 text-right">{row.r2.toFixed(2)}</td>
                  <td className="py-3.5 px-3 text-right">{row.acc1 ? `${row.acc1.toFixed(1)}%` : '—'}</td>
                  <td className="py-3.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                    {row.acc3.toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-3 text-right">{row.acc5 ? `${row.acc5.toFixed(1)}%` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Benchmark Visual Comparison Charts */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Visual Benchmark Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive bar comparison across all tested models.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['mae', 'rmse', 'acc3', 'r2'].map((metric) => (
              <button
                key={metric}
                onClick={() => setActiveChartMetric(metric)}
                className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all ${
                  activeChartMetric === metric
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {metric.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="name" stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} />
              <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#cbd5e1',
                  borderRadius: '12px',
                  color: darkMode ? '#f8fafc' : '#0f172a',
                }}
              />
              <Bar
                dataKey={
                  activeChartMetric === 'mae' ? 'MAE' :
                  activeChartMetric === 'rmse' ? 'RMSE' :
                  activeChartMetric === 'acc3' ? 'Acc3' : 'R2'
                }
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
