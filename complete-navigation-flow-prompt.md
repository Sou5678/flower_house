# Amour Florals E-Commerce System Design Prompt

## Project Overview
Design a comprehensive MERN stack e-commerce platform for "Amour Florals" flower shop with complete navigation flows, database operations, and user interactions.

## Core Pages & Navigation Flow

### 1. Homepage (/)
**Components**: HeroSection, FeaturedCollections, Testimonials, Newsletter
**Navigation**: Shop Now → Products | Collections → Collections Page | Featured Products → Product Detail
**APIs**: `GET /api/products/featured`, `GET /api/products/popular`

### 2. Navigation Bar (Global)
**Features**: Search bar, location detection, auth status, cart count, mobile menu
**Flows**: 
- Search → Products page with query
- Profile → Login (if not auth) or Profile page
- Cart → Cart page | Wishlist → Wishlist page
**APIs**: `GET /api/auth/me`, `GET /api/products/search?q={query}`

### 3. Products Page (/products)
**Features**: Advanced filters (occasion, flower type, color), search, sorting, pagination
**Navigation**: Product cards → Product Detail | Add to Cart → Cart update | Add to Wishlist → Backend update
**APIs**: `GET /api/products?filters`, `POST /api/cart`, `POST /api/users/favorites`
**State**: Filter states, search query, pagination, loading states

### 4. Product Detail (/products/:id)
**Features**: Image gallery, size/vase selection, personal notes, tabs (details/care/delivery)
**Navigation**: Add to Cart → Stay on page | Buy Now → Cart page
**APIs**: `GET /api/products/{id}`, `POST /api/cart`, `GET /api/products?category={id}`
**State**: Selected options, active tab, product data

### 5. Cart Page (/cart)
**Features**: Quantity controls, promo codes, order summary, save for later
**Navigation**: Checkout → Order process | Continue Shopping → Products
**APIs**: `GET /api/cart`, `PUT /api/cart/{itemId}`, `DELETE /api/cart/{itemId}`, `POST /api/cart/promo`
**State**: Cart items, promo codes, calculations

### 6. Wishlist Page (/wishlist)
**Features**: Bulk selection, move to cart (single/bulk), remove items, progress indicators
**Navigation**: Requires auth → Login redirect | Move to Cart → Cart update | Continue Shopping → Products
**APIs**: `GET /api/users/favorites`, `DELETE /api/users/favorites/bulk`, `POST /api/cart/from-wishlist/bulk`
**State**: Selected items Set, bulk operation progress, toast notifications

### 7. Profile Page (/profile)
**Features**: Personal details editing, order history, address management, preferences
**Navigation**: Sidebar sections, logout → Login page
**APIs**: `GET /api/auth/me`, `PUT /api/auth/updatedetails`, `GET /api/orders`
**State**: User data, edit mode, active section, form validation

### 8. Authentication Pages
**Login (/login)**: Email/password, remember me, forgot password
**Signup (/signup)**: Registration form, email verification, auto-login
**Navigation**: Success → Intended page or homepage | Cross-links between login/signup
**APIs**: `POST /api/auth/login`, `POST /api/auth/register`

### 9. Collections Page (/collections)
**Features**: Collection filtering, category cards
**Navigation**: Collection cards → Products with category filter
**APIs**: `GET /api/categories`, `GET /api/products?category={id}`

## Complete API Endpoints

### Authentication
```
POST /api/auth/register - User registration
POST /api/auth/login - User login  
GET /api/auth/logout - User logout
GET /api/auth/me - Get current user
PUT /api/auth/updatedetails - Update profile
PUT /api/auth/updatepassword - Update password
```

### Products
```
GET /api/products - Get products with filters
GET /api/products/:id - Get single product
GET /api/products/search - Search products
GET /api/products/featured - Get featured products
GET /api/products/popular - Get popular products
```

### Cart Management
```
GET /api/cart - Get user cart
POST /api/cart - Add item to cart
PUT /api/cart/:itemId - Update quantity
DELETE /api/cart/:itemId - Remove item
DELETE /api/cart - Clear cart
POST /api/cart/promo - Apply promo code
POST /api/cart/from-wishlist/:id - Move from wishlist
```

### Wishlist Management
```
GET /api/users/favorites - Get wishlist
POST /api/users/favorites - Add to wishlist
DELETE /api/users/favorites/:id - Remove from wishlist
DELETE /api/users/favorites/bulk - Bulk remove
POST /api/cart/from-wishlist/bulk - Bulk move to cart
```

### Orders
```
POST /api/orders - Create order
GET /api/orders - Get user orders
GET /api/orders/:id - Get single order
PUT /api/orders/:id/cancel - Cancel order
```

