const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const EmailService = require('../utils/email');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', orderId } = req.body;

    // Validate required fields
    if (!amount || !orderId) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount and order ID are required'
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId).populate('items.product user');
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this order'
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Amount in paise
      currency: currency,
      receipt: `order_${orderId}`,
      notes: {
        orderId: orderId,
        userId: req.user.id,
        orderNumber: order.orderNumber
      }
    });

    // Update order with Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    order.paymentStatus = 'pending';
    await order.save();

    res.status(200).json({
      status: 'success',
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID,
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          customerName: order.user.fullName,
          customerEmail: order.user.email,
          customerPhone: order.shippingAddress?.phone || order.user.phone
        }
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create payment order'
    });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = req.body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        status: 'error',
        message: 'All payment verification fields are required'
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment signature'
      });
    }

    // Find and update order
    const order = await Order.findById(orderId).populate('items.product user');
    
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this order'
      });
    }

    // Update order with payment details
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paidAt = new Date();

    // Reduce inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    await order.save();

    // Send confirmation email
    try {
      await EmailService.sendOrderConfirmation(order.user, order);
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError);
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully',
      data: {
        order: order,
        paymentId: razorpay_payment_id
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify payment'
    });
  }
};

// @desc    Handle Razorpay webhook
// @route   POST /api/payments/webhook
// @access  Public (Razorpay webhook)
exports.handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== webhookSignature) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Webhook processing failed'
    });
  }
};

// Helper function to handle payment captured
const handlePaymentCaptured = async (payment) => {
  try {
    const order = await Order.findOne({ 
      razorpayOrderId: payment.order_id 
    }).populate('items.product user');

    if (!order) {
      console.error('Order not found for payment:', payment.id);
      return;
    }

    // Update order status
    order.razorpayPaymentId = payment.id;
    order.paymentStatus = 'completed';
    order.orderStatus = 'confirmed';
    order.paidAt = new Date();

    // Reduce inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product._id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
      }
    }

    await order.save();

    // Send confirmation email
    try {
      await EmailService.sendOrderConfirmation(order.user, order);
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError);
    }

    console.log('Payment captured successfully for order:', order.orderNumber);
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
};

// Helper function to handle payment failed
const handlePaymentFailed = async (payment) => {
  try {
    const order = await Order.findOne({ 
      razorpayOrderId: payment.order_id 
    }).populate('user');

    if (!order) {
      console.error('Order not found for failed payment:', payment.id);
      return;
    }

    // Update order status
    order.paymentStatus = 'failed';
    order.orderStatus = 'payment_failed';
    await order.save();

    // Send payment failure email
    try {
      await EmailService.sendPaymentFailureNotification(order.user, order);
    } catch (emailError) {
      console.error('Payment failure email failed:', emailError);
    }

    console.log('Payment failed for order:', order.orderNumber);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

// Helper function to handle order paid
const handleOrderPaid = async (order) => {
  try {
    console.log('Order paid webhook received:', order.id);
    // Additional logic if needed
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
};

// @desc    Get payment status
// @route   GET /api/payments/status/:orderId
// @access  Private
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this order'
      });
    }

    let paymentDetails = null;
    if (order.paymentIntentId) {
      try {
        paymentDetails = await stripe.paymentIntents.retrieve(order.paymentIntentId);
      } catch (stripeError) {
        console.error('Error retrieving payment intent:', stripeError);
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        totalAmount: order.totalAmount,
        paidAt: order.paidAt,
        paymentDetails: paymentDetails ? {
          id: paymentDetails.id,
          status: paymentDetails.status,
          amount: paymentDetails.amount / 100,
          currency: paymentDetails.currency
        } : null
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get payment status'
    });
  }
};

// @desc    Refund payment
// @route   POST /api/payments/refund
// @access  Private (Admin only)
exports.refundPayment = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    if (!order.razorpayPaymentId) {
      return res.status(400).json({
        status: 'error',
        message: 'No payment found for this order'
      });
    }

    // Create refund
    const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
      amount: amount ? Math.round(amount * 100) : undefined, // Amount in paise
      speed: 'normal',
      notes: {
        orderId: orderId,
        adminId: req.user.id,
        reason: reason || 'requested_by_customer'
      }
    });

    // Update order status
    order.paymentStatus = amount && amount < order.totalAmount ? 'partially_refunded' : 'refunded';
    order.orderStatus = 'refunded';
    order.refundedAt = new Date();
    order.refundAmount = (order.refundAmount || 0) + (amount || order.totalAmount);
    await order.save();

    res.status(200).json({
      status: 'success',
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process refund'
    });
  }
};