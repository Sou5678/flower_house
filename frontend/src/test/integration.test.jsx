/**
 * Integration tests for critical user flows
 * Tests complete user workflows using the wishlist system
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';

// Import components
import ProductCard from '../components/ProductCard';
import WishlistPage from '../pages/WishlistPage';
import { WishlistProvider } from '../contexts/WishlistContext';
import { BrowserRouter } from 'react-router-dom';

// Import test utilities
import {
  testAddToWishlistFlow,
  testRemoveFromWishlistFlow,
  testBulkOperationsFlow,
  testWishlistPageLoadFlow,
  testAuthenticationWishlistFlow,
  testErrorRecoveryFlow,
  testConcurrentOperationsFlow,
  testPerformanceFlow,
  testAccessibilityFlow,
  testCompleteUserJourney
} from './integration-helpers';

import {
  setupLocalStorageMock,
  createMockProduct,
  createMockProducts,
  setupAPIMocks,
  resetAPIMocks,
  assertWishlistConsistency
} from './utilities.jsx';

import { productGenerator, wishlistGenerator } from './generators';
import API from '../utils/api';

// Mock the API module
vi.mock('../utils/api');

// Setup localStorage mock
const mockLocalStorage = setupLocalStorageMock();

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <WishlistProvider>
      {children}
    </WishlistProvider>
  </BrowserRouter>
);

describe('Integration Tests - Critical User Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage.setItem('amourFloralsToken', 'mock-token');
    resetAPIMocks();
  });

  describe('Add to Wishlist Flow', () => {
    test('user can successfully add product to wishlist', async () => {
      const product = createMockProduct();
      
      // Mock successful API response
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [] } }
      });
      API.post.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [product] } }
      });

      const { container } = render(
        <TestWrapper>
          <ProductCard product={product} onAddToCart={vi.fn()} />
        </TestWrapper>
      );

      await testAddToWishlistFlow(container, product, { expectSuccess: true });
    });

    test('user receives feedback when add to wishlist fails', async () => {
      const product = createMockProduct();
      
      // Mock failed API response
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [] } }
      });
      API.post.mockRejectedValue({
        response: { data: { message: 'Failed to add to wishlist' } }
      });

      const { container } = render(
        <TestWrapper>
          <ProductCard product={product} onAddToCart={vi.fn()} />
        </TestWrapper>
      );

      await testAddToWishlistFlow(container, product, { 
        expectSuccess: false, 
        shouldFail: true 
      });
    });

    test('add to wishlist works with network delays', async () => {
      const product = createMockProduct();
      
      // Mock delayed API response
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [] } }
      });
      API.post.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            data: { status: 'success', data: { wishlist: [product] } }
          }), 500)
        )
      );

      const { container } = render(
        <TestWrapper>
          <ProductCard product={product} onAddToCart={vi.fn()} />
        </TestWrapper>
      );

      await testAddToWishlistFlow(container, product, { 
        expectSuccess: true,
        networkDelay: 500
      });
    });
  });

  describe('Remove from Wishlist Flow', () => {
    test('user can successfully remove product from wishlist', async () => {
      const product = createMockProduct();
      
      // Mock successful API responses
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [product] } }
      });
      API.delete.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [] } }
      });

      const { container } = render(
        <TestWrapper>
          <ProductCard product={product} onAddToCart={vi.fn()} />
        </TestWrapper>
      );

      await testRemoveFromWishlistFlow(container, product, { expectSuccess: true });
    });

    test('user receives feedback when remove from wishlist fails', async () => {
      const product = createMockProduct();
      
      // Mock failed API response
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [product] } }
      });
      API.delete.mockRejectedValue({
        response: { data: { message: 'Failed to remove from wishlist' } }
      });

      const { container } = render(
        <TestWrapper>
          <ProductCard product={product} onAddToCart={vi.fn()} />
        </TestWrapper>
      );

      await testRemoveFromWishlistFlow(container, product, { 
        expectSuccess: false, 
        shouldFail: true 
      });
    });
  });

  describe('Wishlist Page Load Flow', () => {
    test('wishlist page loads with existing items', async () => {
      const products = createMockProducts(3);
      
      // Mock API response with wishlist items
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: products } }
      });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      await testWishlistPageLoadFlow(container, products, { expectLoading: true });
    });

    test('wishlist page shows empty state when no items', async () => {
      // Mock API response with empty wishlist
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [] } }
      });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      await testWishlistPageLoadFlow(container, [], { expectLoading: true });
    });

    test('wishlist page handles load errors gracefully', async () => {
      // Mock API failure
      API.get.mockRejectedValue({
        response: { data: { message: 'Failed to load wishlist' } }
      });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      await testWishlistPageLoadFlow(container, [], { 
        expectLoading: true, 
        shouldFail: true 
      });
    });
  });

  describe('Bulk Operations Flow', () => {
    test('user can remove multiple items from wishlist', async () => {
      const products = createMockProducts(5);
      const selectedProducts = products.slice(0, 3);
      
      // Mock API responses
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: products } }
      });
      API.delete.mockResolvedValue({
        data: { 
          status: 'success', 
          data: { 
            wishlist: products.slice(3),
            bulkResult: {
              successful: selectedProducts.map(p => p._id),
              failed: [],
              totalProcessed: selectedProducts.length
            }
          }
        }
      });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      await testBulkOperationsFlow(
        container, 
        selectedProducts, 
        'remove selected',
        { expectSuccess: true }
      );
    });

    test('bulk operations handle partial failures', async () => {
      const products = createMockProducts(5);
      const selectedProducts = products.slice(0, 3);
      
      // Mock API responses with partial failure
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: products } }
      });
      API.delete.mockResolvedValue({
        data: { 
          status: 'success', 
          data: { 
            wishlist: products.slice(2), // Only first item removed
            bulkResult: {
              successful: [selectedProducts[0]._id],
              failed: [
                { id: selectedProducts[1]._id, error: 'Network error' },
                { id: selectedProducts[2]._id, error: 'Server error' }
              ],
              totalProcessed: selectedProducts.length
            }
          }
        }
      });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      await testBulkOperationsFlow(
        container, 
        selectedProducts, 
        'remove selected',
        { expectSuccess: true, partialFailure: true }
      );
    });
  });

  describe('Authentication Flow', () => {
    test('logged in user sees their saved wishlist', async () => {
      const savedWishlist = createMockProducts(3);
      
      // Mock API response with saved wishlist
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: savedWishlist } }
      });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      await testAuthenticationWishlistFlow(container, {
        hasToken: true,
        savedWishlist,
        expectSync: true
      });
    });

    test('non-authenticated user is prompted to log in', async () => {
      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      await testAuthenticationWishlistFlow(container, {
        hasToken: false,
        savedWishlist: [],
        expectSync: false
      });
    });
  });

  describe('Error Recovery Flow', () => {
    test('user can recover from network errors', async () => {
      const products = createMockProducts(2);
      
      // First call fails, second succeeds
      API.get
        .mockRejectedValueOnce({
          code: 'NETWORK_ERROR',
          message: 'Network Error'
        })
        .mockResolvedValue({
          data: { status: 'success', data: { wishlist: products } }
        });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      await testErrorRecoveryFlow(container, 'network', {
        expectRecovery: true,
        retryAttempts: 1
      });
    });

    test('user can recover from authentication errors', async () => {
      const products = createMockProducts(2);
      
      // First call fails with auth error, second succeeds
      API.get
        .mockRejectedValueOnce({
          response: { status: 401, data: { message: 'Authentication failed' } }
        })
        .mockResolvedValue({
          data: { status: 'success', data: { wishlist: products } }
        });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      await testErrorRecoveryFlow(container, 'auth', {
        expectRecovery: true,
        retryAttempts: 1
      });
    });
  });

  describe('Concurrent Operations Flow', () => {
    test('concurrent add/remove operations maintain consistency', async () => {
      const products = createMockProducts(3);
      
      // Mock API responses for concurrent operations
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [products[0]] } }
      });
      API.post.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [products[0], products[1]] } }
      });
      API.delete.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [products[1]] } }
      });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      const operations = [
        { type: 'add', product: products[1] },
        { type: 'remove', product: products[0] }
      ];

      await testConcurrentOperationsFlow(container, operations, {
        expectConsistency: true,
        networkDelay: 100
      });
    });
  });

  describe('Performance Flow', () => {
    test('large wishlist maintains responsive UI', async () => {
      const largeWishlist = createMockProducts(100);
      
      // Mock API response with large dataset
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: largeWishlist } }
      });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      const { performanceMetrics } = await testPerformanceFlow(
        container, 
        'scroll',
        { 
          itemCount: 100, 
          operationCount: 20, 
          expectResponsive: true 
        }
      );

      expect(performanceMetrics.duration).toBeLessThan(5000);
      expect(performanceMetrics.operationsPerSecond).toBeGreaterThan(1);
    });
  });

  describe('Accessibility Flow', () => {
    test('wishlist is fully keyboard navigable', async () => {
      const products = createMockProducts(3);
      
      // Mock API response
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: products } }
      });

      const { container } = render(
        <TestWrapper>
          <WishlistPage />
        </TestWrapper>
      );

      await testAccessibilityFlow(container, {
        expectKeyboardNavigation: true,
        expectScreenReaderSupport: true
      });
    });
  });

  describe('Complete User Journey', () => {
    test('end-to-end user workflow completes successfully', async () => {
      const products = createMockProducts(5);
      
      // Mock all necessary API responses
      API.get.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [] } }
      });
      API.post.mockResolvedValue({
        data: { status: 'success', data: { wishlist: products.slice(0, 1) } }
      });
      API.delete.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [] } }
      });

      const components = {
        productCard: ProductCard,
        productList: WishlistPage,
        wishlistPage: WishlistPage
      };

      const { completedSteps } = await testCompleteUserJourney(components, {
        expectSuccess: true,
        includeErrors: false
      });

      expect(completedSteps).toBe(6);
    });

    test('end-to-end workflow with error scenarios', async () => {
      const products = createMockProducts(5);
      
      // Mock API responses including failures and recoveries
      API.get
        .mockResolvedValueOnce({
          data: { status: 'success', data: { wishlist: [] } }
        })
        .mockRejectedValueOnce({
          code: 'NETWORK_ERROR',
          message: 'Network Error'
        })
        .mockResolvedValue({
          data: { status: 'success', data: { wishlist: products.slice(0, 2) } }
        });

      API.post.mockResolvedValue({
        data: { status: 'success', data: { wishlist: products.slice(0, 1) } }
      });
      API.delete.mockResolvedValue({
        data: { status: 'success', data: { wishlist: [] } }
      });

      const components = {
        productCard: ProductCard,
        productList: WishlistPage,
        wishlistPage: WishlistPage
      };

      const { completedSteps } = await testCompleteUserJourney(components, {
        expectSuccess: true,
        includeErrors: true
      });

      expect(completedSteps).toBe(7);
    });
  });
});

/**
 * Property-based integration tests
 * Tests integration flows with generated data
 */
