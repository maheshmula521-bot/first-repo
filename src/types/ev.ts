export type ConnectorType = 'CCS' | 'NACS' | 'CHAdeMO' | 'J1772';
export type SpeedCategory = 'Level 2' | 'DC Fast' | 'Ultra-Fast';
export type NetworkName = 'Tesla Supercharger' | 'Electrify America' | 'ChargePoint' | 'EVgo' | 'Shell Recharge' | 'Blink';
export type Amenity = 'Restroom' | 'Coffee' | 'Dining' | 'Wi-Fi' | 'Shopping' | 'Lounge' | 'Valet';

export interface StallInfo {
  id: string;
  stallNumber: string;
  connectorType: ConnectorType;
  maxKw: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentVehicle?: string;
  minsRemaining?: number;
}

export interface Station {
  id: string;
  name: string;
  network: NetworkName;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  distanceMiles: number;
  powerMaxKw: number;
  speedCategory: SpeedCategory;
  connectorTypes: ConnectorType[];
  pricePerKwh: number;
  idleFeePerMin: number;
  isRenewable: boolean;
  rating: number;
  reviewCount: number;
  open24Hours: boolean;
  amenities: Amenity[];
  stallsTotal: number;
  stallsAvailable: number;
  queueLength: number;
  averageWaitMins: number;
  actualVsAdvertisedSpeedPercent: number;
  stalls: StallInfo[];
  photos: string[];
  hostVerified: boolean;
}

export interface FilterState {
  searchQuery: string;
  selectedCity: string;
  connectors: ConnectorType[];
  speedCategories: SpeedCategory[];
  networks: NetworkName[];
  minPowerKw: number;
  maxPrice: number;
  renewableOnly: boolean;
  availableOnly: boolean;
  openNowOnly: boolean;
  amenities: Amenity[];
  sortBy: 'distance' | 'price' | 'speed' | 'rating' | 'availability';
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  batteryCapacityKwh: number;
  usableRangeMiles: number;
  defaultConnector: ConnectorType;
  efficiencyWhPerMile: number;
  imageUrl?: string;
}

export interface Reservation {
  id: string;
  stationId: string;
  stationName: string;
  stationAddress: string;
  stallId: string;
  stallNumber: string;
  connectorType: ConnectorType;
  powerKw: number;
  startTime: string; // ISO string
  durationMins: number;
  status: 'confirmed' | 'active' | 'completed' | 'cancelled';
  vehicleName: string;
  targetKwh: number;
  estimatedCost: number;
  pinCode: string;
  qrCodeData: string;
  createdAt: string;
}

export interface TripPlanStop {
  station: Station;
  distanceFromStartMiles: number;
  arrivalSoC: number; // percentage
  departureSoC: number; // percentage
  energyAddedKwh: number;
  chargeDurationMins: number;
  costEstimate: number;
}

export interface TripPlanResult {
  startCity: string;
  destCity: string;
  totalDistanceMiles: number;
  drivingDurationHours: number;
  chargingDurationHours: number;
  totalDurationHours: number;
  stops: TripPlanStop[];
  totalEnergyKwh: number;
  totalChargingCost: number;
  gasolineEquivalentCost: number;
  savingsUsd: number;
  co2SavedKg: number;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorBadge: string;
  stationId: string;
  stationName: string;
  city: string;
  rating: number;
  speedReportKw?: number;
  advertisedSpeedKw?: number;
  comment: string;
  upvotes: number;
  userUpvoted?: boolean;
  timestamp: string;
  verifiedCharge: boolean;
  tags: string[];
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  badge: string;
  kwhCharged: number;
  co2SavedKg: number;
  stationsVisited: number;
  points: number;
}
