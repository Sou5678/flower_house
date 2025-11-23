# Google Maps API Setup Guide

## Steps to Enable Location Detection

1. **Get Google Maps API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Geocoding API
     - Places API (for search functionality)
   - Create credentials (API Key)
   - Restrict the API key to your domain for security

2. **Update Environment Variable:**
   - Open `frontend/.env` file
   - Replace `your_google_maps_api_key_here` with your actual API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Test Location Detection:**
   - Restart the frontend server: `npm run dev`
   - Click on location button in navbar
   - Click "Use Current Location" option
   - Allow location permission when browser prompts

## Features Enabled:
- ✅ Automatic location detection using GPS
- ✅ Enhanced address formatting with Google Maps
- ✅ Better accuracy for Indian addresses
- ✅ Fallback to manual selection if GPS fails
- ✅ Toast notifications for user feedback
- ✅ Caching for better performance

## Security Notes:
- Always restrict your API key to specific domains in production
- Monitor API usage to avoid unexpected charges
- Consider implementing rate limiting for location requests