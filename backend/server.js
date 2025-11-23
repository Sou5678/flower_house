const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const hpp = require('hpp');
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');
const { logger, requestLogger } = require('./utils/logger');
require('dotenv').config();

const app = express();

// =====================
// SECURITY MIDDLEWARES
// =====================

// 1. Helmet with safe configuration
app.use(helmet({
  contentSecurityPolicy: false, // Temporary disable for development
  crossOriginEmbedderPolicy: false
}));

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 3. CORS - Development ke liye allow all
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 4. Body Parsing
app.use(express.json({ 
  limit: '10mb'
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// 5. HTTP Parameter Pollution protection
app.use(hpp());

// 6. Compression
app.use(compression());

// 7. Request Logging
app.use(requestLogger);

// =====================
// DATABASE CONNECTION
// =====================

const connectDB = require('./config/database');
connectDB();

// =====================
// ROUTES
// =====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/email', require('./routes/email'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/order-management', require('./routes/orderManagement'));
app.use('/api/location', require('./routes/location'));

// =====================
// HEALTH CHECK
// =====================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Amour Florals Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Test route for signup
app.post('/api/test/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    
    // Simple validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide all required fields'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Test signup successful',
      data: {
        user: {
          fullName,
          email,
          id: 'test-user-id'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// =====================
// ERROR HANDLING
// =====================

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(globalErrorHandler);

// =====================
// SERVER START
// =====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;