import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import ProductCard from '../ProductCard';
import { WishlistProvider } from '../../contexts/WishlistContext';
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
    description: fc.string({ minLength: 1, maxLength: 500 }),
    inStock: fc.boolean(),
    occasion: fc.constantFrom('Birthday', 'Anniversary', 'Wedding', 'Sympathy'),
    flowerType: fc.constantFrom('Rose', 'Lily', 'Tulip', 'Orchid'),
    color: fc.constantFrom('Red', 'Pink', 'White', 'Yellow'),
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

// Helper to render ProductCard with WishlistProvider
const renderProductCard = (product, wishlist = []) => {
  // Set wishlist in localStorage
  if (wishlist.length > 0) {
    localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(wishlist));
  } else {
    localStorageMock.removeItem('amourFloralsWishlist');
  }

  // Mock API responses
  API.get.mockResolvedValue({
    data: {
      status: 'success',
      data: { wishlist },
    },
  });

  const mockOnAddToCart = vi.fn();

  return render(
    <BrowserRouter>
      <WishlistProvider>
        <ProductCard product={product} onAddToCart={mockOnAddToCart} />
      </WishlistProvider>
    </BrowserRouter>
  );
};

/**
 * **Feature: product-wishlist, Property 3: Heart icon visual state reflects wishlist membership**
 * **Validates: Requirements 1.4, 1.5**
 *
 * For any product, the heart icon visual state (filled/outlined) should match 
 * whether the product is in the wishlist - filled when in wishlist, outlined when not.
 */
