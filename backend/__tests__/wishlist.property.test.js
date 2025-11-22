const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

let mongoServer;
let emailCounter = 0;
let categoryCounter = 0;

// Setup in-memory MongoDB
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(() => {
  emailCounter = 0;
  categoryCounter = 0;
});

afterEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
});

// Helper to create a category
const createCategory = async () => {
  const category = await Category.create({
    name: `Category-${categoryCounter++}-${Date.now()}`,
    description: 'Test category',
    isActive: true
  });
  return category._id;
};

// Generator for valid product data
const productGenerator = () => fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  price: fc.double({ min: 0.01, max: 10000, noNaN: true }),
  inventory: fc.record({
    stock: fc.integer({ min: 0, max: 1000 }),
    isAvailable: fc.boolean()
  })
});

// Generator for valid user data with unique email
const userGenerator = () => fc.record({
  fullName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  email: fc.emailAddress().map(email => `user${emailCounter++}-${email}`),
  password: fc.string({ minLength: 6, maxLength: 20 }).filter(s => s.trim().length >= 6)
});

/**
 * **Feature: product-wishlist, Property 9: Wishlist persistence round-trip**
 * **Validates: Requirements 4.1**
 * 
 * For any product added to the wishlist, querying the backend database 
 * should return that product in the user's favorites list.
 */
