import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  fetchRoutes,
  fetchLiveVehicles,
  fetchAllPredictions,
  fetchBenchmarks,
  fetchMonitoringStatus,
  setStalenessInjection,
} from '../api/client';

const BusContext = createContext();

export function BusProvider({ children }) {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState('21A');
  const [selectedVehicleId, setSelectedVehicleId] = useState('BUS_21A_101');
  const [selectedStopId, setSelectedStopId] = useState('STP_01');
  
  const [liveVehicles, setLiveVehicles] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [benchmarks, setBenchmarks] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  
  const [feedStatus, setFeedStatus] = useState('LIVE');
  const [feedAge, setFeedAge] = useState(8);
  const [isFallback, setIsFallback] = useState(false);
  const [isStaleInjected, setIsStaleInjected] = useState(false);
  
  const [activeTab, setActiveTab] = useState('passenger'); // passenger | tracking | route_details | stop_details | prediction_analytics | model_architecture | model_comparison | ablation_study | system_monitoring
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial Data Load
  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const [routesData, benchmarksData, monitorData] = await Promise.allSettled([
          fetchRoutes(),
          fetchBenchmarks(),
          fetchMonitoringStatus(),
        ]);

        if (routesData.status === 'fulfilled' && routesData.value.routes) {
          setRoutes(routesData.value.routes);
          if (routesData.value.routes.length > 0) {
            setSelectedRouteId(routesData.value.routes[0].route_id);
          }
        }
        if (benchmarksData.status === 'fulfilled') {
          setBenchmarks(benchmarksData.value);
        }
        if (monitorData.status === 'fulfilled' && monitorData.value.monitoring) {
          setMonitoring(monitorData.value.monitoring);
          setFeedStatus(monitorData.value.monitoring.feed_status);
          setFeedAge(monitorData.value.monitoring.feed_age_seconds);
          setIsFallback(monitorData.value.monitoring.is_fallback_active);
          setIsStaleInjected(monitorData.value.monitoring.is_stale_injected);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  // Real-time Polling Loop for live telemetry & predictions (every 2.5s)
  const pollLiveTelemetry = useCallback(async () => {
    try {
      const [vehRes, predRes, monRes] = await Promise.allSettled([
        fetchLiveVehicles(),
        fetchAllPredictions(),
        fetchMonitoringStatus(),
      ]);

      if (vehRes.status === 'fulfilled' && vehRes.value.vehicles) {
        setLiveVehicles(vehRes.value.vehicles);
        setFeedStatus(vehRes.value.feed_status);
        setFeedAge(vehRes.value.feed_age_seconds);
        setIsFallback(vehRes.value.is_fallback);
        setIsStaleInjected(vehRes.value.is_stale_injected);
      }

      if (predRes.status === 'fulfilled' && predRes.value.predictions) {
        setPredictions(predRes.value.predictions);
      }

      if (monRes.status === 'fulfilled' && monRes.value.monitoring) {
        setMonitoring(monRes.value.monitoring);
      }
    } catch (err) {
      console.warn('Telemetry poll error:', err);
    }
  }, []);

  useEffect(() => {
    pollLiveTelemetry();
    const interval = setInterval(pollLiveTelemetry, 2500);
    return () => clearInterval(interval);
  }, [pollLiveTelemetry]);

  // Handle staleness toggle
  const toggleStaleness = async (enable) => {
    try {
      const res = await setStalenessInjection(enable, enable ? 120.0 : 0.0);
      setIsStaleInjected(res.is_stale_injected);
      setFeedAge(res.feed_age_seconds);
      setFeedStatus(res.feed_status);
      await pollLiveTelemetry();
    } catch (err) {
      console.error('Failed to toggle staleness:', err);
    }
  };

  const selectedVehiclePrediction = predictions.find(
    (p) => p.vehicle_id === selectedVehicleId
  ) || predictions[0] || null;

  return (
    <BusContext.Provider
      value={{
        routes,
        selectedRouteId,
        setSelectedRouteId,
        selectedVehicleId,
        setSelectedVehicleId,
        selectedStopId,
        setSelectedStopId,
        liveVehicles,
        predictions,
        selectedVehiclePrediction,
        benchmarks,
        monitoring,
        feedStatus,
        feedAge,
        isFallback,
        isStaleInjected,
        toggleStaleness,
        activeTab,
        setActiveTab,
        darkMode,
        setDarkMode,
        loading,
        error,
        refreshData: pollLiveTelemetry,
      }}
    >
      {children}
    </BusContext.Provider>
  );
}

export function useBus() {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBus must be used within a BusProvider');
  }
  return context;
}
