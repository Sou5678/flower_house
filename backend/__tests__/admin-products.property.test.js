const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const AdminActivity = require('../models/AdminActivity');

let mongoServer;
let emailCounter = 0;

// Setup in-memory MongoDB
beforeAll(async () => {
  // Disconnect from any existing connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  // Wait for connection to be ready
  await new Promise(resolve => {
    if (mongoose.connection.readyState === 1) {
      resolve();
    } else {
      mongoose.connection.once('connected', resolve);
    }
  });
}, 30000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

beforeEach(() => {
  emailCounter = 0;
});

afterEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
  await AdminActivity.deleteMany({});
});

// Generator for valid admin user
const adminUserGenerator = () => fc.record({
  fullName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  email: fc.emailAddress().map(email => `admin${emailCounter++}-${email}`),
  password: fc.string({ minLength: 6, maxLength: 20 }).filter(s => s.trim().length >= 6),
  role: fc.constant('admin')
});

// Generator for valid category data
const categoryGenerator = () => fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
  isActive: fc.boolean()
});

// Generator for valid product data
const productGenerator = (categoryId) => fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
  description: fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }).map(p => Math.round(p * 100) / 100),
  category: fc.constant(categoryId),
  inventory: fc.record({
    stock: fc.integer({ min: 0, max: 1000 }),
    lowStockThreshold: fc.option(fc.integer({ min: 1, max: 50 })),
    isAvailable: fc.option(fc.boolean())
  }),
  images: fc.option(fc.array(fc.record({
    url: fc.webUrl(),
    alt: fc.string({ minLength: 1, maxLength: 100 }),
    isPrimary: fc.option(fc.boolean())
  }), { minLength: 0, maxLength: 3 })),
  isFeatured: fc.option(fc.boolean()),
  isPopular: fc.option(fc.boolean()),
  flowerTypes: fc.option(fc.array(fc.constantFrom('roses', 'lilies', 'tulips', 'orchids', 'mixed', 'seasonal'), { minLength: 0, maxLength: 3 })),
  occasions: fc.option(fc.array(fc.constantFrom('birthday', 'anniversary', 'wedding', 'sympathy', 'congratulations', 'just-because'), { minLength: 0, maxLength: 3 })),
  colors: fc.option(fc.array(fc.constantFrom('red', 'pink', 'white', 'yellow', 'purple', 'mixed'), { minLength: 0, maxLength: 3 })),
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 })),
  careInstructions: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  deliveryInfo: fc.option(fc.string({ minLength: 1, maxLength: 500 }))
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

// Generator for product updates (partial data)
const productUpdateGenerator = () => fc.record({
  name: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
  description: fc.option(fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0)),
  price: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }).map(p => Math.round(p * 100) / 100)),
  inventory: fc.option(fc.record({
    stock: fc.integer({ min: 0, max: 1000 }),
    lowStockThreshold: fc.option(fc.integer({ min: 1, max: 50 })),
    isAvailable: fc.option(fc.boolean())
  })),
  isFeatured: fc.option(fc.boolean()),
  isPopular: fc.option(fc.boolean()),
  flowerTypes: fc.option(fc.array(fc.constantFrom('roses', 'lilies', 'tulips', 'orchids', 'mixed', 'seasonal'), { minLength: 0, maxLength: 3 })),
  occasions: fc.option(fc.array(fc.constantFrom('birthday', 'anniversary', 'wedding', 'sympathy', 'congratulations', 'just-because'), { minLength: 0, maxLength: 3 })),
  tags: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }))
}).map(obj => {
  // Remove null values
  const result = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null) {
      result[key] = obj[key];
    }
  });
  return result;
});

// Helper to generate valid JWT token
const generateValidToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h'
  });
};

/**
 * **Feature: admin-dashboard, Property 1: Product data integrity preservation**
 * **Validates: Requirements 1.1, 2.2**
 * 
 * For any valid product data submitted through the admin interface, creating or updating 
 * the product should result in the exact same data being stored and retrievable from the Product_Catalog.
 */
