# Amour Florals Backend System Design & Enhancement Prompt

## Project Overview
Design and enhance the backend architecture for "Amour Florals" - a Node.js/Express e-commerce API with MongoDB. Focus on completing missing features, optimizing existing implementations, and adding advanced functionality for a production-ready flower shop platform.

## Current Backend Architecture

### Tech Stack
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Security**: Helmet, CORS, rate limiting, HPP protection
- **File Storage**: Cloudinary integration for image management
- **Email**: Nodemailer for transactional emails
- **Testing**: Jest with Supertest for API testing

### Existing Implementation Status

#### ✅ **Completed Features**
1. **Authentication System** (`/api/auth`)
   - User registration with email validation
   - Login with JWT token generation
   - Password reset with email tokens
   - Profile management (update details/password)
   - Logout functionality

2. **Product Management** (`/api/products`)
   - CRUD operations for products
   - Advanced search with filters (occasion, flower type, color, price)
   - Featured and popular product endpoints
   - Category-based filtering
   - Pagination and sorting

3. **Cart System** (`/api/cart`)
   - Add/remove/update cart items
   - Stock validation
   - Cart persistence per user
   - Price calculations with customizations

4. **Order Management** (`/api/orders`)
   - Order creation with stock updates
   - Order history and tracking
   - Status updates (admin)
   - Order cancellation with stock restoration

5. **User Favorites** (`/api/users/favorites`)
   - Add/remove products from wishlist
   - Wishlist retrieval with populated product data

6. **Basic Wishlist** (`/api/wishlist`)
   - Atomic move from wishlist to cart
   - Bulk operations support

## Missing Features & Enhancements Needed

### 🔧 **Critical Missing Features**

#### 1. **Advanced Wishlist Operations**
```javascript
// Missing bulk operations endpoints
POST   /api/wishlist/bulk/add           - Bulk add multiple products
DELETE /api/wishlist/bulk/remove        - Bulk remove with progress tracking
POST   /api/wishlist/bulk/move-to-cart  - Bulk atomic move to cart
GET    /api/wishlist/shared/:token      - Shareable wishlist links
```

#### 2. **Payment Integration**
```javascript
// Stripe payment processing
POST   /api/payments/create-intent      - Create Stripe payment intent
POST   /api/payments/confirm            - Confirm payment
POST   /api/payments/webhook            - Handle Stripe webhooks
GET    /api/payments/methods            - Get saved payment methods
POST   /api/payments/methods            - Save payment method
```

#### 3. **Advanced Product Features**
```javascript
// Product reviews and ratings
POST   /api/products/:id/reviews        - Add product review
GET    /api/products/:id/reviews        - Get product reviews
PUT    /api/reviews/:id                 - Update review (owner only)
DELETE /api/reviews/:id                 - Delete review (owner/admin)

// Product recommendations
GET    /api/products/:id/related        - Get related products
GET    /api/products/recommendations    - Personalized recommendations
GET    /api/products/trending           - Trending products
```

#### 4. **Inventory Management**
```javascript
// Stock management
PUT    /api/products/:id/stock          - Update stock levels (admin)
GET    /api/inventory/low-stock         - Get low stock alerts
POST   /api/inventory/restock           - Restock notification
GET    /api/inventory/reports           - Inventory reports
```

#### 5. **Advanced Order Features**
```javascript
// Order tracking and notifications
GET    /api/orders/:id/tracking         - Real-time order tracking
POST   /api/orders/:id/notifications    - Send order updates
PUT    /api/orders/:id/delivery         - Update delivery status
GET    /api/orders/analytics            - Order analytics (admin)
```

### 🚀 **Advanced Features to Implement**

#### 1. **Promo Code System**
```javascript
// Discount and promo management
POST   /api/promos                      - Create promo code (admin)
GET    /api/promos/validate/:code       - Validate promo code
POST   /api/cart/apply-promo            - Apply promo to cart
DELETE /api/cart/remove-promo           - Remove promo from cart
GET    /api/promos/user-eligible        - Get user-eligible promos
```

