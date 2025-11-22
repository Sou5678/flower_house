// Centralized authentication utilities
const TOKEN_KEY = 'amourFloralsToken';
const USER_KEY = 'amourFloralsUser';

export const authUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
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