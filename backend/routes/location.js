// routes/location.js
const express = require('express');
const router = express.Router();

// Mock data for Indian cities (in production, you'd use a proper geocoding service)
const indianCities = [
  { city: 'Mumbai', state: 'Maharashtra', country: 'India', coordinates: { latitude: 19.0760, longitude: 72.8777 } },
  { city: 'Delhi', state: 'Delhi', country: 'India', coordinates: { latitude: 28.7041, longitude: 77.1025 } },
  { city: 'Bangalore', state: 'Karnataka', country: 'India', coordinates: { latitude: 12.9716, longitude: 77.5946 } },
  { city: 'Hyderabad', state: 'Telangana', country: 'India', coordinates: { latitude: 17.3850, longitude: 78.4867 } },
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India', coordinates: { latitude: 13.0827, longitude: 80.2707 } },
  { city: 'Kolkata', state: 'West Bengal', country: 'India', coordinates: { latitude: 22.5726, longitude: 88.3639 } },
  { city: 'Pune', state: 'Maharashtra', country: 'India', coordinates: { latitude: 18.5204, longitude: 73.8567 } },
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India', coordinates: { latitude: 23.0225, longitude: 72.5714 } },
  { city: 'Jaipur', state: 'Rajasthan', country: 'India', coordinates: { latitude: 26.9124, longitude: 75.7873 } },
  { city: 'Surat', state: 'Gujarat', country: 'India', coordinates: { latitude: 21.1702, longitude: 72.8311 } },
  { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India', coordinates: { latitude: 26.8467, longitude: 80.9462 } },
  { city: 'Kanpur', state: 'Uttar Pradesh', country: 'India', coordinates: { latitude: 26.4499, longitude: 80.3319 } },
  { city: 'Nagpur', state: 'Maharashtra', country: 'India', coordinates: { latitude: 21.1458, longitude: 79.0882 } },
  { city: 'Indore', state: 'Madhya Pradesh', country: 'India', coordinates: { latitude: 22.7196, longitude: 75.8577 } },
  { city: 'Thane', state: 'Maharashtra', country: 'India', coordinates: { latitude: 19.2183, longitude: 72.9781 } },
  { city: 'Bhopal', state: 'Madhya Pradesh', country: 'India', coordinates: { latitude: 23.2599, longitude: 77.4126 } },
  { city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', coordinates: { latitude: 17.6868, longitude: 83.2185 } },
  { city: 'Pimpri-Chinchwad', state: 'Maharashtra', country: 'India', coordinates: { latitude: 18.6298, longitude: 73.7997 } },
  { city: 'Patna', state: 'Bihar', country: 'India', coordinates: { latitude: 25.5941, longitude: 85.1376 } },
  { city: 'Vadodara', state: 'Gujarat', country: 'India', coordinates: { latitude: 22.3072, longitude: 73.1812 } },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India', coordinates: { latitude: 28.6692, longitude: 77.4538 } },
  { city: 'Ludhiana', state: 'Punjab', country: 'India', coordinates: { latitude: 30.9010, longitude: 75.8573 } },
  { city: 'Agra', state: 'Uttar Pradesh', country: 'India', coordinates: { latitude: 27.1767, longitude: 78.0081 } },
  { city: 'Nashik', state: 'Maharashtra', country: 'India', coordinates: { latitude: 19.9975, longitude: 73.7898 } },
  { city: 'Faridabad', state: 'Haryana', country: 'India', coordinates: { latitude: 28.4089, longitude: 77.3178 } },
  { city: 'Meerut', state: 'Uttar Pradesh', country: 'India', coordinates: { latitude: 28.9845, longitude: 77.7064 } },
  { city: 'Rajkot', state: 'Gujarat', country: 'India', coordinates: { latitude: 22.3039, longitude: 70.8022 } },
  { city: 'Kalyan-Dombivli', state: 'Maharashtra', country: 'India', coordinates: { latitude: 19.2403, longitude: 73.1305 } },
  { city: 'Vasai-Virar', state: 'Maharashtra', country: 'India', coordinates: { latitude: 19.4912, longitude: 72.8054 } },
  { city: 'Varanasi', state: 'Uttar Pradesh', country: 'India', coordinates: { latitude: 25.3176, longitude: 82.9739 } }
];

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

// Search locations endpoint
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const query = q.toLowerCase();
    
    // Filter cities based on query
    const results = indianCities
      .filter(city => 
        city.city.toLowerCase().includes(query) || 
        city.state.toLowerCase().includes(query)
      )
      .slice(0, 10) // Limit to 10 results
      .map(city => ({
        placeId: `${city.city}_${city.state}`.replace(/\s+/g, '_').toLowerCase(),
        description: `${city.city}, ${city.state}, ${city.country}`,
        mainText: city.city,
        secondaryText: `${city.state}, ${city.country}`,
        city: city.city,
        state: city.state,
        country: city.country,
        coordinates: city.coordinates
      }));

    res.json(results);
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ error: 'Failed to search locations' });
  }
});

