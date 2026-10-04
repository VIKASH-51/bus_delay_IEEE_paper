import React from 'react';
import StatusBanner from '../components/StatusBanner';
import ModelArchDiagram from '../components/ModelArchDiagram';
import {
  Cpu,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  Code2,
  Sliders,
} from 'lucide-react';

export default function ModelArchitecture() {
  const trainingConfig = [
    { param: "Sequence Window Length (L)", value: "12 stops", desc: "Temporal history window of prior delays, travel times, and dwells" },
    { param: "GRU Hidden Size (h)", value: "64 units", desc: "Recurrent latent dimension per layer" },
    { param: "GRU Number of Layers", value: "2 layers", desc: "Stacked Recurrent Neural Network depth" },
    { param: "Context Encoder Output (c)", value: "64 units", desc: "Dense linear projection of 14 spatiotemporal features" },
    { param: "Gated Fusion Dimension (z)", value: "64 units", desc: "Element-wise convex combination z = g⊙h + (1-g)⊙c" },
    { param: "Dropout Rate", value: "0.20", desc: "Regularization applied across recurrent and dense layers" },
    { param: "Composite Loss Function", value: "MAE + 0.5 × MSE", desc: "Balanced loss penalizing large outliers while maintaining linear delay scale" },
    { param: "Optimizer & Learning Rate", value: "Adam (lr = 0.001)", desc: "Adaptive moment estimation optimizer" },
    { param: "Batch Size", value: "128", desc: "Mini-batch size during training" },
    { param: "Early Stopping Patience", value: "7 epochs", desc: "Stops training when validation loss stops improving" },
    { param: "Prediction Horizon", value: "1 stop ahead", desc: "Predicts arrival delay at next consecutive stop" },
    { param: "Data Split Scheme", value: "70% / 15% / 15%", desc: "Strict chronological partitioning with training-only scalers" },
  ];

  return (
    <div className="w-full space-y-6">
      <StatusBanner />

      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <Cpu className="w-5 h-5" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Two-Branch Spatiotemporal Gated Fusion Architecture
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Interactive neural network architecture diagram implementing the exact mathematical formulations, tensor dimensions, and dynamic gating from the research paper.
        </p>
      </div>

      {/* Interactive Neural Architecture Flow Diagram */}
      <ModelArchDiagram />

      {/* Hyperparameters and Training Configuration Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-500" />
            <span>Research Paper Training Configuration & Hyperparameters</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Table 2 & Section 3/4
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {trainingConfig.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 block mb-1">
                  {item.param}
                </span>
                <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-300 block mb-1">
                  {item.value}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
