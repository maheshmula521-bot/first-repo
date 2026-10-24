import { FilterState, Station, TripPlanResult, TripPlanStop, Vehicle } from '../types/ev';

/**
 * Calculates estimated kWh needed for a given distance based on vehicle efficiency.
 */
export function calculateEnergyNeed(distanceMiles: number, efficiencyWhPerMile: number): number {
  if (distanceMiles <= 0 || efficiencyWhPerMile <= 0) return 0;
  return Number(((distanceMiles * efficiencyWhPerMile) / 1000).toFixed(2));
}

/**
 * Realistic charging duration estimate in minutes.
 * Models an 80% taper factor because charging slows down above 60-80% SoC.
 */
export function estimateChargingTimeMinutes(
  kwhToAdd: number,
  stationPowerKw: number,
  batteryCapacityKwh: number,
  targetSoC: number = 80
): number {
  if (kwhToAdd <= 0 || stationPowerKw <= 0) return 0;
  
  // Effective power factoring EV charging curves (real world ~82% average delivery)
  const effectivePowerKw = Math.min(stationPowerKw, 250) * 0.82;
  const hours = kwhToAdd / effectivePowerKw;
  const minutes = Math.ceil(hours * 60);
  
  // Minimum connection & handshake overhead is 2 minutes
  return Math.max(minutes + 2, 8);
}

/**
 * Compares EV charging cost with average gasoline ICE vehicle cost.
 * Average US ICE car: 28 MPG, $3.85/gallon.
 */
export function calculateGasolineSavings(
  distanceMiles: number,
  evChargingCostUsd: number,
  gasMpg: number = 28,
  gasPricePerGallon: number = 3.85
): { gasCost: number; savingsUsd: number } {
  if (distanceMiles <= 0) return { gasCost: 0, savingsUsd: 0 };
  const gallonsNeeded = distanceMiles / gasMpg;
  const gasCost = Number((gallonsNeeded * gasPricePerGallon).toFixed(2));
  const savingsUsd = Number(Math.max(0, gasCost - evChargingCostUsd).toFixed(2));
  return { gasCost, savingsUsd };
}

/**
 * Calculates CO2 emissions avoided in kg compared to an ICE car.
 * EPA standard: ~404 grams (0.404 kg) of CO2 per mile for average passenger vehicle.
 * EV grid impact subtracted (clean energy grid factor ~0.08 kg/kWh).
 */
export function calculateCo2AvoidedKg(distanceMiles: number, totalKwhUsed: number): number {
  if (distanceMiles <= 0) return 0;
  const iceEmissionsKg = distanceMiles * 0.404;
  const evGridEmissionsKg = totalKwhUsed * 0.08;
  const netSavedKg = Math.max(0, iceEmissionsKg - evGridEmissionsKg);
  return Number(netSavedKg.toFixed(1));
}

/**
 * Filter stations by multiple criteria
 */
export function filterStations(stations: Station[], filters: FilterState): Station[] {
  return stations.filter((station) => {
    // Search query matches name, network, address, city
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchName = station.name.toLowerCase().includes(q);
      const matchNetwork = station.network.toLowerCase().includes(q);
      const matchCity = station.city.toLowerCase().includes(q);
      const matchAddress = station.address.toLowerCase().includes(q);
      if (!matchName && !matchNetwork && !matchCity && !matchAddress) return false;
    }

    // City filter
    if (filters.selectedCity && filters.selectedCity !== 'All Cities') {
      if (station.city.toLowerCase() !== filters.selectedCity.toLowerCase()) return false;
    }

    // Connectors filter
    if (filters.connectors.length > 0) {
      const hasConnector = filters.connectors.some((c) => station.connectorTypes.includes(c));
      if (!hasConnector) return false;
    }

    // Speed categories filter
    if (filters.speedCategories.length > 0) {
      if (!filters.speedCategories.includes(station.speedCategory)) return false;
    }

    // Networks filter
    if (filters.networks.length > 0) {
      if (!filters.networks.includes(station.network)) return false;
    }

    // Min Power kW
    if (filters.minPowerKw > 0 && station.powerMaxKw < filters.minPowerKw) {
      return false;
    }

    // Max Price per kWh
    if (filters.maxPrice < 1.0 && station.pricePerKwh > filters.maxPrice) {
      return false;
    }

    // Renewable only
    if (filters.renewableOnly && !station.isRenewable) {
      return false;
    }

    // Available only
    if (filters.availableOnly && station.stallsAvailable <= 0) {
      return false;
    }

    // Open now
    if (filters.openNowOnly && !station.open24Hours) {
      return false;
    }

    // Amenities
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every((a) => station.amenities.includes(a));
      if (!hasAllAmenities) return false;
    }

    return true;
  });
}

/**
 * Sort stations by designated metric
 */
