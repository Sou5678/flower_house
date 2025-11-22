# Amour Florals - Complete Database Structure

## Database Overview
**Database Type**: MongoDB (NoSQL Document Database)  
**ODM**: Mongoose for Node.js  
**Current Collections**: 5 main collections with relationships  
**Missing Collections**: 8 additional collections needed for complete functionality

---

## 🗂️ Current Database Collections

### 1. **Users Collection** (`users`)
**Purpose**: Store user account information, preferences, and authentication data

```javascript
{
  _id: ObjectId,
  fullName: String (required, max: 50),
  email: String (required, unique, validated),
  password: String (required, hashed, min: 6),
  phone: String (optional, validated),
  birthday: String,
  avatar: String (URL),
  role: String (enum: ['user', 'admin'], default: 'user'),
  
  // Address Management
  addresses: [{
    _id: ObjectId (auto-generated),
    type: String (enum: ['home', 'work', 'other']),
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String (default: 'United States'),
    isDefault: Boolean
  }],
  
  // Wishlist/Favorites
  favorites: [ObjectId] (ref: 'Product'),
  
  // User Preferences
  preferences: {
    emailNotifications: Boolean (default: true),
    smsNotifications: Boolean (default: false),
    newsletter: Boolean (default: true)
  },
  
  // Account Status
  isActive: Boolean (default: true),
  lastLogin: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ email: 1 }` - Unique index for login
- `{ createdAt: -1 }` - For user registration analytics

---

### 2. **Products Collection** (`products`)
**Purpose**: Store flower products with detailed information, pricing, and inventory

```javascript
{
  _id: ObjectId,
  name: String (required, max: 100),
  description: String (required, max: 1000),
  price: Number (required, min: 0),
  originalPrice: Number (optional, for discounts),
  
  // Product Images
  images: [{
    url: String,
    alt: String,
    isPrimary: Boolean (default: false)
  }],
  
  // Category Reference
  category: ObjectId (ref: 'Category', required),
  
  // Product Classifications
  occasions: [String] (enum: ['birthday', 'anniversary', 'wedding', 'sympathy', 'congratulations', 'just-because']),
  flowerTypes: [String] (enum: ['roses', 'lilies', 'tulips', 'orchids', 'mixed', 'seasonal']),
  colors: [String] (enum: ['red', 'pink', 'white', 'yellow', 'purple', 'mixed']),
  
  // Product Variations
  sizes: [{
    name: String (required),
    price: Number (required),
    description: String
  }],
  vases: [{
    name: String (required),
    price: Number (required),
    description: String
  }],
  
  // Inventory Management
  inventory: {
    stock: Number (required, min: 0),
    lowStockThreshold: Number (default: 10),
    isAvailable: Boolean (default: true)
  },
  
  // Ratings & Reviews
  ratings: {
    average: Number (default: 0, min: 0, max: 5),
    count: Number (default: 0)
  },
  reviews: [{
    user: ObjectId (ref: 'User'),
    rating: Number (required, min: 1, max: 5),
    comment: String,
    images: [String],
    createdAt: Date (default: Date.now)
  }],
  
  // SEO & Marketing
  tags: [String],
  isFeatured: Boolean (default: false),
  isPopular: Boolean (default: false),
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  
  // Additional Information
  careInstructions: String (max: 500),
  deliveryInfo: String (max: 500),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ category: 1 }` - Filter by category
- `{ price: 1 }` - Price range filtering
- `{ 'ratings.average': -1 }` - Sort by rating
- `{ isFeatured: 1 }` - Featured products
- `{ occasions: 1 }` - Filter by occasion
- `{ flowerTypes: 1 }` - Filter by flower type
- `{ createdAt: -1 }` - Latest products

**Virtual Fields**:
- `discountPercentage` - Calculated discount from originalPrice

---

### 3. **Categories Collection** (`categories`)
**Purpose**: Organize products into hierarchical categories

```javascript
{
  _id: ObjectId,
  name: String (required, unique, max: 50),
  description: String (max: 200),
  
  // Category Image
  image: {
    url: String,
    alt: String
  },
  
  // Hierarchy Support
  parentCategory: ObjectId (ref: 'Category', default: null),
  
  // Display Settings
  isActive: Boolean (default: true),
  displayOrder: Number (default: 0),
  
  // SEO Settings
  seo: {
    title: String,
    description: String,
    slug: String (unique, lowercase, auto-generated)
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ parentCategory: 1 }` - Hierarchical queries
- `{ displayOrder: 1 }` - Ordered display
- `{ 'seo.slug': 1 }` - SEO-friendly URLs

