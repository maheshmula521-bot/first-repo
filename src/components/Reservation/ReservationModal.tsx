import React, { useState } from 'react';
import { Station, StallInfo, Vehicle, Reservation } from '../../types/ev';
import { 
  X, 
  Zap, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Car, 
  ArrowRight
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
      qrCodeData: `VP-${station.id}-${selectedStall.stallNumber}-${pin}`,
      createdAt: new Date().toISOString(),
    };

    setConfirmedReservation(newReservation);
    onConfirmReservation(newReservation);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Reserve EV charging stall"
    >
      <div 
        className="relative w-full max-w-lg bg-[#0c1019] border border-slate-800 rounded-lg overflow-hidden shadow-2xl flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-cyan-400">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Stall Reservation</h2>
              <p className="text-[11px] text-slate-400 font-mono">{station.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reservation dialog"
            className="p-1 rounded text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!confirmedReservation ? (
          <div className="p-5 space-y-4 overflow-y-auto max-h-[80vh]">
            {/* Step 1: Select Vehicle */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 uppercase flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                1. Vehicle
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {vehicles.map((v) => {
                  const isSelected = v.id === selectedVehicleId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVehicleId(v.id)}
                      className={`p-2.5 rounded-md border text-left transition-colors font-mono ${
                        isSelected
                          ? 'bg-slate-800 border-cyan-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-bold text-xs">{v.make} {v.model}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                        <span>{v.batteryCapacityKwh} kWh</span>
                        <span className="text-cyan-400">{v.defaultConnector}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Stall & Connector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 uppercase flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                2. Bay
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono">
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
                      className={`p-2 rounded-md border text-center transition-colors ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-500 text-white'
                          : isAvail
                          ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-bold text-xs">{stall.stallNumber}</div>
                      <div className="text-[10px] text-cyan-400">{stall.connectorType}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        {isAvail ? 'Open' : 'Busy'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Arrival Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                3. Arrival Window
              </label>
              <div className="grid grid-cols-4 gap-1.5 font-mono">
                {[
                  { label: 'In 15m', mins: 15 },
                  { label: 'In 30m', mins: 30 },
                  { label: 'In 45m', mins: 45 },
                  { label: 'In 60m', mins: 60 },
                ].map((slot) => (
                  <button
                    key={slot.mins}
                    onClick={() => setSlotDelayMinutes(slot.mins)}
                    className={`py-1.5 rounded-md text-xs font-mono border transition-colors ${
                      slotDelayMinutes === slot.mins
                        ? 'bg-slate-800 text-cyan-300 border-cyan-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Energy to Charge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Energy Target</span>
                <span className="text-emerald-400">{targetKwh} kWh</span>
              </div>
              <input
                type="range"
                min="20"
                max={selectedVehicle.batteryCapacityKwh}
                step="5"
                value={targetKwh}
                onChange={(e) => setTargetKwh(Number(e.target.value))}
                className="w-full accent-emerald-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>

            {/* Cost Summary Breakdown */}
            <div className="p-3 rounded-md bg-slate-950 border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Tariff Rate</span>
                <span className="text-slate-200">${station.pricePerKwh.toFixed(2)}/kWh</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Stall Hold Fee</span>
                <span className="text-emerald-400">$0.00</span>
              </div>
              <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                <span className="text-white">Estimated Total</span>
                <span className="text-emerald-400 font-mono">${estimatedCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Action - Zero pill button */}
            <button
              onClick={handleBook}
              className="w-full py-2.5 px-4 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Reservation ({selectedStall.stallNumber})</span>
            </button>
          </div>
        ) : (
          /* Confirmation & Pass Screen */
          <div className="p-5 space-y-4 text-center">
            <div className="w-10 h-10 rounded-md bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-emerald-400">Stall Confirmed</span>
              <h3 className="text-base font-bold text-white mt-0.5">Bay {confirmedReservation.stallNumber} Assigned</h3>
              <p className="text-xs text-slate-400 font-mono">{confirmedReservation.stationName}</p>
            </div>

            {/* Digital Pass Card */}
            <div className="p-4 rounded-md bg-slate-950 border border-slate-800 text-left font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3 text-xs">
                <span className="text-slate-400">SESSION TOKEN</span>
                <span className="text-cyan-400">{confirmedReservation.id}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Stall</span>
                  <div className="font-bold text-white">{confirmedReservation.stallNumber} ({confirmedReservation.connectorType})</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Output</span>
                  <div className="font-bold text-emerald-400">{confirmedReservation.powerKw} kW</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Arrival</span>
                  <div className="text-slate-200">
                    {new Date(confirmedReservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Dispenser PIN</span>
                  <div className="text-sm font-bold text-cyan-400 tracking-wider">{confirmedReservation.pinCode}</div>
                </div>
              </div>

              {/* QR Code Bar */}
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-cyan-400 shrink-0" />
                  <div className="text-left font-mono text-[10px]">
                    <div className="text-slate-200 font-bold">OCPP Handshake Pass</div>
                    <div className="text-slate-500">{confirmedReservation.qrCodeData}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-950 text-emerald-400 rounded border border-emerald-900">
                  Ready
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-3 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
              >
                Back to Map
              </button>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1"
              >
                <span>Navigate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
