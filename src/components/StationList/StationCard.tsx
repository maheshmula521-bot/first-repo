import React from 'react';
import { Station } from '../../types/ev';
import { 
  Zap, 
  MapPin, 
  Navigation, 
  Heart, 
  Gauge,
  CheckCircle,
  Activity
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

  return (
    <div
      onClick={() => onSelect(station)}
      className={`group relative p-3.5 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? 'bg-slate-900 border-cyan-500 shadow-sm'
          : 'bg-[#0d121c] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      {/* Header: Network & Power & Favorite */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {station.network}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" />
            {station.powerMaxKw} kW
          </span>
          {station.isRenewable && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900/50">
              100% Clean Grid
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(station.id);
          }}
          aria-label={isFavorite ? `Remove ${station.name} from favorites` : `Add ${station.name} to favorites`}
          className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Station Name & Location */}
      <div className="mb-2">
        <h3 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-400 transition-colors line-clamp-1">
          {station.name}
        </h3>
        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="line-clamp-1">{station.address}, {station.city}</span>
          <span className="text-slate-500 shrink-0">• {station.distanceMiles} mi</span>
        </p>
      </div>

      {/* Availability Meter & Real Telemetry */}
      <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 mb-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              isAvailable ? 'bg-emerald-400' : isFull ? 'bg-rose-500' : 'bg-amber-400'
            }`} />
            <span className="text-slate-200">
              {isAvailable ? `${station.stallsAvailable}/${station.stallsTotal} Stalls Open` : 'Occupied'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            {station.queueLength > 0 ? (
              <span className="text-amber-400">{station.queueLength} queued ({station.averageWaitMins}m)</span>
            ) : (
              <span className="text-slate-500">Zero Wait</span>
            )}
          </div>
        </div>

        {/* Progress Bar of Occupancy */}
        <div className="w-full h-1 bg-slate-800 rounded-sm overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            style={{ width: `${occupancyRatio}%` }}
          />
        </div>

        {/* Technical Speed & Pricing */}
        <div className="flex items-center justify-between pt-0.5 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" />
            <span>Efficiency: {station.actualVsAdvertisedSpeedPercent}%</span>
          </div>
          <div className="text-slate-200 font-bold">
            ${station.pricePerKwh.toFixed(2)}/kWh
          </div>
        </div>
      </div>

      {/* Connectors & Reliability */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1">
          {station.connectorTypes.map((c) => (
            <span
              key={c}
              className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
            >
              {c}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 text-slate-400 text-[11px] font-mono">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span>99.8% Online</span>
        </div>
      </div>

      {/* Action Buttons - Rectangular, zero pill */}
      <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-800/60">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReserve(station);
          }}
          aria-label={`Reserve stall at ${station.name}`}
          className="flex-1 py-1.5 px-2.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors flex items-center justify-center gap-1"
        >
          <Zap className="w-3 h-3 fill-current" />
          <span>Reserve Stall</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(station);
          }}
          aria-label={`View details for ${station.name}`}
          className="py-1.5 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
        >
          Details
        </button>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open directions to ${station.name} in Google Maps`}
          className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
          title="GPS Navigation"
        >
          <Navigation className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
