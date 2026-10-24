import React, { useState } from 'react';
import { Reservation, Station, Vehicle } from '../../types/ev';
import { 
  Car, 
  Zap, 
  Calendar, 
  Clock, 
  QrCode, 
  Leaf, 
  DollarSign, 
  Plus, 
  CreditCard, 
  ShieldCheck, 
  Share2, 
  Heart, 
  MapPin, 
  ChevronRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface UserHubViewProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  favoriteStations: Station[];
  onSelectStation: (station: Station) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  onCancelReservation: (reservationId: string) => void;
}

export const UserHubView: React.FC<UserHubViewProps> = ({
  vehicles,
  reservations,
  favoriteStations,
  onSelectStation,
  onAddVehicle,
  onCancelReservation,
}) => {
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<Reservation | null>(null);
  
  // Add Car Form State
  const [newMake, setNewMake] = useState('Tesla');
  const [newModel, setNewModel] = useState('Model 3');
  const [newBatteryKwh, setNewBatteryKwh] = useState(60);
  const [newRangeMiles, setNewRangeMiles] = useState(272);
  const [newConnector, setNewConnector] = useState<'NACS' | 'CCS' | 'CHAdeMO' | 'J1772'>('NACS');

  // Aggregated Eco & Cost Statistics
  const totalKwhCharged = reservations.reduce((acc, r) => acc + r.targetKwh, 1840);
  const totalCostPaid = reservations.reduce((acc, r) => acc + r.estimatedCost, 624.50);
  const estimatedCo2SavedKg = Math.round(totalKwhCharged * 0.48);
  const estimatedGasSavingsUsd = Math.round(totalCostPaid * 1.8);

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newVehicle: Vehicle = {
      id: `veh-${Date.now()}`,
      make: newMake,
      model: newModel,
      year: 2024,
      batteryCapacityKwh: newBatteryKwh,
      usableRangeMiles: newRangeMiles,
      defaultConnector: newConnector,
      efficiencyWhPerMile: Math.round((newBatteryKwh * 1000) / newRangeMiles),
    };
    onAddVehicle(newVehicle);
    setShowAddCarModal(false);
  };

  return (
    <div className="w-full space-y-6">
      {/* Personalized Header & Eco-Impact Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900 to-emerald-950/70 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=140&q=80"
              alt="Alex profile avatar"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/50 ring-4 ring-cyan-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">Alex's EV Hub</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Eco Champion Level 3
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Connected to Grid • 4 Active Vehicles • 22 Fast Charge Sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddCarModal(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle to Garage</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Total Energy</span>
            </div>
            <div className="text-2xl font-black text-white font-mono">{totalKwhCharged.toLocaleString()} <span className="text-xs text-slate-400">kWh</span></div>
            <div className="text-[10px] text-slate-500 mt-0.5">~6,840 zero-emission miles</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>CO2 Avoided</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">{estimatedCo2SavedKg} <span className="text-xs text-slate-400">kg</span></div>
            <div className="text-[10px] text-emerald-500/80 mt-0.5">Equivalent to 42 planted trees</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <span>Gas Savings</span>
            </div>
            <div className="text-2xl font-black text-cyan-300 font-mono">${estimatedGasSavingsUsd}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">vs $3.85/gal ICE standard</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Green Streak</span>
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">18 Days</div>
            <div className="text-[10px] text-slate-500 mt-0.5">100% renewable power</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Reservations & Garage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Reservations */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Your Stall Reservations</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">{reservations.length} total</span>
            </div>

            {reservations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active or past reservations yet. Select any station on the map to reserve an open stall!
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map((res) => {
                  const isConfirmed = res.status === 'confirmed';
                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isConfirmed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {res.status}
                          </span>
                          <span className="text-xs font-bold text-white">{res.stationName}</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Stall <strong className="text-cyan-300 font-mono">{res.stallNumber}</strong> ({res.connectorType} • {res.powerKw} kW) • {res.vehicleName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(res.startTime).toLocaleDateString()} at {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>• PIN: <strong className="text-slate-300 font-mono">{res.pinCode}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedPass(res)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Show Pass</span>
                        </button>

                        {isConfirmed && (
                          <button
                            onClick={() => onCancelReservation(res.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 text-xs font-semibold border border-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Garage */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-base text-white">My EV Garage</h3>
              </div>
              <span className="text-xs text-slate-400">{vehicles.length} Vehicles Registered</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {v.year} {v.make}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-400">{v.defaultConnector}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{v.model}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">Battery Capacity</span>
                      <span className="font-mono font-bold text-slate-200">{v.batteryCapacityKwh} kWh</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Usable Range</span>
                      <span className="font-mono font-bold text-emerald-400">{v.usableRangeMiles} miles</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Favorite Stations & Quick Payment Methods */}
        <div className="space-y-6">
          {/* Favorite Stations */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <h3 className="font-bold text-sm text-white">Saved Favorite Hubs</h3>
              </div>
              <span className="text-xs text-slate-400">{favoriteStations.length}</span>
            </div>

            {favoriteStations.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Click the heart on any station card to save it here for fast status checks.
              </p>
            ) : (
              <div className="space-y-2">
                {favoriteStations.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => onSelectStation(st)}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-white line-clamp-1">{st.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {st.stallsAvailable} of {st.stallsTotal} free • ${st.pricePerKwh.toFixed(2)}/kWh
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">AutoCharge & Payments</h3>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-6 rounded bg-slate-800 flex items-center justify-center font-bold text-[10px] text-cyan-400">
                  VISA
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">•••• 4821 (Primary)</div>
                  <div className="text-[10px] text-emerald-400">Plug & Charge Enabled</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                Active
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              AutoCharge authenticates your vehicle MAC address upon plugging in without requiring phone tap or RFID cards.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Add Vehicle */}
      {showAddCarModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Add EV to garage"
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Add New EV to Garage</h3>
              <button onClick={() => setShowAddCarModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Make</label>
                <input
                  type="text"
                  required
                  value={newMake}
                  onChange={(e) => setNewMake(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Battery (kWh)</label>
                  <input
                    type="number"
                    required
                    value={newBatteryKwh}
                    onChange={(e) => setNewBatteryKwh(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">EPA Range (Miles)</label>
                  <input
                    type="number"
                    required
                    value={newRangeMiles}
                    onChange={(e) => setNewRangeMiles(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Default Plug Port</label>
                <select
                  value={newConnector}
                  onChange={(e) => setNewConnector(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="NACS">Tesla / NACS</option>
                  <option value="CCS">CCS Combo</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="J1772">J1772 (Level 2)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all mt-4"
              >
                Save Vehicle
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Digital Pass */}
      {selectedPass && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Digital charging pass"
        >
          <div 
            className="w-full max-w-sm bg-gradient-to-br from-slate-900 to-cyan-950 border border-cyan-500/50 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">VoltPulse Priority Pass</span>
              <button onClick={() => setSelectedPass(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-lg text-white">{selectedPass.stationName}</h3>
              <p className="text-xs text-slate-300">Stall {selectedPass.stallNumber} • {selectedPass.powerKw} kW</p>
            </div>

            <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center text-slate-900 space-y-2">
              <QrCode className="w-28 h-28" />
              <span className="text-[10px] font-mono font-bold">{selectedPass.qrCodeData}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Stall Unlock PIN</span>
              <span className="text-2xl font-black text-emerald-400 font-mono tracking-widest">{selectedPass.pinCode}</span>
            </div>

            <button
              onClick={() => setSelectedPass(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