describe('Property 1: Product data integrity preservation', () => {
  test('creating a product preserves all submitted data exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        categoryGenerator(),
        async (adminData, categoryData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user and category
          const admin = await User.create(adminData);
          const category = await Category.create(categoryData);
          const token = generateValidToken(admin._id);
          
          // Generate product data with the created category
          const productData = await fc.sample(productGenerator(category._id), 1)[0];
          
          // Create product via API
          const createResponse = await request(app)
            .post('/api/admin/products')
            .set('Authorization', `Bearer ${token}`)
            .send(productData);
          

          
          expect(createResponse.status).toBe(201);
          expect(createResponse.body.status).toBe('success');
          
          const createdProduct = createResponse.body.data.product;
          
          // Verify all submitted data is preserved (accounting for trimming)
          expect(createdProduct.name).toBe(productData.name.trim());
          expect(createdProduct.description).toBe(productData.description);
          expect(createdProduct.price).toBe(productData.price);
          expect(createdProduct.category.toString()).toBe(category._id.toString());
          expect(createdProduct.inventory.stock).toBe(productData.inventory.stock);
          
          // Handle optional fields with defaults
          if (productData.hasOwnProperty('isFeatured')) {
            expect(createdProduct.isFeatured).toBe(productData.isFeatured);
          } else {
            expect(createdProduct.isFeatured).toBe(false); // Default value
          }
          
          if (productData.hasOwnProperty('isPopular')) {
            expect(createdProduct.isPopular).toBe(productData.isPopular);
          } else {
            expect(createdProduct.isPopular).toBe(false); // Default value
          }
          
          // Verify arrays are preserved (handle optional fields)
          if (productData.hasOwnProperty('flowerTypes')) {
            expect(createdProduct.flowerTypes).toEqual(productData.flowerTypes);
          }
          if (productData.hasOwnProperty('occasions')) {
            expect(createdProduct.occasions).toEqual(productData.occasions);
          }
          if (productData.hasOwnProperty('tags')) {
            expect(createdProduct.tags).toEqual(productData.tags);
          }
          if (productData.hasOwnProperty('colors')) {
            expect(createdProduct.colors).toEqual(productData.colors);
          }
          
          // Verify images are preserved
          expect(createdProduct.images).toHaveLength(productData.images.length);
          productData.images.forEach((img, index) => {
            expect(createdProduct.images[index].url).toBe(img.url);
            expect(createdProduct.images[index].alt).toBe(img.alt);
          });
          
          // Retrieve product directly from database to verify persistence
          const dbProduct = await Product.findById(createdProduct._id).populate('category');
          
          expect(dbProduct.name).toBe(productData.name.trim());
          expect(dbProduct.description).toBe(productData.description);
          expect(dbProduct.price).toBe(productData.price);
          expect(dbProduct.category._id.toString()).toBe(category._id.toString());
          expect(dbProduct.inventory.stock).toBe(productData.inventory.stock);
          
          // Handle optional fields with defaults
          if (productData.hasOwnProperty('isFeatured')) {
            expect(dbProduct.isFeatured).toBe(productData.isFeatured);
          } else {
            expect(dbProduct.isFeatured).toBe(false); // Default value
          }
          
          if (productData.hasOwnProperty('isPopular')) {
            expect(dbProduct.isPopular).toBe(productData.isPopular);
          } else {
            expect(dbProduct.isPopular).toBe(false); // Default value
          }
        }
      ),
      { numRuns: 2 }
    );
  });

  test('updating a product preserves all submitted changes exactly', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        categoryGenerator(),
        productUpdateGenerator(),
        async (adminData, categoryData, updateData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user and category
          const admin = await User.create(adminData);
          const category = await Category.create(categoryData);
          const token = generateValidToken(admin._id);
          
          // Create initial product
          const initialProductData = await fc.sample(productGenerator(category._id), 1)[0];
          const initialProduct = await Product.create(initialProductData);
          
          // Skip if no updates to apply
          if (Object.keys(updateData).length === 0) {
            return;
          }
          
          // Update product via API
          const updateResponse = await request(app)
            .put(`/api/admin/products/${initialProduct._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateData);
          
          expect(updateResponse.status).toBe(200);
          expect(updateResponse.body.status).toBe('success');
          
          const updatedProduct = updateResponse.body.data.product;
          
          // Verify all submitted updates are applied
          Object.keys(updateData).forEach(key => {
            if (key === 'inventory') {
              expect(updatedProduct.inventory.stock).toBe(updateData.inventory.stock);
            } else if (key === 'name') {
              expect(updatedProduct[key]).toBe(updateData[key].trim());
            } else {
              expect(updatedProduct[key]).toEqual(updateData[key]);
            }
          });
          
          // Verify unchanged fields remain the same
          Object.keys(initialProductData).forEach(key => {
            if (!updateData.hasOwnProperty(key)) {
              if (key === 'category') {
                const categoryId = typeof updatedProduct.category === 'object' ? updatedProduct.category._id : updatedProduct.category;
                expect(categoryId.toString()).toBe(initialProductData.category.toString());
              } else if (key === 'inventory') {
                if (!updateData.inventory) {
                  expect(updatedProduct.inventory.stock).toBe(initialProductData.inventory.stock);
                }
              } else if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
                expect(updatedProduct[key]).toEqual(initialProductData[key]);
              }
            }
          });
          
          // Retrieve product directly from database to verify persistence
          const dbProduct = await Product.findById(updatedProduct._id);
          
          Object.keys(updateData).forEach(key => {
            if (key === 'inventory') {
              expect(dbProduct.inventory.stock).toBe(updateData.inventory.stock);
            } else if (key === 'name') {
              expect(dbProduct[key]).toBe(updateData[key].trim());
            } else {
              expect(dbProduct[key]).toEqual(updateData[key]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('retrieving a product returns exactly the stored data', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        categoryGenerator(),
        async (adminData, categoryData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user and category
          const admin = await User.create(adminData);
          const category = await Category.create(categoryData);
          const token = generateValidToken(admin._id);
          
          // Create product directly in database
          const productData = await fc.sample(productGenerator(category._id), 1)[0];
          const dbProduct = await Product.create(productData);
          
          // Retrieve product via API
          const getResponse = await request(app)
            .get(`/api/admin/products/${dbProduct._id}`)
            .set('Authorization', `Bearer ${token}`);
          
          expect(getResponse.status).toBe(200);
          expect(getResponse.body.status).toBe('success');
          
          const retrievedProduct = getResponse.body.data.product;
          
          // Verify all data matches exactly (accounting for trimming)
          expect(retrievedProduct.name).toBe(productData.name.trim());
          expect(retrievedProduct.description).toBe(productData.description);
          expect(retrievedProduct.price).toBe(productData.price);
          expect(retrievedProduct.category._id.toString()).toBe(category._id.toString());
          expect(retrievedProduct.inventory.stock).toBe(productData.inventory.stock);
          
          // Handle optional fields with defaults
          if (productData.hasOwnProperty('isFeatured')) {
            expect(retrievedProduct.isFeatured).toBe(productData.isFeatured);
          } else {
            expect(retrievedProduct.isFeatured).toBe(false); // Default value
          }
          
          if (productData.hasOwnProperty('isPopular')) {
            expect(retrievedProduct.isPopular).toBe(productData.isPopular);
          } else {
            expect(retrievedProduct.isPopular).toBe(false); // Default value
          }
          
          // Verify arrays match exactly (handle optional fields)
          if (productData.hasOwnProperty('flowerTypes')) {
            expect(retrievedProduct.flowerTypes).toEqual(productData.flowerTypes);
          }
          if (productData.hasOwnProperty('occasions')) {
            expect(retrievedProduct.occasions).toEqual(productData.occasions);
          }
          if (productData.hasOwnProperty('tags')) {
            expect(retrievedProduct.tags).toEqual(productData.tags);
          }
          if (productData.hasOwnProperty('colors')) {
            expect(retrievedProduct.colors).toEqual(productData.colors);
          }
          
          // Verify images match exactly
          expect(retrievedProduct.images).toHaveLength(productData.images.length);
          productData.images.forEach((img, index) => {
            expect(retrievedProduct.images[index].url).toBe(img.url);
            expect(retrievedProduct.images[index].alt).toBe(img.alt);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  test('bulk updating products preserves data integrity for all affected products', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        categoryGenerator(),
        fc.array(fc.constant(null), { minLength: 2, maxLength: 5 }), // Generate array of nulls to determine count
        productUpdateGenerator().filter(update => Object.keys(update).length > 0),
        async (adminData, categoryData, productCount, bulkUpdate) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user and category
          const admin = await User.create(adminData);
          const category = await Category.create(categoryData);
          const token = generateValidToken(admin._id);
          
          // Create multiple products
          const products = [];
          for (let i = 0; i < productCount.length; i++) {
            const productData = await fc.sample(productGenerator(category._id), 1)[0];
            const product = await Product.create(productData);
            products.push(product);
          }
          
          const productIds = products.map(p => p._id);
          
          // Perform bulk update via API
          const bulkUpdateResponse = await request(app)
            .put('/api/admin/products/bulk-update')
            .set('Authorization', `Bearer ${token}`)
            .set('X-Admin-Confirmation', 'confirmed')
            .send({
              productIds,
              updates: bulkUpdate
            });
          
          expect(bulkUpdateResponse.status).toBe(200);
          expect(bulkUpdateResponse.body.status).toBe('success');
          expect(bulkUpdateResponse.body.data.modifiedCount).toBe(products.length);
          
          // Verify all products were updated with exact data
          for (const productId of productIds) {
            const updatedProduct = await Product.findById(productId);
            
            Object.keys(bulkUpdate).forEach(key => {
              if (key === 'inventory') {
                expect(updatedProduct.inventory.stock).toBe(bulkUpdate.inventory.stock);
              } else {
                expect(updatedProduct[key]).toEqual(bulkUpdate[key]);
              }
            });
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('product data integrity is maintained across create-retrieve-update-retrieve cycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        categoryGenerator(),
        productUpdateGenerator().filter(update => Object.keys(update).length > 0),
        async (adminData, categoryData, updateData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user and category
          const admin = await User.create(adminData);
          const category = await Category.create(categoryData);
          const token = generateValidToken(admin._id);
          
          // Generate and create initial product
          const initialProductData = await fc.sample(productGenerator(category._id), 1)[0];
          
          const createResponse = await request(app)
            .post('/api/admin/products')
            .set('Authorization', `Bearer ${token}`)
            .send(initialProductData);
          
          expect(createResponse.status).toBe(201);
          const createdProduct = createResponse.body.data.product;
          
          // Retrieve the created product
          const getResponse1 = await request(app)
            .get(`/api/admin/products/${createdProduct._id}`)
            .set('Authorization', `Bearer ${token}`);
          
          expect(getResponse1.status).toBe(200);
          const retrievedProduct1 = getResponse1.body.data.product;
          
          // Verify initial data integrity (accounting for trimming)
          expect(retrievedProduct1.name).toBe(initialProductData.name.trim());
          expect(retrievedProduct1.price).toBe(initialProductData.price);
          
          // Update the product
          const updateResponse = await request(app)
            .put(`/api/admin/products/${createdProduct._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateData);
          
          expect(updateResponse.status).toBe(200);
          
          // Retrieve the updated product
          const getResponse2 = await request(app)
            .get(`/api/admin/products/${createdProduct._id}`)
            .set('Authorization', `Bearer ${token}`);
          
          expect(getResponse2.status).toBe(200);
          const retrievedProduct2 = getResponse2.body.data.product;
          
          // Verify updated data integrity
          Object.keys(updateData).forEach(key => {
            if (key === 'inventory') {
              expect(retrievedProduct2.inventory.stock).toBe(updateData.inventory.stock);
            } else if (key === 'name') {
              expect(retrievedProduct2[key]).toBe(updateData[key].trim());
            } else {
              expect(retrievedProduct2[key]).toEqual(updateData[key]);
            }
          });
          
          // Verify unchanged fields remain intact
          Object.keys(initialProductData).forEach(key => {
            if (!updateData.hasOwnProperty(key)) {
              if (key === 'category') {
                const categoryId = typeof retrievedProduct2.category === 'object' ? retrievedProduct2.category._id : retrievedProduct2.category;
                expect(categoryId.toString()).toBe(initialProductData.category.toString());
              } else if (key === 'inventory') {
                if (!updateData.inventory) {
                  expect(retrievedProduct2.inventory.stock).toBe(initialProductData.inventory.stock);
                }
              } else if (key === 'name') {
                expect(retrievedProduct2[key]).toBe(initialProductData[key].trim());
              } else if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
                expect(retrievedProduct2[key]).toEqual(initialProductData[key]);
              }
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});