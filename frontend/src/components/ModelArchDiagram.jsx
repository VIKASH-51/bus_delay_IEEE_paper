import React, { useState } from 'react';
import { useBus } from '../context/BusContext';
import {
  Cpu,
  Layers,
  ArrowRight,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  Info,
  Sliders,
  Maximize2,
} from 'lucide-react';

export default function ModelArchDiagram() {
  const [selectedNode, setSelectedNode] = useState('gated_fusion');
  const { selectedVehiclePrediction } = useBus();

  const liveG = selectedVehiclePrediction?.model_breakdown?.gate_weight_g ?? 0.64;
  const seqPct = selectedVehiclePrediction?.model_breakdown?.sequence_weight_pct ?? 64.0;
  const ctxPct = selectedVehiclePrediction?.model_breakdown?.context_weight_pct ?? 36.0;

  const nodeDetails = {
    branch1_seq: {
      title: "Branch 1 – Spatiotemporal Sequence Encoder (GRU)",
      equation: "h_t = \\text{GRU}(X_{\\text{seq}}, h_{t-1}) \\quad \\text{where } X_{\\text{seq}} \\in \\mathbb{R}^{B \\times 12 \\times 3}",
      inputShape: "Batch × 12 stops × 3 features [Delay, Travel Time, Dwell Time]",
      outputShape: "h ∈ ℝ^{B × 64}",
      hyperparameters: "2-Layer GRU, Hidden Size = 64, Dropout = 0.20, Sequence Window = 12 stops",
      explanation: "Captures autoregressive temporal dependencies, upstream delay propagation dynamics, and dwelling variances over the preceding 12 stops along the transit corridor."
    },
    branch2_ctx: {
      title: "Branch 2 – Context Encoder (Dense + ReLU)",
      equation: "c = \\text{ReLU}(W_c \\cdot X_{\\text{ctx}} + b_c) \\quad \\text{where } X_{\\text{ctx}} \\in \\mathbb{R}^{B \\times 14}",
      inputShape: "Batch × 14 context features [Time-of-day, Day of week, Peak flag, Route ID, Headway, Coordinates, etc.]",
      outputShape: "c ∈ ℝ^{B × 64}",
      hyperparameters: "Dense Linear Layer (14 → 64), ReLU Activation, Dropout = 0.20",
      explanation: "Encodes static infrastructure topology and dynamic contextual factors including peak hour traffic congestion, route topology, headway regularity, and geographic coordinates."
    },
    gated_fusion: {
      title: "Gated Fusion Unit (Dynamic Element-Wise Gating)",
      equation: "g = \\sigma(W_g [h; c] + b_g) \\in [0, 1]^{64}, \\quad z = g \\odot h + (1 - g) \\odot c \\in \\mathbb{R}^{64}",
      inputShape: "Concatenation [h; c] ∈ ℝ^{B × 128}",
      outputShape: "Fused representation vector z ∈ ℝ^{B × 64}",
      hyperparameters: "Linear Gate Layer (128 → 64), Sigmoid Activation, Element-wise Convex Combination",
      explanation: "Computes a dynamic gate vector g that adaptively modulates how much weight is assigned to the historical temporal sequence (h) vs. the external spatial/traffic context (c). Under high congestion or schedule recovery, the gate dynamically shifts weights."
    },
    prediction_head: {
      title: "Linear Prediction Head & ETA Formulation",
      equation: "\\hat{y}_{\\text{delay}} = W_{\\text{out}} \\cdot z + b_{\\text{out}}, \\quad \\text{ETA} = T_{\\text{scheduled}} + \\hat{y}_{\\text{delay}}",
      inputShape: "Fused representation z ∈ ℝ^{B × 64}",
      outputShape: "Predicted Delay ∈ ℝ (Minutes), Final Passenger ETA",
      hyperparameters: "Linear Layer (64 → 1), Horizon = 1 stop ahead",
      explanation: "Projects the fused latent representation z to predict arrival delay in minutes, then adds the delay to the GTFS static timetable arrival time to produce the final passenger ETA."
    }
  };

  const current = nodeDetails[selectedNode] || nodeDetails.gated_fusion;

  return (
    <div className="w-full space-y-6">
      {/* Diagram Canvas */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <div className="min-w-[700px] flex flex-col items-center space-y-6">
          
          {/* Top Level: Dual Input Sources */}
          <div className="grid grid-cols-2 gap-8 w-full">
            {/* Input 1 */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                Input Stream 1
              </span>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100 font-mono">
                Delay Window (Last 12 Stops)
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">[Delay, Travel Time, Dwell Time]</span>
            </div>

            {/* Input 2 */}
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                Input Stream 2
              </span>
              <p className="font-bold text-xs text-slate-900 dark:text-slate-100 font-mono">
                Spatiotemporal Context (14 Features)
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">[Time, Peak, Headway, Coords, Progress]</span>
            </div>
          </div>

          {/* Level 2: Dual Encoders */}
          <div className="grid grid-cols-2 gap-8 w-full">
            {/* Branch 1 Encoder Node */}
            <button
              onClick={() => setSelectedNode('branch1_seq')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedNode === 'branch1_seq'
                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 scale-[1.02]'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-blue-400 dark:hover:border-blue-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> Branch 1: Sequence Encoder
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/20 text-white">
                  2-Layer GRU
                </span>
              </div>
              <p className="text-xs opacity-90 mb-2">
                Hidden size: 64 • Dropout: 0.20
              </p>
              <div className="p-2 rounded bg-black/20 font-mono text-[11px] text-center font-bold">
                Representation Vector h ∈ ℝ⁶⁴
              </div>
            </button>

            {/* Branch 2 Encoder Node */}
            <button
              onClick={() => setSelectedNode('branch2_ctx')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedNode === 'branch2_ctx'
                  ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400 scale-[1.02]'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-indigo-400 dark:hover:border-indigo-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Branch 2: Context Encoder
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/20 text-white">
                  Dense + ReLU
                </span>
              </div>
              <p className="text-xs opacity-90 mb-2">
                Linear (14 → 64) • ReLU • Dropout 0.20
              </p>
              <div className="p-2 rounded bg-black/20 font-mono text-[11px] text-center font-bold">
                Representation Vector c ∈ ℝ⁶⁴
              </div>
            </button>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-400" />

          {/* Level 3: Gated Fusion Unit */}
          <button
            onClick={() => setSelectedNode('gated_fusion')}
            className={`w-full p-5 rounded-2xl border text-left transition-all relative ${
              selectedNode === 'gated_fusion'
                ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-xl ring-2 ring-blue-400 scale-[1.01]'
                : 'bg-slate-900 text-white hover:border-blue-400 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-sm text-white">
                  Gated Fusion Unit: Dynamic Combination z = g·h + (1-g)·c
                </span>
              </div>
              <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                Gate g = σ(W_g [h; c] + b_g)
              </span>
            </div>

            {/* Dynamic Gate live balance meter */}
            <div className="p-3 bg-black/40 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-white">
                <span>Sequence Weight (g): <strong>{seqPct}%</strong></span>
                <span>Context Weight (1-g): <strong>{ctxPct}%</strong></span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex border border-white/10">
                <div className="bg-blue-400 h-full" style={{ width: `${seqPct}%` }} />
                <div className="bg-indigo-400 h-full" style={{ width: `${ctxPct}%` }} />
              </div>
            </div>
          </button>

          <ArrowDown className="w-5 h-5 text-slate-400" />

          {/* Level 4: Linear Prediction Head */}
          <button
            onClick={() => setSelectedNode('prediction_head')}
            className={`w-full max-w-xl p-4 rounded-xl border text-center transition-all ${
              selectedNode === 'prediction_head'
                ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-emerald-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="font-bold text-xs uppercase tracking-wider block mb-1">
              Linear Head & ETA Formulator
            </span>
            <p className="font-mono text-xs font-semibold mb-1">
              Predicted Delay = W_out · z + b_out
            </p>
            <div className="p-2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-sm font-black inline-block mt-1">
              ETA = Scheduled Arrival Time + Predicted Delay
            </div>
          </button>
        </div>
      </div>

      {/* Layer Detail Inspector */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
          <Info className="w-4 h-4" />
          <span>{current.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block">
              Mathematical Formulation
            </span>
            <p className="font-mono text-slate-900 dark:text-slate-100 font-semibold bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
              {current.equation}
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block">
              Tensor Input & Output Shapes
            </span>
            <p className="text-slate-800 dark:text-slate-200 font-mono">
              <strong>In:</strong> {current.inputShape}
            </p>
            <p className="text-slate-800 dark:text-slate-200 font-mono">
              <strong>Out:</strong> {current.outputShape}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200 dark:border-slate-700">
          <strong className="text-slate-900 dark:text-white">Mechanism Rationale: </strong> {current.explanation}
        </div>
      </div>
    </div>
  );
}
