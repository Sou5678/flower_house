// contexts/LocationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import locationService from '../services/locationService';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isServiceable, setIsServiceable] = useState(null);

  // Load saved location on mount
  useEffect(() => {
    const loadSavedLocation = async () => {
      try {
        const savedLocation = locationService.getSavedLocation();
        if (savedLocation) {
          setLocation(savedLocation);
          checkServiceability(savedLocation);
        }
      } catch (err) {
        console.error('Failed to load saved location:', err);
      }
    };

    loadSavedLocation();
  }, []);

  // Check if location is serviceable
  const checkServiceability = useCallback(async (locationData) => {
    try {
      const response = await fetch('/api/location/check-serviceable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: locationData.city,
          state: locationData.state,
          coordinates: locationData.coordinates
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsServiceable(data);
      }
    } catch (err) {
      console.error('Failed to check serviceability:', err);
    }
  }, []);

  // Update location
  const updateLocation = useCallback(async (newLocation) => {
    setIsLoading(true);
    setError(null);

    try {
      // Save location
      locationService.saveUserLocation(newLocation);
      setLocation(newLocation);
      
      // Check serviceability
      await checkServiceability(newLocation);
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkServiceability]);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentLocation = await locationService.getUserLocation();
      
      if (!currentLocation.isDefault) {
        await updateLocation(currentLocation);
        return currentLocation;
      } else {
        setError('Unable to get current location');
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [updateLocation]);

  // Clear location
  const clearLocation = useCallback(() => {
    locationService.clearSavedLocation();
    setLocation(null);
    setIsServiceable(null);
    setError(null);
  }, []);

  // Search locations
  const searchLocations = useCallback(async (query) => {
    try {
      return await locationService.searchLocations(query);
    } catch (err) {
      console.error('Location search failed:', err);
      return [];
    }
  }, []);

  // Get location display text
  const getLocationDisplayText = useCallback(() => {
    if (!location) return 'Select Location';
    return location.city;
  }, [location]);

  // Get full address
  const getFullAddress = useCallback(() => {
    if (!location) return '';
    return location.formattedAddress || `${location.city}, ${location.state}, ${location.country}`;
  }, [location]);

  const value = {
    // State
    location,
    isLoading,
    error,
    isServiceable,
    
    // Actions
    updateLocation,
    getCurrentLocation,
    clearLocation,
    searchLocations,
    
    // Helpers
    getLocationDisplayText,
    getFullAddress,
    
    // Checks
    hasLocation: !!location,
    isLocationServiceable: isServiceable?.isServiceable || false
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};