// Reverse geocoding endpoint
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Find the nearest city
    let nearestCity = null;
    let minDistance = Infinity;

    indianCities.forEach(city => {
      const distance = calculateDistance(
        latitude, 
        longitude, 
        city.coordinates.latitude, 
        city.coordinates.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    });

    if (nearestCity && minDistance < 100) { // Within 100km
      const result = {
        city: nearestCity.city,
        state: nearestCity.state,
        country: nearestCity.country,
        formattedAddress: `${nearestCity.city}, ${nearestCity.state}, ${nearestCity.country}`,
        coordinates: { latitude, longitude },
        accuracy: Math.round(minDistance * 1000) // Convert to meters
      };
      
      res.json(result);
    } else {
      // If no nearby city found, return a generic response
      res.json({
        city: 'Unknown City',
        state: 'Unknown State',
        country: 'India',
        formattedAddress: 'Location in India',
        coordinates: { latitude, longitude },
        accuracy: null
      });
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ error: 'Failed to reverse geocode location' });
  }
});

// Get location details by place ID
router.get('/details/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    
    // Parse place ID to get city and state
    const parts = placeId.replace(/_/g, ' ').split(' ');
    
    // Find the city in our database
    const city = indianCities.find(c => 
      c.city.toLowerCase() === parts[0]?.toLowerCase() ||
      placeId.includes(c.city.toLowerCase().replace(/\s+/g, '_'))
    );

    if (city) {
      const result = {
        city: city.city,
        state: city.state,
        country: city.country,
        formattedAddress: `${city.city}, ${city.state}, ${city.country}`,
        coordinates: city.coordinates
      };
      
      res.json(result);
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (error) {
    console.error('Location details error:', error);
    res.status(500).json({ error: 'Failed to get location details' });
  }
});

// Get popular cities
router.get('/popular', async (req, res) => {
  try {
    const popularCities = indianCities.slice(0, 20).map(city => ({
      city: city.city,
      state: city.state,
      country: city.country,
      formattedAddress: `${city.city}, ${city.state}, ${city.country}`,
      coordinates: city.coordinates
    }));
    
    res.json(popularCities);
  } catch (error) {
    console.error('Popular cities error:', error);
    res.status(500).json({ error: 'Failed to get popular cities' });
  }
});

// Check if location is serviceable (for delivery)
router.post('/check-serviceable', async (req, res) => {
  try {
    const { city, state, coordinates } = req.body;
    
    // For demo purposes, all major cities are serviceable
    const serviceableCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
      'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'
    ];
    
    const isServiceable = serviceableCities.some(serviceableCity => 
      city.toLowerCase().includes(serviceableCity.toLowerCase())
    );
    
    res.json({
      isServiceable,
      message: isServiceable 
        ? 'Delivery available in your area' 
        : 'Delivery not available in your area yet',
      estimatedDeliveryTime: isServiceable ? '2-4 hours' : null
    });
  } catch (error) {
    console.error('Serviceability check error:', error);
    res.status(500).json({ error: 'Failed to check serviceability' });
  }
});

module.exports = router;