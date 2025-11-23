// src/services/api.js
import API from '../utils/api';
import authUtils from '../utils/auth';

const API_URL = '/api';

export const api = {
  // ==================== AUTHENTICATION ====================
  login: async (email, password) => {
    const response = await API.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await API.post(`${API_URL}/auth/register`, userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await API.get(`${API_URL}/auth/me`);
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await API.put(`${API_URL}/auth/updatedetails`, userData);
    return response.data;
  },

  updatePassword: async (passwordData) => {
    const response = await API.put(`${API_URL}/auth/updatepassword`, passwordData);
    return response.data;
  },

  // ==================== PRODUCTS ====================
  getProducts: async (params = {}) => {
    const response = await API.get(`${API_URL}/products`, { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await API.get(`${API_URL}/products/${id}`);
    return response.data;
  },

  searchProducts: async (searchParams) => {
    const response = await API.get(`${API_URL}/products/search`, { params: searchParams });
    return response.data;
  },

  getFeaturedProducts: async () => {
    const response = await API.get(`${API_URL}/products/featured`);
    return response.data;
  },

  getPopularProducts: async () => {
    const response = await API.get(`${API_URL}/products/popular`);
    return response.data;
  },

  // ==================== CART ====================
  getCart: async () => {
    const response = await API.get(`${API_URL}/cart`);
    return response.data;
  },

  addToCart: async (productData) => {
    const response = await API.post(`${API_URL}/cart`, productData);
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await API.put(`${API_URL}/cart/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await API.delete(`${API_URL}/cart/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await API.delete(`${API_URL}/cart`);
    return response.data;
  },

  // ==================== ORDERS ====================
  createOrder: async (orderData) => {
    const response = await API.post(`${API_URL}/orders`, orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await API.get(`${API_URL}/orders`);
    return response.data;
  },

  getOrder: async (orderId) => {
    const response = await API.get(`${API_URL}/orders/${orderId}`);
    return response.data;
  },



  // ==================== PAYMENTS ====================
  createPaymentIntent: async (orderData) => {
    const response = await API.post(`${API_URL}/payment/create-payment-intent`, orderData);
    return response.data;
  },

  // ==================== CATEGORIES ====================
  getCategories: async () => {
    const response = await API.get(`${API_URL}/categories`);
    return response.data;
  },
};

// Utility function to handle API errors
export const handleApiError = (error) => {
  if (import.meta.env.DEV) {
    console.error('API Error:', error);
  }
  return {
    status: 'error',
    message: 'Something went wrong. Please try again.'
  };
};

// Re-export auth utilities for backward compatibility
export const isAuthenticated = authUtils.isAuthenticated;
export const logout = authUtils.logout;