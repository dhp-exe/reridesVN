import { EstimateResponse, VehicleType, Coordinates, ProviderName } from '../types/estimate';
import { fetchMockEstimates, mockGeocode } from './mockService';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
// Ensure we check if the backend is enabled in env
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

console.log('USE_BACKEND =', USE_BACKEND);
console.log('API_BASE =', API_BASE);

// AUTOCOMPLETE
export const fetchSuggestions = async (query: string, userLocation?: Coordinates | null): Promise<string[]> => {
  if (!query || query.length < 2) return [];

  // 1. Try Backend
  if (USE_BACKEND) {
    try {
      let url = `${API_BASE}/api/autocomplete?query=${encodeURIComponent(query)}`;
      if (userLocation) {
        url += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
      }

      const response = await fetch(url);
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn('Backend autocomplete failed', e);
    }
  }

  // 2. Fallback (Mock Data if backend is off/fails)
  // Useful for testing without an internet connection
  const MOCK_PLACES = [
    "Ben Thanh Market, District 1",
    "Tan Son Nhat Airport, Tan Binh",
    "Landmark 81, Binh Thanh",
    "Bitexco Financial Tower, District 1",
    "235 Nguyen Van Cu, District 5",
    "268 Ly Thuong Kiet, District 10"
  ];
  return MOCK_PLACES.filter(p => p.toLowerCase().includes(query.toLowerCase()));
};

// Helper to map backend strings (e.g., "GRAB") to Frontend Enum (e.g., "Grab")
const normalizeServiceName = (service: string): ProviderName => {
  const s = service.toUpperCase();
  if (s.includes('GRAB')) return ProviderName.GRAB;
  if (s.includes('BE')) return ProviderName.BE;
  if (s.includes('XANH') || s.includes('SM')) return ProviderName.XANH_SM;
  return ProviderName.GRAB; // Default fallback
};

/**
 * Adapter: normalize backend + mock into EstimateResponse
 */
const adaptToEstimateResponse = (
  raw: any,
  vehicleType: VehicleType
): EstimateResponse => {
  const items = raw.results ?? raw.options ?? [];

  // 1. Map raw data to our interface
  const mappedResults = items.map((item: any) => ({
    service: normalizeServiceName(item.service ?? item.provider),
    vehicle_type: vehicleType,
    estimated_price: item.estimated_price ?? item.price_vnd,
    eta_min: item.eta_min ?? item.duration_min,
    score: item.score ?? 0,
    deep_link: item.deep_link ?? null
  }));

  mappedResults.sort((a: any, b: any) => a.estimated_price - b.estimated_price);

  return {
    distance_km: raw.distance_km ?? raw.distance ?? 0,
    traffic_factor: raw.traffic_factor ?? 1,
    route_geometry: raw.route_geometry ?? '',
    results: mappedResults
  };
};

/**
 * 1. Geocoding Service
 * Tries backend first, falls back to mock.
 */
export const geocodeLocation = async (address: string): Promise<Coordinates> => {
  // Try Backend
  if (USE_BACKEND) {
    try {
      const response = await fetch(`${API_BASE}/api/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        throw new Error('Backend geocode failed');
      }

      // Backend returns { lat: number, lng: number } which matches Coordinates interface
      return await response.json();
    } catch (error) {
      console.warn('Backend geocode failed or unreachable. Falling back to mock.', error);
    }
  }

  // Fallback to Mock
  console.warn('Using mock geocode for:', address);
  return mockGeocode(address);
};

/**
 * 2. Ride Estimate Service
 * Accepts Coordinates (already geocoded in App.tsx), tries backend, falls back to mock.
 */
export const fetchRideEstimates = async (
  pickup: Coordinates,     // Changed from string to Coordinates
  dropoff: Coordinates,    // Changed from string to Coordinates
  vehicleType: VehicleType
): Promise<EstimateResponse> => {

  // Try Backend
  if (USE_BACKEND) {
    try {
      const response = await fetch(`${API_BASE}/api/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Backend expects: { pickup: {lat, lng}, dropoff: {lat, lng}, vehicle_type: string }
        body: JSON.stringify({
          pickup: pickup,
          dropoff: dropoff,
          vehicle_type: vehicleType
        })
      });

      if (!response.ok) {
        throw new Error('Backend estimate failed');
      }

      const backendData = await response.json();
      return adaptToEstimateResponse(backendData, vehicleType);

    } catch (err) {
      console.warn('Backend estimate failed or unreachable. Falling back to mock.', err);
    }
  }

  // Fallback to Mock
  console.warn('Using mock estimates');
  // Mock service already accepts Coordinates, so we just pass them through
  const mockData = await fetchMockEstimates(
    pickup,
    dropoff,
    vehicleType
  );

  return adaptToEstimateResponse(mockData, vehicleType);
};