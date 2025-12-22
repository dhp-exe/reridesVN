import { ProviderName, VehicleType, Coordinates } from '../types/estimate';
import { buildDeepLink } from '../utils/buildDeepLink';


const PricingConfig = {
  [ProviderName.GRAB]: {
    bike: { base: 12500, perKm: 4200, perMin: 300 },
    car: { base: 29000, perKm: 11500, perMin: 500 },
  },
  [ProviderName.BE]: {
    bike: { base: 11000, perKm: 3800, perMin: 250 },
    car: { base: 26000, perKm: 10500, perMin: 450 },
  },
  [ProviderName.XANH_SM]: {
    bike: { base: 12000, perKm: 4000, perMin: 0 },
    car: { base: 28000, perKm: 11000, perMin: 0 },
  }
};

const getRouteMetrics = async (pickup: Coordinates, dropoff: Coordinates) => {
  await new Promise(r => setTimeout(r, 400));

  const R = 6371;
  const dLat = (dropoff.lat - pickup.lat) * Math.PI / 180;
  const dLon = (dropoff.lng - pickup.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(pickup.lat * Math.PI / 180) *
    Math.cos(dropoff.lat * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance_km = Math.max(1, +(R * c).toFixed(2));

  const duration_min = Math.round(distance_km * 3.5);

  return { distance_km, duration_min };
};

export const fetchMockEstimates = async (
  pickup: Coordinates,
  dropoff: Coordinates,
  vehicleType: VehicleType
) => {
  await new Promise(r => setTimeout(r, 300));

  return {
    distance_km: 6.2,
    traffic_factor: 1,
    results: [
      {
        service: 'Grab',
        vehicle_type: vehicleType,
        estimated_price: vehicleType === 'bike' ? 18000 : 45000,
        eta_min: 15,
        score: 0,
        deep_link: null
      },
      {
        service: 'Be',
        vehicle_type: vehicleType,
        estimated_price: vehicleType === 'bike' ? 17000 : 43000,
        eta_min: 17,
        score: 1,
        deep_link: null
      },
      {
        service: 'Xanh SM',
        vehicle_type: vehicleType,
        estimated_price: vehicleType === 'bike' ? 16000 : 44000,
        eta_min: 16,
        score: 1,
        deep_link: null
      }
    ]
  };
};

export const mockGeocode = async (address: string): Promise<Coordinates> => {
  await new Promise(r => setTimeout(r, 200));
  return {
    lat: 10.7769 + (Math.random() - 0.5) * 0.1,
    lng: 106.7009 + (Math.random() - 0.5) * 0.1
  };
};