export function sortStations(stations: Station[], sortBy: FilterState['sortBy']): Station[] {
  const cloned = [...stations];
  switch (sortBy) {
    case 'distance':
      return cloned.sort((a, b) => a.distanceMiles - b.distanceMiles);
    case 'price':
      return cloned.sort((a, b) => a.pricePerKwh - b.pricePerKwh);
    case 'speed':
      return cloned.sort((a, b) => b.powerMaxKw - a.powerMaxKw);
    case 'rating':
      return cloned.sort((a, b) => b.rating - a.rating);
    case 'availability':
      return cloned.sort((a, b) => b.stallsAvailable - a.stallsAvailable);
    default:
      return cloned;
  }
}

/**
 * Multi-stop EV Trip Optimizer algorithm
 */
export function planEvTrip(
  startCity: string,
  destCity: string,
  totalDistanceMiles: number,
  candidateStations: Station[],
  vehicle: Vehicle,
  startingSoCPercent: number = 85,
  minArrivalSoCPercent: number = 15
): TripPlanResult {
  const efficiencyWhPerMile = vehicle.efficiencyWhPerMile || 300;
  const usableKwh = vehicle.batteryCapacityKwh;
  const totalEnergyNeededKwh = calculateEnergyNeed(totalDistanceMiles, efficiencyWhPerMile);
  
  // Usable range with initial charge down to minimum buffer
  const initialEnergyKwh = (usableKwh * startingSoCPercent) / 100;
  const minBufferKwh = (usableKwh * minArrivalSoCPercent) / 100;
  const initialAvailableEnergyKwh = Math.max(0, initialEnergyKwh - minBufferKwh);
  const initialSafeRangeMiles = (initialAvailableEnergyKwh * 1000) / efficiencyWhPerMile;

  const stops: TripPlanStop[] = [];
  let accumulatedChargingTimeMins = 0;
  let totalChargingCost = 0;

  // If trip distance is well within range without any stop
  if (totalDistanceMiles <= initialSafeRangeMiles) {
    const drivingHours = totalDistanceMiles / 62; // avg 62 mph highway
    const { gasCost, savingsUsd } = calculateGasolineSavings(totalDistanceMiles, 0);
    return {
      startCity,
      destCity,
      totalDistanceMiles,
      drivingDurationHours: Number(drivingHours.toFixed(1)),
      chargingDurationHours: 0,
      totalDurationHours: Number(drivingHours.toFixed(1)),
      stops: [],
      totalEnergyKwh: totalEnergyNeededKwh,
      totalChargingCost: 0,
      gasolineEquivalentCost: gasCost,
      savingsUsd: savingsUsd,
      co2SavedKg: calculateCo2AvoidedKg(totalDistanceMiles, totalEnergyNeededKwh),
    };
  }

  // Needs 1 or more stops along the corridor. We pick candidate stations positioned along distance
  // Target charging between 15% and 80% (the fastest EV charging sweet spot).
  const sortedCandidates = [...candidateStations].sort((a, b) => b.powerMaxKw - a.powerMaxKw);

  const numStopsNeeded = Math.max(1, Math.ceil((totalDistanceMiles - initialSafeRangeMiles) / 170));
  const segmentDistance = totalDistanceMiles / (numStopsNeeded + 1);

  for (let i = 1; i <= numStopsNeeded; i++) {
    const targetDistance = segmentDistance * i;
    // Pick the best station candidate (prefer fast charging & high rating)
    const stationIndex = (i - 1) % sortedCandidates.length;
    const selectedStation = sortedCandidates[stationIndex] || candidateStations[0];

    const arrivalSoC = Math.max(minArrivalSoCPercent, 18);
    const departureSoC = 80; // Fast charge to 80%
    const percentAdded = departureSoC - arrivalSoC;
    const energyAddedKwh = Number(((usableKwh * percentAdded) / 100).toFixed(1));
    const chargeDurationMins = estimateChargingTimeMinutes(energyAddedKwh, selectedStation.powerMaxKw, usableKwh, departureSoC);
    const stopCost = Number((energyAddedKwh * selectedStation.pricePerKwh).toFixed(2));

    accumulatedChargingTimeMins += chargeDurationMins;
    totalChargingCost += stopCost;

    stops.push({
      station: selectedStation,
      distanceFromStartMiles: Math.round(targetDistance),
      arrivalSoC,
      departureSoC,
      energyAddedKwh,
      chargeDurationMins,
      costEstimate: stopCost,
    });
  }

  const drivingHours = totalDistanceMiles / 62;
  const chargingHours = accumulatedChargingTimeMins / 60;
  const totalDurationHours = Number((drivingHours + chargingHours).toFixed(1));

  const roundedChargingCost = Number(totalChargingCost.toFixed(2));
  const { gasCost, savingsUsd } = calculateGasolineSavings(totalDistanceMiles, roundedChargingCost);

  return {
    startCity,
    destCity,
    totalDistanceMiles,
    drivingDurationHours: Number(drivingHours.toFixed(1)),
    chargingDurationHours: Number(chargingHours.toFixed(1)),
    totalDurationHours,
    stops,
    totalEnergyKwh: totalEnergyNeededKwh,
    totalChargingCost: roundedChargingCost,
    gasolineEquivalentCost: gasCost,
    savingsUsd,
    co2SavedKg: calculateCo2AvoidedKg(totalDistanceMiles, totalEnergyNeededKwh),
  };
}
