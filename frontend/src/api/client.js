/**
 * REST API Client for Spatiotemporal Bus Delay Prediction System
 */
const API_BASE = 'http://localhost:8000';

export async function fetchRoutes() {
  const res = await fetch(`${API_BASE}/api/routes`);
  if (!res.ok) throw new Error('Failed to fetch routes');
  return res.json();
}

export async function fetchRouteDetails(routeId) {
  const res = await fetch(`${API_BASE}/api/routes/${routeId}`);
  if (!res.ok) throw new Error(`Failed to fetch route ${routeId}`);
  return res.json();
}

export async function fetchLiveVehicles() {
  const res = await fetch(`${API_BASE}/api/live/vehicles`);
  if (!res.ok) throw new Error('Failed to fetch live vehicles');
  return res.json();
}

export async function setStalenessInjection(enable, forcedAge = 120.0) {
  const res = await fetch(`${API_BASE}/api/live/staleness`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enable, forced_age_seconds: forcedAge }),
  });
  if (!res.ok) throw new Error('Failed to update staleness');
  return res.json();
}

export async function controlSimulation(running, trafficMultiplier) {
  const res = await fetch(`${API_BASE}/api/live/simulation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ running, traffic_multiplier: trafficMultiplier }),
  });
  if (!res.ok) throw new Error('Failed to control simulation');
  return res.json();
}

export async function predictVehicleEta(vehicleId) {
  const res = await fetch(`${API_BASE}/api/predict/vehicle/${vehicleId}`);
  if (!res.ok) throw new Error(`Failed to predict ETA for vehicle ${vehicleId}`);
  return res.json();
}

export async function predictStopArrivals(stopId, routeId = null) {
  const url = routeId 
    ? `${API_BASE}/api/predict/stop/${stopId}?route_id=${routeId}`
    : `${API_BASE}/api/predict/stop/${stopId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to predict arrivals for stop ${stopId}`);
  return res.json();
}

export async function fetchAllPredictions() {
  const res = await fetch(`${API_BASE}/api/predict/all`);
  if (!res.ok) throw new Error('Failed to fetch all predictions');
  return res.json();
}

export async function fetchBenchmarks() {
  const res = await fetch(`${API_BASE}/api/analytics/benchmarks`);
  if (!res.ok) throw new Error('Failed to fetch benchmarks');
  return res.json();
}

export async function fetchAblationResults() {
  const res = await fetch(`${API_BASE}/api/analytics/ablation`);
  if (!res.ok) throw new Error('Failed to fetch ablation study');
  return res.json();
}

export async function fetchFeatureImportance() {
  const res = await fetch(`${API_BASE}/api/analytics/feature-importance`);
  if (!res.ok) throw new Error('Failed to fetch feature importance');
  return res.json();
}

export async function fetchArchitectureSpec() {
  const res = await fetch(`${API_BASE}/api/architecture/spec`);
  if (!res.ok) throw new Error('Failed to fetch architecture spec');
  return res.json();
}

export async function fetchMonitoringStatus() {
  const res = await fetch(`${API_BASE}/api/monitoring/status`);
  if (!res.ok) throw new Error('Failed to fetch monitoring status');
  return res.json();
}
