import React from 'react';
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
  Cell,
} from 'recharts';
import { FlaskConical, CheckCircle2, TrendingDown, Layers, ArrowDown } from 'lucide-react';

export default function AblationChart() {
  const { benchmarks, darkMode } = useBus();

  const ablationData = benchmarks?.ablation_table || [
    {
      configuration: "Sequence Only (GRU)",
      mae: 2.43,
      acc3: 82.7,
      description: "2-layer GRU using only 12-stop delay, travel & dwell sequences",
      delta_mae: "+0.25 min",
      gain_acc3: "-3.7%",
    },
    {
      configuration: "Context Only (MLP)",
      mae: 2.71,
      acc3: 78.1,
      description: "Context encoder using only spatiotemporal context features",
      delta_mae: "+0.53 min",
      gain_acc3: "-8.3%",
    },
    {
      configuration: "Concatenation without Gate",
      mae: 2.29,
      acc3: 84.6,
      description: "Direct linear layer on [h; c] without dynamic gating",
      delta_mae: "+0.11 min",
      gain_acc3: "-1.8%",
    },
    {
      configuration: "Full Gated Fusion (Proposed)",
      mae: 2.18,
      acc3: 86.4,
      description: "Dynamic gate g = σ(Wg[h;c]+bg) fusing h and c",
      delta_mae: "Best (0.00)",
      gain_acc3: "Highest (+86.4%)",
    },
  ];

  const barColors = ['#64748b', '#8b5cf6', '#3b82f6', '#10b981'];

  return (
    <div className="w-full space-y-6">
      {/* Overview Card */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-2">
          <FlaskConical className="w-5 h-5" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Architectural Component Ablation Study
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Systematic ablation isolating the individual contributions of the Recurrent Sequence Encoder (Branch 1), the Spatiotemporal Context Encoder (Branch 2), and the dynamic Gated Fusion Unit.
        </p>

        {/* Ablation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ablationData.map((item, idx) => {
            const isFull = item.configuration.includes("Full Gated");
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isFull
                    ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white">
                      {item.configuration}
                    </span>
                    {isFull && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase">
                        Optimal
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-tight">
                    {item.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700 font-mono">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">MAE:</span>
                    <strong className="text-slate-900 dark:text-white font-bold text-sm">
                      {item.mae.toFixed(2)} min
                    </strong>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-500">Acc₃ (≤3 min):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {item.acc3.toFixed(1)}%
                    </strong>
                  </div>
                  <div className="flex justify-between items-baseline text-[10px]">
                    <span className="text-slate-400">Δ MAE vs Best:</span>
                    <span className={isFull ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                      {item.delta_mae}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MAE Comparison Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            Mean Absolute Error (MAE) by Configuration (Lower is Better ↓)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Full Gated Fusion achieves lowest MAE of 2.18 minutes.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ablationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="configuration" stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 10 }} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} domain={[1.5, 3.0]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: darkMode ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Bar dataKey="mae" name="MAE (Minutes)" radius={[6, 6, 0, 0]}>
                  {ablationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Acc3 Accuracy Comparison Chart */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
            Acc₃ Accuracy (Within ±3 min) by Configuration (Higher is Better ↑)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Gated Fusion achieves highest proportion of passenger-acceptable arrivals (86.4%).
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ablationData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="configuration" stroke={darkMode ? '#94a3b8' : '#64748b'} tick={{ fontSize: 10 }} />
                <YAxis stroke={darkMode ? '#94a3b8' : '#64748b'} domain={[70, 90]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                    borderColor: darkMode ? '#334155' : '#cbd5e1',
                    borderRadius: '12px',
                    color: darkMode ? '#f8fafc' : '#0f172a',
                  }}
                />
                <Bar dataKey="acc3" name="Acc3 (%)" radius={[6, 6, 0, 0]}>
                  {ablationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
