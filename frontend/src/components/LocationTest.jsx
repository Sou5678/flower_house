// components/LocationTest.jsx
import React, { useState } from 'react';
import { useLocation } from '../contexts/LocationContext';
import LocationModal from './LocationModal';
import DeliveryInfo from './DeliveryInfo';

const LocationTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    location,
    isLoading,
    error,
    isServiceable,
    updateLocation,
    getCurrentLocation,
    clearLocation,
    getLocationDisplayText,
    getFullAddress,
    hasLocation,
    isLocationServiceable
  } = useLocation();

  const handleLocationSelect = (selectedLocation) => {
    updateLocation(selectedLocation);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Location System Test</h2>
        
        {/* Current Location Display */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Current Location</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-medium">Display Text: {getLocationDisplayText()}</p>
            <p className="text-sm text-gray-600">Full Address: {getFullAddress()}</p>
            <p className="text-sm text-gray-600">Has Location: {hasLocation ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-600">Is Serviceable: {isLocationServiceable ? 'Yes' : 'No'}</p>
            {isLoading && <p className="text-sm text-blue-600">Loading...</p>}
            {error && <p className="text-sm text-red-600">Error: {error}</p>}
          </div>
        </div>

        {/* Location Details */}
        {location && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Location Details</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(location, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Serviceability Info */}
        {isServiceable && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Serviceability Info</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(isServiceable, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Get Current Location
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Select Location Manually
          </button>
          
          <button
            onClick={clearLocation}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Clear Location
          </button>
        </div>

        {/* Delivery Info Component */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Delivery Info Component</h3>
          <DeliveryInfo />
        </div>

        {/* Location Modal */}
        <LocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLocationSelect={handleLocationSelect}
          currentLocation={location}
        />
      </div>
    </div>
  );
};

export default LocationTest;