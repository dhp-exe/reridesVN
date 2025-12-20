export enum VehicleType {
  BIKE = 'bike',
  CAR = 'car',
}

export enum ProviderName {
  XANH_SM = 'Xanh SM',
  BE = 'Be',
  GRAB = 'Grab',
}

export enum TrafficStatus {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationInput {
  address: string;
  coords: Coordinates;
}

// Backend API Response Structures

export interface ServiceResult {
  service: ProviderName;
  estimated_price: number;
  eta_min: number;
  score: number;
  deep_link: string;
  // UI helpers not strictly in backend response but useful for frontend mapping
  vehicle_type: VehicleType;
}

export interface EstimateResponse {
  distance_km: number;
  traffic_factor: number;
  results: ServiceResult[];
}

export interface SearchParams {
  pickup: LocationInput;
  destination: LocationInput;
  vehicleType: VehicleType;
}
