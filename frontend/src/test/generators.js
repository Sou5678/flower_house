/**
 * Test data generators for property-based testing
 * Uses fast-check to generate realistic test data for wishlist operations
 */

import * as fc from 'fast-check';

// Counter for generating unique IDs
let idCounter = 0;

/**
 * Generator for MongoDB-style ObjectIds
 */
export const objectIdGenerator = () => 
  fc.string({ minLength: 24, maxLength: 24 })
    .filter(s => /^[0-9a-fA-F]{24}$/.test(s))
    .map(s => s.toLowerCase());

/**
 * Generator for unique product IDs
 */
export const uniqueProductIdGenerator = () => 
  fc.constant(null).map(() => {
    const uniqueId = (idCounter++).toString(16).padStart(24, '0');
    return uniqueId;
  });

/**
 * Generator for valid product data with unique IDs
 */
export const productGenerator = () =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0)
      .map(s => s.trim()),
    price: fc.double({ min: 0.01, max: 10000, noNaN: true, noDefaultInfinity: true }),
    originalPrice: fc.option(fc.double({ min: 0.01, max: 10000, noNaN: true, noDefaultInfinity: true })),
    description: fc.string({ minLength: 1, maxLength: 500 })
      .filter(s => s.trim().length > 0)
      .map(s => s.trim()),
    category: fc.constantFrom('Roses', 'Lilies', 'Tulips', 'Orchids', 'Mixed Bouquets'),
    images: fc.array(fc.webUrl(), { minLength: 1, maxLength: 5 }),
    inStock: fc.boolean(),
    occasion: fc.option(fc.constantFrom('Birthday', 'Anniversary', 'Wedding', 'Sympathy', 'Valentine\'s Day')),
    flowerType: fc.option(fc.constantFrom('Rose', 'Lily', 'Tulip', 'Orchid', 'Carnation')),
    color: fc.option(fc.constantFrom('Red', 'Pink', 'White', 'Yellow', 'Purple', 'Mixed')),
    addedAt: fc.date({ min: new Date('2020-01-01'), max: new Date() })
  }).map(product => {
    const uniqueId = (idCounter++).toString(16).padStart(24, '0');
    return {
      ...product,
      _id: uniqueId,
      id: uniqueId,
    };
  });

/**
 * Generator for wishlist (array of products)
 */
export const wishlistGenerator = (options = {}) => {
  const { minLength = 0, maxLength = 20 } = options;
  return fc.array(productGenerator(), { minLength, maxLength });
};

/**
 * Generator for non-empty wishlist
 */
export const nonEmptyWishlistGenerator = (options = {}) => {
  const { minLength = 1, maxLength = 20 } = options;
  return wishlistGenerator({ minLength, maxLength });
};

/**
 * Generator for valid user data with unique email
 */
let emailCounter = 0;
export const userGenerator = () => fc.record({
  fullName: fc.string({ minLength: 1, maxLength: 50 })
    .filter(s => s.trim().length > 0)
    .map(s => s.trim()),
  email: fc.emailAddress().map(email => `user${emailCounter++}-${email}`),
  password: fc.string({ minLength: 6, maxLength: 20 })
    .filter(s => s.trim().length >= 6),
  phone: fc.option(fc.string({ minLength: 10, maxLength: 15 })
    .filter(s => /^\+?[\d\s\-\(\)]+$/.test(s))),
  address: fc.option(fc.record({
    street: fc.string({ minLength: 5, maxLength: 100 }),
    city: fc.string({ minLength: 2, maxLength: 50 }),
    state: fc.string({ minLength: 2, maxLength: 50 }),
    zipCode: fc.string({ minLength: 5, maxLength: 10 }),
    country: fc.constantFrom('US', 'CA', 'UK', 'AU')
  }))
});

/**
 * Generator for API response structures
 */
export const apiResponseGenerator = (dataGenerator) => fc.record({
  status: fc.constantFrom('success', 'error'),
  message: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
  data: fc.option(dataGenerator)
});

/**
 * Generator for successful API responses
 */
export const successApiResponseGenerator = (dataGenerator) => fc.record({
  status: fc.constant('success'),
  message: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
  data: dataGenerator
});

/**
 * Generator for error API responses
 */
export const errorApiResponseGenerator = () => fc.record({
  status: fc.constant('error'),
  message: fc.string({ minLength: 1, maxLength: 200 }),
  data: fc.constant(null)
});

/**
 * Generator for bulk operation results
 */
export const bulkResultGenerator = (productIds) => fc.record({
  successful: fc.subarray(productIds),
  failed: fc.array(fc.record({
    id: fc.constantFrom(...productIds),
    error: fc.string({ minLength: 1, maxLength: 100 })
  })),
  totalProcessed: fc.constant(productIds.length),
  summary: fc.string({ minLength: 10, maxLength: 200 }),
  operationId: fc.integer({ min: 1000000000000, max: 9999999999999 })
});

/**
 * Generator for cart items
 */
export const cartItemGenerator = () => fc.record({
  _id: uniqueProductIdGenerator(),
  product: productGenerator(),
  quantity: fc.integer({ min: 1, max: 10 }),
  addedAt: fc.date({ min: new Date('2020-01-01'), max: new Date() })
});

/**
 * Generator for cart data
 */
