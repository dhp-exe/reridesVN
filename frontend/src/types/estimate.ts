export enum VehicleType {
  BIKE = 'bike',
  CAR = 'car',
}

export enum ProviderName {
  XANH_SM = 'Xanh SM',
  BE = 'Be',
  GRAB = 'Grab',
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationInput {
  address: string;
  coords: Coordinates;
}

export interface ServiceResult {
  service: ProviderName;
  estimated_price: number;
  eta_min: number;
  score: number;
  deep_link: string;
  vehicle_type: VehicleType;
}

export interface EstimateResponse {
  distance_km: number;
  traffic_factor: number;
  results: ServiceResult[];
}