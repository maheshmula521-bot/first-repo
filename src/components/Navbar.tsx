import React from 'react';
import { Vehicle } from '../types/ev';
import { 
  Zap, 
  MapPin, 
  Navigation, 
  MessageSquare, 
  Car, 
  Building2, 
  Heart, 
  Calendar,
  Radio
} from 'lucide-react';

export type NavTab = 'explore' | 'trip-planner' | 'community' | 'user-hub' | 'operator';

interface NavbarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (vehicleId: string) => void;
  favoritesCount: number;
  reservationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  favoritesCount,
  reservationsCount,
}) => {
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#050811]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onChangeTab('explore')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#050811] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 fill-current animate-pulse" />
            </div>
          </div>
          <div>
            <div className="font-black text-lg text-white tracking-tight flex items-center gap-1.5 leading-none">
              <span>Volt</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Pulse</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">EV Network</span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
          <button
            onClick={() => onChangeTab('explore')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'explore'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Find Stations</span>
          </button>

          <button
            onClick={() => onChangeTab('trip-planner')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'trip-planner'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Trip Planner</span>
          </button>

          <button
            onClick={() => onChangeTab('community')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Community</span>
          </button>

          <button
            onClick={() => onChangeTab('user-hub')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              activeTab === 'user-hub'
                ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-cyan-400" />
            <span>My EV Hub</span>
            {reservationsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => onChangeTab('operator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'operator'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>B2B Portal</span>
          </button>
        </nav>

        {/* Right Action: Vehicle Selector Pill & Badges */}
        <div className="flex items-center gap-2.5">
          {/* Vehicle Dropdown */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <select
              value={selectedVehicleId}
              onChange={(e) => onSelectVehicle(e.target.value)}
              aria-label="Select active vehicle"
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer appearance-none pr-1"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-slate-200">
                  ⚡ {v.make} {v.model} ({v.batteryCapacityKwh}kWh)
                </option>
              ))}
            </select>
          </div>

          {/* Quick Hub Shortcut button */}
          <button
            onClick={() => onChangeTab('user-hub')}
            aria-label="View user reservations and favorites"
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline font-semibold">{reservationsCount} Active</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-slate-800/60 bg-[#050811]">
        <button
          onClick={() => onChangeTab('explore')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold ${
            activeTab === 'explore' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Stations</span>
        </button>
        <button
          onClick={() => onChangeTab('trip-planner')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold ${
            activeTab === 'trip-planner' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Trips</span>
        </button>
        <button
          onClick={() => onChangeTab('community')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold ${
            activeTab === 'community' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Community</span>
        </button>
        <button
          onClick={() => onChangeTab('user-hub')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold ${
            activeTab === 'user-hub' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>My Hub</span>
        </button>
        <button
          onClick={() => onChangeTab('operator')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-bold ${
            activeTab === 'operator' ? 'text-indigo-400' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>B2B</span>
        </button>
      </div>
    </header>
  );
};
