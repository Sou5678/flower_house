// src/services/api.js
import API from '../utils/api';
import authUtils from './auth';

export const api = {
  // ==================== AUTHENTICATION ====================
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await API.put('/auth/updatedetails', userData);
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await API.put('/auth/updatepassword', passwordData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgotpassword', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await API.put(`/auth/resetpassword/${token}`, { password });
    return response.data;
  },

  // ==================== PRODUCTS ====================
  getProducts: async (params = {}) => {
    const response = await API.get('/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },

  searchProducts: async (searchParams) => {
    const response = await API.get('/products/search', { params: searchParams });
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await API.get('/products/featured');
    return response.data;
  },

  getPopularProducts: async () => {
    const response = await API.get('/products/popular');
    return response.data;
  },

  // ==================== CART ====================
  getCart: async () => {
    const response = await API.get('/cart');
    return response.data;
  },

  addToCart: async (productData) => {
    const response = await API.post('/cart', productData);
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await API.put(`/cart/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await API.delete(`/cart/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await API.delete('/cart');
    return response.data;
  },

  // ==================== ORDERS ====================
  createOrder: async (orderData) => {
    const response = await API.post('/orders', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await API.get('/orders');
    return response.data;
  },

  getOrder: async (orderId) => {
    const response = await API.get(`/orders/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId, reason) => {
    const response = await API.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // ==================== PAYMENTS ====================
  createPaymentIntent: async (orderData) => {
    const response = await API.post('/payments/create-payment-intent', orderData);
    return response.data;
  },

  verifyPayment: async (paymentData) => {
    const response = await API.post('/payments/verify', paymentData);
    return response.data;
  },

  // ==================== CATEGORIES ====================
  getCategories: async () => {
    const response = await API.get('/categories');
    return response.data;
  },

  getCategory: async (id) => {
    const response = await API.get(`/categories/${id}`);
    return response.data;
  },

  // ==================== WISHLIST ====================
  getWishlist: async () => {
    const response = await API.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await API.post('/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await API.delete(`/wishlist/${productId}`);
    return response.data;
  },

  clearWishlist: async () => {
    const response = await API.delete('/wishlist');
    return response.data;
  },

  // ==================== USERS ====================
  getUsers: async (params = {}) => {
    const response = await API.get('/users', { params });
    return response.data;
  },

  getUser: async (userId) => {
    const response = await API.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await API.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await API.delete(`/users/${userId}`);
    return response.data;
  },

  // ==================== ADMIN ====================
  getDashboardStats: async () => {
    const response = await API.get('/admin/dashboard');
    return response.data;
  },

  // ==================== UPLOAD ====================
  uploadImage: async (formData) => {
    const response = await API.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ==================== INVENTORY ====================
  getInventory: async () => {
    const response = await API.get('/inventory');
    return response.data;
  },

  updateInventory: async (productId, stockData) => {
    const response = await API.put(`/inventory/${productId}`, stockData);
    return response.data;
  },

  // ==================== LOCATION ====================
  getLocationServices: async () => {
    const response = await API.get('/location/services');
    return response.data;
  },

  // ==================== HEALTH CHECK ====================
  healthCheck: async () => {
    const response = await API.get('/health');
    return response.data;
  }
};

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (import.meta.env.DEV) {
    console.error('API Error:', error);
  }
  
  if (error.isAuthError) {
    return {
      status: 'error',
      message: error.message,
      type: 'AUTH_ERROR',
      redirectToLogin: true
    };
  }
  
  if (error.isNetworkError) {
    return {
      status: 'error',
      message: 'Network error - please check your connection and try again',
      type: 'NETWORK_ERROR'
    };
  }
  
  if (error.response?.data?.message) {
    return {
      status: 'error',
      message: error.response.data.message,
      type: 'SERVER_ERROR'
    };
  }
  
  return {
    status: 'error',
    message: 'Something went wrong. Please try again.',
    type: 'UNKNOWN_ERROR'
  };
};

// Enhanced API call wrapper with retry logic
export const apiCall = async (apiFunction, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await apiFunction();
      return result;
    } catch (error) {
      lastError = error;
      
      if (error.isAuthError) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.warn(`API call attempt ${attempt} failed, retrying...`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw lastError;
};

// Re-export auth utilities for backward compatibility
export const isAuthenticated = authUtils.isAuthenticated;
export const logout = authUtils.logout;
export const getToken = authUtils.getToken;
export const setToken = authUtils.setToken;

// Export for default import
export default api;