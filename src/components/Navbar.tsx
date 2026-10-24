import React from 'react';
import { Vehicle } from '../types/ev';
import { 
  Zap, 
  Navigation, 
  Activity, 
  Cpu, 
  Sliders, 
  ShieldCheck, 
  Calendar,
  Lock
} from 'lucide-react';

export type NavTab = 'explore' | 'trip-planner' | 'community' | 'user-hub' | 'operator' | 'privacy';

interface NavbarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (vehicleId: string) => void;
  reservationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  reservationsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d14]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo - Minimal Industrial */}
        <div 
          onClick={() => onChangeTab('explore')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-wider uppercase text-slate-100 flex items-center gap-1">
              <span>Volt</span>
              <span className="text-cyan-400">Pulse</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Grid Telemetry</div>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) - No pill shape, no purple */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-lg bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => onChangeTab('explore')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'explore'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Stations</span>
          </button>

          <button
            onClick={() => onChangeTab('trip-planner')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'trip-planner'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Route Planner</span>
          </button>

          <button
            onClick={() => onChangeTab('community')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>Diagnostics Log</span>
          </button>

          <button
            onClick={() => onChangeTab('user-hub')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'user-hub'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Driver Console</span>
            {reservationsCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => onChangeTab('operator')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'operator'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Host Portal</span>
          </button>

          <button
            onClick={() => onChangeTab('privacy')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Privacy</span>
          </button>
        </nav>

        {/* Right Action: Vehicle Selector Pill replaced with clean engineering select */}
        <div className="flex items-center gap-2">
          {/* Vehicle Dropdown */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Vehicle:</span>
            <select
              value={selectedVehicleId}
              onChange={(e) => onSelectVehicle(e.target.value)}
              aria-label="Select active vehicle"
              className="bg-transparent text-slate-200 font-mono font-medium focus:outline-none cursor-pointer appearance-none pr-1"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-slate-200">
                  {v.make} {v.model} ({v.batteryCapacityKwh}kWh)
                </option>
              ))}
            </select>
          </div>

          {/* Reservations Counter */}
          <button
            onClick={() => onChangeTab('user-hub')}
            aria-label="View user reservations"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-xs">{reservationsCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar - Clean rectangular buttons */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-slate-800 bg-[#090d14]">
        <button
          onClick={() => onChangeTab('explore')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold ${
            activeTab === 'explore' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Stations</span>
        </button>
        <button
          onClick={() => onChangeTab('trip-planner')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold ${
            activeTab === 'trip-planner' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Routes</span>
        </button>
        <button
          onClick={() => onChangeTab('community')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold ${
            activeTab === 'community' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Logs</span>
        </button>
        <button
          onClick={() => onChangeTab('user-hub')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold ${
            activeTab === 'user-hub' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Console</span>
        </button>
        <button
          onClick={() => onChangeTab('operator')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold ${
            activeTab === 'operator' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Host</span>
        </button>
        <button
          onClick={() => onChangeTab('privacy')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold ${
            activeTab === 'privacy' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Privacy</span>
        </button>
      </div>
    </header>
  );
};
