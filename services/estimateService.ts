import { EstimateResponse, VehicleType, Coordinates } from '../types/estimate';
import { fetchMockEstimates, mockGeocode as fetchMockGeocode } from './mockService';

const USE_MOCK = true; // Toggle for dev

export const fetchRideEstimates = async (
  pickup: Coordinates,
  dropoff: Coordinates,
  vehicleType: VehicleType
): Promise<EstimateResponse> => {
  if (USE_MOCK) {
    return fetchMockEstimates(pickup, dropoff, vehicleType);
  } else {
    // In production, this would call the Python backend
    const response = await fetch('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pickup, dropoff, vehicle_type: vehicleType, time: 'now' })
    });
    return await response.json();
  }
};

export const geocodeLocation = async (address: string): Promise<Coordinates> => {
  if (USE_MOCK) {
    return fetchMockGeocode(address);
  }
  // Real implementation would call Google Places API or backend proxy
  return { lat: 0, lng: 0 };
};
