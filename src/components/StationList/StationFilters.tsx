import React, { useState } from 'react';
import { FilterState, ConnectorType, SpeedCategory, NetworkName, Amenity } from '../../types/ev';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Zap, 
  Leaf, 
  Check, 
  MapPin, 
  ArrowUpDown,
  RotateCcw
} from 'lucide-react';

interface StationFiltersProps {
  filters: FilterState;
  onChangeFilters: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

const CITIES = ['All Cities', 'San Francisco', 'Oakland', 'San Jose', 'Austin', 'Los Angeles', 'Seattle', 'Truckee', 'Barstow'];
const NETWORKS: NetworkName[] = ['Tesla Supercharger', 'Electrify America', 'ChargePoint', 'EVgo', 'Shell Recharge'];
const CONNECTORS: ConnectorType[] = ['CCS', 'NACS', 'CHAdeMO', 'J1772'];
const AMENITIES: Amenity[] = ['Restroom', 'Coffee', 'Dining', 'Wi-Fi', 'Shopping', 'Lounge'];

export const StationFilters: React.FC<StationFiltersProps> = ({
  filters,
  onChangeFilters,
  totalCount,
  filteredCount,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const toggleConnector = (connector: ConnectorType) => {
    const exists = filters.connectors.includes(connector);
    const updated = exists
      ? filters.connectors.filter((c) => c !== connector)
      : [...filters.connectors, connector];
    onChangeFilters({ ...filters, connectors: updated });
  };

  const toggleNetwork = (net: NetworkName) => {
    const exists = filters.networks.includes(net);
    const updated = exists
      ? filters.networks.filter((n) => n !== net)
      : [...filters.networks, net];
    onChangeFilters({ ...filters, networks: updated });
  };

  const toggleAmenity = (amenity: Amenity) => {
    const exists = filters.amenities.includes(amenity);
    const updated = exists
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onChangeFilters({ ...filters, amenities: updated });
  };

  const resetAllFilters = () => {
    onChangeFilters({
      searchQuery: '',
      selectedCity: 'All Cities',
      connectors: [],
      speedCategories: [],
      networks: [],
      minPowerKw: 0,
      maxPrice: 1.0,
      renewableOnly: false,
      availableOnly: false,
      openNowOnly: false,
      amenities: [],
      sortBy: 'distance',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.selectedCity !== 'All Cities' ||
    filters.connectors.length > 0 ||
    filters.networks.length > 0 ||
    filters.minPowerKw > 0 ||
    filters.maxPrice < 1.0 ||
    filters.renewableOnly ||
    filters.availableOnly ||
    filters.openNowOnly ||
    filters.amenities.length > 0 ||
    filters.sortBy !== 'distance';

  return (
    <div className="w-full space-y-3">
      {/* Search Bar + City Selector + Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search station, network, address or ZIP..."
            value={filters.searchQuery}
            onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChangeFilters({ ...filters, searchQuery: '' })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* City Filter */}
        <div className="relative shrink-0 sm:w-44">
          <select
            value={filters.selectedCity}
            onChange={(e) => onChangeFilters({ ...filters, selectedCity: e.target.value })}
            aria-label="Select city filter"
            className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-slate-200">
                {c}
              </option>
            ))}
          </select>
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative shrink-0 sm:w-40">
          <select
            value={filters.sortBy}
            onChange={(e) => onChangeFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            aria-label="Sort stations by"
            className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors appearance-none cursor-pointer"
          >
            <option value="distance" className="bg-slate-900">Nearest Distance</option>
            <option value="price" className="bg-slate-900">Lowest Price ($/kWh)</option>
            <option value="speed" className="bg-slate-900">Fastest (Power kW)</option>
            <option value="rating" className="bg-slate-900">Highest Rated</option>
            <option value="availability" className="bg-slate-900">Most Available</option>
          </select>
          <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* More Filters Button */}
        <button
          onClick={() => setShowDrawer(!showDrawer)}
          aria-label="Toggle advanced filters drawer"
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 active:scale-95 ${
            hasActiveFilters
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </button>
      </div>

      {/* Quick Filter Chips Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onChangeFilters({ ...filters, availableOnly: !filters.availableOnly })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 flex items-center gap-1.5 ${
            filters.availableOnly
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Available Now</span>
        </button>

        <button
          onClick={() => onChangeFilters({ ...filters, minPowerKw: filters.minPowerKw === 150 ? 0 : 150 })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 flex items-center gap-1.5 ${
            filters.minPowerKw >= 150
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Fast 150kW+</span>
        </button>

        <button
          onClick={() => toggleConnector('NACS')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 flex items-center gap-1.5 ${
            filters.connectors.includes('NACS')
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <span>Tesla / NACS</span>
        </button>

        <button
          onClick={() => toggleConnector('CCS')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 flex items-center gap-1.5 ${
            filters.connectors.includes('CCS')
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <span>CCS Combo</span>
        </button>

        <button
          onClick={() => onChangeFilters({ ...filters, renewableOnly: !filters.renewableOnly })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 flex items-center gap-1.5 ${
            filters.renewableOnly
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Green Energy</span>
        </button>

        <button
          onClick={() => onChangeFilters({ ...filters, openNowOnly: !filters.openNowOnly })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${
            filters.openNowOnly
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span>24/7 Access</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 shrink-0 ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Drawer */}
      {showDrawer && (
        <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              Detailed Filtering Options
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Showing <strong className="text-slate-200">{filteredCount}</strong> of {totalCount} stations
              </span>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close filters panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Network Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Charging Networks</label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {NETWORKS.map((net) => {
                  const checked = filters.networks.includes(net);
                  return (
                    <button
                      key={net}
                      onClick={() => toggleNetwork(net)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        checked ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{net}</span>
                      {checked && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connectors & Power Slider */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Connector Plugs
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CONNECTORS.map((c) => {
                    const checked = filters.connectors.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleConnector(c)}
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium text-center transition-colors border ${
                          checked
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  <span>Minimum Power</span>
                  <span className="text-cyan-400 font-mono">{filters.minPowerKw > 0 ? `${filters.minPowerKw} kW` : 'Any'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="350"
                  step="25"
                  value={filters.minPowerKw}
                  onChange={(e) => onChangeFilters({ ...filters, minPowerKw: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Price Cap & Amenities */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  <span>Max Price per kWh</span>
                  <span className="text-emerald-400 font-mono">
                    {filters.maxPrice < 1.0 ? `$${filters.maxPrice.toFixed(2)}/kWh` : 'No Limit'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.60"
                  step="0.02"
                  value={filters.maxPrice > 0.60 ? 0.60 : filters.maxPrice}
                  onChange={(e) => onChangeFilters({ ...filters, maxPrice: Number(e.target.value) })}
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Station Amenities
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AMENITIES.map((a) => {
                    const checked = filters.amenities.includes(a);
                    return (
                      <button
                        key={a}
                        onClick={() => toggleAmenity(a)}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors border ${
                          checked
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                        }`}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
