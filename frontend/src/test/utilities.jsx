/**
 * Test utilities for wishlist operations
 * Provides helper functions for setting up test environments and mocking
 */

import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { WishlistProvider } from '../contexts/WishlistContext';
import API from '../utils/api';

/**
 * Mock localStorage implementation for testing
 */
export const createMockLocalStorage = () => {
  let store = {};
  
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    },
    // Additional utility methods for testing
    _getStore: () => ({ ...store }),
    _setStore: (newStore) => { store = { ...newStore }; }
  };
};

/**
 * Setup localStorage mock for tests
 */
export const setupLocalStorageMock = () => {
  const mockLocalStorage = createMockLocalStorage();
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true
  });
  return mockLocalStorage;
};

/**
 * Mock API responses for different scenarios
 */
export const createAPIMocks = () => {
  const mocks = {
    // Success responses
    getWishlistSuccess: (wishlist = []) => ({
      data: {
        status: 'success',
        data: { wishlist }
      }
    }),
    
    addToWishlistSuccess: (wishlist = []) => ({
      data: {
        status: 'success',
        data: { wishlist },
        message: 'Product added to wishlist'
      }
    }),
    
    removeFromWishlistSuccess: (wishlist = []) => ({
      data: {
        status: 'success',
        data: { wishlist },
        message: 'Product removed from wishlist'
      }
    }),
    
    clearWishlistSuccess: () => ({
      data: {
        status: 'success',
        data: { wishlist: [] },
        message: 'Wishlist cleared'
      }
    }),
    
    moveToCartSuccess: (wishlist = [], cart = null, transactionId = 'mock-tx-id') => ({
      data: {
        status: 'success',
        data: { 
          wishlist, 
          cart: cart || { items: [] },
          transactionId
        },
        message: 'Product moved from wishlist to cart atomically'
      }
    }),
    
    // Error responses
    networkError: (message = 'Network Error') => {
      const error = new Error(message);
      error.code = 'NETWORK_ERROR';
      return Promise.reject(error);
    },
    
    authError: (message = 'Authentication failed') => {
      const error = new Error(message);
      error.response = {
        status: 401,
        data: { message }
      };
      return Promise.reject(error);
    },
    
    validationError: (message = 'Validation failed') => {
      const error = new Error(message);
      error.response = {
        status: 400,
        data: { message }
      };
      return Promise.reject(error);
    },
    
    serverError: (message = 'Internal server error') => {
      const error = new Error(message);
      error.response = {
        status: 500,
        data: { message }
      };
      return Promise.reject(error);
    },
    
    timeoutError: () => {
      const error = new Error('Request timeout');
      error.code = 'TIMEOUT';
      return Promise.reject(error);
    }
  };
  
  return mocks;
};

/**
 * Setup API mocks with default behaviors
 */
export const setupAPIMocks = () => {
  vi.mock('../utils/api', () => ({
    default: {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
      put: vi.fn(),
      patch: vi.fn()
    }
  }));
  
  return API;
};

/**
 * Reset all API mocks
 */
export const resetAPIMocks = () => {
  if (API.get?.mockReset) {
    API.get.mockReset();
    API.post.mockReset();
    API.delete.mockReset();
    API.put?.mockReset();
    API.patch?.mockReset();
  }
};

/**
 * Create a test wrapper with WishlistProvider and Router
 */
export const createTestWrapper = (initialWishlist = [], mockLocalStorage = null) => {
  // Setup localStorage if provided
  if (mockLocalStorage) {
    if (initialWishlist.length > 0) {
      mockLocalStorage.setItem('amourFloralsWishlist', JSON.stringify(initialWishlist));
    }
    mockLocalStorage.setItem('amourFloralsToken', 'mock-token');
  }
  
  // Setup API mocks
  const apiMocks = createAPIMocks();
  API.get.mockResolvedValue(apiMocks.getWishlistSuccess(initialWishlist));
  
  const TestWrapper = ({ children }) => (
    <BrowserRouter>
      <WishlistProvider>
        {children}
      </WishlistProvider>
    </BrowserRouter>
  );
  
  return { TestWrapper, apiMocks };
};

