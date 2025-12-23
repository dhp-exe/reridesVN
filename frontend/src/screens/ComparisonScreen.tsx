import React from 'react';
import { EstimateResponse } from '../types/estimate';
import ServiceRow from '../components/ServiceRow';
import TrafficBadge from '../components/TrafficBadge';
import MapComponent from '../components/MapComponent'; // Import Map

interface ComparisonScreenProps {
  data: EstimateResponse;
  onBack: () => void;
  pickup: string;
  destination: string;
  pickupCoords: { lat: number; lng: number }; // <--- New Prop
  dropoffCoords: { lat: number; lng: number }; // <--- New Prop
}

const ComparisonScreen: React.FC<ComparisonScreenProps> = ({ 
  data, 
  onBack, 
  pickup, 
  destination,
  pickupCoords,
  dropoffCoords
}) => {
  const { results, traffic_factor, distance_km, route_geometry } = data;

  return (
    <div className="flex flex-col h-full bg-gray-50">
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
        
        {/* --- MAP VISUALIZATION --- */}
        <div className="mb-6">
          <MapComponent 
            pickup={{ ...pickupCoords, label: pickup }}
            dropoff={{ ...dropoffCoords, label: destination }}
            routeGeometry={route_geometry}
          />
        </div>
        {/* ------------------------- */}

        <div className="flex items-start justify-between">
          <div className="flex-1 mr-2">
            <h2 className="text-xl font-bold text-gray-900">Best Rides Found</h2>
            <div className="flex items-center text-xs text-gray-500 mt-1 truncate">
              <span className="truncate max-w-[100px]">{pickup}</span>
              <span className="mx-1">→</span>
              <span className="truncate max-w-[100px]">{destination}</span>
            </div>
          </div>
          <TrafficBadge factor={traffic_factor} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {results.map((option, index) => (
          <ServiceRow 
            key={`${option.service}-${index}`} 
            option={option} 
            isBest={index === 0} 
            distanceKm={distance_km} 
          />
        ))}

        <div className="text-center p-4 text-xs text-gray-400">
          Prices and ETAs are estimates based on real-time data.
        </div>
      </div>
    </div>
  );
};

export default ComparisonScreen;