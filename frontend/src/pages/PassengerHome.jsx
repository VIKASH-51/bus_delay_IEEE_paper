import React, { useState } from 'react';
import { useBus } from '../context/BusContext';
import EtaCard from '../components/EtaCard';
import StatusBanner from '../components/StatusBanner';
import InteractiveMap from '../components/InteractiveMap';
import {
  Bus,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Radio,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function PassengerHome() {
  const {
    routes,
    selectedRouteId,
    setSelectedRouteId,
    selectedVehicleId,
    setSelectedVehicleId,
    liveVehicles,
    predictions,
    selectedVehiclePrediction,
    setActiveTab,
  } = useBus();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter routes based on search query
  const filteredRoutes = routes.filter((r) =>
    r.route_short_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.route_long_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active vehicles on selected route
  const routeVehicles = liveVehicles.filter((v) => v.route_id === selectedRouteId);

  return (
    <div className="w-full space-y-6">
      {/* Top Feed Status & Fallback Notification (Shows banner only if fallback/stale or system badge) */}
      <StatusBanner />

      {/* Hero Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Bus className="w-96 h-96 -mr-16" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Spatiotemporal Delay Prediction Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2 text-white">
            Real-Time Bus Arrivals & Accurate ETAs
          </h1>
          <p className="text-sm text-blue-100 leading-relaxed mb-6">
            Powered by two-branch gated recurrent neural networks learning temporal congestion, passenger dwell variances, and transit topology.
          </p>

          {/* Quick Route & Stop Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search route number, corridor name, or destination..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm shadow-lg font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Left ETA & Bus Selectors / Right Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real-time ETA Card & Route Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Clean Passenger ETA Card */}
          <EtaCard
            prediction={selectedVehiclePrediction}
            onSelectVehicle={setSelectedVehicleId}
          />

          {/* Route Selector Pills */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-blue-500" />
                <span>Select Active Route</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {filteredRoutes.length} Available Corridors
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {filteredRoutes.map((r) => {
                const isSelected = r.route_id === selectedRouteId;
                return (
                  <button
                    key={r.route_id}
                    onClick={() => {
                      setSelectedRouteId(r.route_id);
                      const matchingV = liveVehicles.find((v) => v.route_id === r.route_id);
                      if (matchingV) setSelectedVehicleId(matchingV.vehicle_id);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 font-bold border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="block text-base font-black">
                      {r.route_short_name}
                    </span>
                    <span className={`text-[10px] truncate block font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {r.route_long_name.split('-')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buses Active on this Corridor */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-500" />
                <span>Active Buses on Route {selectedRouteId}</span>
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                {routeVehicles.length} Buses Live
              </span>
            </div>

            <div className="space-y-2">
              {routeVehicles.map((v) => {
                const isSelected = v.vehicle_id === selectedVehicleId;
                const pred = predictions.find((p) => p.vehicle_id === v.vehicle_id);

                return (
                  <div
                    key={v.vehicle_id}
                    onClick={() => setSelectedVehicleId(v.vehicle_id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`px-2.5 py-1.5 rounded-lg font-bold text-xs font-mono ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                      }`}>
                        {v.vehicle_id.split('_').slice(1).join('_')}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">
                          Next: {v.next_stop_name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Progress: {Math.round(v.trip_progress * 100)}% • Speed: {v.speed_kmh} km/h
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-300 block">
                        {pred ? pred.predicted_eta_display : 'ETA...'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        v.current_delay_min > 2 ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      }`}>
                        {pred ? pred.delay_display : `${v.current_delay_min}m`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Corridor Map (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Live Corridor Map</span>
              </span>
              <button
                onClick={() => setActiveTab('tracking')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Full Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <InteractiveMap height="420px" />
          </div>

          {/* Research Highlight Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-blue-950/30 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>Gated Fusion Advantage</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Unlike traditional GPS extrapolation or static timetable schedules, our Two-Branch Gated Fusion Model dynamically balances 12-stop delay history with real-time peak hour congestion, achieving a <strong>2.18 min MAE</strong> and <strong>86.4% Acc₃ accuracy</strong>.
            </p>
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setActiveTab('model_comparison')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View Benchmarks →
              </button>
              <button
                onClick={() => setActiveTab('model_architecture')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Explore Architecture →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
