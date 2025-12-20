import { Coordinates, EstimateResponse, VehicleType } from '../types';
import { MockService } from './mockService';

export const fetchRideEstimates = async (
  pickup: Coordinates,
  dropoff: Coordinates,
  vehicleType: VehicleType
): Promise<EstimateResponse> => {
  
  const { metrics, results } = await MockService.processRequest(pickup, dropoff, vehicleType);

  return {
    distance_km: metrics.distanceKm,
    traffic_factor: metrics.trafficFactor,
    results: results
  };
};

export const mockGeocode = MockService.geocode;