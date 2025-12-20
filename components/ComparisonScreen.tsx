import React from 'react';
import { EstimateResponse, ServiceResult } from '../types';
import { PROVIDER_THEMES, WEB_LINKS } from '../constants';

interface ComparisonScreenProps {
  data: EstimateResponse;
  onBack: () => void;
  pickup: string;
  destination: string;
}

const ComparisonScreen: React.FC<ComparisonScreenProps> = ({ data, onBack, pickup, destination }) => {
  const { results, traffic_factor } = data;

  const handleBook = (option: ServiceResult) => {
    // Priority 1: Use the Backend generated Deep Link
    if (option.deep_link && option.deep_link !== '#') {
      window.location.href = option.deep_link;
    }
    
    // Fallback: Web Link
    const webLink = WEB_LINKS[option.service];
    setTimeout(() => {
       window.open(webLink, '_blank');
    }, 1500);
  };

  // Helper for Traffic UI
  const getTrafficStatus = (factor: number) => {
    if (factor >= 1.4) return { label: 'High', color: 'text-red-500' };
    if (factor >= 1.1) return { label: 'Medium', color: 'text-yellow-600' };
    return { label: 'Low', color: 'text-green-500' };
  };

  const trafficStatus = getTrafficStatus(traffic_factor);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 shadow-sm z-10">
        <button 
          onClick={onBack}
          className="text-gray-500 flex items-center gap-1 text-sm font-medium mb-4 hover:text-gray-900 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Search
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Best Rides Found</h2>
            <div className="flex items-center text-xs text-gray-500 mt-1 max-w-[250px] truncate">
              <span className="truncate">{pickup}</span>
              <span className="mx-1">→</span>
              <span className="truncate">{destination}</span>
            </div>
          </div>
          <div className="text-right">
             <span className="block text-xs text-gray-400 uppercase font-bold">Traffic</span>
             <span className={`text-sm font-bold ${trafficStatus.color}`}>
               {trafficStatus.label}
             </span>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {results.map((option, index) => {
          const theme = PROVIDER_THEMES[option.service];
          const isRank1 = index === 0;

          return (
            <div 
              key={`${option.service}-${index}`}
              className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-300 ${
                isRank1 ? 'border-blue-500 shadow-lg scale-[1.01]' : 'border-gray-100 hover:border-gray-300'
              }`}
            >
              {isRank1 && (
                <div className="absolute -top-3 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                  ⭐ Best Option
                </div>
              )}

              <div className="p-4 flex items-center justify-between">
                {/* Left: Provider Info */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                    <img src={theme.logoPlaceholder} alt={option.service} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{option.service}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        ⏱️ {option.eta_min} min away
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price */}
                <div className="text-right">
                  <div className={`text-xl font-bold ${isRank1 ? 'text-blue-600' : 'text-gray-900'}`}>
                    {(option.estimated_price / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-gray-400">VND</div>
                </div>
              </div>

              {/* Action Area */}
              <div className="border-t border-gray-50 p-3 bg-gray-50/50 rounded-b-2xl flex items-center justify-between">
                <div className="text-xs text-gray-500 px-2">
                   Est. Dist: <strong>{data.distance_km} km</strong>
                </div>
                <button
                  onClick={() => handleBook(option)}
                  className={`py-2 px-6 rounded-lg text-sm font-bold transition-colors ${
                    isRank1 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200' 
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  Book Now
                </button>
              </div>
            </div>
          );
        })}

        <div className="text-center mt-6 p-4">
          <p className="text-xs text-gray-400">
            *Prices are estimates. Final fare may vary in app due to real-time demand.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComparisonScreen;
