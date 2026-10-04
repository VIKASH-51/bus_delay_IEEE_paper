import React, { useState, useEffect } from 'react';
import { useBus } from '../context/BusContext';
import { predictStopArrivals, fetchRouteDetails } from '../api/client';
import StatusBanner from '../components/StatusBanner';
import {
  Clock,
  MapPin,
  Bus,
  ArrowRight,
  Radio,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function StopDetails() {
  const { routes, selectedRouteId, liveVehicles, predictions, feedStatus } = useBus();
  const [selectedStop, setSelectedStop] = useState({
    stop_id: 'STP_01',
    stop_name: 'Gandhipuram Central Bus Terminus',
    stop_lat: 11.0183,
    stop_lon: 76.9656,
  });
  const [stopArrivals, setStopArrivals] = useState([]);
  const [loading, setLoading] = useState(false);

  // Available stops list
  const availableStops = [
    { stop_id: 'STP_01', stop_name: 'Gandhipuram Central Bus Terminus', route: '21A' },
    { stop_id: 'STP_02', stop_name: 'Cross Cut Road Commercial Hub', route: '21A' },
    { stop_id: 'STP_06', stop_name: 'Railway Station Main Gate', route: '21A' },
    { stop_id: 'STP_14', stop_name: 'Ukkadam Central Bus Stand', route: '21A' },
    { stop_id: 'STP_20', stop_name: 'TIDEL Park IT Special Zone', route: '45B' },
    { stop_id: 'STP_22', stop_name: 'Airport Terminal 1', route: '45B' },
    { stop_id: 'STP_28', stop_name: 'PSG Tech Campus Gate', route: '45B' },
    { stop_id: 'STP_40', stop_name: 'Vadavalli Bus Terminal', route: '12C' },
    { stop_id: 'STP_44', stop_name: 'RS Puram Post Office', route: '12C' },
    { stop_id: 'STP_60', stop_name: 'Saravanampatti IT Corridor', route: '78' },
  ];

  useEffect(() => {
    async function loadArrivals() {
      try {
        setLoading(true);
        const data = await predictStopArrivals(selectedStop.stop_id);
        if (data.arrivals) {
          setStopArrivals(data.arrivals);
        }
      } catch (err) {
        console.error('Error fetching stop arrivals:', err);
      } finally {
        setLoading(false);
      }
    }
    loadArrivals();
  }, [selectedStop, predictions]);

  return (
    <div className="w-full space-y-6">
      <StatusBanner />

      {/* Stop Information Board Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                Passenger Timetable Board
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {selectedStop.stop_name}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Station Code: {selectedStop.stop_id}
              </p>
            </div>
          </div>

          {/* Stop Selector Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Switch Stop:</span>
            <select
              value={selectedStop.stop_id}
              onChange={(e) => {
                const match = availableStops.find((s) => s.stop_id === e.target.value);
                if (match) setSelectedStop(match);
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              {availableStops.map((s) => (
                <option key={s.stop_id} value={s.stop_id}>
                  {s.stop_name} (Route {s.route})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Live Digital Station Departures Board */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Upcoming Real-Time Bus Arrivals</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Auto-refreshing live
          </span>
        </div>

        {stopArrivals.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Bus className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active buses currently approaching this stop.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stopArrivals.map((arr, idx) => {
              const isLate = arr.predicted_delay_min > 0.5;

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-blue-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-black text-sm font-mono shadow-sm">
                      {arr.route_short_name || arr.route_id}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {arr.route_long_name || `Corridor ${arr.route_id}`}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Vehicle: {arr.vehicle_id} • Approaching: {arr.next_stop_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Scheduled
                      </span>
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                        {arr.scheduled_arrival_display}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">
                        Predicted ETA
                      </span>
                      <span className="font-mono text-base font-black text-blue-600 dark:text-blue-300">
                        {arr.predicted_eta_display}
                      </span>
                    </div>

                    <div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-sm ${
                        isLate ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        {arr.delay_display}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
