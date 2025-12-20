import { EstimateResponse, ServiceResult, ProviderName, VehicleType, Coordinates } from '../types';

// ==========================================
// MODULE 1: DEEP LINK BUILDER
// ==========================================
const DeepLinkBuilder = {
  build: (provider: ProviderName, pickup: Coordinates, dropoff: Coordinates): string => {
    // In a real app, these would use the lat/lng to pre-fill the specific app
    switch (provider) {
      case ProviderName.GRAB:
        return `grab://open?screenType=BOOKING&sourceLatitude=${pickup.lat}&sourceLongitude=${pickup.lng}&dropoffLatitude=${dropoff.lat}&dropoffLongitude=${dropoff.lng}`;
      case ProviderName.BE:
        return `be://booking?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&dropoff_lat=${dropoff.lat}&dropoff_lng=${dropoff.lng}`;
      case ProviderName.XANH_SM:
        return `xanhsm://booking?p_lat=${pickup.lat}&p_lng=${pickup.lng}&d_lat=${dropoff.lat}&d_lng=${dropoff.lng}`;
      default:
        return '#';
    }
  }
};

// ==========================================
// MODULE 2: ROUTE & TRAFFIC SERVICE
// ==========================================
const RouteService = {
  getMetrics: async (pickup: Coordinates, dropoff: Coordinates) => {
    // Simulating Google Maps Directions API call
    // Latency simulation
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

    // Simple haversine-ish mock distance
    const R = 6371; // km
    const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
    const dLon = (dropoff.lng - pickup.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pickup.lat * Math.PI / 180) * Math.cos(dropoff.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = Math.max(1.5, parseFloat((R * c).toFixed(1))); // Min 1.5km for realism

    const baseDurationMin = distanceKm * 3.5; // ~17km/h avg in city
    
    // Traffic simulation based on "Now"
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    
    // Traffic factor calculation
    // High traffic if rush hour
    const trafficFactor = isRushHour ? 1.4 + (Math.random() * 0.3) : 1.0 + (Math.random() * 0.2);
    
    const durationInTraffic = Math.round(baseDurationMin * trafficFactor);

    return {
      distanceKm,
      durationNormal: baseDurationMin,
      durationInTraffic,
      trafficFactor: parseFloat(trafficFactor.toFixed(2))
    };
  }
};

// ==========================================
// MODULE 3: PRICING ENGINE
// ==========================================
const PricingEngine = {
  // Base configurations
  config: {
    [ProviderName.GRAB]: {
      bike: { base: 12500, perKm: 4200, perMin: 300 },
      car: { base: 29000, perKm: 11500, perMin: 500 },
      surgeThreshold: 1.2,
      surgeMultiplier: 1.3
    },
    [ProviderName.BE]: {
      bike: { base: 11000, perKm: 3800, perMin: 250 },
      car: { base: 26000, perKm: 10500, perMin: 450 },
      surgeThreshold: 1.3,
      surgeMultiplier: 1.15
    },
    [ProviderName.XANH_SM]: {
      bike: { base: 12000, perKm: 4000, perMin: 0 }, // GSM usually fixed distance based
      car: { base: 28000, perKm: 11000, perMin: 0 },
      surgeThreshold: 1.5, // Less sensitive to surge
      surgeMultiplier: 1.1
    }
  },

  estimate: (provider: ProviderName, vehicleType: VehicleType, distance: number, duration: number, trafficFactor: number): number => {
    const conf = PricingEngine.config[provider][vehicleType];
    
    // Basic fare
    let fare = conf.base + (distance * conf.perKm);
    
    // Time based (some apps charge for time)
    fare += (duration * conf.perMin);

    // Surge Logic
    if (trafficFactor > PricingEngine.config[provider].surgeThreshold) {
      fare *= PricingEngine.config[provider].surgeMultiplier;
    }

    // Round to nearest 1000
    return Math.round(fare / 1000) * 1000;
  }
};

// ==========================================
// MODULE 4: RANKING ENGINE
// ==========================================
const RankingEngine = {
  rank: (results: ServiceResult[]): ServiceResult[] => {
    const minPrice = Math.min(...results.map(r => r.estimated_price));
    const minEta = Math.min(...results.map(r => r.eta_min));

    // Score = 0.7 * price_norm + 0.3 * eta_norm (Lower is better)
    results.forEach(r => {
      const priceNorm = r.estimated_price / minPrice;
      const etaNorm = r.eta_min / minEta;
      r.score = (0.7 * priceNorm) + (0.3 * etaNorm);
    });

    return results.sort((a, b) => a.score - b.score);
  }
};

// ==========================================
// MAIN API ENDPOINT HANDLER (POST /estimate)
// ==========================================
export const fetchRideEstimates = async (
  pickup: Coordinates,
  dropoff: Coordinates,
  vehicleType: VehicleType
): Promise<EstimateResponse> => {
  
  // 1. Get Route & Traffic
  const metrics = await RouteService.getMetrics(pickup, dropoff);

  // 2. Generate Estimates for each service
  const providers = [ProviderName.XANH_SM, ProviderName.BE, ProviderName.GRAB];
  let results: ServiceResult[] = [];

  // Randomize base ETA availability per provider
  const baseEta = Math.floor(Math.random() * 5) + 2; // 2-7 mins

  results = providers.map(provider => {
    const price = PricingEngine.estimate(
      provider, 
      vehicleType, 
      metrics.distanceKm, 
      metrics.durationInTraffic, 
      metrics.trafficFactor
    );

    // ETA adjustments: Grab usually faster, GSM slightly slower (fewer cars)
    let etaModifier = 0;
    if (provider === ProviderName.GRAB) etaModifier = -1;
    if (provider === ProviderName.XANH_SM) etaModifier = 1;

    return {
      service: provider,
      vehicle_type: vehicleType,
      estimated_price: price,
      eta_min: Math.max(1, baseEta + etaModifier), // Ensure min 1 min
      score: 0, // Calculated in Ranking Engine
      deep_link: DeepLinkBuilder.build(provider, pickup, dropoff)
    };
  });

  // 3. Rank Results
  results = RankingEngine.rank(results);

  return {
    distance_km: metrics.distanceKm,
    traffic_factor: metrics.trafficFactor,
    results: results
  };
};

// Helper to mock geocoding (turn string into lat/lng)
// In a real app, this is Google Places API
export const mockGeocode = async (address: string): Promise<Coordinates> => {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 200));
  
  // Return random coordinates within HCMC bounds for realism
  // HCMC center approx: 10.7769, 106.7009
  return {
    lat: 10.7769 + (Math.random() - 0.5) * 0.1,
    lng: 106.7009 + (Math.random() - 0.5) * 0.1
  };
};
