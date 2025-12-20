import { EstimateResponse, ServiceResult, ProviderName, VehicleType, Coordinates } from '../types/estimate';
import { buildDeepLink } from '../utils/buildDeepLink';

const PricingConfig = {
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
    bike: { base: 12000, perKm: 4000, perMin: 0 },
    car: { base: 28000, perKm: 11000, perMin: 0 },
    surgeThreshold: 1.5,
    surgeMultiplier: 1.1
  }
};

const getRouteMetrics = async (pickup: Coordinates, dropoff: Coordinates) => {
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));
  
  const R = 6371;
  const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
  const dLon = (dropoff.lng - pickup.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(pickup.lat * Math.PI / 180) * Math.cos(dropoff.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = Math.max(1.5, parseFloat((R * c).toFixed(1)));

  const baseDurationMin = distanceKm * 3.5;
  const hour = new Date().getHours();
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  const trafficFactor = isRushHour ? 1.4 + (Math.random() * 0.3) : 1.0 + (Math.random() * 0.2);
  const durationInTraffic = Math.round(baseDurationMin * trafficFactor);

  return { distanceKm, durationInTraffic, trafficFactor: parseFloat(trafficFactor.toFixed(2)) };
};

export const fetchMockEstimates = async (pickup: Coordinates, dropoff: Coordinates, vehicleType: VehicleType): Promise<EstimateResponse> => {
  const metrics = await getRouteMetrics(pickup, dropoff);
  const providers = [ProviderName.XANH_SM, ProviderName.BE, ProviderName.GRAB];
  
  const baseEta = Math.floor(Math.random() * 5) + 2;

  let results: ServiceResult[] = providers.map(provider => {
    const conf = PricingConfig[provider][vehicleType];
    let fare = conf.base + (metrics.distanceKm * conf.perKm) + (metrics.durationInTraffic * conf.perMin);
    
    if (metrics.trafficFactor > PricingConfig[provider].surgeThreshold) {
      fare *= PricingConfig[provider].surgeMultiplier;
    }
    
    const price = Math.round(fare / 1000) * 1000;
    
    let etaModifier = 0;
    if (provider === ProviderName.GRAB) etaModifier = -1;
    if (provider === ProviderName.XANH_SM) etaModifier = 1;

    return {
      service: provider,
      vehicle_type: vehicleType,
      estimated_price: price,
      eta_min: Math.max(1, baseEta + etaModifier),
      score: 0,
      deep_link: buildDeepLink(provider, pickup, dropoff)
    };
  });

  const minPrice = Math.min(...results.map(r => r.estimated_price));
  const minEta = Math.min(...results.map(r => r.eta_min));

  results.forEach(r => {
    const priceNorm = r.estimated_price / minPrice;
    const etaNorm = r.eta_min / minEta;
    r.score = (0.7 * priceNorm) + (0.3 * etaNorm);
  });

  results.sort((a, b) => a.score - b.score);

  return {
    distance_km: metrics.distanceKm,
    traffic_factor: metrics.trafficFactor,
    results: results
  };
};

export const mockGeocode = async (address: string): Promise<Coordinates> => {
  await new Promise(r => setTimeout(r, 200));
  return {
    lat: 10.7769 + (Math.random() - 0.5) * 0.1,
    lng: 106.7009 + (Math.random() - 0.5) * 0.1
  };
};
