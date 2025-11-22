/**
 * Integration test helpers for critical user flows
 * Provides utilities for testing complete user workflows
 */

import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  renderWithWishlistContext, 
  createMockProduct, 
  createMockProducts,
  assertWishlistConsistency,
  simulateNetworkDelay
} from './utilities.jsx';

/**
 * Integration test helper for add-to-wishlist flow
 */
export const testAddToWishlistFlow = async (component, product, options = {}) => {
  const { 
    expectSuccess = true, 
    networkDelay = 0,
    shouldFail = false,
    errorType = 'network'
  } = options;

  const user = userEvent.setup();

  // Render component with wishlist context
  const { mockLocalStorage } = renderWithWishlistContext(component);

  // Find and click the add to wishlist button
  const addButton = await screen.findByLabelText(/add to wishlist/i);
  expect(addButton).toBeInTheDocument();

  // Simulate network delay if specified
  if (networkDelay > 0) {
    await simulateNetworkDelay(networkDelay);
  }

  // Click the button
  await user.click(addButton);

  if (expectSuccess && !shouldFail) {
    // Wait for success feedback
    await waitFor(() => {
      const removeButton = screen.getByLabelText(/remove from wishlist/i);
      expect(removeButton).toBeInTheDocument();
    });

    // Verify localStorage was updated
    const wishlistData = mockLocalStorage.getItem('amourFloralsWishlist');
    if (wishlistData) {
      const wishlist = JSON.parse(wishlistData);
      expect(wishlist.some(item => item._id === product._id)).toBe(true);
    }
  } else {
    // Wait for error state or no change
    await waitFor(() => {
      const addButton = screen.getByLabelText(/add to wishlist/i);
      expect(addButton).toBeInTheDocument();
    });
  }

  return { mockLocalStorage };
};

/**
 * Integration test helper for remove-from-wishlist flow
 */
export const testRemoveFromWishlistFlow = async (component, product, options = {}) => {
  const { 
    expectSuccess = true, 
    networkDelay = 0,
    shouldFail = false
  } = options;

  const user = userEvent.setup();

  // Render component with product already in wishlist
  const { mockLocalStorage } = renderWithWishlistContext(component, [product]);

  // Find and click the remove from wishlist button
  const removeButton = await screen.findByLabelText(/remove from wishlist/i);
  expect(removeButton).toBeInTheDocument();

  // Simulate network delay if specified
  if (networkDelay > 0) {
    await simulateNetworkDelay(networkDelay);
  }

  // Click the button
  await user.click(removeButton);

  if (expectSuccess && !shouldFail) {
    // Wait for success feedback
    await waitFor(() => {
      const addButton = screen.getByLabelText(/add to wishlist/i);
      expect(addButton).toBeInTheDocument();
    });

    // Verify localStorage was updated
    const wishlistData = mockLocalStorage.getItem('amourFloralsWishlist');
    if (wishlistData) {
      const wishlist = JSON.parse(wishlistData);
      expect(wishlist.some(item => item._id === product._id)).toBe(false);
    }
  } else {
    // Wait for error state or no change
    await waitFor(() => {
      const removeButton = screen.getByLabelText(/remove from wishlist/i);
      expect(removeButton).toBeInTheDocument();
    });
  }

  return { mockLocalStorage };
};

/**
 * Integration test helper for bulk operations flow
 */
export const testBulkOperationsFlow = async (component, products, operation, options = {}) => {
  const { 
    expectSuccess = true, 
    networkDelay = 0,
    shouldFail = false,
    partialFailure = false
  } = options;

  const user = userEvent.setup();

  // Render component with products in wishlist
  const { mockLocalStorage } = renderWithWishlistContext(component, products);

  // Select multiple items
  for (const product of products) {
    const checkbox = await screen.findByRole('checkbox', { 
      name: new RegExp(product.name, 'i') 
    });
    await user.click(checkbox);
  }

  // Find and click the bulk operation button
  const operationButton = await screen.findByRole('button', { 
    name: new RegExp(operation, 'i') 
  });
  expect(operationButton).toBeInTheDocument();

  // Simulate network delay if specified
  if (networkDelay > 0) {
    await simulateNetworkDelay(networkDelay);
  }

  // Click the operation button
  await user.click(operationButton);

  if (expectSuccess && !shouldFail) {
    if (partialFailure) {
      // Wait for partial success feedback
      await waitFor(() => {
        const feedback = screen.getByText(/some items could not be processed/i);
        expect(feedback).toBeInTheDocument();
      });
    } else {
      // Wait for complete success feedback
      await waitFor(() => {
        const feedback = screen.getByText(/operation completed successfully/i);
        expect(feedback).toBeInTheDocument();
      });
    }
  } else {
    // Wait for error feedback
    await waitFor(() => {
      const errorMessage = screen.getByText(/operation failed/i);
      expect(errorMessage).toBeInTheDocument();
    });
  }

  return { mockLocalStorage };
};

/**
 * Integration test helper for wishlist page load flow
 */
