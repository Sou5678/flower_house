import { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { adminApi } from '../services/adminApi';

// Admin state structure
const initialState = {
  // Products
  products: [],
  productsLoading: false,
  productsError: null,
  
  // Orders
  orders: [],
  ordersLoading: false,
  ordersError: null,
  
  // Analytics
  analytics: null,
  analyticsLoading: false,
  analyticsError: null,
  
  // Categories
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  
  // UI state
  selectedItems: [],
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
};

// Action types
const ACTIONS = {
  // Products
  SET_PRODUCTS_LOADING: 'SET_PRODUCTS_LOADING',
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_PRODUCTS_ERROR: 'SET_PRODUCTS_ERROR',
  ADD_PRODUCT: 'ADD_PRODUCT',
  UPDATE_PRODUCT: 'UPDATE_PRODUCT',
  DELETE_PRODUCT: 'DELETE_PRODUCT',
  
  // Orders
  SET_ORDERS_LOADING: 'SET_ORDERS_LOADING',
  SET_ORDERS: 'SET_ORDERS',
  SET_ORDERS_ERROR: 'SET_ORDERS_ERROR',
  UPDATE_ORDER: 'UPDATE_ORDER',
  
  // Analytics
  SET_ANALYTICS_LOADING: 'SET_ANALYTICS_LOADING',
  SET_ANALYTICS: 'SET_ANALYTICS',
  SET_ANALYTICS_ERROR: 'SET_ANALYTICS_ERROR',
  
  // Categories
  SET_CATEGORIES_LOADING: 'SET_CATEGORIES_LOADING',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_CATEGORIES_ERROR: 'SET_CATEGORIES_ERROR',
  ADD_CATEGORY: 'ADD_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY',
  
  // UI state
  SET_SELECTED_ITEMS: 'SET_SELECTED_ITEMS',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  RESET_STATE: 'RESET_STATE',
};

// Reducer function
const adminReducer = (state, action) => {
  switch (action.type) {
    // Products
    case ACTIONS.SET_PRODUCTS_LOADING:
      return { ...state, productsLoading: action.payload, productsError: null };
    case ACTIONS.SET_PRODUCTS:
      return { 
        ...state, 
        products: action.payload.products || action.payload,
        productsLoading: false, 
        productsError: null,
        pagination: action.payload.pagination || state.pagination
      };
    case ACTIONS.SET_PRODUCTS_ERROR:
      return { ...state, productsLoading: false, productsError: action.payload };
    case ACTIONS.ADD_PRODUCT:
      return { ...state, products: [action.payload, ...state.products] };
    case ACTIONS.UPDATE_PRODUCT:
      return {
        ...state,
        products: state.products.map(product =>
          product._id === action.payload._id ? action.payload : product
        ),
      };
    case ACTIONS.DELETE_PRODUCT:
      return {
        ...state,
        products: state.products.filter(product => product._id !== action.payload),
      };
    
    // Orders
    case ACTIONS.SET_ORDERS_LOADING:
      return { ...state, ordersLoading: action.payload, ordersError: null };
    case ACTIONS.SET_ORDERS:
      return { 
        ...state, 
        orders: action.payload.orders || action.payload,
        ordersLoading: false, 
        ordersError: null,
        pagination: action.payload.pagination || state.pagination
      };
    case ACTIONS.SET_ORDERS_ERROR:
      return { ...state, ordersLoading: false, ordersError: action.payload };
    case ACTIONS.UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map(order =>
          order._id === action.payload._id ? action.payload : order
        ),
      };
    
    // Analytics
    case ACTIONS.SET_ANALYTICS_LOADING:
      return { ...state, analyticsLoading: action.payload, analyticsError: null };
    case ACTIONS.SET_ANALYTICS:
      return { ...state, analytics: action.payload, analyticsLoading: false, analyticsError: null };
    case ACTIONS.SET_ANALYTICS_ERROR:
      return { ...state, analyticsLoading: false, analyticsError: action.payload };
    
    // Categories
    case ACTIONS.SET_CATEGORIES_LOADING:
      return { ...state, categoriesLoading: action.payload, categoriesError: null };
    case ACTIONS.SET_CATEGORIES:
      return { ...state, categories: action.payload, categoriesLoading: false, categoriesError: null };
    case ACTIONS.SET_CATEGORIES_ERROR:
      return { ...state, categoriesLoading: false, categoriesError: action.payload };
    case ACTIONS.ADD_CATEGORY:
      return { ...state, categories: [action.payload, ...state.categories] };
    case ACTIONS.UPDATE_CATEGORY:
      return {
        ...state,
        categories: state.categories.map(category =>
          category._id === action.payload._id ? action.payload : category
        ),
      };
    case ACTIONS.DELETE_CATEGORY:
      return {
        ...state,
        categories: state.categories.filter(category => category._id !== action.payload),
      };
    
    // UI state
    case ACTIONS.SET_SELECTED_ITEMS:
      return { ...state, selectedItems: action.payload };
    case ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case ACTIONS.SET_PAGINATION:
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case ACTIONS.RESET_STATE:
      return initialState;
    
    default:
      return state;
  }
};

