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
  Share2, 
  Cpu,
  Layers
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
    <div className="w-full space-y-5">
      {/* Top Banner - Minimal Functional */}
      <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Deterministic Corridor Routing Engine</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Route Energy & Charging Stop Optimizer
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Computes distance-based power consumption, fast DC charging tapers (15% to 80%), and compares grid tariffs against baseline fuel costs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Route Inputs & Vehicle Parameters */}
        <div className="space-y-4 p-4 rounded-lg bg-slate-900 border border-slate-800">
          {/* Preset Corridors */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 uppercase block">
              Standard Highway Corridors
            </label>
            <div className="grid grid-cols-1 gap-1">
              {POPULAR_ROUTES.map((route) => {
                const isActive = selectedRoutePreset === route.name;
                return (
                  <button
                    key={route.name}
                    onClick={() => handleSelectPreset(route)}
                    className={`px-3 py-2 rounded-md text-left text-xs font-mono transition-colors flex items-center justify-between border ${
                      isActive
                        ? 'bg-slate-800 border-cyan-500/70 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span>{route.name}</span>
                    <span className="text-[11px] text-slate-500">{route.distanceMiles} mi</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Departure & Destination */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Origin Point</label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                <input
                  type="text"
                  value={startCity}
                  onChange={(e) => setStartCity(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Destination Point</label>
              <div className="relative">
                <Navigation className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400" />
                <input
                  type="text"
                  value={destCity}
                  onChange={(e) => setDestCity(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-slate-700"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Corridor Mileage</span>
                <span className="text-cyan-400">{distanceMiles} miles</span>
              </div>
              <input
                type="range"
                min="50"
                max="600"
                step="10"
                value={distanceMiles}
                onChange={(e) => setDistanceMiles(Number(e.target.value))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Vehicle Parameters */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Vehicle Specification</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-slate-700 cursor-pointer"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.make} {v.model} ({v.batteryCapacityKwh} kWh)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Initial SoC</label>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  <span className="font-bold text-slate-200">{startingSoC}%</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Buffer Minimum</label>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800">
                  <span className="font-bold text-slate-200">{minArrivalSoC}%</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full py-2.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 font-mono"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Compute Optimal Stops</span>
          </button>
        </div>

        {/* Right Columns: Trip Overview & Itinerary Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {tripResult && (
            <>
              {/* Trip Key Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Duration</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {tripResult.totalDurationHours} hrs
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {tripResult.drivingDurationHours}h transit • {tripResult.chargingDurationHours}h charge
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>Stops</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-400">
                    {tripResult.stops.length} Required
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    High speed taper curve
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                    <DollarSign className="w-3 h-3 text-cyan-400" />
                    <span>Cost</span>
                  </div>
                  <div className="text-lg font-bold text-cyan-300">
                    ${tripResult.totalChargingCost.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-0.5">
                    Save ${tripResult.savingsUsd.toFixed(2)} vs Gas
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                    <Leaf className="w-3 h-3 text-emerald-400" />
                    <span>Emissions</span>
                  </div>
                  <div className="text-lg font-bold text-emerald-400">
                    {tripResult.co2SavedKg} kg CO2
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Offset vs ICE standard
                  </div>
                </div>
              </div>

              {/* Itinerary Timeline */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3 font-mono">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-xs">
                  <div>
                    <h3 className="font-bold text-slate-100 uppercase">Routing Itinerary</h3>
                    <p className="text-[11px] text-slate-500">{tripResult.startCity} &rarr; {tripResult.destCity} ({tripResult.totalDistanceMiles} miles)</p>
                  </div>

                  <button
                    onClick={handleShareTrip}
                    aria-label="Share trip route"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                  >
                    <Share2 className="w-3 h-3 text-cyan-400" />
                    <span>{copiedShare ? 'Copied' : 'Export'}</span>
                  </button>
                </div>

                <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                  {/* Origin Step */}
                  <div className="relative text-xs">
                    <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Start: {tripResult.startCity}</div>
                        <div className="text-[11px] text-slate-400">Depart with {startingSoC}% battery</div>
                      </div>
                      <span className="text-slate-500">0 mi</span>
                    </div>
                  </div>

                  {/* Charging Stops */}
                  {tripResult.stops.map((stop, idx) => (
                    <div key={idx} className="relative p-3 rounded bg-slate-950 border border-slate-800">
                      <div className="absolute -left-[1.85rem] top-3.5 w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5 text-xs">
                        <div>
                          <span className="text-cyan-400 font-bold mr-2">STOP #{idx + 1}</span>
                          <span className="text-slate-200 font-semibold">{stop.station.name}</span>
                          <div className="text-[11px] text-slate-500 mt-0.5">{stop.station.address}, {stop.station.city}</div>
                        </div>

                        <button
                          onClick={() => onSelectStationOnMap(stop.station)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] border border-slate-700 transition-colors self-start sm:self-auto"
                        >
                          View Bay Status
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Arrival SoC</span>
                          <span className="font-bold text-amber-400">{stop.arrivalSoC}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Session Time</span>
                          <span className="font-bold text-cyan-400">~{stop.chargeDurationMins}m</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Target SoC</span>
                          <span className="font-bold text-emerald-400">{stop.departureSoC}% (+{stop.energyAddedKwh} kWh)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Session Cost</span>
                          <span className="font-bold text-slate-200">${stop.costEstimate.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Destination Step */}
                  <div className="relative text-xs">
                    <div className="absolute -left-[1.35rem] top-1 w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">Destination: {tripResult.destCity}</div>
                        <div className="text-[11px] text-slate-400">Estimated reserve ~32%</div>
                      </div>
                      <span className="text-slate-500">{tripResult.totalDistanceMiles} mi</span>
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
