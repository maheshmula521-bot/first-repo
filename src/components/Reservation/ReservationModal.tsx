import React, { useState } from 'react';
import { Station, StallInfo, Vehicle, Reservation } from '../../types/ev';
import { 
  X, 
  Zap, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  Car, 
  CreditCard,
  Sparkles,
  ArrowRight,
  Download
} from 'lucide-react';

interface ReservationModalProps {
  station: Station | null;
  initialStall?: StallInfo | null;
  vehicles: Vehicle[];
  onClose: () => void;
  onConfirmReservation: (reservation: Reservation) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  station,
  initialStall,
  vehicles,
  onClose,
  onConfirmReservation,
}) => {
  if (!station) return null;

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'veh-1');
  const [selectedStallId, setSelectedStallId] = useState<string>(
    initialStall?.id || (station.stalls[0]?.id || `${station.id}-stall-1`)
  );
  const [slotDelayMinutes, setSlotDelayMinutes] = useState<number>(15);
  const [chargeDurationMinutes, setChargeDurationMinutes] = useState<number>(35);
  const [targetKwh, setTargetKwh] = useState<number>(45);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const selectedStall = station.stalls.find((s) => s.id === selectedStallId) || {
    id: selectedStallId,
    stallNumber: initialStall?.stallNumber || 'Stall 1A',
    connectorType: initialStall?.connectorType || station.connectorTypes[0] || 'CCS',
    maxKw: station.powerMaxKw,
    status: 'available',
  };

  const estimatedCost = Number((targetKwh * station.pricePerKwh).toFixed(2));

  const handleBook = () => {
    const reservationTime = new Date(Date.now() + slotDelayMinutes * 60 * 1000).toISOString();
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const newReservation: Reservation = {
      id: `res-${Date.now().toString().slice(-6)}`,
      stationId: station.id,
      stationName: station.name,
      stationAddress: `${station.address}, ${station.city}`,
      stallId: selectedStall.id,
      stallNumber: selectedStall.stallNumber,
      connectorType: selectedStall.connectorType,
      powerKw: selectedStall.maxKw,
      startTime: reservationTime,
      durationMins: chargeDurationMinutes,
      status: 'confirmed',
      vehicleName: `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`,
      targetKwh,
      estimatedCost,
      pinCode: pin,
      qrCodeData: `VOLT-${station.id}-${selectedStall.stallNumber}-${pin}`,
      createdAt: new Date().toISOString(),
    };

    setConfirmedReservation(newReservation);
    onConfirmReservation(newReservation);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Reserve EV charging stall"
    >
      <div 
        className="relative w-full max-w-xl bg-[#090f1e] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Reserve Charging Stall</h2>
              <p className="text-xs text-slate-400">{station.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reservation dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!confirmedReservation ? (
          <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
            {/* Step 1: Select Vehicle */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-cyan-400" />
                1. Select EV Vehicle
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vehicles.map((v) => {
                  const isSelected = v.id === selectedVehicleId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-md shadow-cyan-950'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="font-bold text-xs">{v.make} {v.model}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center justify-between font-mono">
                        <span>{v.batteryCapacityKwh} kWh</span>
                        <span className="text-cyan-300">{v.defaultConnector}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Stall & Connector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                2. Preferred Stall & Connector
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(station.stalls.length > 0 ? station.stalls : [
                  { id: 'st-def-1', stallNumber: '1A', connectorType: station.connectorTypes[0], maxKw: station.powerMaxKw, status: 'available' },
                  { id: 'st-def-2', stallNumber: '1B', connectorType: station.connectorTypes[0], maxKw: station.powerMaxKw, status: 'available' },
                  { id: 'st-def-3', stallNumber: '2A', connectorType: station.connectorTypes[1] || station.connectorTypes[0], maxKw: station.powerMaxKw, status: 'available' },
                  { id: 'st-def-4', stallNumber: '2B', connectorType: station.connectorTypes[0], maxKw: station.powerMaxKw, status: 'available' },
                ]).map((stall) => {
                  const isSelected = stall.id === selectedStallId;
                  const isAvail = stall.status === 'available';
                  return (
                    <button
                      key={stall.id}
                      disabled={!isAvail}
                      onClick={() => setSelectedStallId(stall.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-md'
                          : isAvail
                          ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-slate-950/40 border-slate-800/40 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-bold text-xs">{stall.stallNumber}</div>
                      <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{stall.connectorType}</div>
                      <div className="text-[9px] text-slate-400 mt-1">
                        {isAvail ? 'Available' : 'Busy'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Arrival Time Slot */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                3. Estimated Arrival Time Slot
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'In 15m', mins: 15 },
                  { label: 'In 30m', mins: 30 },
                  { label: 'In 45m', mins: 45 },
                  { label: 'In 60m', mins: 60 },
                ].map((slot) => (
                  <button
                    key={slot.mins}
                    onClick={() => setSlotDelayMinutes(slot.mins)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      slotDelayMinutes === slot.mins
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Energy to Charge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <span>Target Energy Amount</span>
                <span className="text-emerald-400 font-mono font-bold">{targetKwh} kWh (~{Math.round(targetKwh * 3.6)} miles added)</span>
              </div>
              <input
                type="range"
                min="20"
                max={selectedVehicle.batteryCapacityKwh}
                step="5"
                value={targetKwh}
                onChange={(e) => setTargetKwh(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Cost Summary Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Charging Rate ({station.network})</span>
                <span className="text-slate-200 font-mono">${station.pricePerKwh.toFixed(2)} / kWh</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Hold Reservation Fee</span>
                <span className="text-emerald-400 font-bold">$0.00 (Free Early Access)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Idle Grace Period</span>
                <span className="text-slate-200 font-mono">10 minutes after full</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-white">Estimated Session Total</span>
                <span className="text-emerald-400 font-mono text-base">${estimatedCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleBook}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm & Lock In Stall {selectedStall.stallNumber}</span>
            </button>
          </div>
        ) : (
          /* Confirmation & Digital Pass Screen */
          <div className="p-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Reservation Confirmed</span>
              <h3 className="text-xl font-black text-white mt-1">Stall {confirmedReservation.stallNumber} Locked For You</h3>
              <p className="text-xs text-slate-400 mt-1">{confirmedReservation.stationName}</p>
            </div>

            {/* Simulated Digital Pass Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/60 border border-cyan-500/40 text-left relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Zap className="w-32 h-32 text-cyan-300" />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">VoltPulse Priority Pass</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {confirmedReservation.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Assigned Stall</span>
                  <div className="text-base font-bold text-white font-mono">{confirmedReservation.stallNumber} ({confirmedReservation.connectorType})</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Max Power</span>
                  <div className="text-base font-bold text-emerald-400 font-mono">{confirmedReservation.powerKw} kW</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Start Window</span>
                  <div className="text-xs font-semibold text-slate-200 font-mono">
                    {new Date(confirmedReservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Stall Unlock PIN</span>
                  <div className="text-base font-black text-cyan-400 font-mono tracking-widest">{confirmedReservation.pinCode}</div>
                </div>
              </div>

              {/* QR Code Simulation */}
              <div className="p-3 bg-white rounded-xl flex items-center justify-between text-slate-900">
                <div className="flex items-center gap-3">
                  <QrCode className="w-12 h-12 text-slate-900 shrink-0" />
                  <div className="text-left">
                    <div className="text-[11px] font-bold">Scan at Charger Post</div>
                    <div className="text-[9px] font-mono text-slate-600">{confirmedReservation.qrCodeData}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded">Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors border border-slate-700"
              >
                Close & View on Map
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Navigate to Stall</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
