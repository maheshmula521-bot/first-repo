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
  Heart, 
  ChevronRight,
  Activity,
  Layers
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
    <div className="w-full space-y-5">
      {/* Header & Metrics */}
      <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Driver Telemetry Console</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                Grid Handshake Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Account: primary-node • {vehicles.length} Registered EV Profiles
            </p>
          </div>

          <button
            onClick={() => setShowAddCarModal(true)}
            className="px-3 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Vehicle</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Energy Delivered</span>
            </div>
            <div className="text-lg font-bold text-white">{totalKwhCharged.toLocaleString()} kWh</div>
            <div className="text-[10px] text-slate-500 mt-0.5">6,840 zero-emission mi</div>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>CO2 Avoided</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">{estimatedCo2SavedKg} kg</div>
            <div className="text-[10px] text-slate-500 mt-0.5">vs gasoline ICE standard</div>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              <span>Gas Savings</span>
            </div>
            <div className="text-lg font-bold text-cyan-300">${estimatedGasSavingsUsd}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Fuel arbitrage calculation</div>
          </div>

          <div className="p-3 rounded bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>Active Cycle</span>
            </div>
            <div className="text-lg font-bold text-slate-200">18 Days</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Zero interruption streak</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Columns: Reservations & Garage */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Reservations */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 uppercase">Stall Reservations</h3>
              </div>
              <span className="text-slate-500">{reservations.length} records</span>
            </div>

            {reservations.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No active or past reservations recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {reservations.map((res) => {
                  const isConfirmed = res.status === 'confirmed';
                  return (
                    <div
                      key={res.id}
                      className="p-3 rounded bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase px-1.5 py-0.2 rounded font-bold ${
                            isConfirmed ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-slate-900 text-slate-500'
                          }`}>
                            {res.status}
                          </span>
                          <span className="font-bold text-white">{res.stationName}</span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          Bay {res.stallNumber} ({res.connectorType} • {res.powerKw} kW) • {res.vehicleName}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{new Date(res.startTime).toLocaleDateString()} {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>• PIN: <strong className="text-cyan-400">{res.pinCode}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => setSelectedPass(res)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>Pass</span>
                        </button>

                        {isConfirmed && (
                          <button
                            onClick={() => onCancelReservation(res.id)}
                            className="px-2 py-1 rounded bg-slate-900 hover:bg-rose-950 hover:text-rose-400 text-slate-500 text-xs border border-slate-800 transition-colors"
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

          {/* Vehicle Profiles */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 uppercase">Registered Hardware Profiles</h3>
              </div>
              <span className="text-slate-500">{vehicles.length} Units</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2 text-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-slate-500 uppercase">
                        {v.year} {v.make}
                      </span>
                      <span className="text-cyan-400 font-bold">{v.defaultConnector}</span>
                    </div>
                    <div className="font-bold text-sm text-white">{v.model}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-800 text-slate-400">
                    <div>Pack: <strong className="text-slate-200">{v.batteryCapacityKwh} kWh</strong></div>
                    <div>Range: <strong className="text-slate-200">{v.usableRangeMiles} mi</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Saved Stations & AutoCharge */}
        <div className="space-y-4 font-mono">
          {/* Saved Stations */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                <h3 className="font-bold text-slate-100 uppercase">Monitored Stations</h3>
              </div>
              <span className="text-slate-500">{favoriteStations.length}</span>
            </div>

            {favoriteStations.length === 0 ? (
              <p className="text-[11px] text-slate-500 py-3 text-center">
                No stations monitored. Toggle favorite in station cards.
              </p>
            ) : (
              <div className="space-y-1.5">
                {favoriteStations.map((st) => (
                  <div
                    key={st.id}
                    onClick={() => onSelectStation(st)}
                    className="p-2.5 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white line-clamp-1">{st.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {st.stallsAvailable}/{st.stallsTotal} open • ${st.pricePerKwh.toFixed(2)}/kWh
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plug & Charge */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="font-bold text-slate-100 uppercase">ISO 15118 Plug & Charge</h3>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">VISA •••• 4821</div>
                <div className="text-[10px] text-slate-500">Certificate Hash: 9F20...BA41</div>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                Authorized
              </span>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
              Cryptographic vehicle identifier auto-authenticates sessions upon connector insertion with zero human interaction required.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Add Vehicle */}
      {showAddCarModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Add EV to garage"
        >
          <div 
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-2xl space-y-3 font-mono text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-white uppercase">Register Vehicle Specification</h3>
              <button onClick={() => setShowAddCarModal(false)} className="text-slate-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Make</label>
                <input
                  type="text"
                  required
                  value={newMake}
                  onChange={(e) => setNewMake(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Battery (kWh)</label>
                  <input
                    type="number"
                    required
                    value={newBatteryKwh}
                    onChange={(e) => setNewBatteryKwh(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">EPA Range (mi)</label>
                  <input
                    type="number"
                    required
                    value={newRangeMiles}
                    onChange={(e) => setNewRangeMiles(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Inlet Port</label>
                <select
                  value={newConnector}
                  onChange={(e) => setNewConnector(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-white cursor-pointer"
                >
                  <option value="NACS">NACS (Tesla)</option>
                  <option value="CCS">CCS Combo</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="J1772">J1772</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors mt-3"
              >
                Save Vehicle Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Digital Pass */}
      {selectedPass && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Digital charging pass"
        >
          <div 
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-2xl space-y-3 font-mono text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400 uppercase">Session Token</span>
              <button onClick={() => setSelectedPass(null)} className="text-slate-500 hover:text-white">
                ✕
              </button>
            </div>

            <div className="text-center space-y-0.5">
              <div className="font-bold text-white text-sm">{selectedPass.stationName}</div>
              <div className="text-slate-400 text-[11px]">Bay {selectedPass.stallNumber} • {selectedPass.powerKw} kW</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded flex flex-col items-center justify-center space-y-2 text-slate-200">
              <QrCode className="w-24 h-24 text-cyan-400" />
              <span className="text-[10px] text-slate-500">{selectedPass.qrCodeData}</span>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase block">Dispenser PIN</span>
              <span className="text-xl font-bold text-cyan-400 tracking-wider">{selectedPass.pinCode}</span>
            </div>

            <button
              onClick={() => setSelectedPass(null)}
              className="w-full py-1.5 rounded-md bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
