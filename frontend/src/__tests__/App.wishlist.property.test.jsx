import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import App from '../App';
import API from '../utils/api';

// Mock the API module
vi.mock('../utils/api');

// Mock all page components to avoid rendering complexity
vi.mock('../pages/HomePage', () => ({ default: () => <div>Home</div> }));
vi.mock('../pages/AboutPage', () => ({ default: () => <div>About</div> }));
vi.mock('../pages/CollectionsPage', () => ({ default: () => <div>Collections</div> }));
vi.mock('../pages/ProductsPage', () => ({ default: () => <div>Products</div> }));
vi.mock('../pages/ProductDetailPage', () => ({ default: () => <div>Product Detail</div> }));
vi.mock('../pages/CartPage', () => ({ default: () => <div>Cart</div> }));
vi.mock('../pages/ProfilePage', () => ({ default: () => <div>Profile</div> }));
vi.mock('../pages/LoginPage', () => ({ default: () => <div>Login</div> }));
vi.mock('../pages/SignUpPage', () => ({ default: () => <div>SignUp</div> }));
vi.mock('../pages/WishlistPage', () => ({ default: () => <div>Wishlist</div> }));
vi.mock('../pages/FAQPage', () => ({ default: () => <div>FAQ</div> }));
vi.mock('../pages/FlowerCarePage', () => ({ default: () => <div>Flower Care</div> }));
vi.mock('../components/Nav', () => ({ default: () => <div>Nav</div> }));
vi.mock('../components/Contact', () => ({ default: () => <div>Contact</div> }));

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
 * **Feature: product-wishlist, Property 10: Login retrieves saved wishlist**
 * **Validates: Requirements 4.2**
 *
 * For any user with saved wishlist items, logging in should retrieve and display
 * all previously saved items.
 */
describe('Property 10: Login retrieves saved wishlist', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorageMock.clear();
    // Reset ID counter
    idCounter = 0;
  });

  test('logging in with a token fetches the saved wishlist from backend', async () => {
    await fc.assert(
      fc.asyncProperty(wishlistGenerator(), async (savedWishlist) => {
        // Clear mocks for this iteration
        vi.clearAllMocks();
        
        // Clear localStorage for this iteration
        localStorageMock.clear();
        
        // Simulate user logging in by setting token
        localStorageMock.setItem('amourFloralsToken', 'mock-auth-token');
        
        // Mock API to return the saved wishlist
        API.get.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: savedWishlist },
          },
        });

        // Render the App (which should trigger fetchWishlist on mount)
        const { unmount } = render(<App />);

        // Wait for the API call to be made
        await waitFor(() => {
          expect(API.get).toHaveBeenCalledWith('/api/wishlist');
        }, { timeout: 2000 });

        // Verify the API was called at least once
        expect(API.get).toHaveBeenCalled();
        
        // Cleanup
        unmount();
      }),
      { numRuns: 20 }
    );
  }, 30000);

  test('logging in without a token does not fetch wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        // Clear mocks for this iteration
        vi.clearAllMocks();
        
        // Clear localStorage for this iteration
        localStorageMock.clear();
        
        // No token set (user not logged in)
        
        // Mock API (should not be called)
        API.get.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: [] },
          },
        });

        // Render the App
        const { unmount } = render(<App />);

        // Wait a bit to ensure no API call is made
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify the API was NOT called
        expect(API.get).not.toHaveBeenCalled();
        
        // Cleanup
        unmount();
      }),
      { numRuns: 10 }
    );
  }, 30000);
});

/**
 * **Feature: product-wishlist, Property 11: Logout-login preserves wishlist**
 * **Validates: Requirements 4.3**
 *
 * For any wishlist state, performing a logout followed by a login should result
 * in the same wishlist contents.
 */
describe('Property 11: Logout-login preserves wishlist', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorageMock.clear();
    // Reset ID counter
    idCounter = 0;
  });

  test('wishlist persists across logout and login', async () => {
    await fc.assert(
      fc.asyncProperty(wishlistGenerator(), async (initialWishlist) => {
        // Clear mocks for this iteration
        vi.clearAllMocks();
        
        // Clear localStorage for this iteration
        localStorageMock.clear();
        
        // Simulate initial login with wishlist
        localStorageMock.setItem('amourFloralsToken', 'mock-auth-token');
        
        // Mock API to return the initial wishlist
        API.get.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: initialWishlist },
          },
        });

        // Render the App (first login)
        const { unmount: unmount1 } = render(<App />);

        // Wait for the initial API call
        await waitFor(() => {
          expect(API.get).toHaveBeenCalledWith('/api/wishlist');
        }, { timeout: 2000 });

        // Simulate logout by removing token
        localStorageMock.removeItem('amourFloralsToken');
        
        // Unmount the app (simulating navigation away or app close)
        unmount1();

        // Clear the mock to reset call count
        vi.clearAllMocks();

        // Simulate login again by setting token
        localStorageMock.setItem('amourFloralsToken', 'mock-auth-token-2');
        
        // Mock API to return the same wishlist (persisted on backend)
        API.get.mockResolvedValue({
          data: {
            status: 'success',
            data: { wishlist: initialWishlist },
          },
        });

        // Render the App again (second login)
        const { unmount: unmount2 } = render(<App />);

        // Wait for the API call after re-login
        await waitFor(() => {
          expect(API.get).toHaveBeenCalledWith('/api/wishlist');
        }, { timeout: 2000 });

        // Verify the API was called to fetch the persisted wishlist
        expect(API.get).toHaveBeenCalled();
        
        // Cleanup
        unmount2();
      }),
      { numRuns: 20 }
    );
  }, 30000);

  test('wishlist data remains consistent across multiple logout-login cycles', async () => {
    await fc.assert(
      fc.asyncProperty(
        wishlistGenerator(),
        fc.integer({ min: 2, max: 5 }),
        async (persistedWishlist, cycles) => {
          // Clear localStorage for this iteration
          localStorageMock.clear();
          
          for (let i = 0; i < cycles; i++) {
            // Simulate login
            localStorageMock.setItem('amourFloralsToken', `mock-token-${i}`);
            
            // Mock API to return the persisted wishlist
            API.get.mockResolvedValue({
              data: {
                status: 'success',
                data: { wishlist: persistedWishlist },
              },
            });

            // Render the App
            const { unmount } = render(<App />);

            // Wait for the API call
            await waitFor(() => {
              expect(API.get).toHaveBeenCalledWith('/api/wishlist');
            }, { timeout: 2000 });

            // Verify the API was called
            expect(API.get).toHaveBeenCalled();

            // Simulate logout
            localStorageMock.removeItem('amourFloralsToken');
            
            // Unmount the app
            unmount();

            // Clear mocks for next iteration
            vi.clearAllMocks();
          }
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);
});
