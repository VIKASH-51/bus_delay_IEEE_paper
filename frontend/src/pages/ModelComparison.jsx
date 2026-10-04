import React from 'react';
import StatusBanner from '../components/StatusBanner';
import BenchmarkTable from '../components/BenchmarkTable';
import {
  Layers,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Award,
} from 'lucide-react';

export default function ModelComparison() {
  return (
    <div className="w-full space-y-6">
      <StatusBanner />

      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <Trophy className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Model Benchmarks & Comparative Performance Analysis
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Comprehensive empirical benchmark evaluation across classical baselines, ensemble models, recurrent neural networks, and the proposed Spatiotemporal Gated Fusion Model.
        </p>
      </div>

      {/* Benchmark Table and Bar Charts */}
      <BenchmarkTable />
    </div>
  );
}