// Create context
const AdminContext = createContext();

// Provider component
export const AdminProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Product actions
  const fetchProducts = useCallback(async (filters = {}) => {
    dispatch({ type: ACTIONS.SET_PRODUCTS_LOADING, payload: true });
    try {
      const response = await adminApi.getProducts(filters);
      dispatch({ type: ACTIONS.SET_PRODUCTS, payload: response.data });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_PRODUCTS_ERROR, payload: error.message });
    }
  }, []);

  const createProduct = useCallback(async (productData) => {
    try {
      const response = await adminApi.createProduct(productData);
      dispatch({ type: ACTIONS.ADD_PRODUCT, payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateProduct = useCallback(async (productId, productData) => {
    try {
      const response = await adminApi.updateProduct(productId, productData);
      dispatch({ type: ACTIONS.UPDATE_PRODUCT, payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteProduct = useCallback(async (productId) => {
    try {
      await adminApi.deleteProduct(productId);
      dispatch({ type: ACTIONS.DELETE_PRODUCT, payload: productId });
    } catch (error) {
      throw error;
    }
  }, []);

  // Order actions
  const fetchOrders = useCallback(async (filters = {}) => {
    dispatch({ type: ACTIONS.SET_ORDERS_LOADING, payload: true });
    try {
      const response = await adminApi.getOrders(filters);
      dispatch({ type: ACTIONS.SET_ORDERS, payload: response.data });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ORDERS_ERROR, payload: error.message });
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    try {
      const response = await adminApi.updateOrderStatus(orderId, status);
      dispatch({ type: ACTIONS.UPDATE_ORDER, payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  // Analytics actions
  const fetchAnalytics = useCallback(async (params = {}) => {
    dispatch({ type: ACTIONS.SET_ANALYTICS_LOADING, payload: true });
    try {
      const response = await adminApi.getAnalytics(params);
      dispatch({ type: ACTIONS.SET_ANALYTICS, payload: response.data });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ANALYTICS_ERROR, payload: error.message });
    }
  }, []);

  // Category actions
  const fetchCategories = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_CATEGORIES_LOADING, payload: true });
    try {
      const response = await adminApi.getCategories();
      dispatch({ type: ACTIONS.SET_CATEGORIES, payload: response.data });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_CATEGORIES_ERROR, payload: error.message });
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    try {
      const response = await adminApi.createCategory(categoryData);
      dispatch({ type: ACTIONS.ADD_CATEGORY, payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateCategory = useCallback(async (categoryId, categoryData) => {
    try {
      const response = await adminApi.updateCategory(categoryId, categoryData);
      dispatch({ type: ACTIONS.UPDATE_CATEGORY, payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId) => {
    try {
      await adminApi.deleteCategory(categoryId);
      dispatch({ type: ACTIONS.DELETE_CATEGORY, payload: categoryId });
    } catch (error) {
      throw error;
    }
  }, []);

  // UI actions
  const setSelectedItems = useCallback((items) => {
    dispatch({ type: ACTIONS.SET_SELECTED_ITEMS, payload: items });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  const setPagination = useCallback((pagination) => {
    dispatch({ type: ACTIONS.SET_PAGINATION, payload: pagination });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_STATE });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    ...state,
    
    // Product actions
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Order actions
    fetchOrders,
    updateOrderStatus,
    
    // Analytics actions
    fetchAnalytics,
    
    // Category actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // UI actions
    setSelectedItems,
    setFilters,
    setPagination,
    resetState,
  }), [
    state,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchOrders,
    updateOrderStatus,
    fetchAnalytics,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    setSelectedItems,
    setFilters,
    setPagination,
    resetState
  ]);

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to use admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;