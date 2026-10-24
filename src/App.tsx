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
  LeaderboardUser, 
  FilterState, 
  StallInfo 
} from './types/ev';
import { 
  INITIAL_STATIONS, 
  INITIAL_VEHICLES, 
  INITIAL_RESERVATIONS, 
  INITIAL_COMMUNITY_POSTS, 
  INITIAL_LEADERBOARD 
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
import { 
  Zap, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Leaf, 
  Layers, 
  ListFilter,
  CheckCircle2,
  Car
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);

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

  // Layout View Mode on Explore Tab: 'split' | 'map' | 'list'
  const [exploreViewMode, setExploreViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Simulated Real-Time Telemetry: minor fluctuations in stall availability over time
  useEffect(() => {
    const interval = setInterval(() => {
      setStations((prevStations) =>
        prevStations.map((st) => {
          // 25% chance of subtle status fluctuation to simulate cars arriving/leaving
          if (Math.random() > 0.75) {
            const delta = Math.random() > 0.5 ? 1 : -1;
            const newAvail = Math.max(0, Math.min(st.stallsTotal, st.stallsAvailable + delta));
            return {
              ...st,
              stallsAvailable: newAvail,
              queueLength: newAvail === 0 ? Math.floor(Math.random() * 3 + 1) : 0,
            };
          }
          return st;
        })
      );
    }, 18000);

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
    // Decrement availability of that station
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
    // Give user 50 leaderboard points
    setLeaderboard((prev) =>
      prev.map((u) =>
        u.name.includes('You') ? { ...u, points: u.points + 50 } : u
      )
    );
  };

  const handleUpvotePost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const upvoted = !p.userUpvoted;
          return {
            ...p,
            upvotes: upvoted ? p.upvotes + 1 : p.upvotes - 1,
            userUpvoted: upvoted,
          };
        }
        return p;
      })
    );
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
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onSelectVehicle={setSelectedVehicleId}
        favoritesCount={favorites.length}
        reservationsCount={reservations.filter((r) => r.status === 'confirmed').length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* TAB 1: EXPLORE MAP & STATIONS */}
        {activeTab === 'explore' && (
          <div className="space-y-6">
            {/* Hero Headline & Live Network Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#071326] to-slate-900 border border-slate-800 shadow-2xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/50">
                    <Sparkles className="w-3.5 h-3.5" />
                    Real-time EV Charging Grid
                  </span>
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live Syncing
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Find. Reserve. Charge.
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Locate ultra-fast charging hubs across Tesla Supercharger, Electrify America, EVgo and ChargePoint with verified speeds and zero queues.
                </p>
              </div>

              {/* View Layout Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950 border border-slate-800 self-start md:self-center shrink-0">
                <button
                  onClick={() => setExploreViewMode('split')}
                  aria-label="Split view (Map + List)"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    exploreViewMode === 'split' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Split View
                </button>
                <button
                  onClick={() => setExploreViewMode('map')}
                  aria-label="Full map view"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    exploreViewMode === 'map' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Map Only
                </button>
                <button
                  onClick={() => setExploreViewMode('list')}
                  aria-label="Cards list view"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    exploreViewMode === 'list' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Column */}
              {(exploreViewMode === 'split' || exploreViewMode === 'map') && (
                <div className={`transition-all ${
                  exploreViewMode === 'map' ? 'lg:col-span-12 h-[750px]' : 'lg:col-span-7 h-[680px]'
                } sticky top-20`}>
                  <InteractiveMap
                    stations={filteredStations}
                    selectedStation={selectedStation}
                    onSelectStation={(st) => {
                      setSelectedStation(st);
                      // On mobile, also open detail modal
                      if (window.innerWidth < 1024) {
                        setIsDetailModalOpen(true);
                      }
                    }}
                  />
                </div>
              )}

              {/* Station Cards List Column */}
              {(exploreViewMode === 'split' || exploreViewMode === 'list') && (
                <div className={`space-y-4 ${
                  exploreViewMode === 'list' ? 'lg:col-span-12' : 'lg:col-span-5'
                }`}>
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {filteredStations.length} {filteredStations.length === 1 ? 'Station' : 'Stations'} Located
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Sorted by {filters.sortBy}
                    </span>
                  </div>

                  {filteredStations.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
                      <Zap className="w-8 h-8 text-slate-600 mx-auto" />
                      <div className="font-bold text-white text-base">No stations match your filters</div>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Try clearing connector types or expanding your price and power range.
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
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className={`grid gap-4 ${exploreViewMode === 'list' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
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

        {/* TAB 3: COMMUNITY & LEADERBOARD */}
        {activeTab === 'community' && (
          <CommunityView
            posts={communityPosts}
            leaderboard={leaderboard}
            stations={stations}
            onAddPost={handleAddCommunityPost}
            onUpvotePost={handleUpvotePost}
          />
        )}

        {/* TAB 4: USER HUB & GARAGE */}
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
      </main>

      {/* MODAL: Station Full Details */}
      {isDetailModalOpen && (
        <StationDetailModal
          station={selectedStation}
          isFavorite={selectedStation ? favorites.includes(selectedStation.id) : false}
          onClose={() => setIsDetailModalOpen(false)}
          onToggleFavorite={handleToggleFavorite}
          onOpenReservation={handleOpenReservation}
        />
      )}

      {/* MODAL: Stall Reservation & Digital Pass */}
      {isReservationModalOpen && (
        <ReservationModal
          station={selectedStation}
          initialStall={selectedStallForReservation}
          vehicles={vehicles}
          onClose={() => setIsReservationModalOpen(false)}
          onConfirmReservation={handleConfirmReservation}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#04070e] py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">VoltPulse EV Network</span>
            <span>• Built for the modern electric driver</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Aggregating Tesla • Electrify America • EVgo • ChargePoint</span>
            <span className="text-emerald-400 font-semibold">100% Verified Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
