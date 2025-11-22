import { describe, test, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
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

// Counter for generating unique IDs
let idCounter = 0;

// Generator for valid product data with unique IDs
const productGenerator = () =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
    price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
    image: fc.webUrl(),
    description: fc.string({ minLength: 1, maxLength: 500 }),
  }).map((product) => {
    const uniqueId = (idCounter++).toString(16).padStart(24, '0');
    return {
      ...product,
      _id: uniqueId,
      id: uniqueId,
    };
  });

// Generator for wishlist (array of products)
const wishlistGenerator = () => fc.array(productGenerator(), { minLength: 0, maxLength: 10 });

/**
 * **Feature: product-wishlist, Property 5: Wishlist state changes propagate immediately to UI**
 * **Validates: Requirements 2.2**
 *
 * For any wishlist operation (add or remove), the UI should update to reflect
 * the new state without requiring a page refresh.
 */
describe('Property 5: Wishlist state changes propagate immediately to UI', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorageMock.clear();
    // Mock token in localStorage
    localStorageMock.setItem('amourFloralsToken', 'mock-token');
    // Reset ID counter
    idCounter = 0;
  });

  test('adding a product immediately updates wishlist state', async () => {
    await fc.assert(
      fc.asyncProperty(wishlistGenerator(), productGenerator(), async (initialWishlist, newProduct) => {
        // Clear localStorage for this iteration
        localStorageMock.clear();
        localStorageMock.setItem('amourFloralsToken', 'mock-token');
        
        // Ensure the new product is not already in the wishlist
        const filteredWishlist = initialWishlist.filter(
          (p) => p._id !== newProduct._id && p.id !== newProduct.id
        );

        // Set initial wishlist in localStorage
        if (filteredWishlist.length > 0) {
          localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(filteredWishlist));
        }

        // Mock API responses
        API.get.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: filteredWishlist },
          },
        });

        API.post.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: [...filteredWishlist, newProduct] },
          },
        });

        // Render the hook
        const { result } = renderHook(() => useWishlist(), {
          wrapper: WishlistProvider,
        });

        // Wait for initial load from localStorage
        if (filteredWishlist.length > 0) {
          await waitFor(() => {
            expect(result.current.wishlist.length).toBe(filteredWishlist.length);
          }, { timeout: 1000 });
        }

        // Capture initial state
        const initialSize = result.current.wishlist.length;

        // Add product to wishlist
        await act(async () => {
          await result.current.addToWishlist(newProduct);
        });

        // After the operation completes, verify the product is in the wishlist
        expect(result.current.wishlist.length).toBe(initialSize + 1);
        expect(result.current.isInWishlist(newProduct._id)).toBe(true);
        
        const hasNewProduct = result.current.wishlist.some(
          (p) => p._id === newProduct._id || p.id === newProduct.id
        );
        expect(hasNewProduct).toBe(true);
      }),
      { numRuns: 100 }
    );
  }, 30000);

  test('removing a product immediately updates wishlist state', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productGenerator(), { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        async (initialWishlist, removeIndex) => {
          // Adjust removeIndex to be within bounds
          const actualRemoveIndex = removeIndex % initialWishlist.length;
          const productToRemove = initialWishlist[actualRemoveIndex];

          // Set initial wishlist in localStorage
          localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(initialWishlist));

          // Mock API responses
          API.get.mockResolvedValue({
            data: {
              status: 'success',
              data: { wishlist: initialWishlist },
            },
          });

          const updatedWishlist = initialWishlist.filter(
            (p) => p._id !== productToRemove._id && p.id !== productToRemove.id
          );

          API.delete.mockResolvedValue({
            data: {
              status: 'success',
              data: { wishlist: updatedWishlist },
            },
          });

          // Render the hook
          const { result } = renderHook(() => useWishlist(), {
            wrapper: WishlistProvider,
          });

          // Wait for initial load from localStorage
          await waitFor(() => {
            expect(result.current.wishlist.length).toBe(initialWishlist.length);
          }, { timeout: 1000 });

          // Capture initial state
          const initialSize = result.current.wishlist.length;

          // Remove product from wishlist
          await act(async () => {
            await result.current.removeFromWishlist(productToRemove._id);
          });

          // Wait for state to update
          await waitFor(() => {
            expect(result.current.wishlist.length).toBe(initialSize - 1);
          }, { timeout: 1000 });

          // Verify the product is no longer in the wishlist
          const stillHasProduct = result.current.wishlist.some(
            (p) => p._id === productToRemove._id || p.id === productToRemove.id
          );
          expect(stillHasProduct).toBe(false);

          // Verify isInWishlist reflects the change immediately
          expect(result.current.isInWishlist(productToRemove._id)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  test('multiple sequential operations propagate state changes immediately', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productGenerator(), { minLength: 2, maxLength: 5 }),
        async (products) => {
          // Start with empty wishlist
          API.get.mockResolvedValue({
            data: {
              status: 'success',
              data: { wishlist: [] },
            },
          });

          // Render the hook
          const { result } = renderHook(() => useWishlist(), {
            wrapper: WishlistProvider,
          });

          let currentWishlist = [];

          // Add products one by one and verify state updates immediately
          for (let i = 0; i < products.length; i++) {
            const product = products[i];
            currentWishlist = [...currentWishlist, product];

            API.post.mockResolvedValue({
              data: {
                status: 'success',
                data: { wishlist: currentWishlist },
              },
            });

            const sizeBefore = result.current.wishlist.length;

            await act(async () => {
              await result.current.addToWishlist(product);
            });

            // Wait for state to update
            await waitFor(() => {
              expect(result.current.wishlist.length).toBe(sizeBefore + 1);
            }, { timeout: 1000 });
            
            expect(result.current.isInWishlist(product._id)).toBe(true);
          }

          // Now remove products one by one and verify state updates immediately
          for (let i = 0; i < products.length; i++) {
            const product = products[i];
            currentWishlist = currentWishlist.filter(
              (p) => p._id !== product._id && p.id !== product.id
            );

            API.delete.mockResolvedValue({
              data: {
                status: 'success',
                data: { wishlist: currentWishlist },
              },
            });

            const sizeBefore = result.current.wishlist.length;

            await act(async () => {
              await result.current.removeFromWishlist(product._id);
            });

            // Wait for state to update
            await waitFor(() => {
              expect(result.current.wishlist.length).toBe(sizeBefore - 1);
            }, { timeout: 1000 });
            
            expect(result.current.isInWishlist(product._id)).toBe(false);
          }

          // Verify wishlist is empty at the end
          expect(result.current.wishlist.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('clearing wishlist immediately updates state to empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productGenerator(), { minLength: 1, maxLength: 10 }),
        async (initialWishlist) => {
          // Set initial wishlist in localStorage
          localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(initialWishlist));

          // Mock API responses
          API.get.mockResolvedValue({
            data: {
              status: 'success',
              data: { wishlist: initialWishlist },
            },
          });

          API.delete.mockResolvedValue({
            data: {
              status: 'success',
              data: { wishlist: [] },
            },
          });

          // Render the hook
          const { result } = renderHook(() => useWishlist(), {
            wrapper: WishlistProvider,
          });

          // Wait for initial load from localStorage
          await waitFor(() => {
            expect(result.current.wishlist.length).toBe(initialWishlist.length);
          });

          // Verify initial wishlist is not empty
          expect(result.current.wishlist.length).toBeGreaterThan(0);

          // Clear wishlist
          await act(async () => {
            await result.current.clearWishlist();
          });

          // Verify state updated immediately to empty
          expect(result.current.wishlist.length).toBe(0);

          // Verify all products are no longer in wishlist
          for (const product of initialWishlist) {
            expect(result.current.isInWishlist(product._id)).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  test('failed operations rollback state immediately', async () => {
    await fc.assert(
      fc.asyncProperty(wishlistGenerator(), productGenerator(), async (initialWishlist, newProduct) => {
        // Clear localStorage for this iteration
        localStorageMock.clear();
        localStorageMock.setItem('amourFloralsToken', 'mock-token');
        
        // Ensure the new product is not already in the wishlist
        const filteredWishlist = initialWishlist.filter(
          (p) => p._id !== newProduct._id && p.id !== newProduct.id
        );

        // Set initial wishlist in localStorage
        if (filteredWishlist.length > 0) {
          localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(filteredWishlist));
        }

        // Mock API responses
        API.get.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: filteredWishlist },
          },
        });

        // Mock API to fail
        API.post.mockRejectedValue({
          response: {
            data: {
              message: 'Failed to add to wishlist',
            },
          },
        });

        // Render the hook
        const { result } = renderHook(() => useWishlist(), {
          wrapper: WishlistProvider,
        });

        // Wait for initial load from localStorage
        if (filteredWishlist.length > 0) {
          await waitFor(() => {
            expect(result.current.wishlist.length).toBe(filteredWishlist.length);
          }, { timeout: 1000 });
        }

        // Capture initial state
        const initialState = [...result.current.wishlist];
        const initialSize = initialState.length;

        // Attempt to add product (this will fail)
        try {
          await act(async () => {
            await result.current.addToWishlist(newProduct);
          });
        } catch (error) {
          // Expected to fail
        }

        // After the failed operation, verify state rolled back
        // The rollback should happen synchronously after the catch
        expect(result.current.wishlist.length).toBe(initialSize);
        
        // Verify the wishlist matches the initial state
        const currentIds = result.current.wishlist.map((p) => p._id || p.id).sort();
        const initialIds = initialState.map((p) => p._id || p.id).sort();
        expect(currentIds).toEqual(initialIds);

        // Verify the new product is not in the wishlist
        expect(result.current.isInWishlist(newProduct._id)).toBe(false);
      }),
      { numRuns: 100 }
    );
  }, 30000);

  test('state changes are reflected in isInWishlist helper immediately', async () => {
    await fc.assert(
      fc.asyncProperty(productGenerator(), async (product) => {
        // Start with empty wishlist
        API.get.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: [] },
          },
        });

        API.post.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: [product] },
          },
        });

        API.delete.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: [] },
          },
        });

        // Render the hook
        const { result } = renderHook(() => useWishlist(), {
          wrapper: WishlistProvider,
        });

        // Initially, product should not be in wishlist
        expect(result.current.isInWishlist(product._id)).toBe(false);

        // Add product
        await act(async () => {
          await result.current.addToWishlist(product);
        });

        // Wait for state to update
        await waitFor(() => {
          expect(result.current.isInWishlist(product._id)).toBe(true);
        }, { timeout: 1000 });

        // Remove product
        await act(async () => {
          await result.current.removeFromWishlist(product._id);
        });

        // Wait for state to update
        await waitFor(() => {
          expect(result.current.isInWishlist(product._id)).toBe(false);
        }, { timeout: 1000 });
      }),
      { numRuns: 100 }
    );
  }, 30000);
});
