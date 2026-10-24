import React, { useState } from 'react';
import { FilterState, ConnectorType, NetworkName, Amenity } from '../../types/ev';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Zap, 
  MapPin, 
  ArrowUpDown,
  RotateCcw,
  Check
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
    <div className="w-full space-y-2.5">
      {/* Search Bar + City Selector + Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter by station name, network, or address..."
            value={filters.searchQuery}
            onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-9 pr-8 py-2 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChangeFilters({ ...filters, searchQuery: '' })}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* City Filter */}
        <div className="relative shrink-0 sm:w-40">
          <select
            value={filters.selectedCity}
            onChange={(e) => onChangeFilters({ ...filters, selectedCity: e.target.value })}
            aria-label="Select city filter"
            className="w-full pl-3 pr-7 py-2 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-600 appearance-none cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c} value={c} className="bg-slate-900 text-slate-200">
                {c}
              </option>
            ))}
          </select>
          <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        {/* Sort Dropdown */}
        <div className="relative shrink-0 sm:w-36">
          <select
            value={filters.sortBy}
            onChange={(e) => onChangeFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            aria-label="Sort stations by"
            className="w-full pl-3 pr-7 py-2 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-slate-600 appearance-none cursor-pointer"
          >
            <option value="distance" className="bg-slate-900">Distance</option>
            <option value="price" className="bg-slate-900">Price ($/kWh)</option>
            <option value="speed" className="bg-slate-900">Power (kW)</option>
            <option value="availability" className="bg-slate-900">Available</option>
          </select>
          <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Filters Toggle Button - Rectangular, zero pill */}
        <button
          onClick={() => setShowDrawer(!showDrawer)}
          aria-label="Toggle advanced filters drawer"
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border text-xs font-mono transition-colors shrink-0 ${
            hasActiveFilters
              ? 'bg-slate-800 border-cyan-500/60 text-cyan-400'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
        </button>
      </div>

      {/* Filter Chips - NO rounded-full (use rounded-md), zero pill */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => onChangeFilters({ ...filters, availableOnly: !filters.availableOnly })}
          className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors shrink-0 flex items-center gap-1.5 ${
            filters.availableOnly
              ? 'bg-slate-800 text-emerald-400 border-emerald-500/60'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Available Only</span>
        </button>

        <button
          onClick={() => onChangeFilters({ ...filters, minPowerKw: filters.minPowerKw === 150 ? 0 : 150 })}
          className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors shrink-0 flex items-center gap-1.5 ${
            filters.minPowerKw >= 150
              ? 'bg-slate-800 text-cyan-400 border-cyan-500/60'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3 h-3 text-cyan-400" />
          <span>&ge; 150 kW</span>
        </button>

        <button
          onClick={() => toggleConnector('NACS')}
          className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors shrink-0 ${
            filters.connectors.includes('NACS')
              ? 'bg-slate-800 text-cyan-400 border-cyan-500/60'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span>NACS</span>
        </button>

        <button
          onClick={() => toggleConnector('CCS')}
          className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors shrink-0 ${
            filters.connectors.includes('CCS')
              ? 'bg-slate-800 text-cyan-400 border-cyan-500/60'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span>CCS</span>
        </button>

        <button
          onClick={() => onChangeFilters({ ...filters, renewableOnly: !filters.renewableOnly })}
          className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors shrink-0 ${
            filters.renewableOnly
              ? 'bg-slate-800 text-emerald-400 border-emerald-500/60'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span>Renewable Source</span>
        </button>

        <button
          onClick={() => onChangeFilters({ ...filters, openNowOnly: !filters.openNowOnly })}
          className={`px-2.5 py-1 rounded-md text-xs font-mono border transition-colors shrink-0 ${
            filters.openNowOnly
              ? 'bg-slate-800 text-cyan-400 border-cyan-500/60'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <span>24/7 Access</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="px-2 py-1 text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors flex items-center gap-1 shrink-0 ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Drawer */}
      {showDrawer && (
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300">
              Filter Parameters ({filteredCount} / {totalCount} matching)
            </h4>
            <button
              onClick={() => setShowDrawer(false)}
              className="text-slate-500 hover:text-white"
              aria-label="Close filters panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Network Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase">Networks</label>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {NETWORKS.map((net) => {
                  const checked = filters.networks.includes(net);
                  return (
                    <button
                      key={net}
                      onClick={() => toggleNetwork(net)}
                      className={`w-full text-left px-2 py-1 rounded text-xs font-mono flex items-center justify-between transition-colors ${
                        checked ? 'bg-slate-800 text-cyan-300 border border-slate-700' : 'text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <span>{net}</span>
                      {checked && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connectors & Power Slider */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
                  Connectors
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {CONNECTORS.map((c) => {
                    const checked = filters.connectors.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleConnector(c)}
                        className={`px-2 py-1 rounded text-xs font-mono text-center transition-colors border ${
                          checked
                            ? 'bg-slate-800 text-cyan-300 border-slate-700'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Min Power</span>
                  <span className="text-cyan-400">{filters.minPowerKw > 0 ? `${filters.minPowerKw} kW` : 'Any'}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="350"
                  step="25"
                  value={filters.minPowerKw}
                  onChange={(e) => onChangeFilters({ ...filters, minPowerKw: Number(e.target.value) })}
                  className="w-full accent-cyan-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Price Cap */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Max Tariff</span>
                  <span className="text-emerald-400">
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
                  className="w-full accent-emerald-400 h-1 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
