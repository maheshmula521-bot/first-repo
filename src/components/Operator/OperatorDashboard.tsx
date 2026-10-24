import React, { useState } from 'react';
import { Station } from '../../types/ev';
import { 
  Building2, 
  Zap, 
  DollarSign, 
  Activity, 
  Settings, 
  Power, 
  RefreshCw, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Sliders,
  ShieldAlert
} from 'lucide-react';

interface OperatorDashboardProps {
  station: Station;
  onUpdateStationPrice: (stationId: string, newPrice: number, newIdleFee: number) => void;
  onToggleStallMaintenance: (stallId: string) => void;
}

export const OperatorDashboard: React.FC<OperatorDashboardProps> = ({
  station,
  onUpdateStationPrice,
  onToggleStallMaintenance,
}) => {
  const [priceInput, setPriceInput] = useState(station.pricePerKwh.toString());
  const [idleFeeInput, setIdleFeeInput] = useState(station.idleFeePerMin.toString());
  const [isSaved, setIsSaved] = useState(false);
  const [dynamicSurgeEnabled, setDynamicSurgeEnabled] = useState(true);

  // Simulated live operator telemetry
  const occupiedStalls = station.stallsTotal - station.stallsAvailable;
  const occupancyRate = Math.round((occupiedStalls / station.stallsTotal) * 100);
  const currentTotalLoadKw = occupiedStalls * 145; // average kW per active car
  const todayRevenue = 1482.50 + occupiedStalls * 18.2;
  const todayKwhDelivered = 3890;

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStationPrice(station.id, parseFloat(priceInput) || 0.38, parseFloat(idleFeeInput) || 0.50);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            B2B Charging Network Operator Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Station Telemetry: {station.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Site ID: <span className="font-mono text-cyan-400">{station.id}</span> • Grid Connection: 2.5 MVA Transformer • Real-Time SCADA Online
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-semibold">Grid Feed Normal</span>
          </div>
        </div>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Power Draw</span>
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {currentTotalLoadKw} <span className="text-xs text-slate-400">kW</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Peak capacity 2,500 kW</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Today's Revenue</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${todayRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">+14% vs last Tuesday</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Live Occupancy</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {occupancyRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{occupiedStalls} of {station.stallsTotal} stalls charging</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Avg Session Time</span>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">
            24.2 <span className="text-xs text-slate-400">mins</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">82% fast taper threshold</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stall SCADA Control Grid */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-base text-white">Stall Hardware & Remote Power Switches</h3>
              <p className="text-xs text-slate-400">Trigger individual stall firmware reboots or maintenance locks.</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">{station.stallsAvailable} Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {station.stalls.map((stall) => {
              const isAvail = stall.status === 'available';
              const isOccupied = stall.status === 'occupied';
              const isMaintenance = stall.status === 'maintenance';

              return (
                <div
                  key={stall.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{stall.stallNumber}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {stall.connectorType} • {stall.maxKw} kW
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        isAvail ? 'bg-emerald-400' : isOccupied ? 'bg-amber-400' : 'bg-rose-500'
                      }`} />
                      <span className="capitalize">{stall.status}</span>
                      {stall.currentVehicle && (
                        <span className="text-slate-300 font-semibold">• {stall.currentVehicle}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onToggleStallMaintenance(stall.id)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                        isMaintenance
                          ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title={isMaintenance ? 'Clear maintenance lock' : 'Put stall in maintenance mode'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alert(`Remote reboot command sent to ${stall.stallNumber}`)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Remote hardware reset"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Pricing & Tariff Management */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-base text-white">Tariff & Surge Pricing</h3>
            </div>
          </div>

          <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Base Energy Rate ($/kWh)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Idle Fee ($/min after 10m grace)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.05"
                  value={idleFeeInput}
                  onChange={(e) => setIdleFeeInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">AI Dynamic Demand Pricing</span>
                <input
                  type="checkbox"
                  checked={dynamicSurgeEnabled}
                  onChange={(e) => setDynamicSurgeEnabled(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Automatically adjusts kWh price by ±15% during peak grid congestion hours (4 PM - 9 PM) to optimize stall turnover.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
            >
              {isSaved ? 'Updated Pricing Live on Grid!' : 'Publish Tariff Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
