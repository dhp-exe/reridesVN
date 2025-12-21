import { EstimateResponse, VehicleType, Coordinates } from '../types/estimate';
import { fetchMockEstimates, mockGeocode } from './mockService';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

export const fetchRideEstimates = async (
  pickup: Coordinates,
  dropoff: Coordinates,
  vehicleType: VehicleType
): Promise<EstimateResponse> => {

  // 1.Explicit demo mode (GitHub Pages)
  if (!USE_BACKEND) {
    console.warn('Using mock estimates (backend disabled)');
    return fetchMockEstimates(pickup, dropoff, vehicleType);
  }

  // 2.Try backend, fallback on failure
  try {
    const response = await fetch(`${API_BASE}/api/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup,
        dropoff,
        vehicle_type: vehicleType,
        time: 'now'
      })
    });

    if (!response.ok) {
      throw new Error('Backend error');
    }

    return await response.json();

  } catch (err) {
    console.warn('Backend unavailable, falling back to mock estimates');
    return fetchMockEstimates(pickup, dropoff, vehicleType);
  }
};

export const geocodeLocation = async (address: string): Promise<Coordinates> => {

  // GitHub Pages / demo mode
  if (!USE_BACKEND) {
    return mockGeocode(address);
  }

  try {
    const response = await fetch(`${API_BASE}/api/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });

    if (!response.ok) {
      throw new Error('Geocode backend error');
    }

    return await response.json();

  } catch (err) {
    console.warn('Geocode backend unavailable, using mock');
    return mockGeocode(address);
  }
};
