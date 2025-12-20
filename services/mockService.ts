import { ProviderName, VehicleType, Coordinates, ServiceResult } from '../types';
import { PRICING_CONFIG } from '../constants/pricing';
import { buildDeepLink } from '../utils/buildDeepLink';

const RouteService = {
  getMetrics: async (pickup: Coordinates, dropoff: Coordinates) => {
    // Simulating Google Maps Directions API call
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 500));

    // Simple haversine-ish mock distance
    const R = 6371; // km
    const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
    const dLon = (dropoff.lng - pickup.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pickup.lat * Math.PI / 180) * Math.cos(dropoff.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = Math.max(1.5, parseFloat((R * c).toFixed(1)));

    const baseDurationMin = distanceKm * 3.5; 
    
    // Traffic simulation
    const hour = new Date().getHours();
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
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

const PricingEngine = {
  estimate: (provider: ProviderName, vehicleType: VehicleType, distance: number, duration: number, trafficFactor: number): number => {
    const providerConfig = PRICING_CONFIG[provider];
    const vehicleConfig = providerConfig[vehicleType];
    
    let fare = vehicleConfig.base + (distance * vehicleConfig.perKm);
    fare += (duration * vehicleConfig.perMin);

    if (trafficFactor > providerConfig.surgeThreshold) {
      fare *= providerConfig.surgeMultiplier;
    }

    return Math.round(fare / 1000) * 1000;
  }
};

const RankingEngine = {
  rank: (results: ServiceResult[]): ServiceResult[] => {
    const minPrice = Math.min(...results.map(r => r.estimated_price));
    const minEta = Math.min(...results.map(r => r.eta_min));

    results.forEach(r => {
      const priceNorm = r.estimated_price / minPrice;
      const etaNorm = r.eta_min / minEta;
      r.score = (0.7 * priceNorm) + (0.3 * etaNorm);
    });

    return results.sort((a, b) => a.score - b.score);
  }
};

export const MockService = {
  RouteService,
  PricingEngine,
  RankingEngine,
  // Helper to mock geocoding (Google Places API simulation)
  geocode: async (address: string): Promise<Coordinates> => {
    await new Promise(r => setTimeout(r, 200));
    return {
      lat: 10.7769 + (Math.random() - 0.5) * 0.1,
      lng: 106.7009 + (Math.random() - 0.5) * 0.1
    };
  },
  
  processRequest: async (pickup: Coordinates, dropoff: Coordinates, vehicleType: VehicleType) => {
    const metrics = await RouteService.getMetrics(pickup, dropoff);
    const providers = [ProviderName.XANH_SM, ProviderName.BE, ProviderName.GRAB];
    
    const baseEta = Math.floor(Math.random() * 5) + 2;

    let results = providers.map(provider => {
      const price = PricingEngine.estimate(
        provider, 
        vehicleType, 
        metrics.distanceKm, 
        metrics.durationInTraffic, 
        metrics.trafficFactor
      );

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

    return {
      metrics,
      results: RankingEngine.rank(results)
    };
  }
};