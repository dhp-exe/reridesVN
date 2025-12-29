import React, { useState, useEffect, useRef } from 'react';
import { VehicleType, Coordinates } from '../types/estimate'; // Added Coordinates import
import { fetchSuggestions } from '../services/estimateService'; 
import { getSearchHistory } from '../utils/storage';

interface InputScreenProps {
  onSearch: (
    pickupText: string,
    destinationText: string,
    vehicleType: VehicleType,
    pickupCoords?: Coordinates // <--- Updated Prop to accept specific coords
  ) => void;
  isLoading: boolean;
}

const InputScreen: React.FC<InputScreenProps> = ({ onSearch, isLoading }) => {
  const [pickupText, setPickupText] = useState('');
  const [destText, setDestText] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.BIKE);

  // --- Autocomplete State ---
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [activeField, setActiveField] = useState<'pickup' | 'dest' | null>(null);
  
  // --- User Data ---
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Click outside the boxes
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setActiveField(null); // Close dropdown
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // 1. Load Location & History on Mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.log("Location access denied:", error),
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
    setHistory(getSearchHistory());
  }, []);

  // 2. Handle Autocomplete (Debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Pickup Autocomplete
      if (activeField === 'pickup') {
        if (pickupText.length > 1) {
          const results = await fetchSuggestions(pickupText); // Pass userLocation here if you want biasing
          setPickupSuggestions(results);
        } else if (pickupText.length === 0) {
          setPickupSuggestions(history); // Show history if empty
        }
      } 
      // Destination Autocomplete
      else if (activeField === 'dest') {
        if (destText.length > 1) {
          const results = await fetchSuggestions(destText);
          setDestSuggestions(results);
        } else if (destText.length === 0) {
          setDestSuggestions(history); // Show history if empty
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pickupText, destText, activeField, history]);

  // 3. Handle "Use My Location" Click
  const handleUseMyLocation = () => {
    if (userLocation) {
      setPickupText("My Current Location");
      setPickupSuggestions([]);
      setActiveField(null);
    } 
    else {
      setPickupText("My Current Location");
      alert("Location not available. Please allow GPS access.");
    }
  };

  // 4. Handle Selection
  const handleSelectSuggestion = (text: string, field: 'pickup' | 'dest') => {
    if (field === 'pickup') {
      setPickupText(text);
      setPickupSuggestions([]);
    } else {
      setDestText(text);
      setDestSuggestions([]);
    }
    setActiveField(null);
  };

  // 5. Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupText.trim() || !destText.trim()) return;

    // Check if user is using "My Current Location" logic
    const isUsingCurrentLocation = pickupText === "My Current Location" && userLocation;

    onSearch(
      pickupText, 
      destText, 
      vehicleType, 
      isUsingCurrentLocation ? userLocation : undefined
    );
  };

  return (
    <div className="flex flex-col h-full p-4 animate-fade-in relative">
      <div className="mb-8 mt-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ReRides VN</h1>
        <p className="text-gray-500 text-sm mt-2">Compare ride options & prices instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6 relative">
        
        <div ref={wrapperRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-5 relative">
          
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
                onFocus={() => {
                  setActiveField('pickup');
                  if(!pickupText) setPickupSuggestions(history); // Show history immediately
                }}
                placeholder="Enter pickup location"
                className="flex-1 block w-full border-b border-gray-200 bg-transparent py-2 px-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-0 sm:text-lg transition-colors"
                autoComplete="off"
              />
              
              {/* 📍 USE MY LOCATION BUTTON */}
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="ml-2 text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center bg-blue-50 px-2 py-1.5 rounded-full transition-colors"
                title="Use my current GPS location"
              >
                <span>📍</span> <span className="hidden sm:inline"></span>
              </button>
            </div>
            
            {/* SUGGESTIONS / HISTORY DROPDOWN */}
            {activeField === 'pickup' && pickupSuggestions.length > 0 && (
              <ul className="absolute left-10 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                {/* Header Label */}
                <li className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase sticky top-0">
                  {pickupText.length === 0 ? 'Recent Searches' : 'Suggestions'}
                </li>
                {pickupSuggestions.map((item, idx) => (
                  <li 
                    key={idx}
                    onClick={() => handleSelectSuggestion(item, 'pickup')}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-none flex items-center gap-2"
                  >
                    <span>{pickupText.length === 0 ? '🕒' : '📍'}</span> {item}
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
                onFocus={() => {
                  setActiveField('dest');
                  if(!destText) setDestSuggestions(history); // Show history immediately
                }}
                placeholder="Enter destination"
                className="flex-1 block w-full border-b border-gray-200 bg-transparent py-2 px-2 text-gray-900 placeholder-gray-400 focus:border-red-500 focus:ring-0 sm:text-lg transition-colors"
                autoComplete="off"
              />
            </div>

             {/* SUGGESTIONS / HISTORY DROPDOWN */}
             {activeField === 'dest' && destSuggestions.length > 0 && (
              <ul className="absolute left-10 right-0 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
                <li className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase sticky top-0">
                  {destText.length === 0 ? 'Recent Searches' : 'Suggestions'}
                </li>
                {destSuggestions.map((item, idx) => (
                  <li 
                    key={idx}
                    onClick={() => handleSelectSuggestion(item, 'dest')}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-none flex items-center gap-2"
                  >
                     <span>{destText.length === 0 ? '🕒' : '🏁'}</span> {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Vehicle Selection (Preserved) */}
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
            className={`w-full py-4 px-6 mb-10 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all transform active:scale-95 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {isLoading ? 'Calculating Route...' : 'Find Best Price'}
          </button>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Made by dhp.
          </p>
        </div>
      </form>
    </div>
  );
};

export default InputScreen;