#### 2. **Notification System**
```javascript
// Email and SMS notifications
POST   /api/notifications/email         - Send custom email
POST   /api/notifications/sms           - Send SMS notification
GET    /api/notifications/templates     - Get email templates
POST   /api/notifications/bulk          - Bulk notification sending
GET    /api/notifications/history       - Notification history
```

#### 3. **Analytics & Reporting**
```javascript
// Business intelligence
GET    /api/analytics/sales             - Sales analytics
GET    /api/analytics/products          - Product performance
GET    /api/analytics/users             - User behavior analytics
GET    /api/analytics/revenue           - Revenue reports
GET    /api/analytics/dashboard         - Admin dashboard data
```

#### 4. **Search & Recommendations**
```javascript
// Advanced search features
GET    /api/search/autocomplete         - Search suggestions
POST   /api/search/save                 - Save search query
GET    /api/search/popular              - Popular searches
GET    /api/search/history              - User search history
POST   /api/recommendations/train       - Train recommendation model
```

## Enhanced Database Schema

### **Extended User Model**
```javascript
{
  // Existing fields...
  preferences: {
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    newsletter: Boolean,
    favoriteOccasions: [String],
    priceRange: { min: Number, max: Number }
  },
  loyaltyPoints: { type: Number, default: 0 },
  membershipTier: { type: String, enum: ['bronze', 'silver', 'gold'], default: 'bronze' },
  searchHistory: [{ query: String, timestamp: Date }],
  lastActiveAt: Date,
  deviceInfo: [{ deviceId: String, lastUsed: Date, platform: String }]
}
```

### **New Models to Implement**

#### **PromoCode Model**
```javascript
{
  code: { type: String, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'fixed', 'shipping'] },
  value: Number,
  minOrderAmount: Number,
  maxDiscount: Number,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  validFrom: Date,
  validUntil: Date,
  applicableCategories: [ObjectId],
  isActive: { type: Boolean, default: true },
  createdBy: ObjectId
}
```

#### **Review Model**
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  product: { type: ObjectId, ref: 'Product', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: String,
  comment: String,
  images: [String],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  reportedCount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}
```

#### **Notification Model**
```javascript
{
  user: { type: ObjectId, ref: 'User' },
  type: { type: String, enum: ['email', 'sms', 'push'] },
  template: String,
  subject: String,
  content: String,
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  sentAt: Date,
  metadata: Object,
  retryCount: { type: Number, default: 0 }
}
```

## API Enhancements & New Endpoints

### **Bulk Operations with Progress Tracking**
```javascript
// Enhanced wishlist bulk operations
POST /api/wishlist/bulk/operations
{
  "action": "move-to-cart", // or "remove"
  "productIds": ["id1", "id2", "id3"],
  "options": { "quantity": 1, "size": "standard" }
}

Response: {
  "status": "success",
  "data": {
    "operationId": "bulk-op-123",
    "successful": ["id1", "id2"],
    "failed": [{ "id": "id3", "reason": "Out of stock" }],
    "progress": { "completed": 2, "total": 3, "percentage": 67 }
  }
}
```

### **Real-time Features**
```javascript
// WebSocket endpoints for real-time updates
GET /api/realtime/order-status/:orderId  - Real-time order tracking
GET /api/realtime/stock-updates          - Live stock updates
GET /api/realtime/cart-sync              - Cross-device cart sync
```

### **Advanced Search & Filtering**
```javascript
// Enhanced product search
GET /api/products/search/advanced
Query params: {
  q: "roses",
  filters: {
    occasion: ["birthday", "anniversary"],
    priceRange: { min: 50, max: 200 },
    availability: "in-stock",
    rating: { min: 4 },
    location: "nearby"
  },
  sort: "relevance",
  facets: true
}
```

## Security Enhancements

### **Advanced Authentication**
```javascript
// Multi-factor authentication
POST   /api/auth/mfa/setup              - Setup 2FA
POST   /api/auth/mfa/verify             - Verify 2FA token
POST   /api/auth/mfa/disable            - Disable 2FA

