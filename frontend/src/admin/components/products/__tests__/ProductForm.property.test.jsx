import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import ProductForm from '../ProductForm';
import { adminApi } from '../../../services/adminApi';

// Mock the admin API
vi.mock('../../../services/adminApi');

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockParams = { id: null };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// Counter for generating unique IDs
let idCounter = 0;

// Generator for valid category data
const categoryGenerator = () => fc.record({
  _id: fc.constant(null).map(() => (idCounter++).toString(16).padStart(24, '0')),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  isActive: fc.boolean()
});

// Generator for valid product data
const productGenerator = (categoryId) => fc.record({
  _id: fc.constant(null).map(() => (idCounter++).toString(16).padStart(24, '0')),
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }).map(p => Math.round(p * 100) / 100),
  category: fc.record({
    _id: fc.constant(categoryId),
    name: fc.string({ minLength: 1, maxLength: 50 })
  }),
  inventory: fc.record({
    stock: fc.integer({ min: 0, max: 1000 }),
    lowStockThreshold: fc.option(fc.integer({ min: 1, max: 50 })),
    isAvailable: fc.boolean()
  }),
  images: fc.array(fc.record({
    url: fc.webUrl(),
    alt: fc.string({ minLength: 1, maxLength: 100 }),
    isPrimary: fc.boolean()
  }), { minLength: 0, maxLength: 5 }),
  isFeatured: fc.boolean(),
  isPopular: fc.boolean(),
  flowerTypes: fc.array(fc.constantFrom('roses', 'lilies', 'tulips', 'orchids', 'mixed'), { minLength: 0, maxLength: 3 }),
  occasions: fc.array(fc.constantFrom('birthday', 'anniversary', 'wedding', 'sympathy', 'congratulations'), { minLength: 0, maxLength: 3 }),
  colors: fc.array(fc.constantFrom('red', 'pink', 'white', 'yellow', 'purple'), { minLength: 0, maxLength: 3 }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
  careInstructions: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  deliveryInfo: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  isActive: fc.boolean(),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date() })
}).map(obj => {
  // Remove null values from optional fields
  const result = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null) {
      result[key] = obj[key];
    }
  });
  return result;
});

// Helper to render ProductForm with router context
const renderProductForm = (isEdit = false, productId = null) => {
  if (isEdit && productId) {
    mockParams.id = productId;
  } else {
    mockParams.id = null;
  }

  return render(
    <BrowserRouter>
      <ProductForm isEdit={isEdit} />
    </BrowserRouter>
  );
};

/**
 * **Feature: admin-dashboard, Property 5: Product edit form population**
 * **Validates: Requirements 2.1**
 * 
 * For any existing product selected for editing, the edit form should display 
 * all current product information accurately.
 */
