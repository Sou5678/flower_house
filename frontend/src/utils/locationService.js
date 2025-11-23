// Location service for Amour Florals
class LocationService {
  constructor() {
    this.currentLocation = null;
    this.watchId = null;
    this.listeners = new Set();
  }

  // Get user's current location using browser geolocation
  async getCurrentLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes cache
      ...options
    };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };

          // Get address from coordinates
          try {
            const address = await this.reverseGeocode(location.latitude, location.longitude);
            location.address = address;
          } catch (error) {
            console.warn('Failed to get address from coordinates:', error);
            location.address = {
              city: 'Unknown',
              state: 'Unknown',
              country: 'Unknown',
              formatted: 'Location detected'
            };
          }

          this.currentLocation = location;
          this.notifyListeners(location);
          this.saveLocationToStorage(location);
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Failed to get location';
          
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
          }
          
          reject(new Error(errorMessage));
        },
        defaultOptions
      );
    });
  }

  // Reverse geocoding using a free service
  async reverseGeocode(lat, lng) {
    try {
      // Using OpenStreetMap Nominatim (free service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Amour-Florals-App'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
     