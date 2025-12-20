import React from 'react';
import { EstimateResponse, ServiceResult } from '../types';
import { WEB_LINKS } from '../constants/providers';
import { getTrafficStatus } from '../utils/format';
import ServiceRow from '../components/ServiceRow';

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
          const isRank1 = index === 0;
          return (
            <ServiceRow
              key={`${option.service}-${index}`}
              option={option}
              isBest={isRank1}
              distanceKm={data.distance_km}
              onBook={handleBook}
            />
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