import { ProviderName } from '../types/estimate';

export const PROVIDER_THEMES: Record<ProviderName, { color: string; bg: string; text: string; logoPlaceholder: string }> = {
  [ProviderName.XANH_SM]: {
    color: '#00BFA5', // Cyan/Green
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    logoPlaceholder: 'https://placehold.co/48x48/00BFA5/FFFFFF?text=Xanh',
  },
  [ProviderName.BE]: {
    color: '#FFD600', // Yellow
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    logoPlaceholder: 'https://placehold.co/48x48/FFD600/000000?text=Be',
  },
  [ProviderName.GRAB]: {
    color: '#00B14F', // Green
    bg: 'bg-green-50',
    text: 'text-green-700',
    logoPlaceholder: 'https://placehold.co/48x48/00B14F/FFFFFF?text=Grab',
  },
};