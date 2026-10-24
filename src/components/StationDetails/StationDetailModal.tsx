import React, { useState } from 'react';
import { Station, StallInfo } from '../../types/ev';
import { 
  X, 
  Zap, 
  MapPin, 
  Clock, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  Navigation, 
  Heart, 
  Share2, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  Coffee, 
  Wifi, 
  ShoppingBag, 
  Utensils, 
  Users, 
  Car,
  ChevronRight
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

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Station details for ${station.name}`}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#090f1d] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {station.network}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1 font-mono">
              <Zap className="w-3.5 h-3.5 fill-current" />
              {station.speedCategory} ({station.powerMaxKw} kW)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(station.id)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              aria-label="Share station details"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition-colors relative"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-cyan-500 text-slate-950 px-2 py-0.5 rounded shadow whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Info Hero */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">{station.name}</h2>
                  {station.hostVerified && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Host
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{station.address}, {station.city}, {station.state} {station.zip}</span>
                  <span className="font-semibold text-slate-300">• {station.distanceMiles} miles away</span>
                </p>
              </div>

              {/* Photos Gallery */}
              {station.photos && station.photos.length > 0 && (
                <div className="relative rounded-2xl overflow-hidden aspect-video max-h-64 border border-slate-800">
                  <img
                    src={station.photos[activePhotoIdx] || station.photos[0]}
                    alt={`${station.name} stall photo`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  
                  {station.photos.length > 1 && (
                    <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
                      {station.photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActivePhotoIdx(idx)}
                          aria-label={`View photo ${idx + 1}`}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            activePhotoIdx === idx ? 'bg-cyan-400 w-5' : 'bg-white/50 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 flex items-center gap-2 text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{station.rating} ({station.reviewCount} community reviews)</span>
                  </div>
                </div>
              )}

              {/* Real-time Status Card Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block">Available Stalls</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {station.stallsAvailable} / {station.stallsTotal}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block">Queue Wait</span>
                  <span className="text-lg font-black text-slate-200 font-mono">
                    {station.averageWaitMins === 0 ? '0 min' : `~${station.averageWaitMins}m`}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block">Energy Rate</span>
                  <span className="text-lg font-black text-cyan-400 font-mono">
                    ${station.pricePerKwh.toFixed(2)}<span className="text-xs text-slate-400">/kWh</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase block">Speed Accuracy</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {station.actualVsAdvertisedSpeedPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Sidebar: One-Tap Reservation Widget */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Reserve Stall
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">Guaranteed Slot</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Lock in an open charging spot before you arrive. Receive a digital NFC/QR code pass and skip the queue.
                </p>

                <div className="space-y-2.5 mb-4 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Hold Window</span>
                    <span className="text-slate-200 font-semibold font-mono">30-min buffer</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Idle Fee</span>
                    <span className="text-slate-200 font-semibold font-mono">${station.idleFeePerMin.toFixed(2)}/min after 10m grace</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                    <span className="text-slate-400">Power Output</span>
                    <span className="text-cyan-400 font-bold font-mono">Up to {station.powerMaxKw} kW</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onOpenReservation(station)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Reserve a Charging Slot</span>
                </button>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700 flex items-center justify-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Start GPS Navigation</span>
                </a>
              </div>
            </div>
          </div>

          {/* Individual Stall Live Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-cyan-400" />
                Live Stall-by-Stall Status ({stalls.length} Stalls)
              </h3>
              <span className="text-xs text-slate-400 font-mono">Click available stall to book directly</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stalls.map((stall) => {
                const isAvail = stall.status === 'available';
                return (
                  <div
                    key={stall.id}
                    onClick={() => isAvail && onOpenReservation(station, stall)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isAvail
                        ? 'bg-slate-900/80 border-emerald-500/40 hover:border-emerald-400 hover:bg-slate-800/90 cursor-pointer'
                        : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-100">{stall.stallNumber}</span>
                      <span className={`w-2 h-2 rounded-full ${isAvail ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                    </div>

                    <div className="text-xs text-slate-400 flex items-center justify-between mb-1">
                      <span className="font-mono text-cyan-300 font-semibold">{stall.connectorType}</span>
                      <span className="font-mono text-slate-300">{stall.maxKw} kW</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px] font-medium">
                      {isAvail ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready to plug
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {stall.minsRemaining ? `~${stall.minsRemaining}m left` : 'Occupied'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amenities & Facility Perks */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white">Station Amenities & Surrounding Perks</h3>
            <div className="flex flex-wrap gap-2.5">
              {station.amenities.map((a) => (
                <div
                  key={a}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200"
                >
                  <span className="text-cyan-400">
                    {a === 'Coffee' && <Coffee className="w-4 h-4" />}
                    {a === 'Wi-Fi' && <Wifi className="w-4 h-4" />}
                    {a === 'Shopping' && <ShoppingBag className="w-4 h-4" />}
                    {a === 'Dining' && <Utensils className="w-4 h-4" />}
                    {a === 'Restroom' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {a === 'Lounge' && <Users className="w-4 h-4" />}
                  </span>
                  <span>{a}</span>
                </div>
              ))}
              {station.open24Hours && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-950/40 border border-cyan-800/50 text-xs font-semibold text-cyan-300">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>24/7 Unlimited Access</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
