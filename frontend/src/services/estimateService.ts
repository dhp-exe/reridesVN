import { EstimateResponse, VehicleType, Coordinates } from '../types/estimate';
import { fetchMockEstimates, mockGeocode } from './mockService';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

console.log('USE_BACKEND =', USE_BACKEND);
console.log('API_BASE =', API_BASE);

/**
 * Adapter: normalize backend + mock into EstimateResponse
 */
const adaptToEstimateResponse = (
  raw: any,
  vehicleType: VehicleType
): EstimateResponse => {
  const items = raw.results ?? raw.options ?? [];

  return {
    distance_km: raw.distance_km ?? raw.distance ?? 0,
    traffic_factor: raw.traffic_factor ?? 1,
    results: items.map((item: any) => ({
      service: item.service ?? item.provider,
      vehicle_type: vehicleType,
      estimated_price: item.estimated_price ?? item.price_vnd,
      eta_min: item.eta_min ?? item.duration_min,
      score: item.score ?? 0,
      deep_link: item.deep_link ?? null
    }))
  };
};

/**
 * MAIN ENTRY
 */
export const fetchRideEstimates = async (
  pickupText: string,
  dropoffText: string,
  vehicleType: VehicleType
): Promise<EstimateResponse> => {

  // ===== MOCK MODE =====
  if (!USE_BACKEND) {
    console.warn('Using mock mode');

    const pickupCoords = await mockGeocode(pickupText);
    const dropoffCoords = await mockGeocode(dropoffText);

    const mock = await fetchMockEstimates(
      pickupCoords,
      dropoffCoords,
      vehicleType
    );

    return adaptToEstimateResponse(mock, vehicleType);
  }

  // ===== BACKEND MODE =====
  try {
    const response = await fetch(`${API_BASE}/api/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup: pickupText,
        dropoff: dropoffText,
        vehicle_type: vehicleType
      })
    });

    if (!response.ok) {
      throw new Error('Backend estimate failed');
    }

    const backendData = await response.json();
    return adaptToEstimateResponse(backendData, vehicleType);

  } catch (err) {
    console.warn('Backend failed → fallback to mock');

    const pickupCoords = await mockGeocode(pickupText);
    const dropoffCoords = await mockGeocode(dropoffText);

    const mock = await fetchMockEstimates(
      pickupCoords,
      dropoffCoords,
      vehicleType
    );

    return adaptToEstimateResponse(mock, vehicleType);
  }
};
