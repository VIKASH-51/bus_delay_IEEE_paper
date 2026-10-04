import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useBus } from '../context/BusContext';
import { Bus, MapPin, Clock, Navigation } from 'lucide-react';

// Custom Map center updater hook
function MapCenterController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

// Create custom colored DivIcons for Leaflet
function createBusIcon(routeShortName, isSelected, status) {
  const isLive = status === 'LIVE';
  const bgColor = isSelected ? '#2563eb' : (isLive ? '#059669' : '#d97706');
  
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        padding: 4px 8px;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid white;
        transform: translate(-50%, -50%);
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <rect x="3" y="3" width="18" height="18" rx="4"/>
          <path d="M3 11h18"/>
          <path d="M8 15h.01"/>
          <path d="M16 15h.01"/>
        </svg>
        <span>${routeShortName}</span>
      </div>
    `,
    iconSize: [40, 24],
    iconAnchor: [20, 12],
  });
}

function createStopIcon(sequence, isSelected) {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        background: ${isSelected ? '#3b82f6' : '#ffffff'};
        color: ${isSelected ? '#ffffff' : '#1e293b'};
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        border: 2px solid ${isSelected ? '#1d4ed8' : '#64748b'};
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        transform: translate(-50%, -50%);
      ">
        ${sequence}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function InteractiveMap({ height = "450px" }) {
  const {
    liveVehicles,
    predictions,
    selectedVehicleId,
    setSelectedVehicleId,
    selectedRouteId,
    routes,
    darkMode,
  } = useBus();

  // Find active vehicle to center map
  const activeVehicle = liveVehicles.find((v) => v.vehicle_id === selectedVehicleId) || liveVehicles[0];
  const centerPos = activeVehicle ? [activeVehicle.latitude, activeVehicle.longitude] : [11.0183, 76.9656];

  // Map Tile layer URLs
  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 relative z-0" style={{ height }}>
      <MapContainer
        center={centerPos}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <MapCenterController center={centerPos} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrl}
        />

        {/* Live Buses Markers */}
        {liveVehicles.map((v) => {
          const isSelected = v.vehicle_id === selectedVehicleId;
          const pred = predictions.find((p) => p.vehicle_id === v.vehicle_id);

          return (
            <Marker
              key={v.vehicle_id}
              position={[v.latitude, v.longitude]}
              icon={createBusIcon(v.route_id, isSelected, v.feed_status)}
              eventHandlers={{
                click: () => setSelectedVehicleId(v.vehicle_id),
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px] text-xs font-sans">
                  <div className="flex items-center justify-between border-b pb-1.5 mb-1.5 border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                      Route {v.route_id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.feed_status === 'LIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {v.feed_status}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                    Approaching: {v.next_stop_name}
                  </p>

                  <div className="grid grid-cols-2 gap-1 my-2 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Predicted ETA</span>
                      <strong className="text-blue-600 dark:text-blue-300">
                        {pred ? pred.predicted_eta_display : 'Calculating...'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Predicted Delay</span>
                      <strong className="text-amber-600 dark:text-amber-400">
                        {pred ? pred.delay_display : `${v.current_delay_min} min`}
                      </strong>
                    </div>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Speed: {v.speed_kmh} km/h</span>
                    <span>Feed age: {v.feed_age_seconds}s</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
