import { ProviderName, Coordinates } from '../types/estimate';

const DEEP_LINKS: Record<ProviderName, string> = {
  [ProviderName.GRAB]: 'grab://open?screenType=BOOKING',
  [ProviderName.BE]: 'be://',
  [ProviderName.XANH_SM]: 'xanhsm://',
};

export const WEB_LINKS: Record<ProviderName, string> = {
  [ProviderName.GRAB]: 'https://www.grab.com/vn/transport/',
  [ProviderName.BE]: 'https://be.com.vn/',
  [ProviderName.XANH_SM]: 'https://www.xanhsm.com/',
};

export const buildDeepLink = (provider: ProviderName, pickup: Coordinates, dropoff: Coordinates): string => {
  switch (provider) {
    case ProviderName.GRAB:
      return `grab://open?screenType=BOOKING&sourceLatitude=${pickup.lat}&sourceLongitude=${pickup.lng}&dropoffLatitude=${dropoff.lat}&dropoffLongitude=${dropoff.lng}`;
    case ProviderName.BE:
      return `be://booking?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&dropoff_lat=${dropoff.lat}&dropoff_lng=${dropoff.lng}`;
    case ProviderName.XANH_SM:
      return `xanhsm://booking?p_lat=${pickup.lat}&p_lng=${pickup.lng}&d_lat=${dropoff.lat}&d_lng=${dropoff.lng}`;
    default:
      return '#';
  }
};