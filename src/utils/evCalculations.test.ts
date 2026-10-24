import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateEnergyNeed,
  estimateChargingTimeMinutes,
  calculateGasolineSavings,
  calculateCo2AvoidedKg,
  filterStations,
  sortStations,
  planEvTrip,
} from './evCalculations';
import { Station, FilterState, Vehicle } from '../types/ev';

const mockVehicle: Vehicle = {
  id: 'veh-1',
  make: 'Tesla',
  model: 'Model Y Long Range',
  year: 2024,
  batteryCapacityKwh: 75,
  usableRangeMiles: 310,
  defaultConnector: 'NACS',
  efficiencyWhPerMile: 270,
};

const mockStations: Station[] = [
  {
    id: 'st-1',
    name: 'Downtown Supercharger Hub',
    network: 'Tesla Supercharger',
    address: '450 Mission St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    lat: 37.7903,
    lng: -122.399,
    distanceMiles: 1.2,
    powerMaxKw: 250,
    speedCategory: 'Ultra-Fast',
    connectorTypes: ['NACS', 'CCS'],
    pricePerKwh: 0.38,
    idleFeePerMin: 0.50,
    isRenewable: true,
    rating: 4.9,
    reviewCount: 142,
    open24Hours: true,
    amenities: ['Coffee', 'Restroom', 'Wi-Fi'],
    stallsTotal: 16,
    stallsAvailable: 7,
    queueLength: 0,
    averageWaitMins: 0,
    actualVsAdvertisedSpeedPercent: 96,
    stalls: [],
    photos: [],
    hostVerified: true,
  },
  {
    id: 'st-2',
    name: 'Bay Area Green Fast Charge',
    network: 'Electrify America',
    address: '1000 Broadway',
    city: 'Oakland',
    state: 'CA',
    zip: '94607',
    lat: 37.8044,
    lng: -122.2711,
    distanceMiles: 8.5,
    powerMaxKw: 350,
    speedCategory: 'Ultra-Fast',
    connectorTypes: ['CCS', 'CHAdeMO'],
    pricePerKwh: 0.44,
    idleFeePerMin: 0.40,
    isRenewable: true,
    rating: 4.3,
    reviewCount: 88,
    open24Hours: true,
    amenities: ['Dining', 'Shopping'],
    stallsTotal: 8,
    stallsAvailable: 0, // Full
    queueLength: 2,
    averageWaitMins: 12,
    actualVsAdvertisedSpeedPercent: 88,
    stalls: [],
    photos: [],
    hostVerified: true,
  },
  {
    id: 'st-3',
    name: 'Civic Center Level 2 ChargePoint',
    network: 'ChargePoint',
    address: '355 McAllister St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    lat: 37.7801,
    lng: -122.418,
    distanceMiles: 2.1,
    powerMaxKw: 11,
    speedCategory: 'Level 2',
    connectorTypes: ['J1772'],
    pricePerKwh: 0.22,
    idleFeePerMin: 0.0,
    isRenewable: false,
    rating: 4.0,
    reviewCount: 35,
    open24Hours: false,
    amenities: ['Restroom'],
    stallsTotal: 4,
    stallsAvailable: 3,
    queueLength: 0,
    averageWaitMins: 0,
    actualVsAdvertisedSpeedPercent: 100,
    stalls: [],
    photos: [],
    hostVerified: false,
  },
];

test('calculateEnergyNeed computes correct kWh based on mileage and efficiency', () => {
  const kwh = calculateEnergyNeed(200, 300);
  assert.equal(kwh, 60); // (200 * 300) / 1000 = 60
  assert.equal(calculateEnergyNeed(0, 300), 0);
});

test('estimateChargingTimeMinutes returns sensible charge durations with taper buffer', () => {
  // 40 kWh on 250 kW DC Fast
  const mins = estimateChargingTimeMinutes(40, 250, 75);
  assert.ok(mins >= 10 && mins <= 30, `Expected minutes between 10 and 30, got ${mins}`);
  assert.equal(estimateChargingTimeMinutes(0, 250, 75), 0);
});

test('calculateGasolineSavings compares EV cost with ICE fuel cost', () => {
  const result = calculateGasolineSavings(300, 25.0);
  // ICE: 300 / 28 mpg = 10.71 gal * 3.85 = $41.25. Savings: 41.25 - 25.0 = $16.25
  assert.ok(result.gasCost > 40);
  assert.ok(result.savingsUsd > 10);
});

test('calculateCo2AvoidedKg returns positive carbon savings vs ICE vehicle', () => {
  const co2 = calculateCo2AvoidedKg(100, 28);
  assert.ok(co2 > 30, `Expected > 30 kg CO2 saved, got ${co2}`);
  assert.equal(calculateCo2AvoidedKg(0, 0), 0);
});

test('filterStations handles search queries, connectors, and availability', () => {
  const initialFilter: FilterState = {
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
  };

  // Default: returns all 3
  assert.equal(filterStations(mockStations, initialFilter).length, 3);

  // Search by network
  const searchFilter = { ...initialFilter, searchQuery: 'Electrify' };
  assert.equal(filterStations(mockStations, searchFilter).length, 1);

  // Filter available only (st-2 is full)
  const availableFilter = { ...initialFilter, availableOnly: true };
  const avail = filterStations(mockStations, availableFilter);
  assert.equal(avail.length, 2);
  assert.ok(avail.every((s) => s.stallsAvailable > 0));

  // Filter renewable only
  const renewFilter = { ...initialFilter, renewableOnly: true };
  const renew = filterStations(mockStations, renewFilter);
  assert.equal(renew.length, 2);

  // Filter connector NACS
  const nacsFilter = { ...initialFilter, connectors: ['NACS' as const] };
  const nacs = filterStations(mockStations, nacsFilter);
  assert.equal(nacs.length, 1);
  assert.equal(nacs[0].id, 'st-1');
});

test('sortStations orders correctly by distance, price, speed, rating', () => {
  const byDist = sortStations(mockStations, 'distance');
  assert.equal(byDist[0].id, 'st-1');

  const byPrice = sortStations(mockStations, 'price');
  assert.equal(byPrice[0].id, 'st-3'); // 0.22 is cheapest

  const bySpeed = sortStations(mockStations, 'speed');
  assert.equal(bySpeed[0].id, 'st-2'); // 350kW is fastest
});

test('planEvTrip calculates charging stops when trip exceeds safe battery range', () => {
  // Trip of 450 miles with 75 kWh battery will require charging stops
  const plan = planEvTrip(
    'San Francisco',
    'Los Angeles',
    380,
    mockStations,
    mockVehicle,
    80,
    15
  );

  assert.equal(plan.startCity, 'San Francisco');
  assert.equal(plan.destCity, 'Los Angeles');
  assert.ok(plan.stops.length >= 1, 'Should have at least 1 charging stop for 380 miles');
  assert.ok(plan.totalChargingCost > 0);
  assert.ok(plan.savingsUsd > 0);
  assert.ok(plan.co2SavedKg > 0);
});
