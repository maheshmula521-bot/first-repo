import React, { useState } from 'react';
import { Station, StallInfo } from '../../types/ev';
import { 
  X, 
  Zap, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Navigation, 
  Heart, 
  Share2, 
  CheckCircle2, 
  Car,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';

interface StationDetailModalProps {
  station: Station | null;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (stationId: string) => void;
  onOpenReservation: (station: Station, selectedStall?: StallInfo) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  station,
  isFavorite,
  onClose,
  onToggleFavorite,
  onOpenReservation,
}) => {
  if (!station) return null;

  const [copiedLink, setCopiedLink] = useState(false);

  // Generate stalls if empty
  const stalls: StallInfo[] = station.stalls.length > 0 
    ? station.stalls 
    : Array.from({ length: station.stallsTotal }).map((_, i) => ({
        id: `${station.id}-stall-${i + 1}`,
        stallNumber: `Stall ${i + 1}`,
        connectorType: station.connectorTypes[i % station.connectorTypes.length],
        maxKw: station.powerMaxKw,
        status: i < station.stallsAvailable ? 'available' : 'occupied',
        minsRemaining: i >= station.stallsAvailable ? (i * 7 + 4) : undefined,
      }));

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`Station details for ${station.name}`}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1019] border border-slate-800 rounded-lg overflow-hidden shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {station.network}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {station.powerMaxKw} kW
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onToggleFavorite(station.id)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share station details"
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors relative"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-7 right-0 text-[10px] font-mono font-bold bg-cyan-500 text-slate-950 px-2 py-0.5 rounded shadow whitespace-nowrap">
                  Copied
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Main Info Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{station.name}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{station.address}, {station.city}, {station.state} {station.zip}</span>
                  <span className="text-slate-500">• {station.distanceMiles} mi</span>
                </p>
              </div>

              {/* Status Grid */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Available Stalls</span>
                  <span className="text-base font-bold text-emerald-400">
                    {station.stallsAvailable} / {station.stallsTotal}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Queue Delay</span>
                  <span className="text-base font-bold text-slate-200">
                    {station.averageWaitMins === 0 ? '0 min' : `~${station.averageWaitMins}m`}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Energy Rate</span>
                  <span className="text-base font-bold text-cyan-400">
                    ${station.pricePerKwh.toFixed(2)}/kWh
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase block">Efficiency</span>
                  <span className="text-base font-bold text-emerald-400">
                    {station.actualVsAdvertisedSpeedPercent}%
                  </span>
                </div>
              </div>

              {/* Hardware Specifications */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1.5 pb-1 border-b border-slate-800">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Site Technical Specifications
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                  <div>Grid Interconnect: <strong className="text-slate-200">480V 3-Phase AC</strong></div>
                  <div>OCPP Protocol: <strong className="text-slate-200">v2.0.1 Compliant</strong></div>
                  <div>Peak Delivery: <strong className="text-cyan-400">{station.powerMaxKw} kW DC</strong></div>
                  <div>Isolation Class: <strong className="text-slate-200">Galvanic Class II</strong></div>
                </div>
              </div>
            </div>

            {/* Right Sidebar: One-Tap Reservation Widget */}
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                  <span className="text-xs font-mono uppercase text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Reserve Stall
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">Active Ready</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Lock a specific charging bay before arrival. Receive a 4-digit PIN to authenticate the dispenser handle.
                </p>

                <div className="space-y-2 mb-3 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Hold Buffer</span>
                    <span className="text-slate-200">30 minutes</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Idle Fee</span>
                    <span className="text-slate-200">${station.idleFeePerMin.toFixed(2)}/min</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Max Dispenser</span>
                    <span className="text-cyan-400">{station.powerMaxKw} kW</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onOpenReservation(station)}
                  className="w-full py-2.5 px-3 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Reserve Stall Slot</span>
                </button>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3 h-3 text-cyan-400" />
                  <span>Navigate in Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Individual Stall Live Matrix */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                <Car className="w-4 h-4 text-cyan-400" />
                Dispensers ({stalls.length} Total)
              </h3>
              <span className="text-xs text-slate-500 font-mono">Click open stall to reserve</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {stalls.map((stall) => {
                const isAvail = stall.status === 'available';
                return (
                  <div
                    key={stall.id}
                    onClick={() => isAvail && onOpenReservation(station, stall)}
                    className={`p-3 rounded-md border text-left transition-colors ${
                      isAvail
                        ? 'bg-slate-900 border-slate-700 hover:border-cyan-500 cursor-pointer'
                        : 'bg-slate-950 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 font-mono">
                      <span className="font-bold text-xs text-slate-100">{stall.stallNumber}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono mb-1">
                      <span className="text-cyan-400">{stall.connectorType}</span>
                      <span>{stall.maxKw} kW</span>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] font-mono">
                      {isAvail ? (
                        <span className="text-emerald-400">Available</span>
                      ) : (
                        <span className="text-slate-500">
                          {stall.minsRemaining ? `~${stall.minsRemaining}m left` : 'Occupied'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
