const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
} = require('../controllers/orders');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All order routes require authentication

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/my-orders', getOrders); // User's own orders
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/admin/all', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;
