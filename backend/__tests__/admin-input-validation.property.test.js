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
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
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

// Generator for invalid product data (missing required fields)
const invalidProductGenerator = () => fc.oneof(
  // Missing name
  fc.record({
    description: fc.string({ minLength: 1, maxLength: 500 }),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
    category: fc.string()
  }),
  // Missing description
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
    category: fc.string()
  }),
  // Missing price
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    category: fc.string()
  }),
  // Missing category
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) })
  }),
  // Invalid price (negative or zero)
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    price: fc.oneof(fc.constant(0), fc.float({ min: Math.fround(-1000), max: Math.fround(-0.01) })),
    category: fc.string()
  }),
  // Invalid inventory stock (negative)
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.string({ minLength: 1, maxLength: 500 }),
    price: fc.float({ min: Math.fround(0.01), max: Math.fround(10000) }),
    category: fc.string(),
    inventory: fc.record({
      stock: fc.integer({ min: -1000, max: -1 })
    })
  })
);

// Generator for invalid update data
const invalidUpdateGenerator = () => fc.oneof(
  // Invalid price (negative or zero)
  fc.record({
    price: fc.oneof(fc.constant(0), fc.float({ min: Math.fround(-1000), max: Math.fround(-0.01) }))
  }),
  // Invalid inventory stock (negative)
  fc.record({
    inventory: fc.record({
      stock: fc.integer({ min: -1000, max: -1 })
    })
  }),
  // Invalid category ID
  fc.record({
    category: fc.string({ minLength: 1, maxLength: 10 }).filter(s => !mongoose.Types.ObjectId.isValid(s))
  })
);

// Helper to generate valid JWT token
const generateValidToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h'
  });
};

/**
 * **Feature: admin-dashboard, Property 2: Input validation consistency**
 * **Validates: Requirements 1.2, 2.3**
 * 
 * For any product form submission with invalid or missing required fields, 
 * the Admin_Dashboard should reject the submission and provide appropriate validation errors.
 */
