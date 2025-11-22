# System Design Prompt for Amour Florals E-Commerce Platform

## Project Overview
Create a comprehensive system design document for "Amour Florals" - a full-stack e-commerce platform for a flower shop. This is a production-ready MERN stack application with advanced features for both customers and administrators.

## Current Tech Stack & Architecture

### Backend (Node.js/Express)
- **Framework**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Storage**: Cloudinary for image management
- **Email Service**: Nodemailer for transactional emails
- **Payment Processing**: Stripe integration
- **Security**: Helmet, CORS, rate limiting, HPP protection
- **File Uploads**: Multer middleware

### Frontend (React)
- **Framework**: React 19 with React Router DOM
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios for API communication
- **Testing**: Vitest with Testing Library

### Data Models & Relationships
1. **User Model**: Authentication, profiles, addresses, favorites, preferences
2. **Product Model**: Flowers with categories, pricing, inventory, reviews, ratings
3. **Category Model**: Hierarchical product categorization with SEO
4. **Cart Model**: Shopping cart with customizations (sizes, vases, notes)
5. **Order Model**: Complete order lifecycle with tracking and payments

## System Design Requirements

Please create a detailed system design that includes:

### 1. High-Level Architecture Diagram
- Client-server architecture overview
- Service layer separation
- Database design and relationships
- External service integrations (Cloudinary, Stripe, Email)
- Security boundaries and authentication flow

### 2. Database Design
- **Entity Relationship Diagram** showing all models and their relationships
- **Indexing Strategy** for optimal query performance
- **Data Flow** between entities
- **Scalability considerations** for growing product catalog and user base

### 3. API Architecture
- **RESTful API design** with proper HTTP methods and status codes
- **Authentication & Authorization** flow with JWT
- **Rate limiting** and security middleware implementation
- **Error handling** and validation strategies
- **API versioning** approach for future updates

### 4. Frontend Architecture
- **Component hierarchy** and state management
- **Routing strategy** with protected routes
- **API integration** patterns and error handling
- **Performance optimization** (lazy loading, caching)
- **Responsive design** considerations

### 5. Security Architecture
- **Authentication flow** (registration, login, password reset)
- **Authorization levels** (user, admin roles)
- **Data validation** and sanitization
- **HTTPS/TLS** implementation
- **OWASP security** best practices

### 6. Performance & Scalability
- **Caching strategies** (Redis for sessions, CDN for images)
- **Database optimization** (indexing, query optimization)
- **Load balancing** considerations
- **Horizontal scaling** approach
- **Monitoring and logging** strategy

### 7. Third-Party Integrations
- **Stripe Payment Processing** flow and webhook handling
- **Cloudinary Image Management** with optimization
- **Email Service** for notifications and marketing
- **Analytics integration** for business insights

### 8. Deployment Architecture
- **Environment separation** (development, staging, production)
- **CI/CD pipeline** recommendations
- **Container deployment** strategy (Docker)
- **Cloud hosting** options and configurations
- **Backup and disaster recovery** plans

### 9. Business Logic Flow
- **Customer Journey**: Browse → Add to Cart → Checkout → Order Tracking
- **Admin Workflow**: Product Management → Order Processing → Analytics
- **Inventory Management**: Stock tracking and low-stock alerts
- **Order Fulfillment**: From payment to delivery tracking

### 10. Monitoring & Analytics
- **Application monitoring** (uptime, performance metrics)
- **Business analytics** (sales, popular products, user behavior)
- **Error tracking** and logging strategies
- **Performance monitoring** and optimization

## Specific Features to Address

### Customer Features
- Advanced product filtering (occasion, flower type, color, price)
- Search functionality with autocomplete
- Shopping cart with product customizations
- User profiles with multiple addresses
- Wishlist/favorites management
- Order history and tracking
- Product reviews and ratings

### Admin Features
- Product CRUD operations with image management
- Category management with hierarchical structure
- Order management and status updates
- User management and analytics
- Inventory tracking and alerts
- Sales reporting and analytics

### Technical Features
- Real-time inventory updates
- Email notifications for order status
- Mobile-responsive design
- SEO optimization
- Performance optimization
- Security compliance

## Output Format
Please provide:
1. **Executive Summary** of the system architecture
2. **Detailed diagrams** for each architectural layer
3. **Technology justifications** for chosen solutions
4. **Scalability roadmap** for future growth
5. **Implementation phases** with priorities
6. **Risk assessment** and mitigation strategies
7. **Performance benchmarks** and monitoring KPIs

## Additional Context
- Target audience: Small to medium flower shop with growth potential
- Expected traffic: 1000-10000 daily active users initially
- Geographic scope: Initially US-based with potential international expansion
- Budget considerations: Cost-effective solutions with room for scaling
- Timeline: Production-ready system with iterative improvements

Create a professional, comprehensive system design document that can guide development teams and stakeholders in understanding the complete architecture and implementation strategy for this e-commerce platform.