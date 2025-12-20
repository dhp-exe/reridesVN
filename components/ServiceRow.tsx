import React from 'react';
import { ServiceResult } from '../types/estimate';
import { PROVIDER_THEMES } from '../constants/ui';
import { WEB_LINKS } from '../utils/buildDeepLink';
import { formatPriceK } from '../utils/formatPrice';

interface ServiceRowProps {
  option: ServiceResult;
  isBest: boolean;
  distanceKm: number;
}

const ServiceRow: React.FC<ServiceRowProps> = ({ option, isBest, distanceKm }) => {
  const theme = PROVIDER_THEMES[option.service];

  const handleBook = () => {
    if (option.deep_link && option.deep_link !== '#') {
      window.location.href = option.deep_link;
    }
    const webLink = WEB_LINKS[option.service];
    setTimeout(() => {
       window.open(webLink, '_blank');
    }, 1500);
  };

  return (
    <div 
      className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-300 ${
        isBest ? 'border-blue-500 shadow-lg scale-[1.01] z-10' : 'border-gray-100 hover:border-gray-300'
      }`}
    >
      {isBest && (
        <div className="absolute -top-3 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
          ⭐ Best Choice
        </div>
      )}

      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
            <img src={theme.logoPlaceholder} alt={option.service} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{option.service}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                ⏱️ {option.eta_min} min
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-xl font-bold ${isBest ? 'text-blue-600' : 'text-gray-900'}`}>
            {formatPriceK(option.estimated_price)}
          </div>
          <div className="text-xs text-gray-400">VND</div>
        </div>
      </div>

      <div className="border-t border-gray-50 p-3 bg-gray-50/50 rounded-b-2xl flex items-center justify-between">
        <div className="text-xs text-gray-500 px-2">
           {distanceKm} km
        </div>
        <button
          onClick={handleBook}
          className={`py-2 px-6 rounded-lg text-sm font-bold transition-colors ${
            isBest 
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200' 
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          Book
        </button>
      </div>
    </div>
  );
};

export default ServiceRow;