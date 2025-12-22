import React, { useState, useEffect } from 'react';
import { VehicleType } from '../types/estimate';
// Import the service we just created
import { fetchSuggestions } from '../services/estimateService'; 

interface InputScreenProps {
  onSearch: (
    pickupText: string,
    destinationText: string,
    vehicleType: VehicleType
  ) => void;
  isLoading: boolean;
}

const InputScreen: React.FC<InputScreenProps> = ({ onSearch, isLoading }) => {
  const [pickupText, setPickupText] = useState('');
  const [destText, setDestText] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.BIKE);

  // --- NEW: Autocomplete State ---
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<'pickup' | 'dest' | null>(null);

  // --- NEW: Logic to fetch suggestions when text changes ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Only fetch if user is typing in Pickup field
      if (activeField === 'pickup' && pickupText.length > 1) {
        const results = await fetchSuggestions(pickupText);
        setPickupSuggestions(results);
      } 
      // Only fetch if user is typing in Destination field
      else if (activeField === 'dest' && destText.length > 1) {
        const results = await fetchSuggestions(destText);
        setDestSuggestions(results);
      }
    }, 300); // Wait 300ms after typing stops

    return () => clearTimeout(timer);
  }, [pickupText, destText, activeField]);

  // Handle clicking a suggestion
  const handleSelectSuggestion = (text: string, field: 'pickup' | 'dest') => {
    if (field === 'pickup') {
      setPickupText(text);
      setPickupSuggestions([]); // Hide list
    } else {
      setDestText(text);
      setDestSuggestions([]); // Hide list
    }
    setActiveField(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupText.trim() || !destText.trim()) return;
    onSearch(pickupText, destText, vehicleType);
  };

  return (
    <div className="flex flex-col h-full p-6 animate-fade-in relative">
      <div className="mb-8 mt-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ReRides VN</h1>
        <p className="text-gray-500 text-sm mt-2">Compare ride options & prices instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 relative">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4 relative">
          
          {/* Decorative vertical line */}
          <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gray-200 border-l border-dashed border-gray-300 pointer-events-none"></div>

          {/* === PICKUP INPUT === */}
          <div className="relative z-20">
            <label className="block text-xs font-semibold text-gray-400 mb-1 ml-10 uppercase">Pickup</label>
            <div className="flex items-center">
               <div className="w-8 flex-shrink-0 flex justify-center z-10">
                 <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
               </div>
               <input
                type="text"
                value={pickupText}
                onChange={(e) => {
                  setPickupText(e.target.value);
                  setActiveField('pickup');
                }}
                onFocus={() => setActiveField('pickup')}
                placeholder="Enter pickup location"
                className="flex-1 block w-full border-b border-gray-200 bg-transparent py-2 px-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-0 sm:text-lg transition-colors"
                autoComplete="off"
              />
            </div>
            
            {/* === PICKUP SUGGESTIONS DROPDOWN === */}
            {activeField === 'pickup' && pickupSuggestions.length > 0 && (
              <ul className="absolute left-10 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                {pickupSuggestions.map((item, idx) => (
                  <li 
                    key={idx}
                    onClick={() => handleSelectSuggestion(item, 'pickup')}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-none flex items-center gap-2"
                  >
                    <span>📍</span> {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* === DESTINATION INPUT === */}
          <div className="relative z-10 pt-2">
            <label className="block text-xs font-semibold text-gray-400 mb-1 ml-10 uppercase">Destination</label>
            <div className="flex items-center">
              <div className="w-8 flex-shrink-0 flex justify-center z-10">
                <div className="w-3 h-3 rounded-none bg-red-500 ring-4 ring-red-50"></div>
              </div>
              <input
                type="text"
                value={destText}
                onChange={(e) => {
                  setDestText(e.target.value);
                  setActiveField('dest');
                }}
                onFocus={() => setActiveField('dest')}
                placeholder="Enter destination"
                className="flex-1 block w-full border-b border-gray-200 bg-transparent py-2 px-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-0 sm:text-lg transition-colors"
                autoComplete="off"
              />
            </div>

             {/* === DESTINATION SUGGESTIONS DROPDOWN === */}
             {activeField === 'dest' && destSuggestions.length > 0 && (
              <ul className="absolute left-10 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                {destSuggestions.map((item, idx) => (
                  <li 
                    key={idx}
                    onClick={() => handleSelectSuggestion(item, 'dest')}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-none flex items-center gap-2"
                  >
                    <span>🏁</span> {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Vehicle Selection Buttons */}
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

        {/* Submit Button */}
        <div className="mt-auto mb-6">
          <button
            type="submit"
            disabled={isLoading || !pickupText || !destText}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all transform active:scale-95 ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {isLoading ? 'Calculating Route...' : 'Find Best Price'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputScreen;