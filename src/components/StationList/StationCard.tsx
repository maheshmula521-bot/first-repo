import React from 'react';
import { Station } from '../../types/ev';
import { 
  Zap, 
  MapPin, 
  Star, 
  Sparkles, 
  Navigation, 
  Heart, 
  Clock, 
  Coffee, 
  Wifi, 
  ShoppingBag, 
  Utensils, 
  ShieldCheck, 
  Gauge
} from 'lucide-react';

interface StationCardProps {
  station: Station;
  isSelected?: boolean;
  isFavorite?: boolean;
  onSelect: (station: Station) => void;
  onReserve: (station: Station) => void;
  onToggleFavorite: (stationId: string) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isSelected,
  isFavorite,
  onSelect,
  onReserve,
  onToggleFavorite,
}) => {
  const isAvailable = station.stallsAvailable > 0;
  const isFull = station.stallsAvailable === 0;

  const occupancyRatio = (station.stallsAvailable / station.stallsTotal) * 100;

  const getAmenityIcon = (name: string) => {
    switch (name) {
      case 'Coffee': return <Coffee className="w-3 h-3" />;
      case 'Wi-Fi': return <Wifi className="w-3 h-3" />;
      case 'Shopping': return <ShoppingBag className="w-3 h-3" />;
      case 'Dining': return <Utensils className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <div
      onClick={() => onSelect(station)}
      className={`group relative p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
        isSelected
          ? 'bg-slate-900/95 border-cyan-500 shadow-xl shadow-cyan-500/10'
          : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
      }`}
    >
      {/* Top Header: Network & Power & Favorite */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
            {station.network}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border ${
            station.powerMaxKw >= 250
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}>
            <Zap className="w-3 h-3 fill-current" />
            {station.powerMaxKw} kW
          </span>
          {station.isRenewable && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              100% Green
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(station.id);
          }}
          aria-label={isFavorite ? `Remove ${station.name} from favorites` : `Add ${station.name} to favorites`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Station Name & Location */}
      <div className="mb-2.5">
        <div className="flex items-center gap-1.5">
          <h3 className="font-bold text-slate-100 text-base group-hover:text-cyan-300 transition-colors line-clamp-1">
            {station.name}
          </h3>
          {station.hostVerified && (
            <span title="Verified EV Host">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="line-clamp-1">{station.address}, {station.city}</span>
          <span className="font-semibold text-slate-300 shrink-0">• {station.distanceMiles} mi</span>
        </p>
      </div>

      {/* Availability Meter & Live Telemetry */}
      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${
              isAvailable ? 'bg-emerald-400 animate-pulse' : isFull ? 'bg-rose-500' : 'bg-amber-400'
            }`} />
            <span className="font-semibold text-slate-200">
              {isAvailable ? `${station.stallsAvailable} of ${station.stallsTotal} Stalls Free` : 'All Stalls Occupied'}
            </span>
          </div>

          <div className="text-slate-400 text-[11px] font-mono">
            {station.queueLength > 0 ? (
              <span className="text-amber-400 font-semibold">{station.queueLength} in queue ({station.averageWaitMins}m)</span>
            ) : (
              <span className="text-emerald-400 font-semibold">No Queue</span>
            )}
          </div>
        </div>

        {/* Progress Bar of Occupancy */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isAvailable ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-rose-500'
            }`}
            style={{ width: `${occupancyRatio}%` }}
          />
        </div>

        {/* Real Speed & Pricing Mini Stats */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-1" title="Actual delivered charging speed percentage based on driver speed tests">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>Speed Accuracy: <strong className="text-slate-200">{station.actualVsAdvertisedSpeedPercent}%</strong></span>
          </div>
          <div className="text-slate-200 font-bold font-mono">
            ${station.pricePerKwh.toFixed(2)}<span className="text-[10px] text-slate-400 font-normal">/kWh</span>
          </div>
        </div>
      </div>

      {/* Connectors & Amenities */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          {station.connectorTypes.map((c) => (
            <span
              key={c}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">{station.rating}</span>
          <span className="text-[10px] text-slate-500">({station.reviewCount})</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mt-3 pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReserve(station);
          }}
          aria-label={`Reserve a stall at ${station.name}`}
          className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Reserve Stall</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(station);
          }}
          aria-label={`View details for ${station.name}`}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          Details
        </button>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open directions to ${station.name} in Google Maps`}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
          title="GPS Navigation"
        >
          <Navigation className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