**Virtual Fields**:
- `productCount` - Count of products in category

---

### 4. **Carts Collection** (`carts`)
**Purpose**: Store user shopping cart data with product customizations

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required, unique),
  
  // Cart Items
  items: [{
    _id: ObjectId (auto-generated),
    product: ObjectId (ref: 'Product', required),
    quantity: Number (required, min: 1, default: 1),
    
    // Product Customizations
    size: {
      name: String,
      price: Number
    },
    vase: {
      name: String,
      price: Number
    },
    personalNote: String,
    
    // Pricing
    price: Number (required),
    
    // Item Timestamps
    createdAt: Date,
    updatedAt: Date
  }],
  
  // Cart Totals (auto-calculated)
  subtotal: Number (default: 0),
  total: Number (default: 0),
  
  // Cart Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ user: 1 }` - User's cart lookup

**Pre-save Middleware**:
- Auto-calculates subtotal and total based on items

---

### 5. **Orders Collection** (`orders`)
**Purpose**: Store completed orders with payment and shipping information

```javascript
{
  _id: ObjectId,
  orderNumber: String (unique, auto-generated, format: 'AF-XXXXXX'),
  user: ObjectId (ref: 'User', required),
  
  // Order Items (snapshot from cart)
  items: [{
    product: ObjectId (ref: 'Product', required),
    name: String,
    price: Number,
    quantity: Number (required, min: 1),
    
    // Product Customizations
    size: {
      name: String,
      price: Number
    },
    vase: {
      name: String,
      price: Number
    },
    personalNote: String,
    image: String
  }],
  
  // Shipping Information
  shippingAddress: {
    fullName: String (required),
    street: String (required),
    city: String (required),
    state: String (required),
    zipCode: String (required),
    country: String (default: 'United States'),
    phone: String
  },
  
  // Payment Information
  paymentInfo: {
    method: String (enum: ['card', 'paypal'], required),
    paymentId: String,
    status: String (enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending')
  },
  
  // Order Totals
  subtotal: Number (required),
  shippingFee: Number (default: 0),
  tax: Number (default: 0),
  discount: Number (default: 0),
  total: Number (required),
  
  // Order Status & Tracking
  status: String (enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending'),
  shippingMethod: String (enum: ['standard', 'express', 'same-day'], default: 'standard'),
  estimatedDelivery: Date,
  trackingNumber: String,
  notes: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ user: 1, createdAt: -1 }` - User's order history
- `{ orderNumber: 1 }` - Order lookup
- `{ status: 1 }` - Filter by status
- `{ createdAt: -1 }` - Recent orders

**Virtual Fields**:
- `itemCount` - Total quantity of items

**Static Methods**:
- `getSalesStats(startDate, endDate)` - Sales analytics

---

## 🆕 Missing Collections (To Be Implemented)