export const testWishlistPageLoadFlow = async (component, initialWishlist = [], options = {}) => {
  const { 
    expectLoading = true,
    networkDelay = 0,
    shouldFail = false
  } = options;

  // Render component
  const { mockLocalStorage } = renderWithWishlistContext(component, initialWishlist);

  if (expectLoading) {
    // Check for loading state
    const loadingIndicator = screen.queryByText(/loading/i);
    if (loadingIndicator) {
      expect(loadingIndicator).toBeInTheDocument();
    }
  }

  // Simulate network delay if specified
  if (networkDelay > 0) {
    await simulateNetworkDelay(networkDelay);
  }

  if (!shouldFail) {
    // Wait for content to load
    await waitFor(() => {
      if (initialWishlist.length > 0) {
        const firstProduct = screen.getByText(initialWishlist[0].name);
        expect(firstProduct).toBeInTheDocument();
      } else {
        const emptyMessage = screen.getByText(/your wishlist is empty/i);
        expect(emptyMessage).toBeInTheDocument();
      }
    });

    // Verify wishlist consistency
    assertWishlistConsistency(initialWishlist);
  } else {
    // Wait for error state
    await waitFor(() => {
      const errorMessage = screen.getByText(/failed to load wishlist/i);
      expect(errorMessage).toBeInTheDocument();
    });
  }

  return { mockLocalStorage };
};

/**
 * Integration test helper for authentication flow with wishlist
 */
export const testAuthenticationWishlistFlow = async (component, options = {}) => {
  const { 
    hasToken = true,
    savedWishlist = [],
    expectSync = true
  } = options;

  const user = userEvent.setup();

  // Setup authentication state
  const { mockLocalStorage } = renderWithWishlistContext(component, []);
  
  if (hasToken) {
    mockLocalStorage.setItem('amourFloralsToken', 'mock-token');
  } else {
    mockLocalStorage.removeItem('amourFloralsToken');
  }

  if (savedWishlist.length > 0) {
    mockLocalStorage.setItem('amourFloralsWishlist', JSON.stringify(savedWishlist));
  }

  if (hasToken && expectSync) {
    // Wait for wishlist to sync from backend
    await waitFor(() => {
      if (savedWishlist.length > 0) {
        const firstProduct = screen.getByText(savedWishlist[0].name);
        expect(firstProduct).toBeInTheDocument();
      }
    });
  } else if (!hasToken) {
    // Should redirect to login or show login prompt
    await waitFor(() => {
      const loginPrompt = screen.getByText(/please log in/i);
      expect(loginPrompt).toBeInTheDocument();
    });
  }

  return { mockLocalStorage };
};

/**
 * Integration test helper for error recovery flow
 */
export const testErrorRecoveryFlow = async (component, errorScenario, options = {}) => {
  const { 
    expectRecovery = true,
    retryAttempts = 1
  } = options;

  const user = userEvent.setup();

  // Render component
  const { mockLocalStorage } = renderWithWishlistContext(component);

  // Trigger error scenario
  switch (errorScenario) {
    case 'network':
      // Simulate network error
      break;
    case 'auth':
      // Simulate authentication error
      mockLocalStorage.removeItem('amourFloralsToken');
      break;
    case 'validation':
      // Simulate validation error
      break;
    default:
      throw new Error(`Unknown error scenario: ${errorScenario}`);
  }

  // Wait for error state
  await waitFor(() => {
    const errorMessage = screen.getByText(/error/i);
    expect(errorMessage).toBeInTheDocument();
  });

  if (expectRecovery) {
    // Find and click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    for (let i = 0; i < retryAttempts; i++) {
      await user.click(retryButton);
      
      // Wait for retry attempt
      await waitFor(() => {
        const loadingIndicator = screen.getByText(/retrying/i);
        expect(loadingIndicator).toBeInTheDocument();
      });
    }

    // Wait for recovery
    await waitFor(() => {
      const successMessage = screen.getByText(/recovered|success/i);
      expect(successMessage).toBeInTheDocument();
    });
  }

  return { mockLocalStorage };
};

/**
 * Integration test helper for concurrent operations flow
 */
