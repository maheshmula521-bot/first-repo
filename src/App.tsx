/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Station, 
  Vehicle, 
  Reservation, 
  CommunityPost, 
  FilterState, 
  StallInfo 
} from './types/ev';
import { 
  INITIAL_STATIONS, 
  INITIAL_VEHICLES, 
  INITIAL_RESERVATIONS, 
  INITIAL_COMMUNITY_POSTS 
} from './data/mockData';
import { filterStations, sortStations } from './utils/evCalculations';
import { Navbar, NavTab } from './components/Navbar';
import { InteractiveMap } from './components/Map/InteractiveMap';
import { StationFilters } from './components/StationList/StationFilters';
import { StationCard } from './components/StationList/StationCard';
import { StationDetailModal } from './components/StationDetails/StationDetailModal';
import { ReservationModal } from './components/Reservation/ReservationModal';
import { TripPlannerView } from './components/TripPlanner/TripPlannerView';
import { CommunityView } from './components/Community/CommunityView';
import { UserHubView } from './components/UserHub/UserHubView';
import { OperatorDashboard } from './components/Operator/OperatorDashboard';
import { PrivacyPolicyView } from './components/Legal/PrivacyPolicyView';
import { 
  Zap, 
  Layers,
  Lock,
  Radio
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('explore');
  const [stations, setStations] = useState<Station[]>(INITIAL_STATIONS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(INITIAL_VEHICLES[0].id);
  
  // Selected Station & Modals
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedStallForReservation, setSelectedStallForReservation] = useState<StallInfo | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);

  // User Hub & Community Data
  const [favorites, setFavorites] = useState<string[]>(['st-sf-1', 'st-austin-1']);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
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

  // View Mode: 'split' | 'map' | 'list'
  const [exploreViewMode, setExploreViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Simulated Telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStations((prevStations) =>
        prevStations.map((st) => {
          if (Math.random() > 0.8) {
            const delta = Math.random() > 0.5 ? 1 : -1;
            const newAvail = Math.max(0, Math.min(st.stallsTotal, st.stallsAvailable + delta));
            return {
              ...st,
              stallsAvailable: newAvail,
              queueLength: newAvail === 0 ? Math.floor(Math.random() * 2 + 1) : 0,
            };
          }
          return st;
        })
      );
    }, 22000);

    return () => clearInterval(interval);
  }, []);

  // Filtered & Sorted Stations
  const filteredStations = useMemo(() => {
    const filtered = filterStations(stations, filters);
    return sortStations(filtered, filters.sortBy);
  }, [stations, filters]);

  const favoriteStationsList = useMemo(() => {
    return stations.filter((s) => favorites.includes(s.id));
  }, [stations, favorites]);

  // Handlers
  const handleToggleFavorite = (stationId: string) => {
    setFavorites((prev) =>
      prev.includes(stationId) ? prev.filter((id) => id !== stationId) : [...prev, stationId]
    );
  };

  const handleSelectStation = (station: Station) => {
    setSelectedStation(station);
    setIsDetailModalOpen(true);
  };

  const handleOpenReservation = (station: Station, stall?: StallInfo) => {
    setSelectedStation(station);
    setSelectedStallForReservation(stall || null);
    setIsDetailModalOpen(false);
    setIsReservationModalOpen(true);
  };

  const handleConfirmReservation = (newReservation: Reservation) => {
    setReservations((prev) => [newReservation, ...prev]);
    setStations((prev) =>
      prev.map((s) =>
        s.id === newReservation.stationId
          ? { ...s, stallsAvailable: Math.max(0, s.stallsAvailable - 1) }
          : s
      )
    );
  };

  const handleCancelReservation = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: 'cancelled' } : r))
    );
  };

  const handleAddVehicle = (newVehicle: Vehicle) => {
    setVehicles((prev) => [...prev, newVehicle]);
    setSelectedVehicleId(newVehicle.id);
  };

  const handleAddCommunityPost = (newPost: CommunityPost) => {
    setCommunityPosts((prev) => [newPost, ...prev]);
  };

  const handleUpdateStationPrice = (stationId: string, newPrice: number, newIdleFee: number) => {
    setStations((prev) =>
      prev.map((s) =>
        s.id === stationId ? { ...s, pricePerKwh: newPrice, idleFeePerMin: newIdleFee } : s
      )
    );
  };

  const handleToggleStallMaintenance = (stallId: string) => {
    setStations((prev) =>
      prev.map((s) => ({
        ...s,
        stalls: s.stalls.map((stall) =>
          stall.id === stallId
            ? { ...stall, status: stall.status === 'maintenance' ? 'available' : 'maintenance' }
            : stall
        ),
      }))
    );
  };

  return (
    <div className="min-h-screen bg-[#090d14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={setSelectedVehicleId}
        reservationsCount={reservations.filter((r) => r.status === 'confirmed').length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5">
        {/* TAB 1: EXPLORE MAP & STATIONS */}
        {activeTab === 'explore' && (
          <div className="space-y-4">
            {/* Header: Concise technical copy without purple gradients or vague hero text */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg bg-slate-900 border border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                    Infrastructure Telemetry
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Grid Sync 100%
                  </span>
                </div>
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Public EV Charging Network Directory
                </h1>
                <p className="text-xs text-slate-400 max-w-2xl font-mono">
                  Real-time bay occupancy, verified delivered power (kW), and slot hold reservations across NACS, CCS, and J1772 hardware.
                </p>
              </div>

              {/* View Layout Toggle - Rectangular buttons */}
              <div className="flex items-center gap-1 p-0.5 rounded-md bg-slate-950 border border-slate-800 shrink-0 font-mono">
                <button
                  onClick={() => setExploreViewMode('split')}
                  aria-label="Split view (Map + List)"
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    exploreViewMode === 'split' ? 'bg-slate-800 text-cyan-300 border border-slate-700' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Split
                </button>
                <button
                  onClick={() => setExploreViewMode('map')}
                  aria-label="Full map view"
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    exploreViewMode === 'map' ? 'bg-slate-800 text-cyan-300 border border-slate-700' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Map Only
                </button>
                <button
                  onClick={() => setExploreViewMode('list')}
                  aria-label="Cards list view"
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    exploreViewMode === 'list' ? 'bg-slate-800 text-cyan-300 border border-slate-700' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  List Only
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <StationFilters
              filters={filters}
              onChangeFilters={setFilters}
              totalCount={stations.length}
              filteredCount={filteredStations.length}
            />

            {/* Grid & Map Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Map Column */}
              {(exploreViewMode === 'split' || exploreViewMode === 'map') && (
                <div className={`transition-all ${
                  exploreViewMode === 'map' ? 'lg:col-span-12 h-[720px]' : 'lg:col-span-7 h-[640px]'
                } sticky top-16`}>
                  <InteractiveMap
                    stations={filteredStations}
                    selectedStation={selectedStation}
                    onSelectStation={(st) => {
                      setSelectedStation(st);
                      if (window.innerWidth < 1024) {
                        setIsDetailModalOpen(true);
                      }
                    }}
                  />
                </div>
              )}

              {/* Station Cards List Column */}
              {(exploreViewMode === 'split' || exploreViewMode === 'list') && (
                <div className={`space-y-3 ${
                  exploreViewMode === 'list' ? 'lg:col-span-12' : 'lg:col-span-5'
                }`}>
                  <div className="flex items-center justify-between px-1 text-xs font-mono">
                    <span className="font-semibold text-slate-300 uppercase">
                      {filteredStations.length} Stations Available
                    </span>
                    <span className="text-slate-500">
                      Sort: {filters.sortBy}
                    </span>
                  </div>

                  {filteredStations.length === 0 ? (
                    <div className="p-8 text-center rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono">
                      <div className="font-bold text-white text-sm">No stations match criteria</div>
                      <p className="text-xs text-slate-500">
                        Reset filters or broaden city range.
                      </p>
                      <button
                        onClick={() => setFilters({
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
                        })}
                        className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs text-cyan-400 font-mono transition-colors"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className={`grid gap-3 ${exploreViewMode === 'list' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                      {filteredStations.map((station) => (
                        <StationCard
                          key={station.id}
                          station={station}
                          isSelected={selectedStation?.id === station.id}
                          isFavorite={favorites.includes(station.id)}
                          onSelect={handleSelectStation}
                          onReserve={(st) => handleOpenReservation(st)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TRIP PLANNER */}
        {activeTab === 'trip-planner' && (
          <TripPlannerView
            stations={stations}
            vehicles={vehicles}
            onSelectStationOnMap={(st) => {
              setSelectedStation(st);
              setIsDetailModalOpen(true);
            }}
          />
        )}

        {/* TAB 3: DIAGNOSTICS & FIELD LOGS */}
        {activeTab === 'community' && (
          <CommunityView
            posts={communityPosts}
            stations={stations}
            onAddPost={handleAddCommunityPost}
          />
        )}

        {/* TAB 4: DRIVER CONSOLE & GARAGE */}
        {activeTab === 'user-hub' && (
          <UserHubView
            vehicles={vehicles}
            reservations={reservations}
            favoriteStations={favoriteStationsList}
            onSelectStation={handleSelectStation}
            onAddVehicle={handleAddVehicle}
            onCancelReservation={handleCancelReservation}
          />
        )}

        {/* TAB 5: B2B OPERATOR DASHBOARD */}
        {activeTab === 'operator' && (
          <OperatorDashboard
            station={selectedStation || stations[0]}
            onUpdateStationPrice={handleUpdateStationPrice}
            onToggleStallMaintenance={handleToggleStallMaintenance}
          />
        )}

        {/* TAB 6: PRIVACY POLICY PAGE */}
        {activeTab === 'privacy' && (
          <PrivacyPolicyView
            onBackToStations={() => setActiveTab('explore')}
          />
        )}
      </main>

      {/* MODAL: Station Details */}
      {isDetailModalOpen && (
        <StationDetailModal
          station={selectedStation}
          isFavorite={selectedStation ? favorites.includes(selectedStation.id) : false}
          onClose={() => setIsDetailModalOpen(false)}
          onToggleFavorite={handleToggleFavorite}
          onOpenReservation={handleOpenReservation}
        />
      )}

      {/* MODAL: Stall Reservation */}
      {isReservationModalOpen && (
        <ReservationModal
          station={selectedStation}
          initialStall={selectedStallForReservation}
          vehicles={vehicles}
          onClose={() => setIsReservationModalOpen(false)}
          onConfirmReservation={handleConfirmReservation}
        />
      )}

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-800 bg-[#070a10] py-6 text-xs text-slate-500 font-mono mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-200">VoltPulse Systems</span>
            <span>• OCPP 2.0.1 Telemetry Relay</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('privacy')}
              className="hover:text-slate-200 underline decoration-slate-700 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Privacy Policy</span>
            </button>
            <span>NACS / CCS / J1772 Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
