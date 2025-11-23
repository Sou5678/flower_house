// services/locationService.js
class LocationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    this.isGoogleMapsLoaded = false;
  }

  // Load Google Maps API dynamically
  async loadGoogleMapsAPI() {
    if (this.isGoogleMapsLoaded || !this.apiKey) {
      return this.isGoogleMapsLoaded;
    }

    return new Promise((resolve) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        this.isGoogleMapsLoaded = true;
        resolve(true);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isGoogleMapsLoaded = true;
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        resolve(false);
      };

      document.head.appendChild(script);
    });
  }

  // Get user's current location using browser geolocation
  async getCurrentPosition(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000 // 5 minutes
    };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          let errorMessage = 'Location access denied';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred';
              break;
          }
          reject(new Error(errorMessage));
        },
        { ...defaultOptions, ...options }
      );
    });
  }

  // Enhanced reverse geocoding with Google Maps API
  async reverseGeocode(latitude, longitude) {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
    }

    try {
      // Try Google Maps API first if available
      if (this.apiKey) {
        await this.loadGoogleMapsAPI();
        
        if (window.google && window.google.maps) {
          // Use Google Maps Geocoder service
          const geocoder = new window.google.maps.Geocoder();
          const latlng = { lat: latitude, lng: longitude };
          
          try {
            const response = await new Promise((resolve, reject) => {
              geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  resolve(results[0]);
                } else {
                  reject(new Error('Geocoding failed'));
                }
              });
            });

            const result = this.parseGoogleMapsResult(response);
            
            // Cache the result
            this.cache.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            });
            
            return result;
          } catch (geocoderError) {
            console.warn('Google Maps Geocoder failed, trying REST API:', geocoderError);
          }
        }

        // Fallback to REST API
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`
        );
        
        if (!response.ok) {
          throw new Error('Geocoding API request failed');
        }

        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const result = this.parseGoogleMapsResult(data.results[0]);
          
          // Cache the result
          this.cache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
          
          return result;
        }
      }

      // Fallback to our backend API
      const response = await fetch('/api/location/reverse-geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude, longitude })
      });

      if (!response.ok) {
        throw new Error('Backend geocoding failed');
      }

      const result = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;

    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      
      // Return a fallback location
      return {
        city: 'Unknown City',
        state: 'Unknown State',
        country: 'Unknown Country',
        formattedAddress: 'Location unavailable',
        coordinates: { latitude, longitude }
      };
    }
  }

  // Parse Google Maps API result
  parseGoogleMapsResult(result) {
    const components = result.address_components;
    const location = {
      city: '',
      state: '',
      country: '',
      postalCode: '',
      formattedAddress: result.formatted_address,
      coordinates: {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng
      }
    };

    components.forEach(component => {
      const types = component.types;
      
      if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        location.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        location.state = component.short_name;
      } else if (types.includes('country')) {
        location.country = component.long_name;
      } else if (types.includes('postal_code')) {
        location.postalCode = component.long_name;
      }
    });

    return location;
  }

  // Search for locations (autocomplete)
  async searchLocations(query) {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      // If Google Maps API key is available, use Places API
      if (this.apiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=(cities)&key=${this.apiKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK') {
            return data.predictions.map(prediction => ({
              placeId: prediction.place_id,
              description: prediction.description,
              mainText: prediction.structured_formatting.main_text,
              secondaryText: prediction.structured_formatting.secondary_text
            }));
          }
        }
      }

      // Fallback to backend API
      const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Location search failed');
      }

      return await response.json();

    } catch (error) {
      console.error('Location search failed:', error);
      return [];
    }
  }

  // Get location details by place ID
  async getLocationDetails(placeId) {
    try {
      if (this.apiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,formatted_address,address_components&key=${this.apiKey}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK') {
            return this.parseGoogleMapsResult(data.result);
          }
        }
      }

      // Fallback to backend
      const response = await fetch(`/api/location/details/${placeId}`);
      if (!response.ok) {
        throw new Error('Failed to get location details');
      }

      return await response.json();

    } catch (error) {
      console.error('Failed to get location details:', error);
      throw error;
    }
  }

  // Save user's preferred location
  saveUserLocation(location) {
    try {
      localStorage.setItem('userLocation', JSON.stringify({
        ...location,
        timestamp: Date.now()
      }));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('locationUpdated', {
        detail: location
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to save location:', error);
      return false;
    }
  }

  // Get saved user location
  getSavedLocation() {
    try {
      const saved = localStorage.getItem('userLocation');
      if (!saved) return null;

      const location = JSON.parse(saved);
      
      // Check if location is not too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - location.timestamp > maxAge) {
        this.clearSavedLocation();
        return null;
      }

      return location;
    } catch (error) {
      console.error('Failed to get saved location:', error);
      return null;
    }
  }

  // Clear saved location
  clearSavedLocation() {
    try {
      localStorage.removeItem('userLocation');
      window.dispatchEvent(new CustomEvent('locationCleared'));
      return true;
    } catch (error) {
      console.error('Failed to clear location:', error);
      return false;
    }
  }

  // Enhanced user location detection
  async getUserLocation(forceRefresh = false) {
    // If not forcing refresh, try to get saved location first
    if (!forceRefresh) {
      const saved = this.getSavedLocation();
      if (saved && !saved.isDefault) {
        return saved;
      }
    }

    try {
      // Get current position with better options
      const position = await this.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5 * 60 * 1000 // 5 minutes
      });
      
      // Get detailed address from coordinates using enhanced geocoding
      const location = await this.reverseGeocode(
        position.latitude, 
        position.longitude
      );

      // Add additional location metadata
      const enhancedLocation = {
        ...location,
        coordinates: {
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy
        },
        detectedAt: new Date().toISOString(),
        source: 'gps'
      };

      // Save the location
      this.saveUserLocation(enhancedLocation);
      
      return enhancedLocation;

    } catch (error) {
      console.error('Failed to get user location:', error);
      
      // Return more informative default location
      return {
        city: 'Select Location',
        state: '',
        country: 'India',
        formattedAddress: 'Please select your location manually',
        coordinates: null,
        isDefault: true,
        error: error.message,
        source: 'default'
      };
    }
  }

  // Check if location services are available
  isLocationAvailable() {
    return 'geolocation' in navigator;
  }

  // Request location permission
  async requestLocationPermission() {
    if (!this.isLocationAvailable()) {
      throw new Error('Geolocation not supported');
    }

    try {
      // Try to get position to trigger permission request
      await this.getCurrentPosition({ timeout: 5000 });
      return 'granted';
    } catch (error) {
      if (error.message.includes('denied')) {
        return 'denied';
      }
      return 'unavailable';
    }
  }
}

export default new LocationService();