describe('Property 5: Product edit form population', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    idCounter = 0;
    mockParams.id = null;
  });

  test('edit form displays all current product information accurately', async () => {
    await fc.assert(
      fc.asyncProperty(
        categoryGenerator(),
        async (categoryData) => {
          // Reset for each iteration
          vi.clearAllMocks();
          idCounter = 0;

          // Generate product data with the category
          const productData = await fc.sample(productGenerator(categoryData._id), 1)[0];
          
          // Mock API responses
          adminApi.getCategories.mockResolvedValue({
            data: {
              status: 'success',
              data: { categories: [categoryData] }
            }
          });

          adminApi.getProduct.mockResolvedValue({
            data: {
              status: 'success',
              data: { product: productData }
            }
          });

          // Render the edit form
          renderProductForm(true, productData._id);

          // Wait for the form to load and populate
          await waitFor(() => {
            expect(adminApi.getProduct).toHaveBeenCalledWith(productData._id);
          }, { timeout: 3000 });

          await waitFor(() => {
            const nameInput = screen.getByDisplayValue(productData.name);
            expect(nameInput).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify all form fields are populated with correct data
          
          // Basic fields
          expect(screen.getByDisplayValue(productData.name)).toBeInTheDocument();
          expect(screen.getByDisplayValue(productData.description)).toBeInTheDocument();
          expect(screen.getByDisplayValue(productData.price.toString())).toBeInTheDocument();
          
          // Category selection
          const categorySelect = screen.getByDisplayValue(categoryData.name);
          expect(categorySelect).toBeInTheDocument();
          
          // Inventory fields
          expect(screen.getByDisplayValue(productData.inventory.stock.toString())).toBeInTheDocument();
          
          if (productData.inventory.lowStockThreshold) {
            expect(screen.getByDisplayValue(productData.inventory.lowStockThreshold.toString())).toBeInTheDocument();
          }

          // Boolean fields (checkboxes)
          const isActiveCheckbox = screen.getByRole('checkbox', { name: /active/i });
          expect(isActiveCheckbox.checked).toBe(productData.isActive);

          const isAvailableCheckbox = screen.getByRole('checkbox', { name: /available for purchase/i });
          expect(isAvailableCheckbox.checked).toBe(productData.inventory.isAvailable);

          const isFeaturedCheckbox = screen.getByRole('checkbox', { name: /featured product/i });
          expect(isFeaturedCheckbox.checked).toBe(productData.isFeatured);

          const isPopularCheckbox = screen.getByRole('checkbox', { name: /popular product/i });
          expect(isPopularCheckbox.checked).toBe(productData.isPopular);

          // Array fields (comma-separated)
          if (productData.flowerTypes && productData.flowerTypes.length > 0) {
            expect(screen.getByDisplayValue(productData.flowerTypes.join(', '))).toBeInTheDocument();
          }

          if (productData.occasions && productData.occasions.length > 0) {
            expect(screen.getByDisplayValue(productData.occasions.join(', '))).toBeInTheDocument();
          }

          if (productData.colors && productData.colors.length > 0) {
            expect(screen.getByDisplayValue(productData.colors.join(', '))).toBeInTheDocument();
          }

          if (productData.tags && productData.tags.length > 0) {
            expect(screen.getByDisplayValue(productData.tags.join(', '))).toBeInTheDocument();
          }

          // Optional text fields
          if (productData.careInstructions) {
            expect(screen.getByDisplayValue(productData.careInstructions)).toBeInTheDocument();
          }

          if (productData.deliveryInfo) {
            expect(screen.getByDisplayValue(productData.deliveryInfo)).toBeInTheDocument();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('edit form handles products with minimal data correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        categoryGenerator(),
        async (categoryData) => {
          // Reset for each iteration
          vi.clearAllMocks();
          idCounter = 0;

          // Create minimal product data (only required fields)
          const minimalProduct = {
            _id: (idCounter++).toString(16).padStart(24, '0'),
            name: 'Test Product',
            description: 'Test Description',
            price: 29.99,
            category: {
              _id: categoryData._id,
              name: categoryData.name
            },
            inventory: {
              stock: 10,
              isAvailable: true
            },
            images: [],
            isFeatured: false,
            isPopular: false,
            flowerTypes: [],
            occasions: [],
            colors: [],
            tags: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Mock API responses
          adminApi.getCategories.mockResolvedValue({
            data: {
              status: 'success',
              data: { categories: [categoryData] }
            }
          });

          adminApi.getProduct.mockResolvedValue({
            data: {
              status: 'success',
              data: { product: minimalProduct }
            }
          });

          // Render the edit form
          renderProductForm(true, minimalProduct._id);

          // Wait for the form to load and populate
          await waitFor(() => {
            expect(adminApi.getProduct).toHaveBeenCalledWith(minimalProduct._id);
          }, { timeout: 3000 });

          await waitFor(() => {
            const nameInput = screen.getByDisplayValue(minimalProduct.name);
            expect(nameInput).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify required fields are populated
          expect(screen.getByDisplayValue(minimalProduct.name)).toBeInTheDocument();
          expect(screen.getByDisplayValue(minimalProduct.description)).toBeInTheDocument();
          expect(screen.getByDisplayValue(minimalProduct.price.toString())).toBeInTheDocument();
          expect(screen.getByDisplayValue(minimalProduct.inventory.stock.toString())).toBeInTheDocument();

          // Verify optional fields show empty values
          const flowerTypesInput = screen.getByPlaceholderText('roses, lilies, tulips');
          expect(flowerTypesInput.value).toBe('');

          const occasionsInput = screen.getByPlaceholderText('birthday, anniversary, wedding');
          expect(occasionsInput.value).toBe('');

          const colorsInput = screen.getByPlaceholderText('red, pink, white');
          expect(colorsInput.value).toBe('');

          const tagsInput = screen.getByPlaceholderText('premium, seasonal, popular');
          expect(tagsInput.value).toBe('');

          // Verify boolean fields have correct default values
          const isActiveCheckbox = screen.getByRole('checkbox', { name: /active/i });
          expect(isActiveCheckbox.checked).toBe(true);

          const isFeaturedCheckbox = screen.getByRole('checkbox', { name: /featured product/i });
          expect(isFeaturedCheckbox.checked).toBe(false);

          const isPopularCheckbox = screen.getByRole('checkbox', { name: /popular product/i });
          expect(isPopularCheckbox.checked).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('edit form preserves data integrity across all field types', async () => {
    await fc.assert(
      fc.asyncProperty(
        categoryGenerator(),
        async (categoryData) => {
          // Reset for each iteration
          vi.clearAllMocks();
          idCounter = 0;

          // Generate comprehensive product data
          const productData = await fc.sample(productGenerator(categoryData._id), 1)[0];
          
          // Mock API responses
          adminApi.getCategories.mockResolvedValue({
            data: {
              status: 'success',
              data: { categories: [categoryData] }
            }
          });

          adminApi.getProduct.mockResolvedValue({
            data: {
              status: 'success',
              data: { product: productData }
            }
          });

          // Render the edit form
          renderProductForm(true, productData._id);

          // Wait for the form to load
          await waitFor(() => {
            expect(adminApi.getProduct).toHaveBeenCalledWith(productData._id);
          }, { timeout: 3000 });

          await waitFor(() => {
            const nameInput = screen.getByDisplayValue(productData.name);
            expect(nameInput).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify numeric fields maintain precision
          const priceInput = screen.getByDisplayValue(productData.price.toString());
          expect(parseFloat(priceInput.value)).toBe(productData.price);

          const stockInput = screen.getByDisplayValue(productData.inventory.stock.toString());
          expect(parseInt(stockInput.value)).toBe(productData.inventory.stock);

          // Verify text fields preserve exact content
          const nameInput = screen.getByDisplayValue(productData.name);
          expect(nameInput.value).toBe(productData.name);

          const descriptionInput = screen.getByDisplayValue(productData.description);
          expect(descriptionInput.value).toBe(productData.description);

          // Verify array fields are properly joined and displayed
          if (productData.flowerTypes && productData.flowerTypes.length > 0) {
            const flowerTypesInput = screen.getByDisplayValue(productData.flowerTypes.join(', '));
            expect(flowerTypesInput.value).toBe(productData.flowerTypes.join(', '));
          }

          if (productData.occasions && productData.occasions.length > 0) {
            const occasionsInput = screen.getByDisplayValue(productData.occasions.join(', '));
            expect(occasionsInput.value).toBe(productData.occasions.join(', '));
          }

          // Verify boolean fields reflect exact state
          const isActiveCheckbox = screen.getByRole('checkbox', { name: /active/i });
          expect(isActiveCheckbox.checked).toBe(productData.isActive);

          const isAvailableCheckbox = screen.getByRole('checkbox', { name: /available for purchase/i });
          expect(isAvailableCheckbox.checked).toBe(productData.inventory.isAvailable);

          const isFeaturedCheckbox = screen.getByRole('checkbox', { name: /featured product/i });
          expect(isFeaturedCheckbox.checked).toBe(productData.isFeatured);

          const isPopularCheckbox = screen.getByRole('checkbox', { name: /popular product/i });
          expect(isPopularCheckbox.checked).toBe(productData.isPopular);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  test('edit form handles edge cases in product data', async () => {
    await fc.assert(
      fc.asyncProperty(
        categoryGenerator(),
        fc.record({
          hasZeroPrice: fc.boolean(),
          hasZeroStock: fc.boolean(),
          hasEmptyArrays: fc.boolean(),
          hasLongText: fc.boolean()
        }),
        async (categoryData, edgeCases) => {
          // Reset for each iteration
          vi.clearAllMocks();
          idCounter = 0;

          // Create product with edge case data
          const edgeProduct = {
            _id: (idCounter++).toString(16).padStart(24, '0'),
            name: edgeCases.hasLongText ? 'A'.repeat(100) : 'Test Product',
            description: edgeCases.hasLongText ? 'B'.repeat(500) : 'Test Description',
            price: edgeCases.hasZeroPrice ? 0.01 : 29.99, // Minimum valid price
            category: {
              _id: categoryData._id,
              name: categoryData.name
            },
            inventory: {
              stock: edgeCases.hasZeroStock ? 0 : 10,
              isAvailable: true
            },
            images: [],
            isFeatured: false,
            isPopular: false,
            flowerTypes: edgeCases.hasEmptyArrays ? [] : ['roses'],
            occasions: edgeCases.hasEmptyArrays ? [] : ['birthday'],
            colors: edgeCases.hasEmptyArrays ? [] : ['red'],
            tags: edgeCases.hasEmptyArrays ? [] : ['premium'],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Mock API responses
          adminApi.getCategories.mockResolvedValue({
            data: {
              status: 'success',
              data: { categories: [categoryData] }
            }
          });

          adminApi.getProduct.mockResolvedValue({
            data: {
              status: 'success',
              data: { product: edgeProduct }
            }
          });

          // Render the edit form
          renderProductForm(true, edgeProduct._id);

          // Wait for the form to load
          await waitFor(() => {
            expect(adminApi.getProduct).toHaveBeenCalledWith(edgeProduct._id);
          }, { timeout: 3000 });

          await waitFor(() => {
            const nameInput = screen.getByDisplayValue(edgeProduct.name);
            expect(nameInput).toBeInTheDocument();
          }, { timeout: 3000 });

          // Verify edge case data is handled correctly
          expect(screen.getByDisplayValue(edgeProduct.name)).toBeInTheDocument();
          expect(screen.getByDisplayValue(edgeProduct.description)).toBeInTheDocument();
          expect(screen.getByDisplayValue(edgeProduct.price.toString())).toBeInTheDocument();
          expect(screen.getByDisplayValue(edgeProduct.inventory.stock.toString())).toBeInTheDocument();

          // Verify empty arrays display as empty strings
          if (edgeCases.hasEmptyArrays) {
            const flowerTypesInput = screen.getByPlaceholderText('roses, lilies, tulips');
            expect(flowerTypesInput.value).toBe('');

            const occasionsInput = screen.getByPlaceholderText('birthday, anniversary, wedding');
            expect(occasionsInput.value).toBe('');
          } else {
            expect(screen.getByDisplayValue('roses')).toBeInTheDocument();
            expect(screen.getByDisplayValue('birthday')).toBeInTheDocument();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});