export const cartGenerator = () => fc.record({
  items: fc.array(cartItemGenerator(), { minLength: 0, maxLength: 10 }),
  totalAmount: fc.double({ min: 0, max: 10000, noNaN: true, noDefaultInfinity: true }),
  itemCount: fc.integer({ min: 0, max: 100 })
});

/**
 * Generator for localStorage data
 */
export const localStorageDataGenerator = () => fc.record({
  amourFloralsToken: fc.option(fc.string({ minLength: 20, maxLength: 200 })),
  amourFloralsWishlist: fc.option(fc.jsonValue().map(JSON.stringify)),
  amourFloralsUser: fc.option(fc.jsonValue().map(JSON.stringify))
});

/**
 * Generator for network error scenarios
 */
export const networkErrorGenerator = () => fc.record({
  message: fc.constantFrom(
    'Network Error',
    'Request timeout',
    'Connection refused',
    'Server unavailable',
    'DNS resolution failed'
  ),
  code: fc.constantFrom('NETWORK_ERROR', 'TIMEOUT', 'ECONNREFUSED', 'ENOTFOUND'),
  response: fc.option(fc.record({
    status: fc.constantFrom(500, 502, 503, 504, 408, 429),
    data: fc.record({
      message: fc.string({ minLength: 1, maxLength: 100 }),
      error: fc.option(fc.string({ minLength: 1, maxLength: 100 }))
    })
  }))
});

/**
 * Generator for authentication error scenarios
 */
export const authErrorGenerator = () => fc.record({
  message: fc.constantFrom(
    'Authentication failed',
    'Token expired',
    'Invalid credentials',
    'Access denied',
    'Session expired'
  ),
  response: fc.record({
    status: fc.constantFrom(401, 403),
    data: fc.record({
      message: fc.constantFrom(
        'Please log in to continue',
        'Your session has expired',
        'Invalid authentication token',
        'Access denied'
      )
    })
  })
});

/**
 * Generator for validation error scenarios
 */
export const validationErrorGenerator = () => fc.record({
  message: fc.constantFrom(
    'Validation failed',
    'Invalid input data',
    'Required field missing',
    'Invalid format'
  ),
  response: fc.record({
    status: fc.constantFrom(400, 422),
    data: fc.record({
      message: fc.string({ minLength: 1, maxLength: 100 }),
      errors: fc.option(fc.array(fc.record({
        field: fc.string({ minLength: 1, maxLength: 50 }),
        message: fc.string({ minLength: 1, maxLength: 100 })
      })))
    })
  })
});

/**
 * Generator for concurrent operation scenarios
 */
export const concurrentOperationGenerator = (operationGenerator) => 
  fc.array(operationGenerator, { minLength: 2, maxLength: 10 });

/**
 * Generator for operation timing scenarios
 */
export const operationTimingGenerator = () => fc.record({
  delay: fc.integer({ min: 0, max: 2000 }), // milliseconds
  timeout: fc.integer({ min: 1000, max: 30000 }), // milliseconds
  retryCount: fc.integer({ min: 0, max: 5 }),
  retryDelay: fc.integer({ min: 100, max: 5000 }) // milliseconds
});

/**
 * Generator for UI state scenarios
 */
export const uiStateGenerator = () => fc.record({
  loading: fc.boolean(),
  error: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
  selectedItems: fc.array(uniqueProductIdGenerator(), { minLength: 0, maxLength: 10 }),
  sortBy: fc.constantFrom('name', 'price', 'dateAdded', 'category'),
  filterBy: fc.option(fc.constantFrom('inStock', 'onSale', 'category')),
  viewMode: fc.constantFrom('grid', 'list')
});

/**
 * Generator for performance test scenarios
 */
export const performanceScenarioGenerator = () => fc.record({
  itemCount: fc.integer({ min: 1, max: 1000 }),
  operationCount: fc.integer({ min: 1, max: 100 }),
  concurrentUsers: fc.integer({ min: 1, max: 20 }),
  networkLatency: fc.integer({ min: 0, max: 3000 }) // milliseconds
});

/**
 * Reset counters for test isolation
 */
export const resetGeneratorCounters = () => {
  idCounter = 0;
  emailCounter = 0;
};

/**
 * Utility to create constrained generators
 */
export const constrainedGenerator = (baseGenerator, constraints) => {
  return baseGenerator.filter(constraints.filter || (() => true))
    .map(constraints.map || (x => x));
};

/**
 * Generator for edge case scenarios
 */
export const edgeCaseGenerator = () => fc.oneof(
  // Empty states
  fc.record({
    type: fc.constant('empty'),
    wishlist: fc.constant([]),
    products: fc.constant([])
  }),
  
  // Large datasets
  fc.record({
    type: fc.constant('large'),
    wishlist: wishlistGenerator({ minLength: 100, maxLength: 500 }),
    products: fc.array(productGenerator(), { minLength: 100, maxLength: 500 })
  }),
  
  // Duplicate scenarios
  fc.record({
    type: fc.constant('duplicates'),
    wishlist: fc.array(productGenerator(), { minLength: 1, maxLength: 10 })
      .chain(products => fc.constant([...products, ...products])) // Create duplicates
  }),
  
  // Invalid data scenarios
  fc.record({
    type: fc.constant('invalid'),
    invalidProducts: fc.array(fc.record({
      _id: fc.option(fc.string()),
      name: fc.option(fc.string()),
      price: fc.option(fc.oneof(fc.double(), fc.string(), fc.constant(null)))
    }))
  })
);