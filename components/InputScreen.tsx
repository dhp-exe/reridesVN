import React, { useState } from 'react';
import { VehicleType, LocationInput } from '../types';
import { mockGeocode } from '../services/mockApi';

interface InputScreenProps {
  onSearch: (pickup: LocationInput, destination: LocationInput, vehicleType: VehicleType) => void;
  isLoading: boolean;
}

const InputScreen: React.FC<InputScreenProps> = ({ onSearch, isLoading }) => {
  const [pickupText, setPickupText] = useState('');
  const [destText, setDestText] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.BIKE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupText.trim() || !destText.trim()) return;

    // Simulate Client-side Pre-processing / Autocomplete Selection
    // In a real app, the "LocationInput" would already have coords from the Autocomplete component
    // Here we mock-geocode on submit if we don't have coords yet
    const pickupCoords = await mockGeocode(pickupText);
    const destCoords = await mockGeocode(destText);

    onSearch(
      { address: pickupText, coords: pickupCoords },
      { address: destText, coords: destCoords },
      vehicleType
    );
  };

  const handleUseCurrentLocation = () => {
    setPickupText("Ben Thanh Market, District 1"); // Simulated 'Current Location' address
  };

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in">
      <div className="mb-8 mt-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ReRides VN</h1>
        <p className="text-gray-500 text-sm mt-2">Compare Grab, Be & Xanh SM instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
        
        {/* Location Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4 relative">
          {/* Vertical line connector */}
          <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gray-200 border-l border-dashed border-gray-300 pointer-events-none"></div>

          <div className="relative">
            <label className="block text-xs font-semibold text-gray-400 mb-1 ml-10 uppercase">Pickup</label>
            <div className="flex items-center">
               <div className="w-8 flex-shrink-0 flex justify-center z-10">
                 <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
               </div>
               <input
                type="text"
                value={pickupText}
                onChange={(e) => setPickupText(e.target.value)}
                placeholder="Enter pickup location"
                className="flex-1 block w-full border-b border-gray-200 bg-transparent py-2 px-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-0 sm:text-lg transition-colors"
                required
              />
            </div>
            <button 
              type="button" 
              onClick={handleUseCurrentLocation}
              className="absolute right-0 top-6 text-blue-500 text-xs font-medium hover:text-blue-700"
            >
              📍 Current
            </button>
          </div>

          <div className="relative pt-2">
            <label className="block text-xs font-semibold text-gray-400 mb-1 ml-10 uppercase">Destination</label>
            <div className="flex items-center">
              <div className="w-8 flex-shrink-0 flex justify-center z-10">
                <div className="w-3 h-3 rounded-none bg-red-500 ring-4 ring-red-50"></div>
              </div>
              <input
                type="text"
                value={destText}
                onChange={(e) => setDestText(e.target.value)}
                placeholder="Enter destination"
                className="flex-1 block w-full border-b border-gray-200 bg-transparent py-2 px-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-0 sm:text-lg transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Vehicle Type Selector */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex">
          <button
            type="button"
            onClick={() => setVehicleType(VehicleType.BIKE)}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              vehicleType === VehicleType.BIKE
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span>🏍️</span> Bike
          </button>
          <button
            type="button"
            onClick={() => setVehicleType(VehicleType.CAR)}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              vehicleType === VehicleType.CAR
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <span>🚗</span> Car
          </button>
        </div>

        <div className="mt-auto mb-6">
          <button
            type="submit"
            disabled={isLoading || !pickupText || !destText}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all transform active:scale-95 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating Route...
              </>
            ) : (
              'Find Best Price'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputScreen;