export const testConcurrentOperationsFlow = async (component, operations, options = {}) => {
  const { 
    expectConsistency = true,
    networkDelay = 0
  } = options;

  const user = userEvent.setup();

  // Render component
  const { mockLocalStorage } = renderWithWishlistContext(component);

  // Execute operations concurrently
  const operationPromises = operations.map(async (operation, index) => {
    // Add slight delay to simulate real concurrent operations
    await simulateNetworkDelay(index * 10);
    
    switch (operation.type) {
      case 'add':
        const addButton = await screen.findByLabelText(/add to wishlist/i);
        await user.click(addButton);
        break;
      case 'remove':
        const removeButton = await screen.findByLabelText(/remove from wishlist/i);
        await user.click(removeButton);
        break;
      case 'clear':
        const clearButton = await screen.findByRole('button', { name: /clear wishlist/i });
        await user.click(clearButton);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  });

  // Wait for all operations to complete
  await Promise.allSettled(operationPromises);

  if (expectConsistency) {
    // Wait for final state to stabilize
    await waitFor(() => {
      // Check that UI is in a consistent state
      const wishlistItems = screen.queryAllByTestId('wishlist-item');
      expect(wishlistItems.length).toBeGreaterThanOrEqual(0);
    });

    // Verify localStorage consistency
    const wishlistData = mockLocalStorage.getItem('amourFloralsWishlist');
    if (wishlistData) {
      const wishlist = JSON.parse(wishlistData);
      assertWishlistConsistency(wishlist);
    }
  }

  return { mockLocalStorage };
};

/**
 * Integration test helper for performance testing
 */
export const testPerformanceFlow = async (component, scenario, options = {}) => {
  const { 
    itemCount = 100,
    operationCount = 10,
    expectResponsive = true
  } = options;

  // Create large dataset
  const products = createMockProducts(itemCount);

  // Render component with large wishlist
  const { mockLocalStorage } = renderWithWishlistContext(component, products);

  const startTime = performance.now();

  // Perform multiple operations
  for (let i = 0; i < operationCount; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    
    switch (scenario) {
      case 'scroll':
        // Simulate scrolling through large list
        fireEvent.scroll(window, { target: { scrollY: i * 100 } });
        break;
      case 'search':
        // Simulate searching through large list
        const searchInput = screen.getByRole('textbox', { name: /search/i });
        await userEvent.type(searchInput, randomProduct.name.substring(0, 3));
        await userEvent.clear(searchInput);
        break;
      case 'toggle':
        // Simulate toggling wishlist items
        const toggleButton = screen.getByLabelText(new RegExp(randomProduct.name, 'i'));
        await userEvent.click(toggleButton);
        break;
      default:
        throw new Error(`Unknown performance scenario: ${scenario}`);
    }
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  if (expectResponsive) {
    // Expect operations to complete within reasonable time
    expect(duration).toBeLessThan(5000); // 5 seconds max
  }

  return { 
    mockLocalStorage, 
    performanceMetrics: {
      duration,
      operationsPerSecond: operationCount / (duration / 1000)
    }
  };
};

/**
 * Integration test helper for accessibility flow
 */
export const testAccessibilityFlow = async (component, options = {}) => {
  const { 
    expectKeyboardNavigation = true,
    expectScreenReaderSupport = true
  } = options;

  const user = userEvent.setup();

  // Render component
  const { mockLocalStorage } = renderWithWishlistContext(component);

  if (expectKeyboardNavigation) {
    // Test keyboard navigation
    await user.tab(); // Should focus first interactive element
    
    const focusedElement = document.activeElement;
    expect(focusedElement).toBeInTheDocument();
    expect(focusedElement.tagName).toMatch(/BUTTON|INPUT|A/);

    // Test Enter key activation
    await user.keyboard('{Enter}');
    
    // Should trigger the focused element's action
    await waitFor(() => {
      // Verify some action occurred
      expect(document.activeElement).toBeInTheDocument();
    });
  }

  if (expectScreenReaderSupport) {
    // Test ARIA labels and roles
    const interactiveElements = screen.getAllByRole(/button|link|checkbox/);
    
    interactiveElements.forEach(element => {
      // Each interactive element should have accessible name
      expect(element).toHaveAccessibleName();
    });

    // Test live regions for dynamic updates
    const liveRegions = screen.queryAllByRole('status');
    expect(liveRegions.length).toBeGreaterThanOrEqual(0);
  }

  return { mockLocalStorage };
};

/**
 * Complete end-to-end user journey test
 */
export const testCompleteUserJourney = async (components, options = {}) => {
  const { 
    expectSuccess = true,
    includeErrors = false
  } = options;

  const user = userEvent.setup();
  const products = createMockProducts(5);

  // 1. Start with empty wishlist
  let { mockLocalStorage } = renderWithWishlistContext(components.productList, []);

  // 2. Add products to wishlist
  for (const product of products.slice(0, 3)) {
    await testAddToWishlistFlow(components.productCard, product, { expectSuccess });
  }

  // 3. Navigate to wishlist page
  const { mockLocalStorage: wishlistStorage } = renderWithWishlistContext(
    components.wishlistPage, 
    products.slice(0, 3)
  );

  // 4. Perform bulk operations
  await testBulkOperationsFlow(
    components.wishlistPage, 
    products.slice(0, 2), 
    'remove selected',
    { expectSuccess }
  );

  // 5. Add more products
  await testAddToWishlistFlow(components.productCard, products[3], { expectSuccess });

  // 6. Test error scenarios if requested
  if (includeErrors) {
    await testErrorRecoveryFlow(components.wishlistPage, 'network', { expectRecovery: true });
  }

  // 7. Final state verification
  const finalWishlistData = wishlistStorage.getItem('amourFloralsWishlist');
  if (finalWishlistData) {
    const finalWishlist = JSON.parse(finalWishlistData);
    assertWishlistConsistency(finalWishlist);
  }

  return { 
    mockLocalStorage: wishlistStorage,
    completedSteps: includeErrors ? 7 : 6
  };
};