### Categories
```
GET /api/categories - Get all categories
GET /api/categories/:id - Get single category
```

## Database Schema (MongoDB)

### User Model
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  birthday: String,
  role: ['user', 'admin'],
  addresses: [{
    type: ['home', 'work', 'other'],
    street, city, state, zipCode, country,
    isDefault: Boolean
  }],
  favorites: [ObjectId] // Product references
}
```

### Product Model
```javascript
{
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  images: [{ url, alt, isPrimary }],
  category: ObjectId, // Category reference
  occasions: ['birthday', 'anniversary', 'wedding'],
  flowerTypes: ['roses', 'lilies', 'tulips'],
  colors: ['red', 'pink', 'white'],
  sizes: [{ name, price, description }],
  vases: [{ name, price, description }],
  inventory: { stock, lowStockThreshold, isAvailable },
  ratings: { average, count },
  reviews: [{ user, rating, comment, createdAt }],
  isFeatured: Boolean,
  isPopular: Boolean
}
```

### Cart Model
```javascript
{
  user: ObjectId, // User reference
  items: [{
    product: ObjectId, // Product reference
    quantity: Number,
    size: { name, price },
    vase: { name, price },
    personalNote: String,
    price: Number
  }],
  subtotal: Number,
  total: Number
}
```

### Order Model
```javascript
{
  orderNumber: String (unique),
  user: ObjectId,
  items: [{ product, name, price, quantity, size, vase, personalNote }],
  shippingAddress: { fullName, street, city, state, zipCode, phone },
  paymentInfo: { method, paymentId, status },
  subtotal: Number,
  shippingFee: Number,
  tax: Number,
  total: Number,
  status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'],
  trackingNumber: String
}
```

## State Management Architecture

### Global State (React Context)
- User authentication state
- Cart items and count  
- Wishlist items
- Loading states

### Local Component State
- Form inputs and validation
- UI states (modals, dropdowns)
- Pagination and filtering
- Temporary selections

### localStorage Integration
- Authentication tokens
- Cart items (offline capability)
- User preferences
- Search history

## User Journey Flows

### New User Journey
1. **Discovery**: Homepage → Browse products → View details
2. **Registration**: Profile click → Signup → Email verification → Auto-login
3. **Shopping**: Add to cart → Apply promo → Checkout → Order confirmation
4. **Engagement**: Add to wishlist → Profile management → Repeat purchases

### Returning User Journey
1. **Authentication**: Login → Profile sync → Cart/wishlist restoration
2. **Browsing**: Search/filter → Compare favorites → Quick add to cart
3. **Purchase**: Bulk operations → Saved addresses → Quick checkout
4. **Management**: Order tracking → Profile updates → Wishlist curation

## Key Features & Interactions

### Search & Discovery
- Navbar search with autocomplete
- Advanced filtering on products page
- Category-based browsing
- Featured and popular product sections

### Shopping Cart
- Add from product pages with customizations
- Quantity management and item removal
- Promo code application
- Save for later functionality
- localStorage + backend synchronization

### Wishlist Management
- Single and bulk item selection
- Move to cart (atomic operations)
- Bulk remove with progress tracking
- Authentication-required access
- Real-time UI updates

### User Account
- Profile editing with validation
- Order history and tracking
- Address management
- Authentication state management
- Secure logout with cleanup

## Technical Implementation

### Frontend (React)
- Component-based architecture
- React Router for navigation
- Context API for state management
- Axios for API calls with interceptors
- Tailwind CSS for styling
- Mobile-first responsive design

### Backend (Node.js/Express)
- RESTful API design
- JWT authentication
- MongoDB with Mongoose
- Middleware for auth, validation, error handling
- File upload with Multer/Cloudinary
- Rate limiting and security headers

### Database Design
- Proper indexing for search performance
- Reference relationships between models
- Validation at schema level
- Aggregation pipelines for complex queries

## Security & Performance

### Security
- JWT token management
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting for API endpoints
- HTTPS enforcement

### Performance
- Lazy loading for routes
- Image optimization
- API response caching
- Database query optimization
- Bundle splitting

## Implementation Phases

### Phase 1: Core Features
- Authentication system
- Product catalog with search
- Basic cart functionality
- Order placement

### Phase 2: Enhanced Features  
- Wishlist with bulk operations
- Advanced filtering and sorting
- User profile management
- Order tracking

### Phase 3: Optimization
- Performance improvements
- Mobile responsiveness
- SEO optimization
- Analytics integration

Create a comprehensive system design document with detailed architecture diagrams, API specifications, database schemas, user flow diagrams, and implementation guidelines for this complete e-commerce platform.