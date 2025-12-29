import { ProviderName, VehicleType, Coordinates } from '../types/estimate';
import { buildDeepLink } from '../utils/buildDeepLink';

// 1. Pricing Rules (Base Price + Cost per KM)
const PricingConfig = {
  [ProviderName.GRAB]: {
    bike: { base: 12500, perKm: 4300, perMin: 350 },
    car: { base: 29000, perKm: 12500, perMin: 600 },
  },
  [ProviderName.BE]: {
    bike: { base: 11000, perKm: 4000, perMin: 300 },
    car: { base: 27000, perKm: 11000, perMin: 550 },
  },
  [ProviderName.XANH_SM]: {
    bike: { base: 13000, perKm: 4500, perMin: 0 }, // Xanh often has higher base but no time fee
    car: { base: 30000, perKm: 12000, perMin: 0 },
  }
};

// 2. Helper to Calculate Distance (Haversine Formula)
const getRouteMetrics = async (pickup: Coordinates, dropoff: Coordinates) => {
  await new Promise(r => setTimeout(r, 400)); // Fake network delay

  const R = 6371; // Earth radius in km
  const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
  const dLon = (dropoff.lng - pickup.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(pickup.lat * Math.PI / 180) *
    Math.cos(dropoff.lat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Calculate raw distance + add 20% for "road curvature" (straight line is always too short)
  const distance_km = Math.max(1, +(R * c * 1.2).toFixed(2));
  
  // Estimate time: assume 20km/h average speed in city
  const duration_min = Math.round((distance_km / 20) * 60);

  return { distance_km, duration_min };
};

// 3. Main Function
export const fetchMockEstimates = async (
  pickup: Coordinates,
  dropoff: Coordinates,
  vehicleType: VehicleType
) => {
  // A. Calculate Distance & Time
  const { distance_km, duration_min } = await getRouteMetrics(pickup, dropoff);

  // B. Generate a Random "Traffic Surge" (e.g., 0.9x to 1.3x)
  const traffic_factor = 0.9 + Math.random() * 0.4; 

  // C. Calculate Price for each Provider
  const results = Object.values(ProviderName).map(provider => {
    const config = PricingConfig[provider as ProviderName][vehicleType === VehicleType.BIKE ? 'bike' : 'car'];

    // Formula: (Base + DistanceCost + TimeCost) * TrafficSurge
    const rawPrice = (
      config.base + 
      (config.perKm * distance_km) + 
      (config.perMin * duration_min)
    ) * traffic_factor;

    // Round to nearest 1,000 VND (e.g. 43250 -> 43000)
    const finalPrice = Math.round(rawPrice / 1000) * 1000;

    return {
      service: provider, // 'Grab', 'Be', etc.
      vehicle_type: vehicleType,
      estimated_price: finalPrice,
      eta_min: duration_min + Math.floor(Math.random() * 5), // Randomize ETA slightly
      score: 0,
      deep_link: buildDeepLink(provider, pickup, dropoff)
    };
  });

  // Sort by price (Cheapest first)
  results.sort((a, b) => a.estimated_price - b.estimated_price);

  return {
    distance_km,
    traffic_factor: parseFloat(traffic_factor.toFixed(2)),
    results
  };
};

export const mockGeocode = async (address: string): Promise<Coordinates> => {
  await new Promise(r => setTimeout(r, 200));
  // Returns a random point near Saigon Center
  return {
    lat: 10.7769 + (Math.random() - 0.5) * 0.05,
    lng: 106.7009 + (Math.random() - 0.5) * 0.05
  };
};