const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const emailQueue = require('../utils/emailQueue');
const emailService = require('../utils/email');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @desc    Get email queue status
// @route   GET /api/email/queue/status
// @access  Private/Admin
router.get('/queue/status', (req, res) => {
  try {
    const status = emailQueue.getQueueStatus();
    res.status(200).json({
      status: 'success',
      data: status
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Clear email queue
// @route   DELETE /api/email/queue
// @access  Private/Admin
router.delete('/queue', (req, res) => {
  try {
    emailQueue.clearQueue();
    res.status(200).json({
      status: 'success',
      message: 'Email queue cleared'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Send test email
// @route   POST /api/email/test
// @access  Private/Admin
router.post('/test', async (req, res) => {
  try {
    const { to, type = 'welcome', testData } = req.body;

    if (!to) {
      return res.status(400).json({
        status: 'error',
        message: 'Email address is required'
      });
    }

    let result;
    
    switch (type) {
      case 'welcome':
        result = await emailService.sendWelcomeEmail({ 
          email: to, 
          fullName: testData?.name || 'Test User' 
        });
        break;
        
      case 'password-reset':
        result = await emailService.sendPasswordResetEmail(
          { email: to, fullName: testData?.name || 'Test User' },
          'test-token-123'
        );
        break;
        
      case 'order-confirmation':
        const mockOrder = {
          orderNumber: 'TEST-001',
          items: [
            {
              name: 'Red Roses Bouquet',
              quantity: 1,
              price: 50,
              image: '/placeholder-flower.jpg'
            }
          ],
          total: 55,
          subtotal: 50,
          shippingCost: 5,
          status: 'confirmed',
          createdAt: new Date(),
          shippingAddress: {
            name: testData?.name || 'Test User',
            address: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            pincode: '123456',
            phone: '9876543210'
          },
          _id: 'test-order-id'
        };
        result = await emailService.sendOrderConfirmation(
          { email: to, fullName: testData?.name || 'Test User' },
          mockOrder
        );
        break;
        
      case 'order-status':
        const mockStatusOrder = {
          orderNumber: 'TEST-002',
          status: 'shipped',
          trackingNumber: 'TRK123456789',
          statusMessage: 'Your order is on its way!',
          _id: 'test-order-id-2'
        };
        result = await emailService.sendOrderStatusUpdate(
          { email: to, fullName: testData?.name || 'Test User' },
          mockStatusOrder
        );
        break;
        
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email type'
        });
    }

    res.status(200).json({
      status: 'success',
      message: `Test ${type} email sent successfully`,
      data: { messageId: result?.messageId }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// @desc    Send custom email
// @route   POST /api/email/custom
// @access  Private/Admin
router.post('/custom', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        status: 'error',
        message: 'Email address, subject, and HTML content are required'
      });
    }

    // Add to queue for reliability
    const jobId = await emailQueue.queueCustomEmail(to, subject, html, text);

    res.status(200).json({
      status: 'success',
      message: 'Custom email queued successfully',
      data: { jobId }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;