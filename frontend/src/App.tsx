import React, { useState } from 'react';
import InputScreen from './screens/InputScreen';
import ComparisonScreen from './screens/ComparisonScreen';
import { EstimateResponse, LocationInput, VehicleType } from './types/estimate';
import { fetchRideEstimates } from './services/estimateService';
import { geocodeLocation } from './services/estimateService';
import { Coordinates } from './types/estimate';

const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'comparison'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState<EstimateResponse | null>(null);
  
  const [displayParams, setDisplayParams] = useState<{pickup: string, destination: string}>({ pickup: '', destination: '' });

  const handleSearch = async (
      pickupText: string,
      destinationText: string,
      vehicleType: VehicleType
    ) => {
    setIsLoading(true);
    setDisplayParams({ pickup: pickupText, destination: destinationText });
    
    try {
    // 1. Geocode
    const pickupCoords: Coordinates = await geocodeLocation(pickupText);
    const destCoords: Coordinates = await geocodeLocation(destinationText);

    // 2. Call estimate (backend or mock)
    const data = await fetchRideEstimates(
      pickupCoords,
      destCoords,
      vehicleType
    );

    setResponseData(data);
    setStep('comparison');
  } catch (error) {
    console.error('Failed to fetch estimates', error);
    alert('Something went wrong. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleBack = () => {
    setStep('input');
    setResponseData(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white sm:rounded-3xl shadow-2xl h-screen sm:h-[800px] overflow-hidden flex flex-col relative">
        <div className="h-8 bg-white w-full flex items-center justify-between px-6 select-none sm:hidden">
          <span className="text-xs font-semibold text-gray-900">9:41</span>
          <div className="flex gap-1">
             <div className="w-4 h-4 bg-gray-900 rounded-full opacity-20"></div>
             <div className="w-4 h-4 bg-gray-900 rounded-full opacity-20"></div>
             <div className="w-6 h-3 bg-gray-900 rounded-md opacity-80"></div>
          </div>
        </div>

        {step === 'input' ? (
          <InputScreen onSearch={handleSearch} isLoading={isLoading} />
        ) : responseData ? (
          <ComparisonScreen 
            data={responseData} 
            onBack={handleBack} 
            pickup={displayParams.pickup}
            destination={displayParams.destination}
          />
        ) : null}
      </div>
    </div>
  );
};

export default App;