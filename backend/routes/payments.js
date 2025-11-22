const express = require('express');
const {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  getPaymentStatus,
  refundPayment
} = require('../controllers/payments');
const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/adminAuth');

const router = express.Router();

// Public routes
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes (require authentication)
router.use(protect);

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.get('/status/:orderId', getPaymentStatus);

// Admin only routes
router.post('/refund', adminProtect, refundPayment);

module.exports = router;