/**
 * Render component with wishlist context
 */
export const renderWithWishlistContext = (component, options = {}) => {
  const {
    initialWishlist = [],
    mockLocalStorage = setupLocalStorageMock(),
    ...renderOptions
  } = options;
  
  const { TestWrapper } = createTestWrapper(initialWishlist, mockLocalStorage);
  
  return {
    ...render(component, { wrapper: TestWrapper, ...renderOptions }),
    mockLocalStorage
  };
};

/**
 * Wait for async operations to complete
 */
export const waitForAsyncOperations = (timeout = 1000) => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

/**
 * Create a mock product for testing
 */
export const createMockProduct = (overrides = {}) => {
  const baseProduct = {
    _id: `mock-product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Product',
    price: 25.99,
    description: 'A test product for testing',
    category: 'Test Category',
    images: ['https://example.com/image.jpg'],
    inStock: true,
    addedAt: new Date()
  };
  
  return { ...baseProduct, ...overrides };
};

/**
 * Create multiple mock products
 */
export const createMockProducts = (count = 3, baseOverrides = {}) => {
  return Array.from({ length: count }, (_, index) => 
    createMockProduct({
      ...baseOverrides,
      name: `Test Product ${index + 1}`,
      _id: `mock-product-${Date.now()}-${index}`
    })
  );
};

/**
 * Create a mock user for testing
 */
export const createMockUser = (overrides = {}) => {
  const baseUser = {
    _id: `mock-user-${Date.now()}`,
    fullName: 'Test User',
    email: `test-${Date.now()}@example.com`,
    favorites: []
  };
  
  return { ...baseUser, ...overrides };
};

/**
 * Simulate network delay
 */
export const simulateNetworkDelay = (delay = 100) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Create a mock API response with delay
 */
export const createDelayedMockResponse = (response, delay = 100) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(response), delay);
  });
};

/**
 * Setup test environment for property-based tests
 */
export const setupPropertyTestEnvironment = () => {
  const mockLocalStorage = setupLocalStorageMock();
  const apiMocks = createAPIMocks();
  
  // Reset counters and state
  let idCounter = 0;
  let emailCounter = 0;
  
  const resetCounters = () => {
    idCounter = 0;
    emailCounter = 0;
  };
  
  const generateUniqueId = () => {
    return (idCounter++).toString(16).padStart(24, '0');
  };
  
  const generateUniqueEmail = () => {
    return `test-user-${emailCounter++}@example.com`;
  };
  
  return {
    mockLocalStorage,
    apiMocks,
    resetCounters,
    generateUniqueId,
    generateUniqueEmail,
    cleanup: () => {
      mockLocalStorage.clear();
      resetAPIMocks();
      resetCounters();
    }
  };
};

/**
 * Assert that wishlist state is consistent
 */
export const assertWishlistConsistency = (wishlist, expectedProperties = {}) => {
  // Basic structure validation
  expect(Array.isArray(wishlist)).toBe(true);
  
  // Each item should have required properties
  wishlist.forEach(item => {
    expect(item).toHaveProperty('_id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('price');
    expect(typeof item.price).toBe('number');
    expect(item.price).toBeGreaterThan(0);
  });
  
  // Check for duplicates
  const ids = wishlist.map(item => item._id);
  const uniqueIds = [...new Set(ids)];
  expect(ids.length).toBe(uniqueIds.length);
  
  // Apply custom assertions
  Object.entries(expectedProperties).forEach(([key, value]) => {
    if (key === 'length') {
      expect(wishlist.length).toBe(value);
    } else if (key === 'contains') {
      const containsIds = Array.isArray(value) ? value : [value];
      containsIds.forEach(id => {
        expect(wishlist.some(item => item._id === id)).toBe(true);
      });
    } else if (key === 'notContains') {
      const notContainsIds = Array.isArray(value) ? value : [value];
      notContainsIds.forEach(id => {
        expect(wishlist.some(item => item._id === id)).toBe(false);
      });
    }
  });
};

/**
 * Assert that bulk operation results are valid
 */
export const assertBulkOperationResult = (result, expectedProperties = {}) => {
  expect(result).toHaveProperty('successful');
  expect(result).toHaveProperty('failed');
  expect(result).toHaveProperty('totalProcessed');
  expect(result).toHaveProperty('summary');
  
  expect(Array.isArray(result.successful)).toBe(true);
  expect(Array.isArray(result.failed)).toBe(true);
  expect(typeof result.totalProcessed).toBe('number');
  expect(typeof result.summary).toBe('string');
  
  // Validate that successful + failed = totalProcessed
  expect(result.successful.length + result.failed.length).toBe(result.totalProcessed);
  
  // Apply custom assertions
  Object.entries(expectedProperties).forEach(([key, value]) => {
    if (key === 'successCount') {
      expect(result.successful.length).toBe(value);
    } else if (key === 'failureCount') {
      expect(result.failed.length).toBe(value);
    } else if (key === 'totalCount') {
      expect(result.totalProcessed).toBe(value);
    }
  });
};

/**
 * Create a test scenario for concurrent operations
 */
export const createConcurrentTestScenario = (operations, options = {}) => {
  const { delay = 0, randomizeDelay = false } = options;
  
  const executeOperations = async () => {
    const promises = operations.map(async (operation, index) => {
      const operationDelay = randomizeDelay 
        ? Math.random() * delay 
        : delay * index;
      
      if (operationDelay > 0) {
        await simulateNetworkDelay(operationDelay);
      }
      
      return operation();
    });
    
    return Promise.allSettled(promises);
  };
  
  return { executeOperations };
};

/**
 * Validate error handling behavior
 */
export const assertErrorHandling = (error, expectedType = 'Error') => {
  expect(error).toBeInstanceOf(Error);
  expect(error.message).toBeTruthy();
  expect(typeof error.message).toBe('string');
  
  if (expectedType === 'NetworkError') {
    expect(error.code).toBeDefined();
  } else if (expectedType === 'AuthError') {
    expect(error.response).toBeDefined();
    expect(error.response.status).toBeOneOf([401, 403]);
  } else if (expectedType === 'ValidationError') {
    expect(error.response).toBeDefined();
    expect(error.response.status).toBeOneOf([400, 422]);
  }
};

/**
 * Performance testing utilities
 */
export const measurePerformance = async (operation, iterations = 1) => {
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await operation();
    const end = performance.now();
    times.push(end - start);
  }
  
  const average = times.reduce((sum, time) => sum + time, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  return {
    average,
    min,
    max,
    times,
    iterations
  };
};

/**
 * Memory usage testing utilities
 */
export const measureMemoryUsage = () => {
  if (performance.memory) {
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };
  }
  return null;
};

/**
 * Cleanup utilities for tests
 */
export const cleanupTestEnvironment = () => {
  // Clear localStorage
  if (window.localStorage) {
    window.localStorage.clear();
  }
  
  // Reset API mocks
  resetAPIMocks();
  
  // Clear any timers
  vi.clearAllTimers();
  
  // Reset modules
  vi.resetModules();
};

/**
 * Debug utilities for tests
 */
export const debugTestState = (context = {}) => {
  console.log('=== Test Debug Information ===');
  console.log('Context:', context);
  console.log('LocalStorage:', window.localStorage?._getStore?.() || 'Not available');
  console.log('API Mock Calls:', {
    get: API.get?.mock?.calls?.length || 0,
    post: API.post?.mock?.calls?.length || 0,
    delete: API.delete?.mock?.calls?.length || 0
  });
  console.log('==============================');
};