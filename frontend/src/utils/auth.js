// Centralized authentication utilities
const TOKEN_KEY = 'amourFloralsToken';
const USER_KEY = 'amourFloralsUser';

export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return false;
    
    try {
      // Basic token format validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        // Invalid JWT format, clear it
        authUtils.clearAuth();
        return false;
      }
      
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token expired, clear it
        authUtils.clearAuth();
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid token, clear it
      console.warn('Invalid token found, clearing auth data');
      authUtils.clearAuth();
      return false;
    }
  },

  // Get current auth token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get current user data
  getUser: () => {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Set authentication data
  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Clear authentication data
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('amourFloralsWishlist'); // Clear cached wishlist data
    localStorage.removeItem('amourFloralsCart'); // Clear cart data
    
    // Dispatch auth cleared event
    window.dispatchEvent(new CustomEvent('authCleared', {
      detail: { timestamp: Date.now() }
    }));
  },

  // Logout user with redirect
  logout: (redirectPath = '/login') => {
    authUtils.clearAuth();
    
    // Dispatch auth cleared event
    window.dispatchEvent(new CustomEvent('authCleared', {
      detail: { timestamp: Date.now() }
    }));
    
    window.location.href = redirectPath;
  },

  // Check if user needs to login and redirect if necessary
  requireAuth: (navigate, from = null) => {
    if (!authUtils.isAuthenticated()) {
      const state = from ? { from } : undefined;
      navigate('/login', { state });
      return false;
    }
    return true;
  }
};

export default authUtils;