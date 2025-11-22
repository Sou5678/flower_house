const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');

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
  await Order.deleteMany({});
});

// Generator for valid admin user
const adminUserGenerator = () => fc.record({
  fullName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  email: fc.emailAddress().map(email => `admin${emailCounter++}-${email}`),
  password: fc.string({ minLength: 6, maxLength: 20 }).filter(s => s.trim().length >= 6),
  role: fc.constant('admin')
});

// Generator for valid customer user
const customerUserGenerator = () => fc.record({
  fullName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  email: fc.emailAddress().map(email => `customer${emailCounter++}-${email}`),
  password: fc.string({ minLength: 6, maxLength: 20 }).filter(s => s.trim().length >= 6),
  role: fc.constant('user')
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
  price: fc.float({ min: Math.fround(0.01), max: Math.fround(1000) }).map(p => Math.round(p * 100) / 100),
  category: fc.constant(categoryId),
  inventory: fc.record({
    stock: fc.integer({ min: 10, max: 1000 }),
    lowStockThreshold: fc.integer({ min: 1, max: 50 }),
    isAvailable: fc.constant(true)
  })
});

// Generator for valid order data
const orderGenerator = (userId, products) => fc.record({
  user: fc.constant(userId),
  items: fc.array(
    fc.record({
      product: fc.constantFrom(...products.map(p => p._id)),
      name: fc.constantFrom(...products.map(p => p.name)),
      price: fc.constantFrom(...products.map(p => p.price)),
      quantity: fc.integer({ min: 1, max: 5 })
    }),
    { minLength: 1, maxLength: 3 }
  ),
  shippingAddress: fc.record({
    fullName: fc.string({ minLength: 1, maxLength: 50 }),
    street: fc.string({ minLength: 1, maxLength: 100 }),
    city: fc.string({ minLength: 1, maxLength: 50 }),
    state: fc.string({ minLength: 2, maxLength: 50 }),
    zipCode: fc.string({ minLength: 5, maxLength: 10 }),
    country: fc.constant('United States')
  }),
  paymentInfo: fc.record({
    method: fc.constantFrom('card', 'paypal'),
    status: fc.constantFrom('completed')
  }),
  status: fc.constantFrom('confirmed', 'processing', 'shipped', 'delivered'),
  shippingFee: fc.float({ min: 0, max: 50 }).map(p => Math.round(p * 100) / 100),
  tax: fc.float({ min: 0, max: 100 }).map(p => Math.round(p * 100) / 100),
  discount: fc.float({ min: 0, max: 50 }).map(p => Math.round(p * 100) / 100)
}).map(orderData => {
  // Calculate subtotal and total
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + orderData.shippingFee + orderData.tax - orderData.discount;
  
  return {
    ...orderData,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100
  };
});

// Helper to generate valid JWT token
const generateValidToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h'
  });
};

/**
 * **Feature: admin-dashboard, Property 13: Revenue calculation accuracy**
 * **Validates: Requirements 4.1**
 * 
 * For any time period selected for sales analysis, the displayed revenue should equal 
 * the sum of all completed order totals within that period.
 */