describe('Property 3: Heart icon visual state reflects wishlist membership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('amourFloralsToken', 'mock-token');
    idCounter = 0;
  });

  test('heart icon is filled when product is in wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(productGenerator(), wishlistGenerator(), async (product, otherProducts) => {
        // Clear localStorage for this iteration
        localStorageMock.clear();
        localStorageMock.setItem('amourFloralsToken', 'mock-token');

        // Create wishlist that includes the product
        const wishlist = [...otherProducts, product];

        // Render the component
        renderProductCard(product, wishlist);

        // Wait for the component to render and process wishlist
        await waitFor(() => {
          const heartButton = screen.getByLabelText(/remove from wishlist/i);
          expect(heartButton).toBeInTheDocument();
        }, { timeout: 2000 });

        // Find the heart icon SVG
        const heartButton = screen.getByLabelText(/remove from wishlist/i);
        const heartIcon = heartButton.querySelector('svg');

        // Verify the heart icon is filled (has fill="currentColor")
        expect(heartIcon).toHaveAttribute('fill', 'currentColor');

        // Verify the button has the correct styling for "in wishlist" state
        expect(heartButton).toHaveClass('text-red-500');
      }),
      { numRuns: 100 }
    );
  }, 60000);

  test('heart icon is outlined when product is not in wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(productGenerator(), wishlistGenerator(), async (product, wishlist) => {
        // Clear localStorage for this iteration
        localStorageMock.clear();
        localStorageMock.setItem('amourFloralsToken', 'mock-token');

        // Ensure the product is NOT in the wishlist
        const filteredWishlist = wishlist.filter(
          (p) => p._id !== product._id && p.id !== product.id
        );

        // Render the component
        renderProductCard(product, filteredWishlist);

        // Wait for the component to render
        await waitFor(() => {
          const heartButton = screen.getByLabelText(/add to wishlist/i);
          expect(heartButton).toBeInTheDocument();
        }, { timeout: 2000 });

        // Find the heart icon SVG
        const heartButton = screen.getByLabelText(/add to wishlist/i);
        const heartIcon = heartButton.querySelector('svg');

        // Verify the heart icon is outlined (has fill="none")
        expect(heartIcon).toHaveAttribute('fill', 'none');

        // Verify the button has the correct styling for "not in wishlist" state
        expect(heartButton).toHaveClass('text-gray-400');
      }),
      { numRuns: 100 }
    );
  }, 60000);

  test('heart icon state changes when product is added to wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(productGenerator(), async (product) => {
        // Clear localStorage for this iteration
        localStorageMock.clear();
        localStorageMock.setItem('amourFloralsToken', 'mock-token');

        // Start with empty wishlist
        const initialWishlist = [];

        // Mock API responses
        API.get.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: initialWishlist },
          },
        });

        API.post.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: [product] },
          },
        });

        // Render the component
        const { rerender } = renderProductCard(product, initialWishlist);

        // Initially, heart should be outlined
        await waitFor(() => {
          const heartButton = screen.getByLabelText(/add to wishlist/i);
          expect(heartButton).toBeInTheDocument();
        }, { timeout: 2000 });

        let heartButton = screen.getByLabelText(/add to wishlist/i);
        let heartIcon = heartButton.querySelector('svg');
        expect(heartIcon).toHaveAttribute('fill', 'none');

        // Simulate adding to wishlist by updating localStorage
        localStorageMock.setItem('amourFloralsWishlist', JSON.stringify([product]));

        // Re-render with updated wishlist
        rerender(
          <BrowserRouter>
            <WishlistProvider>
              <ProductCard product={product} onAddToCart={vi.fn()} />
            </WishlistProvider>
          </BrowserRouter>
        );

        // After adding, heart should be filled
        await waitFor(() => {
          const updatedHeartButton = screen.getByLabelText(/remove from wishlist/i);
          expect(updatedHeartButton).toBeInTheDocument();
        }, { timeout: 2000 });

        heartButton = screen.getByLabelText(/remove from wishlist/i);
        heartIcon = heartButton.querySelector('svg');
        expect(heartIcon).toHaveAttribute('fill', 'currentColor');
      }),
      { numRuns: 100 }
    );
  }, 60000);

  test('heart icon state changes when product is removed from wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(productGenerator(), async (product) => {
        // Clear localStorage for this iteration
        localStorageMock.clear();
        localStorageMock.setItem('amourFloralsToken', 'mock-token');

        // Start with product in wishlist
        const initialWishlist = [product];

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

        // Render the component
        const { rerender } = renderProductCard(product, initialWishlist);

        // Initially, heart should be filled
        await waitFor(() => {
          const heartButton = screen.getByLabelText(/remove from wishlist/i);
          expect(heartButton).toBeInTheDocument();
        }, { timeout: 2000 });

        let heartButton = screen.getByLabelText(/remove from wishlist/i);
        let heartIcon = heartButton.querySelector('svg');
        expect(heartIcon).toHaveAttribute('fill', 'currentColor');

        // Simulate removing from wishlist by updating localStorage
        localStorageMock.removeItem('amourFloralsWishlist');

        // Re-render with updated wishlist
        rerender(
          <BrowserRouter>
            <WishlistProvider>
              <ProductCard product={product} onAddToCart={vi.fn()} />
            </WishlistProvider>
          </BrowserRouter>
        );

        // After removing, heart should be outlined
        await waitFor(() => {
          const updatedHeartButton = screen.getByLabelText(/add to wishlist/i);
          expect(updatedHeartButton).toBeInTheDocument();
        }, { timeout: 2000 });

        heartButton = screen.getByLabelText(/add to wishlist/i);
        heartIcon = heartButton.querySelector('svg');
        expect(heartIcon).toHaveAttribute('fill', 'none');
      }),
      { numRuns: 100 }
    );
  }, 60000);
});

/**
 * **Feature: product-wishlist, Property 4: Product card wishlist state matches actual wishlist contents**
 * **Validates: Requirements 2.1**
 *
 * For any set of products and any wishlist state, each product card should display 
 * the correct wishlist indicator based on whether that product exists in the user's 
 * saved wishlist.
 */
