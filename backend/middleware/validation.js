const { body, param, query, validationResult } = require('express-validator');
const { AppError, formatValidationErrors } = require('./errorHandler');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = formatValidationErrors(errors.array());
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
    
  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
    
  phone: body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
    
  mongoId: param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
    
  price: body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
    
  quantity: body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
};

// User validation rules
const userValidation = {
  register: [
    body('fullName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Full name must be between 2 and 50 characters'),
    commonValidations.email,
    commonValidations.password,
    commonValidations.phone.optional(),
    body('birthday')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date'),
    handleValidationErrors
  ],
  
  login: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  
  updateProfile: [
    body('fullName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Full name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    commonValidations.phone.optional(),
    handleValidationErrors
  ]
};

// Product validation rules
const productValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Product name must be between 2 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    commonValidations.price,
    body('category')
      .isMongoId()
      .withMessage('Invalid category ID'),
    body('inventory.stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    body('inventory.lowStockThreshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Low stock threshold must be a non-negative integer'),
    handleValidationErrors
  ],
  
  update: [
    commonValidations.mongoId,
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Product name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    handleValidationErrors
  ]
};

// Order validation rules
const orderValidation = {
  create: [
    body('items')
      .isArray({ min: 1 })
      .withMessage('Order must contain at least one item'),
    body('items.*.product')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be a positive integer'),
    body('shippingAddress.fullName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Full name is required'),
    body('shippingAddress.street')
      .trim()
      .isLength({ min: 5, max: 100 })
      .withMessage('Street address must be between 5 and 100 characters'),
    body('shippingAddress.city')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('City is required'),
    body('shippingAddress.state')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State is required'),
    body('shippingAddress.zipCode')
      .matches(/^[1-9][0-9]{5}$/)
      .withMessage('Please provide a valid Indian PIN code'),
    body('shippingAddress.phone')
      .isMobilePhone('en-IN')
      .withMessage('Please provide a valid phone number'),
    handleValidationErrors
  ],
  
  updateStatus: [
    commonValidations.mongoId,
    body('status')
      .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status'),
    body('trackingNumber')
      .optional()
      .trim()
      .isLength({ min: 5, max: 50 })
      .withMessage('Tracking number must be between 5 and 50 characters'),
    handleValidationErrors
  ]
};

// Query validation rules
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
  ],
  
  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO date'),
    handleValidationErrors
  ]
};

// Inventory validation rules
const inventoryValidation = {
  updateStock: [
    commonValidations.mongoId,
    body('stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    body('lowStockThreshold')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Low stock threshold must be a non-negative integer'),
    body('reason')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Reason must not exceed 200 characters'),
    handleValidationErrors
  ],
  
  bulkUpdate: [
    body('updates')
      .isArray({ min: 1 })
      .withMessage('Updates array is required'),
    body('updates.*.productId')
      .isMongoId()
      .withMessage('Invalid product ID'),
    body('updates.*.stock')
      .isInt({ min: 0 })
      .withMessage('Stock must be a non-negative integer'),
    handleValidationErrors
  ]
};

// File upload validation
const fileValidation = {
  image: (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }
    
    const files = req.files || [req.file];
    
    for (const file of files) {
      // Check file type
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          status: 'error',
          message: 'Only image files are allowed'
        });
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          status: 'error',
          message: 'Image file size must be less than 5MB'
        });
      }
    }
    
    next();
  }
};

// Sanitization helpers
const sanitizeInput = {
  // Remove HTML tags and dangerous characters
  cleanHtml: (str) => {
    return str.replace(/<[^>]*>/g, '').trim();
  },
  
  // Sanitize search queries
  cleanSearch: (str) => {
    return str.replace(/[^\w\s-]/gi, '').trim();
  },
  
  // Sanitize phone numbers
  cleanPhone: (phone) => {
    return phone.replace(/[^\d+]/g, '');
  }
};

module.exports = {
  userValidation,
  productValidation,
  orderValidation,
  queryValidation,
  inventoryValidation,
  fileValidation,
  sanitizeInput,
  handleValidationErrors,
  commonValidations
};