// components/LocationModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import locationService from '../services/locationService';

const LocationModal = ({ isOpen, onClose, onLocationSelect, currentLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [recentLocations, setRecentLocations] = useState([]);
  const searchTimeoutRef = useRef(null);
  const modalRef = useRef(null);

  // Popular cities in India
  const popularCities = [
    { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    { city: 'Delhi', state: 'Delhi', country: 'India' },
    { city: 'Bangalore', state: 'Karnataka', country: 'India' },
    { city: 'Hyderabad', state: 'Telangana', country: 'India' },
    { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
    { city: 'Kolkata', state: 'West Bengal', country: 'India' },
    { city: 'Pune', state: 'Maharashtra', country: 'India' },
    { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
    { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
    { city: 'Surat', state: 'Gujarat', country: 'India' }
  ];

  // Load recent locations on mount
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]');
    setRecentLocations(recent.slice(0, 5)); // Show only last 5
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await locationService.searchLocations(searchQuery);
          setSearchResults(results);
          setError('');
        } catch (err) {
          console.error('Search failed:', err);
          setError('Search failed. Please try again.');
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle location selection
  const handleLocationSelect = useCallback(async (location) => {
    try {
      let selectedLocation = location;

      // If it's a search result with placeId, get full details
      if (location.placeId) {
        selectedLocation = await locationService.getLocationDetails(location.placeId);
      }

      // Save to recent locations
      const recent = JSON.parse(localStorage.getItem('recentLocations') || '[]');
      const filtered = recent.filter(item => 
        item.city !== selectedLocation.city || item.state !== selectedLocation.state
      );
      const updated = [selectedLocation, ...filtered].slice(0, 10);
      localStorage.setItem('recentLocations', JSON.stringify(updated));

      // Save as user location
      locationService.saveUserLocation(selectedLocation);
      
      // Call parent callback
      onLocationSelect(selectedLocation);
      
      // Close modal
      onClose();
      
    } catch (err) {
      console.error('Failed to select location:', err);
      setError('Failed to select location. Please try again.');
    }
  }, [onLocationSelect, onClose]);

  // Get current location
  const handleGetCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    setError('');

    try {
      const location = await locationService.getUserLocation();
      
      if (location.isDefault) {
        setError('Unable to get your location. Please select manually.');
      } else {
        handleLocationSelect(location);
      }
    } catch (err) {
      console.error('Failed to get current location:', err);
      setError('Unable to access your location. Please check permissions and try again.');
    } finally {
      setIsGettingLocation(false);
    }
  }, [handleLocationSelect]);

  // Handle modal close
  const handleClose = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
    onClose();
  }, [onClose]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Select Location</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Current Location Button */}
          <button
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="w-full flex items-center justify-center space-x-2 p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isGettingLocation ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Getting location...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Use Current Location</span>
              </>
            )}
          </button>

          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for your city..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results</h3>
              <div className="space-y-1">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(result)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900">{result.mainText || result.city}</div>
                    <div className="text-sm text-gray-500">{result.secondaryText || `${result.state}, ${result.country}`}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Locations */}
          {recentLocations.length > 0 && searchQuery.length < 2 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Locations</h3>
              <div className="space-y-1">
                {recentLocations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-medium text-gray-900">{location.city}</div>
                      <div className="text-sm text-gray-500">{location.state}, {location.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Cities */}
          {searchQuery.length < 2 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Cities</h3>
              <div className="grid grid-cols-2 gap-2">
                {popularCities.map((city, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(city)}
                    className="text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="font-medium text-gray-900 text-sm">{city.city}</div>
                    <div className="text-xs text-gray-500">{city.state}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;