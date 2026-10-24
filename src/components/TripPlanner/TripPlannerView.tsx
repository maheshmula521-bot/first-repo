import React, { useState } from 'react';
import { Station, Vehicle, TripPlanResult } from '../../types/ev';
import { planEvTrip } from '../../utils/evCalculations';
import { POPULAR_ROUTES } from '../../data/mockData';
import { 
  Navigation, 
  MapPin, 
  Zap, 
  Clock, 
  DollarSign, 
  Leaf, 
  Car, 
  ArrowRight, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  Share2, 
  CheckCircle2,
  Calendar,
  ShieldCheck
} from 'lucide-react';

interface TripPlannerViewProps {
  stations: Station[];
  vehicles: Vehicle[];
  onSelectStationOnMap: (station: Station) => void;
  onSetRoutePolyline?: (polyline: any) => void;
}

export const TripPlannerView: React.FC<TripPlannerViewProps> = ({
  stations,
  vehicles,
  onSelectStationOnMap,
  onSetRoutePolyline,
}) => {
  const [selectedRoutePreset, setSelectedRoutePreset] = useState<string>(POPULAR_ROUTES[0].name);
  const [startCity, setStartCity] = useState<string>(POPULAR_ROUTES[0].startCity);
  const [destCity, setDestCity] = useState<string>(POPULAR_ROUTES[0].destCity);
  const [distanceMiles, setDistanceMiles] = useState<number>(POPULAR_ROUTES[0].distanceMiles);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'veh-1');
  const [startingSoC, setStartingSoC] = useState<number>(85);
  const [minArrivalSoC, setMinArrivalSoC] = useState<number>(15);
  const [tripResult, setTripResult] = useState<TripPlanResult | null>(() => {
    return planEvTrip(
      POPULAR_ROUTES[0].startCity,
      POPULAR_ROUTES[0].destCity,
      POPULAR_ROUTES[0].distanceMiles,
      stations,
      vehicles[0],
      85,
      15
    );
  });
  const [copiedShare, setCopiedShare] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  const handleSelectPreset = (route: typeof POPULAR_ROUTES[0]) => {
    setSelectedRoutePreset(route.name);
    setStartCity(route.startCity);
    setDestCity(route.destCity);
    setDistanceMiles(route.distanceMiles);
    const result = planEvTrip(
      route.startCity,
      route.destCity,
      route.distanceMiles,
      stations,
      selectedVehicle,
      startingSoC,
      minArrivalSoC
    );
    setTripResult(result);
  };

  const handleCalculate = () => {
    const result = planEvTrip(
      startCity,
      destCity,
      distanceMiles,
      stations,
      selectedVehicle,
      startingSoC,
      minArrivalSoC
    );
    setTripResult(result);
  };

  const handleShareTrip = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/40 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI Range & Charging Route Optimizer
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Plan Long Trips Without Charging Anxiety
          </h2>
          <p className="text-sm text-slate-300">
            Intelligently maps optimal charging stops along your route, factoring in your battery capacity, elevation, high-speed DC Fast charging curves, and energy pricing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Route Inputs & Vehicle Parameters */}
        <div className="space-y-5 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
          {/* Quick Popular Road Trips */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Popular EV Corridors
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {POPULAR_ROUTES.map((route) => {
                const isActive = selectedRoutePreset === route.name;
                return (
                  <button
                    key={route.name}
                    onClick={() => handleSelectPreset(route)}
                    className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between border ${
                      isActive
                        ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-200'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>{route.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">{route.distanceMiles} mi</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Origin & Destination */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Departure Point</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                <input
                  type="text"
                  value={startCity}
                  onChange={(e) => setStartCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Destination</label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
                <input
                  type="text"
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>Trip Distance</span>
                <span className="text-cyan-400 font-mono">{distanceMiles} miles</span>
              </div>
              <input
                type="range"
                min="50"
                max="600"
                step="10"
                value={distanceMiles}
                onChange={(e) => setDistanceMiles(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Vehicle & Battery SoC Settings */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Vehicle in Garage</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.batteryCapacityKwh} kWh • {v.usableRangeMiles} mi)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Starting Battery</label>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200 font-mono">{startingSoC}%</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Min Target Buffer</label>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200 font-mono">{minArrivalSoC}%</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Recalculate Optimal Stops</span>
          </button>
        </div>

        {/* Right 2 Columns: Trip Overview & Itinerary Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {tripResult && (
            <>
              {/* Trip Key Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Total Duration</span>
                  </div>
                  <div className="text-xl font-black text-white font-mono">
                    {tripResult.totalDurationHours} hrs
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {tripResult.drivingDurationHours}h drive • {tripResult.chargingDurationHours}h charge
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Charging Stops</span>
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {tripResult.stops.length} {tripResult.stops.length === 1 ? 'Stop' : 'Stops'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Fast sweet spot (15% → 80%)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Charging Cost</span>
                  </div>
                  <div className="text-xl font-black text-cyan-300 font-mono">
                    ${tripResult.totalChargingCost.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                    Save ${tripResult.savingsUsd.toFixed(2)} vs Gas
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CO2 Avoided</span>
                  </div>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {tripResult.co2SavedKg} kg
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    vs gasoline passenger car
                  </div>
                </div>
              </div>

              {/* Itinerary Timeline */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">Route Charging Itinerary</h3>
                    <p className="text-xs text-slate-400">{tripResult.startCity} → {tripResult.destCity} ({tripResult.totalDistanceMiles} miles)</p>
                  </div>

                  <button
                    onClick={handleShareTrip}
                    aria-label="Share trip itinerary"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{copiedShare ? 'Copied!' : 'Share Route'}</span>
                  </button>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-cyan-500 before:to-pink-500">
                  {/* Origin Step */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 ring-2 ring-emerald-500/30" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Start: {tripResult.startCity}</div>
                        <div className="text-[11px] text-slate-400">Depart with <strong className="text-emerald-400">{startingSoC}% battery</strong></div>
                      </div>
                      <span className="text-xs font-mono text-slate-500">0 mi</span>
                    </div>
                  </div>

                  {/* Charging Stops */}
                  {tripResult.stops.map((stop, idx) => (
                    <div key={idx} className="relative p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                      <div className="absolute -left-[2.1rem] top-4 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-slate-900 ring-2 ring-cyan-500/30" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              Stop #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-100">{stop.station.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{stop.station.address}, {stop.station.city}</div>
                        </div>

                        <div className="text-right shrink-0">
                          <button
                            onClick={() => onSelectStationOnMap(stop.station)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold border border-slate-700 transition-colors"
                          >
                            Inspect Station
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Arrive SoC</span>
                          <span className="font-mono font-bold text-amber-400">{stop.arrivalSoC}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Charge Time</span>
                          <span className="font-mono font-bold text-cyan-300">~{stop.chargeDurationMins} mins</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Depart SoC</span>
                          <span className="font-mono font-bold text-emerald-400">{stop.departureSoC}% (+{stop.energyAddedKwh} kWh)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Stop Cost</span>
                          <span className="font-mono font-bold text-slate-200">${stop.costEstimate.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Destination Step */}
                  <div className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-pink-500 border-2 border-slate-900 ring-2 ring-pink-500/30" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Arrive: {tripResult.destCity}</div>
                        <div className="text-[11px] text-slate-400">Estimated arrival with <strong className="text-emerald-400 font-mono">~32% reserve</strong></div>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{tripResult.totalDistanceMiles} mi</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
