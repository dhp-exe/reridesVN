import React, { useState } from 'react';
import InputScreen from './components/InputScreen';
import ComparisonScreen from './components/ComparisonScreen';
import { EstimateResponse, LocationInput, VehicleType } from './types';
import { fetchRideEstimates } from './services/mockApi';

const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'comparison'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [responseData, setResponseData] = useState<EstimateResponse | null>(null);
  
  // State for display purposes in Comparison Screen
  const [displayParams, setDisplayParams] = useState<{pickup: string, destination: string}>({ pickup: '', destination: '' });

  const handleSearch = async (pickup: LocationInput, destination: LocationInput, vehicleType: VehicleType) => {
    setIsLoading(true);
    setDisplayParams({ pickup: pickup.address, destination: destination.address });
    
    try {
      // Calls the mock API (simulate POST /estimate)
      // We pass the coordinates as requested by the backend architecture
      const data = await fetchRideEstimates(pickup.coords, destination.coords, vehicleType);
      setResponseData(data);
      setStep('comparison');
    } catch (error) {
      console.error("Failed to fetch estimates", error);
      alert("Something went wrong. Please try again.");
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
        
        {/* Status Bar Mock (Mobile Feel) */}
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
