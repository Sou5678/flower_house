import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '../WishlistContext';
import API from '../../utils/api';

// Mock the API module
vi.mock('../../utils/api');

// Mock localStorage
const localStorageMock = (() => {
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
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Atomic Cart Operations', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorageMock.clear();
    // Mock token in localStorage
    localStorageMock.setItem('amourFloralsToken', 'mock-token');
  });

  test('moveToCart successfully moves item from wishlist to cart atomically', async () => {
    const testProduct = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Test Rose',
      price: 25.99,
      description: 'Beautiful red rose',
    };

    const initialWishlist = [testProduct];

    // Mock API responses for successful atomic operation
    API.get.mockResolvedValue({
      data: {
        status: 'success',
        data: { wishlist: initialWishlist },
      },
    });

    // Mock successful atomic move-to-cart operation
    API.post.mockResolvedValueOnce({
      data: {
        status: 'success',
        message: 'Product moved from wishlist to cart atomically',
        data: { 
          wishlist: [],
          cart: { items: [{ product: testProduct, quantity: 1 }] },
          transactionId: 'mock-transaction-id'
        },
      },
    });

    // Set initial wishlist in localStorage
    localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(initialWishlist));

    // Render the hook
    const { result } = renderHook(() => useWishlist(), {
      wrapper: WishlistProvider,
    });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.wishlist.length).toBe(1);
    });

    // Verify product is initially in wishlist
    expect(result.current.isInWishlist(testProduct._id)).toBe(true);

    // Move product to cart
    let moveResult;
    await act(async () => {
      moveResult = await result.current.moveToCart(testProduct._id);
    });

    // Verify the operation was successful
    expect(moveResult.success).toBe(true);
    expect(moveResult.productId).toBe(testProduct._id);
    expect(moveResult.transactionId).toBeDefined();
    expect(moveResult.atomic).toBe(true);
    expect(moveResult.backendTransactionId).toBe('mock-transaction-id');

    // Verify product is no longer in wishlist
    expect(result.current.wishlist.length).toBe(0);
    expect(result.current.isInWishlist(testProduct._id)).toBe(false);

    // Verify atomic API call was made
    expect(API.post).toHaveBeenCalledWith(`/api/wishlist/${testProduct._id}/move-to-cart`, {
      quantity: 1,
      price: testProduct.price,
    });
  });

  test('moveToCart rolls back when atomic operation fails', async () => {
    const testProduct = {
      _id: '507f1f77bcf86cd799439012',
      name: 'Test Tulip',
      price: 15.99,
      description: 'Beautiful yellow tulip',
    };

    const initialWishlist = [testProduct];

    // Mock API responses
    API.get.mockResolvedValue({
      data: {
        status: 'success',
        data: { wishlist: initialWishlist },
      },
    });

    // Mock failed atomic operation
    API.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Atomic operation failed',
          transactionAborted: true,
        },
      },
    });

    // Set initial wishlist in localStorage
    localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(initialWishlist));

    // Render the hook
    const { result } = renderHook(() => useWishlist(), {
      wrapper: WishlistProvider,
    });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.wishlist.length).toBe(1);
    });

    // Verify product is initially in wishlist
    expect(result.current.isInWishlist(testProduct._id)).toBe(true);

    // Attempt to move product to cart (should fail)
    let error;
    await act(async () => {
      try {
        await result.current.moveToCart(testProduct._id);
      } catch (err) {
        error = err;
      }
    });

    // Verify the operation failed
    expect(error).toBeDefined();
    expect(error.message).toContain('Atomic operation failed');

    // Verify product is still in wishlist (rollback successful)
    expect(result.current.wishlist.length).toBe(1);
    expect(result.current.isInWishlist(testProduct._id)).toBe(true);

    // Verify atomic API call was attempted
    expect(API.post).toHaveBeenCalledWith(`/api/wishlist/${testProduct._id}/move-to-cart`, {
      quantity: 1,
      price: testProduct.price,
    });
  });

  test('moveToCart handles database transaction failure gracefully', async () => {
    const testProduct = {
      _id: '507f1f77bcf86cd799439013',
      name: 'Test Lily',
      price: 30.99,
      description: 'Beautiful white lily',
    };

    const initialWishlist = [testProduct];

    // Mock API responses
    API.get.mockResolvedValue({
      data: {
        status: 'success',
        data: { wishlist: initialWishlist },
      },
    });

    // Mock database transaction failure
    API.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Database transaction failed',
          transactionAborted: true,
        },
      },
    });

    // Set initial wishlist in localStorage
    localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(initialWishlist));

    // Render the hook
    const { result } = renderHook(() => useWishlist(), {
      wrapper: WishlistProvider,
    });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.wishlist.length).toBe(1);
    });

    // Verify product is initially in wishlist
    expect(result.current.isInWishlist(testProduct._id)).toBe(true);

    // Attempt to move product to cart (should fail)
    let error;
    await act(async () => {
      try {
        await result.current.moveToCart(testProduct._id);
      } catch (err) {
        error = err;
      }
    });

    // Verify the operation failed
    expect(error).toBeDefined();
    expect(error.message).toContain('Database transaction failed');

    // Verify product is still in wishlist (no changes made due to transaction failure)
    expect(result.current.wishlist.length).toBe(1);
    expect(result.current.isInWishlist(testProduct._id)).toBe(true);

    // Verify atomic API call was attempted
    expect(API.post).toHaveBeenCalledWith(`/api/wishlist/${testProduct._id}/move-to-cart`, {
      quantity: 1,
      price: testProduct.price,
    });
  });

  test('moveMultipleToCart processes items with enhanced atomicity', async () => {
    const testProducts = [
      {
        _id: '507f1f77bcf86cd799439014',
        name: 'Test Rose 1',
        price: 25.99,
        description: 'Beautiful red rose',
      },
      {
        _id: '507f1f77bcf86cd799439015',
        name: 'Test Rose 2',
        price: 27.99,
        description: 'Beautiful pink rose',
      },
    ];

    const initialWishlist = [...testProducts];

    // Mock API responses
    API.get.mockResolvedValue({
      data: {
        status: 'success',
        data: { wishlist: initialWishlist },
      },
    });

    // Mock successful atomic operations for both products
    API.post
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'Product moved from wishlist to cart atomically',
          data: { 
            wishlist: [testProducts[1]],
            cart: { items: [{ product: testProducts[0], quantity: 1 }] },
            transactionId: 'mock-transaction-id-1'
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          status: 'success',
          message: 'Product moved from wishlist to cart atomically',
          data: { 
            wishlist: [],
            cart: { items: [{ product: testProducts[1], quantity: 1 }] },
            transactionId: 'mock-transaction-id-2'
          },
        },
      });

    // Set initial wishlist in localStorage
    localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(initialWishlist));

    // Render the hook
    const { result } = renderHook(() => useWishlist(), {
      wrapper: WishlistProvider,
    });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.wishlist.length).toBe(2);
    });

    // Move multiple products to cart
    let bulkResult;
    await act(async () => {
      bulkResult = await result.current.moveMultipleToCart([
        testProducts[0]._id,
        testProducts[1]._id,
      ]);
    });

    // Verify the bulk operation was successful
    expect(bulkResult.successful.length).toBe(2);
    expect(bulkResult.failed.length).toBe(0);
    expect(bulkResult.totalProcessed).toBe(2);
    expect(bulkResult.successRate).toBe(100);
    expect(bulkResult.bulkTransactionId).toBeDefined();

    // Wait for wishlist to be updated
    await waitFor(() => {
      expect(result.current.wishlist.length).toBe(0);
    }, { timeout: 2000 });
    
    expect(result.current.isInWishlist(testProducts[0]._id)).toBe(false);
    expect(result.current.isInWishlist(testProducts[1]._id)).toBe(false);

    // Verify atomic API calls were made for both products
    expect(API.post).toHaveBeenCalledWith(`/api/wishlist/${testProducts[0]._id}/move-to-cart`, {
      quantity: 1,
      price: testProducts[0].price,
    });
    expect(API.post).toHaveBeenCalledWith(`/api/wishlist/${testProducts[1]._id}/move-to-cart`, {
      quantity: 1,
      price: testProducts[1].price,
    });
  });
});