describe('Property 9: Wishlist persistence round-trip', () => {
  test('adding a product to wishlist persists it in the database', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        productGenerator(),
        async (userData, productData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Create user
          const user = await User.create(userData);
          
          // Create category and product
          const categoryId = await createCategory();
          const product = await Product.create({
            ...productData,
            category: categoryId
          });
          
          // Add product to user's favorites (wishlist)
          user.favorites.push(product._id);
          await user.save();
          
          // Query the database to retrieve the user with populated favorites
          const retrievedUser = await User.findById(user._id).populate('favorites');
          
          // Verify the product is in the favorites list
          expect(retrievedUser.favorites).toHaveLength(1);
          expect(retrievedUser.favorites[0]._id.toString()).toBe(product._id.toString());
          expect(retrievedUser.favorites[0].name).toBe(product.name);
          expect(retrievedUser.favorites[0].price).toBe(product.price);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('adding multiple products to wishlist persists all of them', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        fc.array(productGenerator(), { minLength: 1, maxLength: 10 }),
        async (userData, productsData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Create user
          const user = await User.create(userData);
          
          // Create category and products
          const categoryId = await createCategory();
          const products = await Promise.all(
            productsData.map(p => Product.create({
              ...p,
              category: categoryId
            }))
          );
          
          // Add all products to user's favorites
          user.favorites = products.map(p => p._id);
          await user.save();
          
          // Query the database to retrieve the user with populated favorites
          const retrievedUser = await User.findById(user._id).populate('favorites');
          
          // Verify all products are in the favorites list
          expect(retrievedUser.favorites).toHaveLength(products.length);
          
          const retrievedIds = retrievedUser.favorites.map(f => f._id.toString()).sort();
          const originalIds = products.map(p => p._id.toString()).sort();
          
          expect(retrievedIds).toEqual(originalIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('removing a product from wishlist removes it from the database', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        fc.array(productGenerator(), { minLength: 2, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        async (userData, productsData, removeIndex) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Adjust removeIndex to be within bounds
          const actualRemoveIndex = removeIndex % productsData.length;
          
          // Create user
          const user = await User.create(userData);
          
          // Create category and products
          const categoryId = await createCategory();
          const products = await Promise.all(
            productsData.map(p => Product.create({
              ...p,
              category: categoryId
            }))
          );
          
          // Add all products to user's favorites
          user.favorites = products.map(p => p._id);
          await user.save();
          
          // Remove one product
          const productToRemove = products[actualRemoveIndex];
          user.favorites = user.favorites.filter(
            id => id.toString() !== productToRemove._id.toString()
          );
          await user.save();
          
          // Query the database
          const retrievedUser = await User.findById(user._id).populate('favorites');
          
          // Verify the product was removed
          expect(retrievedUser.favorites).toHaveLength(products.length - 1);
          
          const retrievedIds = retrievedUser.favorites.map(f => f._id.toString());
          expect(retrievedIds).not.toContain(productToRemove._id.toString());
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: product-wishlist, Property 1: Adding products to wishlist increases wishlist size**
 * **Validates: Requirements 1.2**
 * 
 * For any product not currently in the user's wishlist, when the user clicks 
 * the heart icon to add it, the wishlist size should increase by exactly one.
 */
describe('Property 1: Adding products to wishlist increases wishlist size', () => {
  test('adding a new product increases wishlist size by one', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        fc.array(productGenerator(), { minLength: 0, maxLength: 10 }),
        productGenerator(),
        async (userData, initialProductsData, newProductData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Create user
          const user = await User.create(userData);
          
          // Create category
          const categoryId = await createCategory();
          
          // Create initial products and add to wishlist
          const initialProducts = await Promise.all(
            initialProductsData.map(p => Product.create({
              ...p,
              category: categoryId
            }))
          );
          
          user.favorites = initialProducts.map(p => p._id);
          await user.save();
          
          const initialSize = user.favorites.length;
          
          // Create new product (ensure it's different from existing ones)
          const newProduct = await Product.create({
            ...newProductData,
            category: categoryId
          });
          
          // Verify new product is not already in wishlist
          const isAlreadyInWishlist = user.favorites.some(
            id => id.toString() === newProduct._id.toString()
          );
          
          if (!isAlreadyInWishlist) {
            // Add new product to wishlist
            user.favorites.push(newProduct._id);
            await user.save();
            
            // Verify size increased by exactly one
            expect(user.favorites.length).toBe(initialSize + 1);
            
            // Verify the new product is in the wishlist
            const hasNewProduct = user.favorites.some(
              id => id.toString() === newProduct._id.toString()
            );
            expect(hasNewProduct).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('adding a product to an empty wishlist results in size of one', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        productGenerator(),
        async (userData, productData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Create user with empty wishlist
          const user = await User.create(userData);
          expect(user.favorites.length).toBe(0);
          
          // Create product
          const categoryId = await createCategory();
          const product = await Product.create({
            ...productData,
            category: categoryId
          });
          
          // Add product to wishlist
          user.favorites.push(product._id);
          await user.save();
          
          // Verify size is exactly one
          expect(user.favorites.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: product-wishlist, Property 2: Removing products from wishlist decreases wishlist size**
 * **Validates: Requirements 1.3**
 * 
 * For any product currently in the user's wishlist, when the user clicks 
 * the heart icon to remove it, the wishlist size should decrease by exactly one.
 */
describe('Property 2: Removing products from wishlist decreases wishlist size', () => {
  test('removing a product decreases wishlist size by one', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        fc.array(productGenerator(), { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 9 }),
        async (userData, productsData, removeIndex) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Adjust removeIndex to be within bounds
          const actualRemoveIndex = removeIndex % productsData.length;
          
          // Create user
          const user = await User.create(userData);
          
          // Create category and products
          const categoryId = await createCategory();
          const products = await Promise.all(
            productsData.map(p => Product.create({
              ...p,
              category: categoryId
            }))
          );
          
          // Add all products to wishlist
          user.favorites = products.map(p => p._id);
          await user.save();
          
          const initialSize = user.favorites.length;
          
          // Remove one product
          const productToRemove = products[actualRemoveIndex];
          user.favorites = user.favorites.filter(
            id => id.toString() !== productToRemove._id.toString()
          );
          await user.save();
          
          // Verify size decreased by exactly one
          expect(user.favorites.length).toBe(initialSize - 1);
          
          // Verify the product is no longer in the wishlist
          const stillHasProduct = user.favorites.some(
            id => id.toString() === productToRemove._id.toString()
          );
          expect(stillHasProduct).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('removing the last product results in empty wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        productGenerator(),
        async (userData, productData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Create user
          const user = await User.create(userData);
          
          // Create product
          const categoryId = await createCategory();
          const product = await Product.create({
            ...productData,
            category: categoryId
          });
          
          // Add product to wishlist
          user.favorites.push(product._id);
          await user.save();
          
          expect(user.favorites.length).toBe(1);
          
          // Remove the product
          user.favorites = user.favorites.filter(
            id => id.toString() !== product._id.toString()
          );
          await user.save();
          
          // Verify wishlist is empty
          expect(user.favorites.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('removing all products one by one results in empty wishlist', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        fc.array(productGenerator(), { minLength: 1, maxLength: 5 }),
        async (userData, productsData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Create user
          const user = await User.create(userData);
          
          // Create category and products
          const categoryId = await createCategory();
          const products = await Promise.all(
            productsData.map(p => Product.create({
              ...p,
              category: categoryId
            }))
          );
          
          // Add all products to wishlist
          user.favorites = products.map(p => p._id);
          await user.save();
          
          const initialSize = products.length;
          
          // Remove products one by one
          for (let i = 0; i < products.length; i++) {
            const expectedSize = initialSize - i - 1;
            
            user.favorites = user.favorites.filter(
              id => id.toString() !== products[i]._id.toString()
            );
            await user.save();
            
            // Verify size decreased correctly
            expect(user.favorites.length).toBe(expectedSize);
          }
          
          // Verify wishlist is empty at the end
          expect(user.favorites.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: product-wishlist, Property 14: Failed operations maintain previous state**
 * **Validates: Requirements 6.2**
 * 
 * For any wishlist operation that fails, the wishlist state should remain 
 * unchanged from its state before the operation was attempted.
 */
describe('Property 14: Failed operations maintain previous state', () => {
  test('attempting to add invalid product ID maintains wishlist state', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        fc.array(productGenerator(), { minLength: 0, maxLength: 10 }),
        async (userData, productsData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Create user
          const user = await User.create(userData);
          
          // Create category and products
          const categoryId = await createCategory();
          const products = await Promise.all(
            productsData.map(p => Product.create({
              ...p,
              category: categoryId
            }))
          );
          
          // Add products to wishlist
          user.favorites = products.map(p => p._id);
          await user.save();
          
          // Capture initial state
          const initialWishlist = user.favorites.map(id => id.toString());
          const initialSize = user.favorites.length;
          
          // Attempt to add an invalid product ID (non-existent)
          const invalidProductId = new mongoose.Types.ObjectId();
          
          try {
            // Simulate the controller logic that would fail
            const product = await Product.findById(invalidProductId);
            if (!product) {
              // This is the failure case - product not found
              // The controller would return an error and NOT modify the user
              throw new Error('Product not found');
            }
            // This should not execute
            user.favorites.push(invalidProductId);
            await user.save();
          } catch (error) {
            // Operation failed - verify state is unchanged
          }
          
          // Reload user from database
          const reloadedUser = await User.findById(user._id);
          
          // Verify wishlist state is unchanged
          expect(reloadedUser.favorites.length).toBe(initialSize);
          expect(reloadedUser.favorites.map(id => id.toString())).toEqual(initialWishlist);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('failed removal operation maintains wishlist state', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        fc.array(productGenerator(), { minLength: 1, maxLength: 10 }),
        async (userData, productsData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Create user
          const user = await User.create(userData);
          
          // Create category and products
          const categoryId = await createCategory();
          const products = await Promise.all(
            productsData.map(p => Product.create({
              ...p,
              category: categoryId
            }))
          );
          
          // Add products to wishlist
          user.favorites = products.map(p => p._id);
          await user.save();
          
          // Capture initial state
          const initialWishlist = user.favorites.map(id => id.toString());
          const initialSize = user.favorites.length;
          
          // Simulate a save failure by making the user invalid
          // We'll test that if save() throws an error, state is not persisted
          const originalFavorites = [...user.favorites];
          
          try {
            // Attempt to remove a product but simulate a failure
            user.favorites = user.favorites.slice(0, -1);
            
            // Simulate a validation error by setting an invalid field
            user.email = ''; // Invalid email would cause save to fail
            await user.save();
          } catch (error) {
            // Operation failed - reload user to verify state is unchanged
          }
          
          // Reload user from database
          const reloadedUser = await User.findById(user._id);
          
          // Verify wishlist state is unchanged (the failed save didn't persist)
          expect(reloadedUser.favorites.length).toBe(initialSize);
          expect(reloadedUser.favorites.map(id => id.toString())).toEqual(initialWishlist);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('database error during add operation maintains previous state', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        fc.array(productGenerator(), { minLength: 0, maxLength: 5 }),
        productGenerator(),
        async (userData, initialProductsData, newProductData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Create user
          const user = await User.create(userData);
          
          // Create category and initial products
          const categoryId = await createCategory();
          const initialProducts = await Promise.all(
            initialProductsData.map(p => Product.create({
              ...p,
              category: categoryId
            }))
          );
          
          // Add initial products to wishlist
          user.favorites = initialProducts.map(p => p._id);
          await user.save();
          
          // Capture initial state
          const initialWishlist = user.favorites.map(id => id.toString());
          const initialSize = user.favorites.length;
          
          // Create new product
          const newProduct = await Product.create({
            ...newProductData,
            category: categoryId
          });
          
          // Simulate a transaction-like behavior where we attempt to add
          // but encounter an error before saving
          try {
            user.favorites.push(newProduct._id);
            
            // Simulate an error by trying to save with invalid data
            const originalEmail = user.email;
            user.email = null; // This will cause a validation error
            await user.save();
            
            // Restore email if somehow it succeeded (shouldn't happen)
            user.email = originalEmail;
          } catch (error) {
            // Error occurred - state should not be persisted
            // Reload user to verify
          }
          
          // Reload user from database
          const reloadedUser = await User.findById(user._id);
          
          // Verify wishlist state is unchanged
          expect(reloadedUser.favorites.length).toBe(initialSize);
          expect(reloadedUser.favorites.map(id => id.toString())).toEqual(initialWishlist);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('concurrent modification failure maintains consistent state', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator(),
        fc.array(productGenerator(), { minLength: 2, maxLength: 10 }),
        async (userData, productsData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          
          // Create user
          const user = await User.create(userData);
          
          // Create category and products
          const categoryId = await createCategory();
          const products = await Promise.all(
            productsData.map(p => Product.create({
              ...p,
              category: categoryId
            }))
          );
          
          // Add products to wishlist
          user.favorites = products.map(p => p._id);
          await user.save();
          
          // Capture initial state
          const initialWishlist = user.favorites.map(id => id.toString());
          const initialSize = user.favorites.length;
          
          // Load the same user in two different instances (simulating concurrent requests)
          const user1 = await User.findById(user._id);
          const user2 = await User.findById(user._id);
          
          // Both try to modify the wishlist
          user1.favorites.push(new mongoose.Types.ObjectId());
          user2.favorites.pop();
          
          // Save user1 first (this should succeed)
          await user1.save();
          
          try {
            // Try to save user2 (this might fail due to version conflict)
            await user2.save();
          } catch (error) {
            // If it fails, that's expected
          }
          
          // Reload user from database
          const reloadedUser = await User.findById(user._id);
          
          // Verify that the state is consistent (either user1's or user2's changes, not corrupted)
          // The key property is that we don't have a corrupted/inconsistent state
          expect(reloadedUser.favorites).toBeDefined();
          expect(Array.isArray(reloadedUser.favorites)).toBe(true);
          
          // The size should be either initialSize + 1 (user1 succeeded) or initialSize - 1 (user2 succeeded)
          // or initialSize (both failed), but not some random corrupted value
          const finalSize = reloadedUser.favorites.length;
          const validSizes = [initialSize - 1, initialSize, initialSize + 1];
          expect(validSizes).toContain(finalSize);
        }
      ),
      { numRuns: 100 }
    );
  });
});