describe('Property 13: Revenue calculation accuracy', () => {
  test('revenue calculation matches sum of completed order totals for any time period', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        categoryGenerator(),
        fc.array(customerUserGenerator(), { minLength: 1, maxLength: 3 }),
        fc.array(fc.constant(null), { minLength: 2, maxLength: 5 }), // For product count
        fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') }),
        fc.date({ min: new Date('2023-01-01'), max: new Date('2024-12-31') }),
        async (adminData, categoryData, customerDataArray, productCount, date1, date2) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await Order.deleteMany({});
          
          // Ensure proper date range
          const startDate = date1 < date2 ? date1 : date2;
          const endDate = date1 < date2 ? date2 : date1;
          
          // Create admin user, category, and customers
          const admin = await User.create(adminData);
          const category = await Category.create(categoryData);
          const customers = await Promise.all(customerDataArray.map(data => User.create(data)));
          const token = generateValidToken(admin._id);
          
          // Create products
          const products = [];
          for (let i = 0; i < productCount.length; i++) {
            const productData = await fc.sample(productGenerator(category._id), 1)[0];
            const product = await Product.create(productData);
            products.push(product);
          }
          
          // Create orders with different dates and statuses
          const orders = [];
          const completedOrderTotals = [];
          
          for (const customer of customers) {
            // Create orders within the date range
            const orderData = await fc.sample(orderGenerator(customer._id, products), 1)[0];
            
            // Set random date within range
            const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
            
            const order = await Order.create({
              ...orderData,
              createdAt: randomDate
            });
            orders.push(order);
            
            // Only count completed orders (not cancelled or pending)
            if (!['cancelled', 'pending'].includes(order.status)) {
              completedOrderTotals.push(order.total);
            }
            
            // Create some orders outside the date range to test filtering
            if (Math.random() > 0.5) {
              const outsideOrderData = await fc.sample(orderGenerator(customer._id, products), 1)[0];
              const outsideDate = Math.random() > 0.5 
                ? new Date(startDate.getTime() - 24 * 60 * 60 * 1000) // Before range
                : new Date(endDate.getTime() + 24 * 60 * 60 * 1000);   // After range
              
              await Order.create({
                ...outsideOrderData,
                createdAt: outsideDate
              });
            }
          }
          
          // Calculate expected revenue (sum of completed orders in date range)
          const expectedRevenue = completedOrderTotals.reduce((sum, total) => sum + total, 0);
          
          // Get analytics via API
          const analyticsResponse = await request(app)
            .get('/api/admin/analytics/sales')
            .query({
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString()
            })
            .set('Authorization', `Bearer ${token}`);
          
          expect(analyticsResponse.status).toBe(200);
          expect(analyticsResponse.body.status).toBe('success');
          
          const metrics = analyticsResponse.body.data.metrics;
          
          // Verify revenue calculation accuracy (allowing for floating point precision)
          expect(Math.round(metrics.totalRevenue * 100) / 100).toBe(Math.round(expectedRevenue * 100) / 100);
          
          // Verify order count matches completed orders
          const expectedOrderCount = orders.filter(order => !['cancelled', 'pending'].includes(order.status)).length;
          expect(metrics.totalOrders).toBe(expectedOrderCount);
          
          // Verify average order value calculation
          if (expectedOrderCount > 0) {
            const expectedAverageOrderValue = expectedRevenue / expectedOrderCount;
            expect(Math.round(metrics.averageOrderValue * 100) / 100).toBe(Math.round(expectedAverageOrderValue * 100) / 100);
          } else {
            expect(metrics.averageOrderValue).toBe(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('revenue calculation excludes cancelled and pending orders', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        categoryGenerator(),
        customerUserGenerator(),
        async (adminData, categoryData, customerData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await Order.deleteMany({});
          
          // Create admin user, category, customer, and product
          const admin = await User.create(adminData);
          const category = await Category.create(categoryData);
          const customer = await User.create(customerData);
          const token = generateValidToken(admin._id);
          
          const productData = await fc.sample(productGenerator(category._id), 1)[0];
          const product = await Product.create(productData);
          
          // Create orders with different statuses
          const completedOrderData = await fc.sample(orderGenerator(customer._id, [product]), 1)[0];
          const cancelledOrderData = await fc.sample(orderGenerator(customer._id, [product]), 1)[0];
          const pendingOrderData = await fc.sample(orderGenerator(customer._id, [product]), 1)[0];
          
          const completedOrder = await Order.create({
            ...completedOrderData,
            status: 'delivered'
          });
          
          const cancelledOrder = await Order.create({
            ...cancelledOrderData,
            status: 'cancelled'
          });
          
          const pendingOrder = await Order.create({
            ...pendingOrderData,
            status: 'pending'
          });
          
          // Get analytics via API
          const analyticsResponse = await request(app)
            .get('/api/admin/analytics/sales')
            .set('Authorization', `Bearer ${token}`);
          
          expect(analyticsResponse.status).toBe(200);
          expect(analyticsResponse.body.status).toBe('success');
          
          const metrics = analyticsResponse.body.data.metrics;
          
          // Revenue should only include completed order
          expect(Math.round(metrics.totalRevenue * 100) / 100).toBe(Math.round(completedOrder.total * 100) / 100);
          expect(metrics.totalOrders).toBe(1);
          expect(Math.round(metrics.averageOrderValue * 100) / 100).toBe(Math.round(completedOrder.total * 100) / 100);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('revenue calculation handles empty result sets correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        adminUserGenerator(),
        async (adminData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await Product.deleteMany({});
          await Category.deleteMany({});
          await Order.deleteMany({});
          
          // Create admin user only (no orders)
          const admin = await User.create(adminData);
          const token = generateValidToken(admin._id);
          
          // Get analytics via API
          const analyticsResponse = await request(app)
            .get('/api/admin/analytics/sales')
            .set('Authorization', `Bearer ${token}`);
          
          expect(analyticsResponse.status).toBe(200);
          expect(analyticsResponse.body.status).toBe('success');
          
          const metrics = analyticsResponse.body.data.metrics;
          
          // All metrics should be zero when no orders exist
          expect(metrics.totalRevenue).toBe(0);
          expect(metrics.totalOrders).toBe(0);
          expect(metrics.averageOrderValue).toBe(0);
          expect(metrics.totalShipping).toBe(0);
          expect(metrics.totalTax).toBe(0);
          expect(metrics.totalSubtotal).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });
});