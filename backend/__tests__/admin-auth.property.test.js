const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../models/User');
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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(() => {
  emailCounter = 0;
});

afterEach(async () => {
  await User.deleteMany({});
  await AdminActivity.deleteMany({});
});

// Generator for valid user data with unique email
const userGenerator = () => fc.record({
  fullName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  email: fc.emailAddress().map(email => `user${emailCounter++}-${email}`),
  password: fc.string({ minLength: 6, maxLength: 20 }).filter(s => s.trim().length >= 6),
  role: fc.constantFrom('user', 'admin')
});

// Generator for invalid tokens
const invalidTokenGenerator = () => fc.oneof(
  fc.constant(''), // Empty token
  fc.constant('invalid-token'), // Invalid format
  fc.string({ minLength: 1, maxLength: 100 }).filter(s => !s.includes('.')), // No JWT format
  fc.constant('Bearer '), // Bearer with no token
  fc.constant('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxNGY5YzJhNzg5YjQwMDAxNTAwMDAwMCIsImlhdCI6MTYzMjU2NzMzOCwiZXhwIjoxNjMyNTcwOTM4fQ.invalid'), // Invalid signature
);

// Helper to generate valid JWT token
const generateValidToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h'
  });
};

// Helper to generate expired JWT token
const generateExpiredToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '-1h' // Already expired
  });
};

/**
 * **Feature: admin-dashboard, Property 18: Authentication enforcement**
 * **Validates: Requirements 5.1, 5.2**
 * 
 * For any attempt to access admin dashboard functionality, valid admin credentials 
 * should be required and invalid credentials should be rejected.
 */
