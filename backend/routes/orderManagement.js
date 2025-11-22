const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllOrdersAdmin,
  getOrderDetailsAdmin,
  updateOrderStatus,
  bulkUpdateOrderStatus,
  getOrderAnalytics,
  cancelOrder
} = require('../controllers/orderManagement');

const router = express.Router();

// @desc    Cancel order (customer or admin)
// @route   PUT /api/order-management/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, cancelOrder);

// All other routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @desc    Get all orders with filtering
// @route   GET /api/order-management
// @access  Private/Admin
router.get('/', getAllOrdersAdmin);

// @desc    Get order analytics
// @route   GET /api/order-management/analytics
// @access  Private/Admin
router.get('/analytics', getOrderAnalytics);

// @desc    Bulk update order status
// @route   PUT /api/order-management/bulk-status
// @access  Private/Admin
router.put('/bulk-status', bulkUpdateOrderStatus);

// @desc    Get single order details
// @route   GET /api/order-management/:id
// @access  Private/Admin
router.get('/:id', getOrderDetailsAdmin);

// @desc    Update order status
// @route   PUT /api/order-management/:id/status
// @access  Private/Admin
router.put('/:id/status', updateOrderStatus);

module.exports = router;