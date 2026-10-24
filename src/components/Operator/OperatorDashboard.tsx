import React, { useState } from 'react';
import { Station } from '../../types/ev';
import { 
  Building2, 
  Zap, 
  DollarSign, 
  Activity, 
  Power, 
  RefreshCw, 
  Sliders
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
  const [dynamicCongestionEnabled, setDynamicCongestionEnabled] = useState(true);

  const occupiedStalls = station.stallsTotal - station.stallsAvailable;
  const occupancyRate = Math.round((occupiedStalls / station.stallsTotal) * 100);
  const currentTotalLoadKw = occupiedStalls * 145;
  const todayRevenue = 1482.50 + occupiedStalls * 18.2;

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStationPrice(station.id, parseFloat(priceInput) || 0.38, parseFloat(idleFeeInput) || 0.50);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="w-full space-y-5 font-mono">
      {/* Top Banner */}
      <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase text-cyan-400 mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Station SCADA & Node Telemetry</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Site Telemetry: {station.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Node: {station.id} • Feed: 2.5 MVA Transformer • Real-Time SCADA Gateway Online
          </p>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-slate-300">Interconnect Nominal</span>
        </div>
      </div>

      {/* Live KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Power Draw</span>
          </div>
          <div className="text-lg font-bold text-cyan-300">
            {currentTotalLoadKw} kW
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Peak capacity 2,500 kW</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Today's Settled Revenue</span>
          </div>
          <div className="text-lg font-bold text-emerald-400">
            ${todayRevenue.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">+14% vs benchmark day</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span>Occupancy Rate</span>
          </div>
          <div className="text-lg font-bold text-white">
            {occupancyRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{occupiedStalls} of {station.stallsTotal} bays drawing</div>
        </div>

        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-0.5">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>Avg Session Time</span>
          </div>
          <div className="text-lg font-bold text-slate-200">
            24.2 mins
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">82% fast taper threshold</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stall Control Grid */}
        <div className="lg:col-span-2 p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div>
              <h3 className="font-bold text-white uppercase">Dispenser Relay Switches</h3>
              <p className="text-[11px] text-slate-500">Command remote reboot or set maintenance lock.</p>
            </div>
            <span className="text-emerald-400 font-bold">{station.stallsAvailable} Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {station.stalls.map((stall) => {
              const isAvail = stall.status === 'available';
              const isOccupied = stall.status === 'occupied';
              const isMaintenance = stall.status === 'maintenance';

              return (
                <div
                  key={stall.id}
                  className="p-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{stall.stallNumber}</span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                        {stall.connectorType} • {stall.maxKw} kW
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isAvail ? 'bg-emerald-400' : isOccupied ? 'bg-amber-400' : 'bg-rose-500'
                      }`} />
                      <span className="capitalize">{stall.status}</span>
                      {stall.currentVehicle && (
                        <span className="text-slate-500">• {stall.currentVehicle}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggleStallMaintenance(stall.id)}
                      className={`p-1.5 rounded border text-xs transition-colors ${
                        isMaintenance
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                      title={isMaintenance ? 'Clear maintenance lock' : 'Put bay in maintenance mode'}
                    >
                      <Power className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => alert(`Remote reboot signal transmitted to ${stall.stallNumber}`)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Remote reset"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tariff Management */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <h3 className="font-bold text-white uppercase">Tariff & Rate Control</h3>
            </div>
          </div>

          <form onSubmit={handleSavePricing} className="space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Base Rate ($/kWh)</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="number"
                  step="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Idle Fee ($/min after 10m grace)</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="number"
                  step="0.05"
                  value={idleFeeInput}
                  onChange={(e) => setIdleFeeInput(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">Dynamic Congestion Surcharge</span>
                <input
                  type="checkbox"
                  checked={dynamicCongestionEnabled}
                  onChange={(e) => setDynamicCongestionEnabled(e.target.checked)}
                  className="w-3.5 h-3.5 accent-cyan-400 cursor-pointer"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                Adjusts energy price by &plusmn;15% during peak substation load window (16:00 to 21:00) to clear stalls.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
            >
              {isSaved ? 'Tariff Published to Dispensers' : 'Deploy Tariff Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