describe('Property 2: Input validation consistency', () => {
  test('creating products with invalid data consistently returns validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        categoryGenerator(),
        invalidProductGenerator(),
        async (adminData, categoryData, invalidProductData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user and category
          const admin = await User.create(adminData);
          const category = await Category.create(categoryData);
          const token = generateValidToken(admin._id);
          
          // Replace category string with actual category ID if present
          if (invalidProductData.category) {
            invalidProductData.category = category._id;
          }
          
          // Attempt to create product with invalid data
          const createResponse = await request(app)
            .post('/api/admin/products')
            .set('Authorization', `Bearer ${token}`)
            .send(invalidProductData);
          
          // Should return error status
          expect(createResponse.status).toBeGreaterThanOrEqual(400);
          expect(createResponse.status).toBeLessThan(500);
          expect(createResponse.body.status).toBe('error');
          
          // Should provide error message
          expect(createResponse.body.message).toBeDefined();
          expect(typeof createResponse.body.message).toBe('string');
          expect(createResponse.body.message.length).toBeGreaterThan(0);
          
          // Verify no product was created in database
          const productCount = await Product.countDocuments();
          expect(productCount).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('updating products with invalid data consistently returns validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        categoryGenerator(),
        invalidUpdateGenerator(),
        async (adminData, categoryData, invalidUpdateData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user and category
          const admin = await User.create(adminData);
          const category = await Category.create(categoryData);
          const token = generateValidToken(admin._id);
          
          // Create a valid product first
          const validProduct = await Product.create({
            name: 'Test Product',
            description: 'Test Description',
            price: 10.99,
            category: category._id,
            inventory: { stock: 100 }
          });
          
          // Replace category string with invalid ID if present
          if (invalidUpdateData.category && typeof invalidUpdateData.category === 'string') {
            // Keep the invalid category ID as is
          }
          
          // Attempt to update product with invalid data
          const updateResponse = await request(app)
            .put(`/api/admin/products/${validProduct._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(invalidUpdateData);
          
          // Should return error status
          expect(updateResponse.status).toBeGreaterThanOrEqual(400);
          expect(updateResponse.status).toBeLessThan(500);
          expect(updateResponse.body.status).toBe('error');
          
          // Should provide error message
          expect(updateResponse.body.message).toBeDefined();
          expect(typeof updateResponse.body.message).toBe('string');
          expect(updateResponse.body.message.length).toBeGreaterThan(0);
          
          // Verify product was not modified in database
          const unchangedProduct = await Product.findById(validProduct._id);
          expect(unchangedProduct.name).toBe('Test Product');
          expect(unchangedProduct.price).toBe(10.99);
          expect(unchangedProduct.inventory.stock).toBe(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('bulk update with invalid data consistently returns validation errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        categoryGenerator(),
        fc.array(fc.constant(null), { minLength: 2, maxLength: 5 }),
        invalidUpdateGenerator(),
        async (adminData, categoryData, productCount, invalidBulkUpdate) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user and category
          const admin = await User.create(adminData);
          const category = await Category.create(categoryData);
          const token = generateValidToken(admin._id);
          
          // Create multiple valid products
          const products = [];
          for (let i = 0; i < productCount.length; i++) {
            const product = await Product.create({
              name: `Test Product ${i}`,
              description: `Test Description ${i}`,
              price: 10.99 + i,
              category: category._id,
              inventory: { stock: 100 + i }
            });
            products.push(product);
          }
          
          const productIds = products.map(p => p._id);
          
          // Attempt bulk update with invalid data
          const bulkUpdateResponse = await request(app)
            .put('/api/admin/products/bulk-update')
            .set('Authorization', `Bearer ${token}`)
            .set('X-Admin-Confirmation', 'confirmed')
            .send({
              productIds,
              updates: invalidBulkUpdate
            });
          
          // Should return error status
          expect(bulkUpdateResponse.status).toBeGreaterThanOrEqual(400);
          expect(bulkUpdateResponse.status).toBeLessThan(500);
          expect(bulkUpdateResponse.body.status).toBe('error');
          
          // Should provide error message
          expect(bulkUpdateResponse.body.message).toBeDefined();
          expect(typeof bulkUpdateResponse.body.message).toBe('string');
          expect(bulkUpdateResponse.body.message.length).toBeGreaterThan(0);
          
          // Verify no products were modified in database
          for (let i = 0; i < products.length; i++) {
            const unchangedProduct = await Product.findById(products[i]._id);
            expect(unchangedProduct.name).toBe(`Test Product ${i}`);
            expect(unchangedProduct.price).toBe(10.99 + i);
            expect(unchangedProduct.inventory.stock).toBe(100 + i);
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  test('validation errors are consistent across different invalid input types', async () => {
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
          
          // Test various invalid scenarios
          const invalidScenarios = [
            // Missing name
            { description: 'Test', price: 10, category: category._id },
            // Missing description
            { name: 'Test', price: 10, category: category._id },
            // Missing price
            { name: 'Test', description: 'Test', category: category._id },
            // Missing category
            { name: 'Test', description: 'Test', price: 10 },
            // Invalid price (zero)
            { name: 'Test', description: 'Test', price: 0, category: category._id },
            // Invalid price (negative)
            { name: 'Test', description: 'Test', price: -10, category: category._id },
            // Invalid inventory stock (negative)
            { name: 'Test', description: 'Test', price: 10, category: category._id, inventory: { stock: -5 } }
          ];
          
          for (const invalidData of invalidScenarios) {
            const response = await request(app)
              .post('/api/admin/products')
              .set('Authorization', `Bearer ${token}`)
              .send(invalidData);
            
            // All invalid scenarios should return error status
            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBeDefined();
            expect(typeof response.body.message).toBe('string');
            expect(response.body.message.length).toBeGreaterThan(0);
          }
          
          // Verify no products were created
          const productCount = await Product.countDocuments();
          expect(productCount).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  });
});