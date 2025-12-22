export interface BackendProviderEstimate {
  provider: string;
  distance_km: number;
  duration_min: number;
  traffic_level: string;
  price_vnd: number;
  deeplink: string;
}

export interface EstimateResponse {
  best_option: string;
  options: BackendProviderEstimate[];
}