### 6. **Reviews Collection** (`reviews`)
**Purpose**: Separate detailed product reviews from products collection

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  product: ObjectId (ref: 'Product', required),
  order: ObjectId (ref: 'Order'), // Verified purchase
  
  // Review Content
  rating: Number (required, min: 1, max: 5),
  title: String (max: 100),
  comment: String (max: 1000),
  images: [String], // Review images
  
  // Review Status
  isVerifiedPurchase: Boolean (default: false),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  
  // Community Interaction
  helpfulVotes: Number (default: 0),
  reportedCount: Number (default: 0),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ product: 1, status: 1 }` - Product reviews
- `{ user: 1 }` - User's reviews
- `{ createdAt: -1 }` - Recent reviews

---

### 7. **PromoCodes Collection** (`promocodes`)
**Purpose**: Manage discount codes and promotional offers

```javascript
{
  _id: ObjectId,
  code: String (required, unique, uppercase),
  
  // Discount Configuration
  type: String (enum: ['percentage', 'fixed', 'shipping'], required),
  value: Number (required), // Percentage or fixed amount
  minOrderAmount: Number (default: 0),
  maxDiscount: Number, // Max discount for percentage type
  
  // Usage Limits
  usageLimit: Number, // Total usage limit
  usedCount: Number (default: 0),
  userUsageLimit: Number (default: 1), // Per user limit
  
  // Validity Period
  validFrom: Date (required),
  validUntil: Date (required),
  
  // Applicability
  applicableCategories: [ObjectId] (ref: 'Category'),
  applicableProducts: [ObjectId] (ref: 'Product'),
  minimumUserType: String (enum: ['all', 'new', 'returning']),
  
  // Status
  isActive: Boolean (default: true),
  
  // Admin Info
  createdBy: ObjectId (ref: 'User'),
  description: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ code: 1 }` - Code lookup
- `{ validFrom: 1, validUntil: 1 }` - Valid codes
- `{ isActive: 1 }` - Active codes

---

### 8. **PromoUsage Collection** (`promousage`)
**Purpose**: Track promo code usage by users

```javascript
{
  _id: ObjectId,
  promoCode: ObjectId (ref: 'PromoCode', required),
  user: ObjectId (ref: 'User', required),
  order: ObjectId (ref: 'Order', required),
  
  // Usage Details
  discountAmount: Number (required),
  originalTotal: Number (required),
  finalTotal: Number (required),
  
  // Timestamps
  usedAt: Date (default: Date.now)
}
```

**Indexes**:
- `{ promoCode: 1, user: 1 }` - User's promo usage
- `{ user: 1 }` - User's promo history

---

### 9. **Notifications Collection** (`notifications`)
**Purpose**: Store and track email/SMS notifications

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  
  // Notification Details
  type: String (enum: ['email', 'sms', 'push'], required),
  template: String (required),
  subject: String,
  content: String (required),
  
  // Delivery Status
  status: String (enum: ['pending', 'sent', 'failed', 'bounced'], default: 'pending'),
  sentAt: Date,
  deliveredAt: Date,
  openedAt: Date,
  clickedAt: Date,
  
  // Retry Logic
  retryCount: Number (default: 0),
  maxRetries: Number (default: 3),
  nextRetryAt: Date,
  
  // Metadata
  metadata: Object, // Additional data for template
  externalId: String, // Third-party service ID
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `{ user: 1, createdAt: -1 }` - User notifications
- `{ status: 1 }` - Pending notifications
- `{ nextRetryAt: 1 }` - Retry queue

---

### 10. **Analytics Collection** (`analytics`)
**Purpose**: Store business analytics and user behavior data

```javascript
{
  _id: ObjectId,
  
  // Event Details
  eventType: String (enum: ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search'], required),
  userId: ObjectId (ref: 'User'),
  sessionId: String,
  
  // Event Data
  data: {
    productId: ObjectId (ref: 'Product'),
    categoryId: ObjectId (ref: 'Category'),
    searchQuery: String,
    pageUrl: String,
    referrer: String,
    value: Number, // For purchase events
    quantity: Number
  },
  
  // User Context
  userAgent: String,
  ipAddress: String,
  country: String,
  city: String,
  device: String (enum: ['desktop', 'mobile', 'tablet']),
  
  // Timestamps
  timestamp: Date (default: Date.now),
  date: String, // YYYY-MM-DD for daily aggregation
  hour: Number // 0-23 for hourly aggregation
}
```

**Indexes**:
- `{ eventType: 1, date: 1 }` - Event analytics
- `{ userId: 1, timestamp: -1 }` - User behavior
- `{ date: 1, hour: 1 }` - Time-based analytics

---

### 11. **Inventory Collection** (`inventory`)
**Purpose**: Track inventory movements and stock history

```javascript
{
  _id: ObjectId,
  product: ObjectId (ref: 'Product', required),
  
  // Movement Details
  type: String (enum: ['restock', 'sale', 'adjustment', 'return'], required),
  quantity: Number (required), // Positive for increase, negative for decrease
  previousStock: Number (required),
  newStock: Number (required),
  
  // Reference Information
  orderId: ObjectId (ref: 'Order'), // For sales
  reason: String, // For adjustments
  notes: String,
  
  // Admin Info
  performedBy: ObjectId (ref: 'User'),
  
  // Timestamps
  createdAt: Date (default: Date.now)
}
```

**Indexes**:
- `{ product: 1, createdAt: -1 }` - Product inventory history
- `{ type: 1, createdAt: -1 }` - Movement type analytics

---

### 12. **Sessions Collection** (`sessions`)
**Purpose**: Manage user sessions and authentication tokens

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  
  // Session Details
  token: String (required, unique),
  refreshToken: String,
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    device: String,
    browser: String,
    os: String
  },
  
  // Session Status
  isActive: Boolean (default: true),
  lastActivity: Date (default: Date.now),
  
  // Security
  loginMethod: String (enum: ['password', 'social', 'magic_link']),
  twoFactorVerified: Boolean (default: false),
  
  // Expiration
  expiresAt: Date (required),
  
  // Timestamps
  createdAt: Date (default: Date.now)
}
```

**Indexes**:
- `{ token: 1 }` - Token lookup
- `{ user: 1, isActive: 1 }` - User's active sessions
- `{ expiresAt: 1 }` - TTL index for auto-cleanup

---

### 13. **SearchHistory Collection** (`searchhistory`)
**Purpose**: Store user search queries for analytics and suggestions

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  
  // Search Details
  query: String (required),
  resultsCount: Number (required),
  filters: Object, // Applied filters
  
  // User Interaction
  clickedProducts: [ObjectId] (ref: 'Product'),
  addedToCart: [ObjectId] (ref: 'Product'),
  
  // Context
  sessionId: String,
  ipAddress: String,
  
  // Timestamps
  searchedAt: Date (default: Date.now)
}
```

**Indexes**:
- `{ user: 1, searchedAt: -1 }` - User search history
- `{ query: 1 }` - Popular searches
- `{ searchedAt: -1 }` - Recent searches

---

## 🔗 Database Relationships

### **One-to-Many Relationships**
- `User` → `Orders` (One user has many orders)
- `User` → `Cart` (One user has one cart)
- `Category` → `Products` (One category has many products)
- `Product` → `Reviews` (One product has many reviews)
- `Order` → `OrderItems` (One order has many items)

### **Many-to-Many Relationships**
- `User` ↔ `Products` (via favorites array in User)
- `PromoCode` ↔ `Categories` (via applicableCategories array)
- `PromoCode` ↔ `Products` (via applicableProducts array)

### **Self-Referencing Relationships**
- `Category` → `Category` (parentCategory for hierarchy)

---

## 📊 Database Indexes Strategy

### **Performance Indexes**
```javascript
// Users Collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "createdAt": -1 })
db.users.createIndex({ "lastLogin": -1 })

