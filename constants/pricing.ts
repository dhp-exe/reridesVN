import { ProviderName } from '../types';

export const PRICING_CONFIG = {
  [ProviderName.GRAB]: {
    bike: { base: 12500, perKm: 4200, perMin: 300 },
    car: { base: 29000, perKm: 11500, perMin: 500 },
    surgeThreshold: 1.2,
    surgeMultiplier: 1.3
  },
  [ProviderName.BE]: {
    bike: { base: 11000, perKm: 3800, perMin: 250 },
    car: { base: 26000, perKm: 10500, perMin: 450 },
    surgeThreshold: 1.3,
    surgeMultiplier: 1.15
  },
  [ProviderName.XANH_SM]: {
    bike: { base: 12000, perKm: 4000, perMin: 0 },
    car: { base: 28000, perKm: 11000, perMin: 0 },
    surgeThreshold: 1.5,
    surgeMultiplier: 1.1
  }
};