describe('Property-Based Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage.setItem('amourFloralsToken', 'mock-token');
    resetAPIMocks();
  });

  test('add to wishlist flow works for any valid product', async () => {
    await fc.assert(
      fc.asyncProperty(productGenerator(), async (product) => {
        // Mock API responses
        API.get.mockResolvedValue({
          data: { status: 'success', data: { wishlist: [] } }
        });
        API.post.mockResolvedValue({
          data: { status: 'success', data: { wishlist: [product] } }
        });

        const { container } = render(
          <TestWrapper>
            <ProductCard product={product} onAddToCart={vi.fn()} />
          </TestWrapper>
        );

        await testAddToWishlistFlow(container, product, { expectSuccess: true });
      }),
      { numRuns: 50 }
    );
  });

  test('wishlist page load works for any valid wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(wishlistGenerator(), async (wishlist) => {
        // Mock API response
        API.get.mockResolvedValue({
          data: { status: 'success', data: { wishlist } }
        });

        const { container } = render(
          <TestWrapper>
            <WishlistPage />
          </TestWrapper>
        );

        await testWishlistPageLoadFlow(container, wishlist, { expectLoading: true });
      }),
      { numRuns: 50 }
    );
  });

  test('bulk operations work for any valid product selection', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productGenerator(), { minLength: 2, maxLength: 10 }),
        fc.integer({ min: 1, max: 5 }),
        async (products, selectCount) => {
          const selectedProducts = products.slice(0, Math.min(selectCount, products.length));
          const remainingProducts = products.slice(selectedProducts.length);

          // Mock API responses
          API.get.mockResolvedValue({
            data: { status: 'success', data: { wishlist: products } }
          });
          API.delete.mockResolvedValue({
            data: { 
              status: 'success', 
              data: { 
                wishlist: remainingProducts,
                bulkResult: {
                  successful: selectedProducts.map(p => p._id),
                  failed: [],
                  totalProcessed: selectedProducts.length
                }
              }
            }
          });

          const { container } = render(
            <TestWrapper>
              <WishlistPage />
            </TestWrapper>
          );

          await testBulkOperationsFlow(
            container, 
            selectedProducts, 
            'remove selected',
            { expectSuccess: true }
          );
        }
      ),
      { numRuns: 30 }
    );
  });
});