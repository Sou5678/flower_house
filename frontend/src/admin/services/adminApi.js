import API from '../../utils/api';

// Admin API service layer
export const adminApi = {
  // Authentication
  login: (credentials) => API.post('/api/auth/login', credentials),
  logout: () => API.post('/api/auth/logout'),
  verifyAuth: () => API.get('/api/auth/me'),

  // Products
  getProducts: (params = {}) => API.get('/api/admin/products', { params }),
  getProduct: (id) => API.get(`/api/admin/products/${id}`),
  createProduct: (data) => API.post('/api/admin/products', data),
  updateProduct: (id, data) => API.put(`/api/admin/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/api/admin/products/${id}`),
  bulkUpdateProducts: (data) => API.post('/api/admin/products/bulk-update', data),
  bulkDeleteProducts: (data) => API.post('/api/admin/products/bulk-delete', data),
  getProductAnalytics: (params = {}) => API.get('/api/admin/products/analytics', { params }),

  // Orders
  getOrders: (params = {}) => API.get('/api/admin/orders', { params }),
  getOrder: (id) => API.get(`/api/admin/orders/${id}`),
  updateOrderStatus: (id, status) => API.put(`/api/admin/orders/${id}/status`, { status }),
  addOrderTracking: (id, trackingData) => API.post(`/api/admin/orders/${id}/tracking`, trackingData),
  getOrderAnalytics: (params = {}) => API.get('/api/admin/orders/analytics', { params }),

  // Analytics
  getAnalytics: (params = {}) => API.get('/api/admin/analytics/sales', { params }),
  getInventoryAnalytics: (params = {}) => API.get('/api/admin/analytics/inventory', { params }),
  getCustomerAnalytics: (params = {}) => API.get('/api/admin/analytics/customers', { params }),
  generateReport: (reportData) => API.post('/api/admin/reports/generate', reportData),

  // Categories
  getCategories: (params = {}) => API.get('/api/admin/categories', { params }),
  getCategory: (id) => API.get(`/api/admin/categories/${id}`),
  createCategory: (data) => API.post('/api/admin/categories', data),
  updateCategory: (id, data) => API.put(`/api/admin/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/api/admin/categories/${id}`),
  reorderCategories: (data) => API.post('/api/admin/categories/reorder', data),

  // File uploads
  uploadImage: (file, type = 'product') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    
    return API.post('/api/admin/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  uploadMultipleImages: (files, type = 'product') => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });
    formData.append('type', type);
    
    return API.post('/api/admin/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Admin users management
  getAdminUsers: (params = {}) => API.get('/api/admin/users', { params }),
  createAdminUser: (data) => API.post('/api/admin/users', data),
  updateAdminUser: (id, data) => API.put(`/api/admin/users/${id}`, data),
  deleteAdminUser: (id) => API.delete(`/api/admin/users/${id}`),

  // System settings
  getSettings: () => API.get('/api/admin/settings'),
  updateSettings: (data) => API.put('/api/admin/settings', data),

  // Activity logs
  getActivityLogs: (params = {}) => API.get('/api/admin/activity-logs', { params }),

  // Dashboard summary
  getDashboardSummary: (params = {}) => API.get('/api/admin/dashboard', { params }),
};

// Export individual API functions for easier imports
export const {
  // Auth
  login,
  logout,
  verifyAuth,
  
  // Products
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  bulkDeleteProducts,
  getProductAnalytics,
  
  // Orders
  getOrders,
  getOrder,
  updateOrderStatus,
  addOrderTracking,
  getOrderAnalytics,
  
  // Analytics
  getAnalytics,
  getInventoryAnalytics,
  getCustomerAnalytics,
  generateReport,
  
  // Categories
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  
  // File uploads
  uploadImage,
  uploadMultipleImages,
  
  // Admin users
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  
  // Settings
  getSettings,
  updateSettings,
  
  // Activity logs
  getActivityLogs,
  
  // Dashboard
  getDashboardSummary,
} = adminApi;

export default adminApi;