// Products Collection
db.products.createIndex({ "category": 1 })
db.products.createIndex({ "price": 1 })
db.products.createIndex({ "ratings.average": -1 })
db.products.createIndex({ "isFeatured": 1 })
db.products.createIndex({ "occasions": 1 })
db.products.createIndex({ "flowerTypes": 1 })
db.products.createIndex({ "colors": 1 })
db.products.createIndex({ "inventory.stock": 1 })

// Orders Collection
db.orders.createIndex({ "user": 1, "createdAt": -1 })
db.orders.createIndex({ "orderNumber": 1 }, { unique: true })
db.orders.createIndex({ "status": 1 })
db.orders.createIndex({ "createdAt": -1 })

// Compound Indexes for Complex Queries
db.products.createIndex({ "category": 1, "price": 1 })
db.products.createIndex({ "occasions": 1, "flowerTypes": 1 })
db.analytics.createIndex({ "eventType": 1, "date": 1 })
```

### **Text Search Indexes**
```javascript
// Full-text search on products
db.products.createIndex({
  "name": "text",
  "description": "text",
  "tags": "text"
}, {
  weights: {
    "name": 10,
    "description": 5,
    "tags": 1
  }
})
```

---

## 🔧 Database Configuration

### **Connection Settings**
```javascript
// MongoDB Connection Options
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maximum number of connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false // Disable mongoose buffering
}
```

### **Environment-Specific Databases**
- **Development**: `amour_florals_dev`
- **Testing**: `amour_florals_test`
- **Staging**: `amour_florals_staging`
- **Production**: `amour_florals_prod`

---

## 📈 Database Size Estimates

### **Current Collections (Estimated)**
- **Users**: ~10,000 documents × 2KB = ~20MB
- **Products**: ~1,000 documents × 5KB = ~5MB
- **Categories**: ~50 documents × 1KB = ~50KB
- **Orders**: ~50,000 documents × 3KB = ~150MB
- **Carts**: ~5,000 documents × 2KB = ~10MB

### **New Collections (Projected)**
- **Reviews**: ~25,000 documents × 1KB = ~25MB
- **PromoCodes**: ~500 documents × 1KB = ~500KB
- **Analytics**: ~1M documents × 500B = ~500MB
- **Notifications**: ~100,000 documents × 1KB = ~100MB

**Total Estimated Database Size**: ~810MB (with indexes ~1.2GB)

---

## 🚀 Implementation Priority

### **Phase 1: Essential Collections**
1. Reviews Collection (for product feedback)
2. PromoCodes Collection (for marketing)
3. Notifications Collection (for user communication)

### **Phase 2: Analytics & Optimization**
1. Analytics Collection (for business insights)
2. SearchHistory Collection (for search improvements)
3. Inventory Collection (for stock management)

### **Phase 3: Advanced Features**
1. Sessions Collection (for security)
2. Additional indexes and optimizations
3. Data archiving strategies

This database structure provides a solid foundation for your e-commerce platform with room for future growth and optimization.