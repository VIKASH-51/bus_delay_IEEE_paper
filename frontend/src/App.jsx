import React from 'react';
import { BusProvider, useBus } from './context/BusContext';
import Navbar from './components/Navbar';
import PassengerHome from './pages/PassengerHome';
import LiveTracking from './pages/LiveTracking';
import RouteDetails from './pages/RouteDetails';
import StopDetails from './pages/StopDetails';
import PredictionAnalytics from './pages/PredictionAnalytics';
import ModelArchitecture from './pages/ModelArchitecture';
import ModelComparison from './pages/ModelComparison';
import AblationStudy from './pages/AblationStudy';
import SystemMonitoring from './pages/SystemMonitoring';
import { Loader2, AlertCircle } from 'lucide-react';

function MainContent() {
  const { activeTab, loading, error } = useBus();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Initializing Spatiotemporal Neural Delay Engine...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl bg-rose-500/10 border border-rose-300 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="font-bold text-base text-rose-900 dark:text-rose-200">
          Unable to Connect to Prediction Engine
        </h3>
        <p className="text-xs text-rose-700 dark:text-rose-300">
          {error}. Ensure the Python FastAPI backend is running on <code>http://localhost:8000</code>.
        </p>
      </div>
    );
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'passenger':
        return <PassengerHome />;
      case 'tracking':
        return <LiveTracking />;
      case 'route_details':
        return <RouteDetails />;
      case 'stop_details':
        return <StopDetails />;
      case 'prediction_analytics':
        return <PredictionAnalytics />;
      case 'model_architecture':
        return <ModelArchitecture />;
      case 'model_comparison':
        return <ModelComparison />;
      case 'ablation_study':
        return <AblationStudy />;
      case 'system_monitoring':
        return <SystemMonitoring />;
      default:
        return <PassengerHome />;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {renderActivePage()}
    </main>
  );
}

export default function App() {
  return (
    <BusProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-blue-500 selection:text-white">
        <Navbar />
        <MainContent />
        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 mt-12 text-center text-xs text-slate-500 dark:text-slate-400 font-sans">
          <p className="font-medium">
            Spatiotemporal Bus Delay Prediction Using Context-Aware Machine Learning for Real-Time Passenger Information
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Two-Branch GRU + Context Gated Fusion Network • GTFS & GTFS-Realtime Integration Architecture
          </p>
        </footer>
      </div>
    </BusProvider>
  );
}