describe('Property 4: Product card wishlist state matches actual wishlist contents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('amourFloralsToken', 'mock-token');
    idCounter = 0;
  });

  test('product cards correctly reflect their wishlist membership status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productGenerator(), { minLength: 2, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        async (products, splitIndex) => {
          // Clear localStorage for this iteration
          localStorageMock.clear();
          localStorageMock.setItem('amourFloralsToken', 'mock-token');

          // Split products into two groups: in wishlist and not in wishlist
          const actualSplitIndex = splitIndex % products.length;
          const productsInWishlist = products.slice(0, actualSplitIndex);
          const productsNotInWishlist = products.slice(actualSplitIndex);

          // Set up wishlist
          localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(productsInWishlist));

          // Mock API responses
          API.get.mockResolvedValue({
            data: {
              status: 'success',
              data: { wishlist: productsInWishlist },
            },
          });

          // Render each product card and verify its state
          for (const product of productsInWishlist) {
            const { unmount } = renderProductCard(product, productsInWishlist);

            // Product should show as in wishlist
            await waitFor(() => {
              const heartButton = screen.getByLabelText(/remove from wishlist/i);
              expect(heartButton).toBeInTheDocument();
            }, { timeout: 2000 });

            const heartButton = screen.getByLabelText(/remove from wishlist/i);
            const heartIcon = heartButton.querySelector('svg');
            expect(heartIcon).toHaveAttribute('fill', 'currentColor');
            expect(heartButton).toHaveClass('text-red-500');

            unmount();
          }

          // Verify products not in wishlist show correct state
          for (const product of productsNotInWishlist) {
            const { unmount } = renderProductCard(product, productsInWishlist);

            // Product should show as not in wishlist
            await waitFor(() => {
              const heartButton = screen.getByLabelText(/add to wishlist/i);
              expect(heartButton).toBeInTheDocument();
            }, { timeout: 2000 });

            const heartButton = screen.getByLabelText(/add to wishlist/i);
            const heartIcon = heartButton.querySelector('svg');
            expect(heartIcon).toHaveAttribute('fill', 'none');
            expect(heartButton).toHaveClass('text-gray-400');

            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  test('product card state matches isInWishlist helper result', async () => {
    await fc.assert(
      fc.asyncProperty(productGenerator(), wishlistGenerator(), async (product, wishlist) => {
        // Clear localStorage for this iteration
        localStorageMock.clear();
        localStorageMock.setItem('amourFloralsToken', 'mock-token');

        // Determine if product should be in wishlist
        const shouldBeInWishlist = Math.random() > 0.5;
        
        let finalWishlist;
        if (shouldBeInWishlist) {
          // Ensure product is in wishlist
          const filtered = wishlist.filter(p => p._id !== product._id && p.id !== product.id);
          finalWishlist = [...filtered, product];
        } else {
          // Ensure product is not in wishlist
          finalWishlist = wishlist.filter(p => p._id !== product._id && p.id !== product.id);
        }

        // Render the component
        renderProductCard(product, finalWishlist);

        // Verify the UI matches the expected state
        if (shouldBeInWishlist) {
          await waitFor(() => {
            const heartButton = screen.getByLabelText(/remove from wishlist/i);
            expect(heartButton).toBeInTheDocument();
          }, { timeout: 2000 });

          const heartButton = screen.getByLabelText(/remove from wishlist/i);
          const heartIcon = heartButton.querySelector('svg');
          expect(heartIcon).toHaveAttribute('fill', 'currentColor');
        } else {
          await waitFor(() => {
            const heartButton = screen.getByLabelText(/add to wishlist/i);
            expect(heartButton).toBeInTheDocument();
          }, { timeout: 2000 });

          const heartButton = screen.getByLabelText(/add to wishlist/i);
          const heartIcon = heartButton.querySelector('svg');
          expect(heartIcon).toHaveAttribute('fill', 'none');
        }
      }),
      { numRuns: 100 }
    );
  }, 60000);

  test('multiple product cards with same wishlist show consistent states', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productGenerator(), { minLength: 3, maxLength: 8 }),
        async (products) => {
          // Clear localStorage for this iteration
          localStorageMock.clear();
          localStorageMock.setItem('amourFloralsToken', 'mock-token');

          // Randomly select some products to be in wishlist
          const wishlist = products.filter(() => Math.random() > 0.5);

          // Set up wishlist
          localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(wishlist));

          // Mock API responses
          API.get.mockResolvedValue({
            data: {
              status: 'success',
              data: { wishlist },
            },
          });

          // Create a map of expected states
          const expectedStates = new Map();
          for (const product of products) {
            const isInWishlist = wishlist.some(
              (p) => p._id === product._id || p.id === product.id
            );
            expectedStates.set(product._id, isInWishlist);
          }

          // Render each product card and verify it matches expected state
          for (const product of products) {
            const { unmount } = renderProductCard(product, wishlist);
            const expectedInWishlist = expectedStates.get(product._id);

            if (expectedInWishlist) {
              await waitFor(() => {
                const heartButton = screen.getByLabelText(/remove from wishlist/i);
                expect(heartButton).toBeInTheDocument();
              }, { timeout: 2000 });

              const heartButton = screen.getByLabelText(/remove from wishlist/i);
              const heartIcon = heartButton.querySelector('svg');
              expect(heartIcon).toHaveAttribute('fill', 'currentColor');
            } else {
              await waitFor(() => {
                const heartButton = screen.getByLabelText(/add to wishlist/i);
                expect(heartButton).toBeInTheDocument();
              }, { timeout: 2000 });

              const heartButton = screen.getByLabelText(/add to wishlist/i);
              const heartIcon = heartButton.querySelector('svg');
              expect(heartIcon).toHaveAttribute('fill', 'none');
            }

            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  test('empty wishlist shows all products as not in wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productGenerator(), { minLength: 1, maxLength: 10 }),
        async (products) => {
          // Clear localStorage for this iteration
          localStorageMock.clear();
          localStorageMock.setItem('amourFloralsToken', 'mock-token');

          // Empty wishlist
          const wishlist = [];

          // Mock API responses
          API.get.mockResolvedValue({
            data: {
              status: 'success',
              data: { wishlist },
            },
          });

          // Verify all products show as not in wishlist
          for (const product of products) {
            const { unmount } = renderProductCard(product, wishlist);

            await waitFor(() => {
              const heartButton = screen.getByLabelText(/add to wishlist/i);
              expect(heartButton).toBeInTheDocument();
            }, { timeout: 2000 });

            const heartButton = screen.getByLabelText(/add to wishlist/i);
            const heartIcon = heartButton.querySelector('svg');
            expect(heartIcon).toHaveAttribute('fill', 'none');
            expect(heartButton).toHaveClass('text-gray-400');

            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  test('full wishlist shows all products as in wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(productGenerator(), { minLength: 1, maxLength: 10 }),
        async (products) => {
          // Clear localStorage for this iteration
          localStorageMock.clear();
          localStorageMock.setItem('amourFloralsToken', 'mock-token');

          // All products in wishlist
          const wishlist = [...products];

          // Set up wishlist
          localStorageMock.setItem('amourFloralsWishlist', JSON.stringify(wishlist));

          // Mock API responses
          API.get.mockResolvedValue({
            data: {
              status: 'success',
              data: { wishlist },
            },
          });

          // Verify all products show as in wishlist
          for (const product of products) {
            const { unmount } = renderProductCard(product, wishlist);

            await waitFor(() => {
              const heartButton = screen.getByLabelText(/remove from wishlist/i);
              expect(heartButton).toBeInTheDocument();
            }, { timeout: 2000 });

            const heartButton = screen.getByLabelText(/remove from wishlist/i);
            const heartIcon = heartButton.querySelector('svg');
            expect(heartIcon).toHaveAttribute('fill', 'currentColor');
            expect(heartButton).toHaveClass('text-red-500');

            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);
});
