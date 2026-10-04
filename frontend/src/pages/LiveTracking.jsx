import React from 'react';
import { useBus } from '../context/BusContext';
import InteractiveMap from '../components/InteractiveMap';
import StatusBanner from '../components/StatusBanner';
import EtaCard from '../components/EtaCard';
import {
  MapPin,
  Bus,
  Gauge,
  Activity,
  Layers,
  Sparkles,
  Sliders,
  Radio,
} from 'lucide-react';

export default function LiveTracking() {
  const {
    liveVehicles,
    selectedVehicleId,
    setSelectedVehicleId,
    selectedRouteId,
    setSelectedRouteId,
    routes,
    predictions,
    selectedVehiclePrediction,
  } = useBus();

  const selectedVehicle = liveVehicles.find((v) => v.vehicle_id === selectedVehicleId) || liveVehicles[0];

  return (
    <div className="w-full space-y-6">
      <StatusBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-500" />
            <span>Live Spatiotemporal Bus Tracking</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time GPS vehicle positions, instantaneous velocities, and online ETA delay estimates.
          </p>
        </div>

        {/* Route Selector Dropdown */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Filter Route:</span>
          <select
            value={selectedRouteId}
            onChange={(e) => {
              setSelectedRouteId(e.target.value);
              const firstBus = liveVehicles.find((v) => v.route_id === e.target.value);
              if (firstBus) setSelectedVehicleId(firstBus.vehicle_id);
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {routes.map((r) => (
              <option key={r.route_id} value={r.route_id}>
                Route {r.route_short_name} - {r.route_long_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map & Vehicle Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Full-height Interactive Leaflet Map (8 cols) */}
        <div className="lg:col-span-8">
          <InteractiveMap height="600px" />
        </div>

        {/* Vehicle Telemetry & Prediction Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <EtaCard
            prediction={selectedVehiclePrediction}
            onSelectVehicle={setSelectedVehicleId}
          />

          {/* Active Fleet List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Live Fleet Status ({liveVehicles.length} Active Vehicles)
            </span>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {liveVehicles.map((v) => {
                const isSelected = v.vehicle_id === selectedVehicleId;
                const pred = predictions.find((p) => p.vehicle_id === v.vehicle_id);

                return (
                  <div
                    key={v.vehicle_id}
                    onClick={() => setSelectedVehicleId(v.vehicle_id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md font-medium'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:border-blue-400 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-black text-xs font-mono">
                          {v.vehicle_id}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300'
                        }`}>
                          R-{v.route_id}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate max-w-[160px] ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {v.next_stop_name}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`}>
                        {pred ? pred.predicted_eta_display : '...'}
                      </span>
                      <span className={`block text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        {v.speed_kmh} km/h
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
