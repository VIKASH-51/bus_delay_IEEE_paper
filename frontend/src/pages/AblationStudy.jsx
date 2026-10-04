import React from 'react';
import StatusBanner from '../components/StatusBanner';
import AblationChart from '../components/AblationChart';
import {
  FlaskConical,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function AblationStudy() {
  return (
    <div className="w-full space-y-6">
      <StatusBanner />

      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <FlaskConical className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Architecture Component Ablation Experimentation
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Quantifying the empirical impact of the Sequence GRU Branch, the Context Encoder, and the dynamic Gated Fusion Unit on delay estimation precision.
        </p>
      </div>

      {/* Ablation Chart and Comparison Cards */}
      <AblationChart />

      {/* Architectural Insights Box */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Key Research Findings from Ablation Analysis</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              1. Sequence Memory Necessity
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Without the 12-stop recurrent GRU sequence, MAE degrades significantly from 2.18 to 2.71 min (+0.53 min), confirming that transit delay propagation exhibits strong autoregressive momentum.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              2. Context Adaptation
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Without spatial coordinates, headway, and peak congestion flags, the Sequence-only model experiences higher variance (MAE 2.43 min), failing during sudden traffic bottlenecks.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">
              3. Gated Fusion Superiority
            </span>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Dynamic element-wise gating <code>g = σ(Wg[h;c]+bg)</code> outperforms static concatenation (2.18 vs 2.29 min), dynamically prioritizing context during peak delays and history during steady transit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
