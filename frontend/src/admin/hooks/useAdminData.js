import { useState, useCallback } from 'react';
import { adminApi } from '../services/adminApi';

// Custom hook for managing admin data operations
export const useAdminData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generic data fetcher
  const fetchData = useCallback(async (apiCall, params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(params);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generic data mutator (create, update, delete)
  const mutateData = useCallback(async (apiCall, data = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Specific data operations
  const operations = {
    // Products
    getProducts: (params) => fetchData(adminApi.getProducts, params),
    getProduct: (id) => fetchData(adminApi.getProduct, id),
    createProduct: (data) => mutateData(adminApi.createProduct, data),
    updateProduct: (id, data) => mutateData((data) => adminApi.updateProduct(id, data), data),
    deleteProduct: (id) => mutateData(adminApi.deleteProduct, id),
    
    // Orders
    getOrders: (params) => fetchData(adminApi.getOrders, params),
    getOrder: (id) => fetchData(adminApi.getOrder, id),
    updateOrderStatus: (id, status) => mutateData((data) => adminApi.updateOrderStatus(id, data.status), { status }),
    
    // Analytics
    getAnalytics: (params) => fetchData(adminApi.getAnalytics, params),
    getInventoryAnalytics: (params) => fetchData(adminApi.getInventoryAnalytics, params),
    getCustomerAnalytics: (params) => fetchData(adminApi.getCustomerAnalytics, params),
    
    // Categories
    getCategories: (params) => fetchData(adminApi.getCategories, params),
    createCategory: (data) => mutateData(adminApi.createCategory, data),
    updateCategory: (id, data) => mutateData((data) => adminApi.updateCategory(id, data), data),
    deleteCategory: (id) => mutateData(adminApi.deleteCategory, id),
    
    // File uploads
    uploadImage: (file, type) => mutateData((data) => adminApi.uploadImage(data.file, data.type), { file, type }),
    uploadMultipleImages: (files, type) => mutateData((data) => adminApi.uploadMultipleImages(data.files, data.type), { files, type }),
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    clearError,
    ...operations,
  };
};

export default useAdminData;