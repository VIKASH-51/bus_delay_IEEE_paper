import React from 'react';
import { useBus } from '../context/BusContext';
import {
  Bus,
  Activity,
  MapPin,
  Route,
  BarChart3,
  Cpu,
  Layers,
  FlaskConical,
  ShieldCheck,
  Sun,
  Moon,
  Radio,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    darkMode,
    setDarkMode,
    feedStatus,
    feedAge,
    isFallback,
    isStaleInjected,
    toggleStaleness,
  } = useBus();

  const navItems = [
    { id: 'passenger', label: 'Passenger Home', icon: Bus, group: 'passenger' },
    { id: 'tracking', label: 'Live Tracking', icon: MapPin, group: 'passenger' },
    { id: 'route_details', label: 'Route Details', icon: Route, group: 'passenger' },
    { id: 'stop_details', label: 'Stop Timetable', icon: Clock, group: 'passenger' },
    { id: 'prediction_analytics', label: 'Prediction Analytics', icon: BarChart3, group: 'research' },
    { id: 'model_architecture', label: 'Model Architecture', icon: Cpu, group: 'research' },
    { id: 'model_comparison', label: 'Model Benchmarks', icon: Layers, group: 'research' },
    { id: 'ablation_study', label: 'Ablation Study', icon: FlaskConical, group: 'research' },
    { id: 'system_monitoring', label: 'System Health', icon: ShieldCheck, group: 'system' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('passenger')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight font-sans">
                  Spatiotemporal<span className="text-blue-500">ETA</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                  ML-RTIS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Context-Aware Gated Fusion Real-Time Information System
              </p>
            </div>
          </div>

          {/* Center Telemetry Pill */}
          <div className="hidden md:flex items-center space-x-3 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/60 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${
                isFallback ? 'bg-amber-500 animate-pulse' : (feedStatus === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400')
              }`} />
              <span className={`font-semibold ${
                isFallback ? 'text-amber-600 dark:text-amber-400' : (feedStatus === 'LIVE' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500')
              }`}>
                {isFallback ? 'FALLBACK ACTIVE' : feedStatus}
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
              <Radio className="w-3.5 h-3.5 text-blue-500" />
              <span>Feed Age: <strong className="font-mono text-slate-800 dark:text-slate-100">{feedAge}s</strong></span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <button
              onClick={() => toggleStaleness(!isStaleInjected)}
              className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                isStaleInjected
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
              }`}
              title="Click to toggle feed staleness and test fallback"
            >
              {isStaleInjected ? 'Stale Injected (Reset)' : 'Test Staleness Fallback'}
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
