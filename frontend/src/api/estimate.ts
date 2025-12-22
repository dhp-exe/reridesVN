import { EstimateResponse, Coordinates, VehicleType } from '../types/estimate';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function estimateRide(
  pickup: Coordinates,
  dropoff: Coordinates,
  vehicleType: VehicleType
): Promise<EstimateResponse> {

  const res = await fetch(`${API_BASE}/api/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pickup,
      dropoff,
      vehicle_type: vehicleType,
      time: 'now'
    })
  });

  if (!res.ok) {
    throw new Error('Estimate API failed');
  }

  return res.json();
}