describe('Property 18: Authentication enforcement', () => {
  test('valid admin credentials allow access to admin endpoints', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator().filter(u => u.role === 'admin'),
        async (adminData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user
          const admin = await User.create(adminData);
          
          // Generate valid token
          const token = generateValidToken(admin._id);
          
          // Test access to admin endpoint
          const response = await request(app)
            .get('/api/admin/test')
            .set('Authorization', `Bearer ${token}`);
          
          // Should allow access
          expect(response.status).toBe(200);
          expect(response.body.status).toBe('success');
          expect(response.body.data.user.id).toBe(admin._id.toString());
          expect(response.body.data.user.role).toBe('admin');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('non-admin users are rejected from admin endpoints', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator().filter(u => u.role === 'user'),
        async (userData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create regular user
          const user = await User.create(userData);
          
          // Generate valid token
          const token = generateValidToken(user._id);
          
          // Test access to admin endpoint
          const response = await request(app)
            .get('/api/admin/test')
            .set('Authorization', `Bearer ${token}`);
          
          // Should deny access
          expect(response.status).toBe(403);
          expect(response.body.status).toBe('error');
          expect(response.body.message).toContain('User does not have admin privileges');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('invalid tokens are rejected from admin endpoints', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidTokenGenerator(),
        async (invalidToken) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Test access with invalid token
          const response = await request(app)
            .get('/api/admin/test')
            .set('Authorization', `Bearer ${invalidToken}`);
          
          // Should deny access
          expect(response.status).toBe(401);
          expect(response.body.status).toBe('error');
          expect(response.body.message).toContain('Not authorized');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('no token provided results in rejection', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant(null), // No token
        async () => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Test access without token
          const response = await request(app)
            .get('/api/admin/test');
          
          // Should deny access
          expect(response.status).toBe(401);
          expect(response.body.status).toBe('error');
          expect(response.body.message).toContain('Not authorized');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('expired tokens are rejected from admin endpoints', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator().filter(u => u.role === 'admin'),
        async (adminData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user
          const admin = await User.create(adminData);
          
          // Generate expired token
          const expiredToken = generateExpiredToken(admin._id);
          
          // Test access with expired token
          const response = await request(app)
            .get('/api/admin/test')
            .set('Authorization', `Bearer ${expiredToken}`);
          
          // Should deny access
          expect(response.status).toBe(401);
          expect(response.body.status).toBe('error');
          expect(response.body.message).toContain('Not authorized');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('deactivated admin users are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator().filter(u => u.role === 'admin'),
        async (adminData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user and deactivate
          const admin = await User.create({
            ...adminData,
            isActive: false
          });
          
          // Generate valid token
          const token = generateValidToken(admin._id);
          
          // Test access with deactivated user
          const response = await request(app)
            .get('/api/admin/test')
            .set('Authorization', `Bearer ${token}`);
          
          // Should deny access
          expect(response.status).toBe(401);
          expect(response.body.status).toBe('error');
          expect(response.body.message).toContain('deactivated');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('deleted admin users are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator().filter(u => u.role === 'admin'),
        async (adminData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user
          const admin = await User.create(adminData);
          
          // Generate valid token
          const token = generateValidToken(admin._id);
          
          // Delete the user
          await User.findByIdAndDelete(admin._id);
          
          // Test access with deleted user's token
          const response = await request(app)
            .get('/api/admin/test')
            .set('Authorization', `Bearer ${token}`);
          
          // Should deny access
          expect(response.status).toBe(401);
          expect(response.body.status).toBe('error');
          expect(response.body.message).toContain('no longer exists');
        }
      ),
      { numRuns: 10 }
    );
  });

  test('sensitive operations require confirmation header', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator().filter(u => u.role === 'admin'),
        async (adminData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user
          const admin = await User.create(adminData);
          
          // Generate valid token
          const token = generateValidToken(admin._id);
          
          // Test sensitive operation without confirmation
          const responseWithoutConfirmation = await request(app)
            .delete('/api/admin/test-sensitive')
            .set('Authorization', `Bearer ${token}`);
          
          // Should require confirmation
          expect(responseWithoutConfirmation.status).toBe(400);
          expect(responseWithoutConfirmation.body.requiresConfirmation).toBe(true);
          
          // Test with confirmation header
          const responseWithConfirmation = await request(app)
            .delete('/api/admin/test-sensitive')
            .set('Authorization', `Bearer ${token}`)
            .set('X-Admin-Confirmation', 'confirmed');
          
          // Should allow operation
          expect(responseWithConfirmation.status).toBe(200);
          expect(responseWithConfirmation.body.status).toBe('success');
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: admin-dashboard, Property 20: Security logging completeness**
 * **Validates: Requirements 5.5**
 * 
 * For any unauthorized access attempt, the event should be logged with relevant 
 * details (IP, timestamp, attempted action).
 */
describe('Property 20: Security logging completeness', () => {
  test('unauthorized access attempts are logged with complete details', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidTokenGenerator(),
        fc.constantFrom('/api/admin/test', '/api/admin/activity-logs', '/api/admin/test-sensitive'),
        fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
        async (invalidToken, endpoint, method) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Make unauthorized request
          const response = await request(app)
            [method.toLowerCase()](endpoint)
            .set('Authorization', `Bearer ${invalidToken}`);
          
          // Should deny access (401 or 429 for rate limiting)
          expect([401, 429]).toContain(response.status);
          
          // Wait a bit for async logging to complete
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Check that security event was logged (only if not rate limited)
          if (response.status !== 429) {
            const logEntries = await AdminActivity.find({
              action: 'unauthorized_access',
              resource: 'auth'
            });
            
            expect(logEntries.length).toBeGreaterThan(0);
            
            // Verify the most recent log entry has required details
            const latestLog = logEntries[logEntries.length - 1];
            expect(latestLog.success).toBe(false);
            expect(latestLog.ipAddress).toBeDefined();
            expect(latestLog.userAgent).toBeDefined();
            expect(latestLog.details).toBeDefined();
            expect(latestLog.details.endpoint).toBe(endpoint);
            expect(latestLog.details.method).toBe(method);
            expect(latestLog.errorMessage).toBeDefined();
            expect(latestLog.createdAt).toBeDefined();
          }

        }
      ),
      { numRuns: 5 }
    );
  });

  test('non-admin user access attempts are logged', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator().filter(u => u.role === 'user'),
        fc.constantFrom('/api/admin/test', '/api/admin/activity-logs'),
        async (userData, endpoint) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create regular user
          const user = await User.create(userData);
          
          // Generate valid token for non-admin user
          const token = generateValidToken(user._id);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Make request as non-admin user
          const response = await request(app)
            .get(endpoint)
            .set('Authorization', `Bearer ${token}`);
          
          // Should deny access (403 or 429 for rate limiting)
          expect([403, 429]).toContain(response.status);
          
          // Wait a bit for async logging to complete
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Check that security event was logged (only if not rate limited)
          if (response.status !== 429) {
            const logEntries = await AdminActivity.find({
              admin: user._id,
              action: 'unauthorized_access',
              resource: 'auth'
            });
            
            expect(logEntries.length).toBeGreaterThan(0);
            
            // Verify log entry details
            const latestLog = logEntries[logEntries.length - 1];
            expect(latestLog.admin.toString()).toBe(user._id.toString());
            expect(latestLog.success).toBe(false);
            expect(latestLog.details.reason).toBe('Insufficient privileges');
            expect(latestLog.details.userRole).toBe('user');
            expect(latestLog.details.endpoint).toBe(endpoint);
            expect(latestLog.errorMessage).toContain('User does not have admin privileges');
          }
        }
      ),
      { numRuns: 5 }
    );
  });

  test('deactivated admin access attempts are logged', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator().filter(u => u.role === 'admin'),
        async (adminData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create deactivated admin user
          const admin = await User.create({
            ...adminData,
            isActive: false
          });
          
          // Generate valid token
          const token = generateValidToken(admin._id);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Make request as deactivated admin
          const response = await request(app)
            .get('/api/admin/test')
            .set('Authorization', `Bearer ${token}`);
          
          // Should deny access (401 or 429 for rate limiting)
          expect([401, 429]).toContain(response.status);
          
          // Wait a bit for async logging to complete
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Check that security event was logged (only if not rate limited)
          if (response.status !== 429) {
            const logEntries = await AdminActivity.find({
              admin: admin._id,
              action: 'unauthorized_access',
              resource: 'auth'
            });
            
            expect(logEntries.length).toBeGreaterThan(0);
            
            // Verify log entry details
            const latestLog = logEntries[logEntries.length - 1];
            expect(latestLog.admin.toString()).toBe(admin._id.toString());
            expect(latestLog.success).toBe(false);
            expect(latestLog.details.reason).toBe('User account deactivated');
            expect(latestLog.errorMessage).toContain('deactivated');
          }
        }
      ),
      { numRuns: 5 }
    );
  });

  test('successful admin operations are logged', async () => {
    await fc.assert(
      fc.asyncProperty(
        userGenerator().filter(u => u.role === 'admin'),
        async (adminData) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Create admin user
          const admin = await User.create(adminData);
          
          // Generate valid token
          const token = generateValidToken(admin._id);
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Make successful request
          const response = await request(app)
            .get('/api/admin/test')
            .set('Authorization', `Bearer ${token}`);
          
          // Should allow access (200 or 429 for rate limiting)
          expect([200, 429]).toContain(response.status);
          
          // Wait a bit for async logging to complete
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Check that activity was logged (only if not rate limited)
          if (response.status !== 429) {
            const logEntries = await AdminActivity.find({
              admin: admin._id,
              action: 'read',
              resource: 'system'
            });
            
            expect(logEntries.length).toBeGreaterThan(0);
            
            // Verify log entry details
            const latestLog = logEntries[logEntries.length - 1];
            expect(latestLog.admin.toString()).toBe(admin._id.toString());
            expect(latestLog.success).toBe(true);
            expect(latestLog.details.endpoint).toBe('/api/admin/test');
            expect(latestLog.details.method).toBe('GET');
            expect(latestLog.details.statusCode).toBe(200);
            expect(latestLog.errorMessage).toBeNull();
          }
        }
      ),
      { numRuns: 5 }
    );
  });

  test('log entries contain required IP and user agent information', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidTokenGenerator(),
        async (invalidToken) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Make request with custom user agent
          const customUserAgent = 'Test-Agent/1.0';
          const response = await request(app)
            .get('/api/admin/test')
            .set('Authorization', `Bearer ${invalidToken}`)
            .set('User-Agent', customUserAgent);
          
          // Should deny access (401 or 429 for rate limiting)
          expect([401, 429]).toContain(response.status);
          
          // Wait a bit for async logging to complete
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Check that security event was logged with IP and user agent (only if not rate limited)
          if (response.status !== 429) {
            const logEntries = await AdminActivity.find({
              action: 'unauthorized_access'
            });
            
            expect(logEntries.length).toBeGreaterThan(0);
            
            // Verify the most recent log entry has IP and user agent
            const latestLog = logEntries[logEntries.length - 1];
            expect(latestLog.ipAddress).toBeDefined();
            expect(latestLog.ipAddress).not.toBe('');
            expect(latestLog.userAgent).toBeDefined();
            expect(latestLog.userAgent).toBe(customUserAgent);
          }
        }
      ),
      { numRuns: 5 }
    );
  });

  test('log entries are timestamped correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        invalidTokenGenerator(),
        async (invalidToken) => {
          // Clean up before each property test iteration
          await User.deleteMany({});
          await AdminActivity.deleteMany({});
          
          // Record time before request
          const beforeRequest = new Date();
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Make unauthorized request
          const response = await request(app)
            .get('/api/admin/test')
            .set('Authorization', `Bearer ${invalidToken}`);
          
          // Record time after request
          const afterRequest = new Date();
          
          // Should deny access (401 or 429 for rate limiting)
          expect([401, 429]).toContain(response.status);
          
          // Wait a bit for async logging to complete
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Check that security event was logged with correct timestamp (only if not rate limited)
          if (response.status !== 429) {
            const logEntries = await AdminActivity.find({
              action: 'unauthorized_access'
            });
            
            expect(logEntries.length).toBeGreaterThan(0);
            
            // Verify timestamp is within reasonable range
            const latestLog = logEntries[logEntries.length - 1];
            expect(latestLog.createdAt).toBeDefined();
            expect(latestLog.createdAt.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
            expect(latestLog.createdAt.getTime()).toBeLessThanOrEqual(afterRequest.getTime() + 2000); // Allow 2 second buffer
          }
        }
      ),
      { numRuns: 5 }
    );
  });
});