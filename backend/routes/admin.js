const express = require('express');
const { adminProtect, logAdminActivity, requireConfirmation } = require('../middleware/adminAuth');

// Import admin controllers
const {
  getAdminProducts,
  getAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  bulkUpdateProducts,
  getProductAnalytics,
  addProductImages,
  removeProductImage,
  updateProductImageOrder
} = require('../controllers/adminProducts');

const {
  getAdminOrders,
  getAdminOrder,
  updateOrderStatus,
  addTrackingInfo,
  getOrderAnalytics,
  bulkUpdateOrderStatus
} = require('../controllers/adminOrders');

const {
  getSalesAnalytics,
  getInventoryAnalytics,
  getCustomerAnalytics,
  generateCustomReport
} = require('../controllers/adminAnalytics');

const router = express.Router();

// Apply admin protection to all routes
router.use(adminProtect);

// =====================
// SYSTEM ROUTES
// =====================

// Test route to verify admin authentication is working
router.get('/test', 
  logAdminActivity('read', 'system'),
  (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Admin authentication is working',
      data: {
        user: {
          id: req.user._id,
          fullName: req.user.fullName,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  }
);

// Get admin activity logs
router.get('/activity-logs',
  logAdminActivity('read', 'system'),
  async (req, res) => {
    try {
      const AdminActivity = require('../models/AdminActivity');
      
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      const activities = await AdminActivity.find()
        .populate('admin', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await AdminActivity.countDocuments();

      res.status(200).json({
        status: 'success',
        data: {
          activities,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch activity logs'
      });
    }
  }
);

// Test route for sensitive operations requiring confirmation
router.delete('/test-sensitive',
  requireConfirmation,
  logAdminActivity('delete', 'system'),
  (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Sensitive operation completed successfully'
    });
  }
);

// =====================
// PRODUCT MANAGEMENT ROUTES
// =====================

// Get all products for admin
router.get('/products',
  logAdminActivity('read', 'product'),
  getAdminProducts
);

// Get product analytics
router.get('/products/analytics',
  logAdminActivity('read', 'product'),
  getProductAnalytics
);

// Bulk update products
router.put('/products/bulk-update',
  requireConfirmation,
  logAdminActivity('bulk_update', 'product'),
  bulkUpdateProducts
);

// Get single product for admin
router.get('/products/:id',
  logAdminActivity('read', 'product'),
  getAdminProduct
);

// Create new product
router.post('/products',
  logAdminActivity('create', 'product'),
  createAdminProduct
);

// Update product
router.put('/products/:id',
  logAdminActivity('update', 'product'),
  updateAdminProduct
);

// Delete product
router.delete('/products/:id',
  requireConfirmation,
  logAdminActivity('delete', 'product'),
  deleteAdminProduct
);

// Add images to product
router.post('/products/:id/images',
  logAdminActivity('update', 'product'),
  addProductImages
);

// Remove image from product
router.delete('/products/:id/images/:imageId',
  logAdminActivity('update', 'product'),
  removeProductImage
);

// Update product image order
router.put('/products/:id/images/reorder',
  logAdminActivity('update', 'product'),
  updateProductImageOrder
);

// =====================
// ORDER MANAGEMENT ROUTES
// =====================

// Get all orders for admin
router.get('/orders',
  logAdminActivity('read', 'order'),
  getAdminOrders
);

// Get order analytics
router.get('/orders/analytics',
  logAdminActivity('read', 'order'),
  getOrderAnalytics
);

// Bulk update order status
router.put('/orders/bulk-status',
  requireConfirmation,
  logAdminActivity('bulk_update', 'order'),
  bulkUpdateOrderStatus
);

// Get single order for admin
router.get('/orders/:id',
  logAdminActivity('read', 'order'),
  getAdminOrder
);

// Update order status
router.put('/orders/:id/status',
  logAdminActivity('update', 'order'),
  updateOrderStatus
);

// Add tracking information
router.post('/orders/:id/tracking',
  logAdminActivity('update', 'order'),
  addTrackingInfo
);

// =====================
// ANALYTICS ROUTES
// =====================

// Get sales analytics
router.get('/analytics/sales',
  logAdminActivity('read', 'analytics'),
  getSalesAnalytics
);

// Get inventory analytics
router.get('/analytics/inventory',
  logAdminActivity('read', 'analytics'),
  getInventoryAnalytics
);

// Get customer analytics
router.get('/analytics/customers',
  logAdminActivity('read', 'analytics'),
  getCustomerAnalytics
);

// Generate custom reports
router.post('/analytics/reports',
  logAdminActivity('create', 'report'),
  generateCustomReport
);

module.exports = router;