// Session management
GET    /api/auth/sessions               - Get active sessions
DELETE /api/auth/sessions/:id           - Revoke specific session
DELETE /api/auth/sessions/all           - Revoke all sessions
```

### **API Security Features**
- Rate limiting per user/IP with Redis
- Request signing for sensitive operations
- API key management for third-party integrations
- Audit logging for all admin operations
- Data encryption for PII fields

## Performance Optimizations

### **Caching Strategy**
```javascript
// Redis caching implementation
- Product catalog caching (30 minutes)
- User session caching (24 hours)
- Search results caching (15 minutes)
- Cart data caching (1 hour)
- Category tree caching (6 hours)
```

### **Database Optimizations**
```javascript
// Enhanced indexing strategy
- Compound indexes for search queries
- Text indexes for full-text search
- Geospatial indexes for location-based features
- TTL indexes for temporary data
- Partial indexes for conditional queries
```

### **API Response Optimization**
```javascript
// Response enhancement features
- Field selection (?fields=name,price,images)
- Response compression (gzip/brotli)
- Pagination with cursor-based navigation
- Batch API requests
- GraphQL-style field selection
```

## Monitoring & Observability

### **Logging & Metrics**
```javascript
// Comprehensive logging
- Structured JSON logging with Winston
- Request/response logging with correlation IDs
- Performance metrics collection
- Error tracking with stack traces
- Business metrics (sales, conversions)
```

### **Health Checks & Monitoring**
```javascript
GET /api/health/detailed              - Comprehensive health check
GET /api/metrics/prometheus           - Prometheus metrics endpoint
GET /api/status/dependencies          - External service status
```

## Deployment & DevOps

### **Environment Configuration**
```javascript
// Multi-environment setup
- Development (local MongoDB, mock payments)
- Staging (Atlas MongoDB, Stripe test mode)
- Production (Atlas MongoDB, Stripe live mode)
- Testing (In-memory MongoDB, mock services)
```

### **CI/CD Pipeline Requirements**
```javascript
// Automated deployment pipeline
1. Code quality checks (ESLint, Prettier)
2. Security scanning (npm audit, Snyk)
3. Unit and integration tests
4. Database migration scripts
5. Environment-specific deployments
6. Health check verification
7. Rollback capabilities
```

## Implementation Priority

### **Phase 1: Core Enhancements (Weeks 1-2)**
1. Complete bulk wishlist operations with progress tracking
2. Implement comprehensive error handling and logging
3. Add product reviews and ratings system
4. Enhance cart with promo code support

### **Phase 2: Payment & Orders (Weeks 3-4)**
1. Integrate Stripe payment processing
2. Implement order tracking and notifications
3. Add inventory management features
4. Create admin analytics dashboard

### **Phase 3: Advanced Features (Weeks 5-6)**
1. Build recommendation engine
2. Implement real-time features with WebSockets
3. Add advanced search with faceted filtering
4. Create notification system

### **Phase 4: Optimization & Security (Weeks 7-8)**
1. Implement Redis caching layer
2. Add comprehensive monitoring and metrics
3. Enhance security with 2FA and audit logs
4. Performance optimization and load testing

## API Documentation Requirements

Create comprehensive API documentation including:
- OpenAPI 3.0 specification
- Interactive API explorer (Swagger UI)
- Code examples in multiple languages
- Authentication flow diagrams
- Error code reference
- Rate limiting documentation
- Webhook documentation for payments

## Testing Strategy

### **Test Coverage Requirements**
```javascript
// Comprehensive testing approach
- Unit tests for all controllers (>90% coverage)
- Integration tests for API endpoints
- Database transaction testing
- Authentication and authorization tests
- Performance and load testing
- Security penetration testing
```

Generate a detailed backend architecture document with API specifications, database schemas, implementation guidelines, security best practices, and deployment strategies for this production-ready e-commerce platform.