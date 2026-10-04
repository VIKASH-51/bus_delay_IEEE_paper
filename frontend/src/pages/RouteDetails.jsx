import React, { useState, useEffect } from 'react';
import { useBus } from '../context/BusContext';
import { fetchRouteDetails } from '../api/client';
import StatusBanner from '../components/StatusBanner';
import {
  Route,
  MapPin,
  Clock,
  Bus,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function RouteDetails() {
  const { routes, selectedRouteId, setSelectedRouteId, liveVehicles, predictions } = useBus();
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadRoute() {
      try {
        setLoading(true);
        const data = await fetchRouteDetails(selectedRouteId);
        setRouteData(data);
      } catch (err) {
        console.error('Error fetching route details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRoute();
  }, [selectedRouteId]);

  const stops = routeData?.stops || [];
  const routeMeta = routeData?.route || routes.find((r) => r.route_id === selectedRouteId) || {};
  const activeBuses = liveVehicles.filter((v) => v.route_id === selectedRouteId);

  return (
    <div className="w-full space-y-6">
      <StatusBanner />

      {/* Header & Route Tabs */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
              {routeMeta.route_short_name || selectedRouteId}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {routeMeta.route_long_name || `Corridor ${selectedRouteId}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                GTFS Route ID: {selectedRouteId} • {stops.length} Fixed Transit Stops • {activeBuses.length} Live Buses Active
              </p>
            </div>
          </div>

          {/* Quick Route Selector */}
          <div className="flex items-center space-x-2">
            {routes.map((r) => (
              <button
                key={r.route_id}
                onClick={() => setSelectedRouteId(r.route_id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  r.route_id === selectedRouteId
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {r.route_short_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stop-by-Stop Corridor Progression Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Corridor Stop Progression & Schedule Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stop-by-stop scheduled arrival times with real-time active bus locations.
            </p>
          </div>
        </div>

        <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
          {stops.map((stop, idx) => {
            const seq = idx + 1;
            // Check if any bus is approaching this stop
            const busApproaching = activeBuses.find(
              (b) => b.next_stop_id === stop.stop_id || b.current_stop_id === stop.stop_id
            );

            return (
              <div
                key={stop.stop_id}
                className={`p-4 rounded-xl border relative z-10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  busApproaching
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono shadow-sm flex-shrink-0 ${
                    busApproaching
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}>
                    {seq}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {stop.stop_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Stop ID: {stop.stop_id} • GPS: ({Number(stop.stop_lat).toFixed(4)}, {Number(stop.stop_lon).toFixed(4)})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                  {busApproaching && (
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold animate-pulse">
                      <Bus className="w-3.5 h-3.5" />
                      <span>{busApproaching.vehicle_id} Approaching</span>
                    </div>
                  )}

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Scheduled Departure
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                      {stop.departure_time || '06:42:00'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
