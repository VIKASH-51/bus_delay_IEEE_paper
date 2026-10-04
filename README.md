# Spatiotemporal Bus Delay Prediction System

### Context-Aware Machine Learning for Real-Time Passenger Information

This repository is a production-grade implementation of the research paper **“Spatiotemporal Bus Delay Prediction Using Context-Aware Machine Learning for Real-Time Passenger Information.”**

---

## 🌟 Core Architecture & Innovation

1. **Branch 1 – Sequence Encoder ($h$):**
   - 2-layer GRU with 64 hidden units and 0.20 dropout
   - Models the preceding 12 stops history: $[ \text{Delay}, \text{Segment Travel Time}, \text{Dwell Time} ]$
   - Captures upstream delay momentum and autoregressive propagation dynamics.

2. **Branch 2 – Context Encoder ($c$):**
   - Dense linear layer (14 $\to$ 64) with ReLU activation and 0.20 dropout
   - Encodes time of day, day of week, weekend/peak congestion flags, route topology, direction, headway regularity, stop sequence, and GPS coordinates.

3. **Gated Fusion Unit ($z$):**
   - Dynamic element-wise gate:
     $$g = \sigma(W_g [h; c] + b_g) \in [0, 1]^{64}$$
   - Convex combination representation:
     $$z = g \odot h + (1 - g) \odot c \in \mathbb{R}^{64}$$
   - Adaptively balances sequential history against sudden external traffic congestion.

4. **Linear Prediction Head & Passenger ETA:**
   - $\hat{y}_{\text{delay}} = W_{\text{out}} \cdot z + b_{\text{out}}$ (predicted delay in minutes)
   - $\text{ETA} = \text{Scheduled Arrival Time} + \hat{y}_{\text{delay}}$

5. **Online Prediction Path & Automated Fallback:**
   - Live stream freshness monitoring: if feed age $> 90$s, automatically fails over to the historical schedule baseline with a prominent **`NOT LIVE`** indicator.

---

## 📊 Benchmark Results (Chronological Test Set)

| Model Architecture | MAE (min) | RMSE (min) | MAPE (%) | $R^2$ | $\text{Acc}_1$ ($\le 1\text{m}$) | $\text{Acc}_3$ ($\le 3\text{m}$) | $\text{Acc}_5$ ($\le 5\text{m}$) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Historical Average** | 3.42 | 4.91 | 18.6% | 0.71 | 38.5% | 68.2% | 85.1% |
| **Linear Regression** | 3.08 | 4.46 | 16.9% | 0.76 | 43.1% | 72.6% | 88.4% |
| **Random Forest** | 2.74 | 4.02 | 15.1% | 0.81 | 49.8% | 77.9% | 91.2% |
| **XGBoost Regressor** | 2.51 | 3.71 | 13.8% | 0.84 | 54.2% | 81.5% | 93.6% |
| **Standard GRU** | 2.43 | 3.58 | 13.4% | 0.85 | 56.1% | 82.7% | 94.3% |
| **Proposed Gated Fusion** | **2.18** | **3.29** | **12.1%** | **0.89** | **62.4%** | **86.4%** | **96.2%** |

---

## 🔬 Ablation Study

| Architecture Variant | MAE (min) | $\text{Acc}_3$ (%) | $\Delta \text{MAE}$ vs Proposed |
| :--- | :---: | :---: | :---: |
| **Sequence Only (GRU)** | 2.43 | 82.7% | +0.25 min |
| **Context Only (MLP)** | 2.71 | 78.1% | +0.53 min |
| **Concatenation without Gate** | 2.29 | 84.6% | +0.11 min |
| **Full Gated Fusion (Proposed)** | **2.18** | **86.4%** | **Optimal** |

---

## 🚀 Quick Start Guide

### 1. Launch Python FastAPI Backend
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Base: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### 2. Launch React + Vite Frontend
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: `http://localhost:5173/`

---

## 📁 9 Interactive System Modules

1. **Passenger Home**: Clean ETA cards, quick route and stop search, active bus selector, live/fallback indicators.
2. **Live Bus Tracking**: Interactive Leaflet corridor map with live moving buses, speedometers, and delay popups.
3. **Route Details**: Stop-by-stop schedule vs predicted timeline and active corridor bus locations.
4. **Stop Details**: Live digital station departure board with real-time arrival countdowns.
5. **Prediction Analytics**: Residual error histogram, sub-minute proximity metrics, and context feature importance.
6. **Model Architecture**: Interactive Two-Branch Gated Fusion neural net visualizer with tensor dimensions and mathematical formulas.
7. **Model Comparison**: Table 1 benchmarks and interactive comparative bar charts.
8. **Ablation Study**: Empirical impact analysis isolating Sequence GRU, Context MLP, and Gated Fusion.
9. **System Monitoring**: GTFS-RT feed health, staleness injection test buttons, unmatched trip counters, and end-to-end data pipeline workflow.
