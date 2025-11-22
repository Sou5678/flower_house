const mongoose = require('mongoose');
const emailService = require('../utils/emailService');
const emailQueue = require('../utils/emailQueue');
require('dotenv').config();

// Test email functionality
async function testEmailSystem() {
  console.log('🧪 Testing Email System...\n');

  // Test data
  const testUser = {
    email: process.env.TEST_EMAIL || 'test@example.com',
    fullName: 'Test User'
  };

  const testOrder = {
    orderId: 'TEST-001',
    orderNumber: 'TEST-001',
    customerName: 'Test User',
    items: [
      {
        name: 'Red Roses Bouquet',
        quantity: 2,
        price: 50,
        image: '/placeholder-flower.jpg'
      },
      {
        name: 'White Lilies',
        quantity: 1,
        price: 35,
        image: '/placeholder-flower.jpg'
      }
    ],
    subtotal: 135,
    shippingCost: 10,
    total: 145,
    status: 'confirmed',
    createdAt: new Date(),
    shippingAddress: {
      name: 'Test User',
      address: '123 Test Street, Apt 4B',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      phone: '9876543210'
    },
    _id: 'test-order-id'
  };

  try {
    // Test 1: Welcome Email
    console.log('1️⃣ Testing Welcome Email...');
    await emailService.sendWelcomeEmail(testUser.email, testUser.fullName);
    console.log('✅ Welcome email sent successfully\n');

    // Test 2: Order Confirmation Email
    console.log('2️⃣ Testing Order Confirmation Email...');
    await emailService.sendOrderConfirmation(testUser.email, testOrder);
    console.log('✅ Order confirmation email sent successfully\n');

    // Test 3: Password Reset Email
    console.log('3️⃣ Testing Password Reset Email...');
    await emailService.sendPasswordResetEmail(testUser.email, 'test-reset-token-123', testUser.fullName);
    console.log('✅ Password reset email sent successfully\n');

    // Test 4: Order Status Update Email
    console.log('4️⃣ Testing Order Status Update Email...');
    const statusUpdateOrder = {
      ...testOrder,
      status: 'shipped',
      trackingNumber: 'TRK123456789',
      statusMessage: 'Your beautiful flowers are on their way!'
    };
    await emailService.sendOrderStatusUpdate(testUser.email, statusUpdateOrder);
    console.log('✅ Order status update email sent successfully\n');

    // Test 5: Email Queue
    console.log('5️⃣ Testing Email Queue System...');
    
    // Add emails to queue
    await emailQueue.queueWelcomeEmail(testUser.email, testUser.fullName);
    await emailQueue.queueOrderConfirmation(testUser.email, testOrder);
    
    // Check queue status
    const queueStatus = emailQueue.getQueueStatus();
    console.log('📊 Queue Status:', queueStatus);
    console.log('✅ Email queue system working\n');

    // Test 6: Custom Email
    console.log('6️⃣ Testing Custom Email...');
    await emailQueue.queueCustomEmail(
      testUser.email,
      'Test Custom Email - Amour Florals',
      `
        <h1>Custom Email Test</h1>
        <p>Hello ${testUser.fullName},</p>
        <p>This is a test of the custom email functionality.</p>
        <p>Best regards,<br>Amour Florals Team</p>
      `,
      'Custom Email Test - This is a test of the custom email functionality.'
    );
    console.log('✅ Custom email queued successfully\n');

    console.log('🎉 All email tests completed successfully!');
    console.log('\n📧 Check your email inbox:', testUser.email);
    console.log('\n💡 Tips:');
    console.log('- Check spam folder if emails not in inbox');
    console.log('- Verify EMAIL_USERNAME and EMAIL_PASSWORD in .env');
    console.log('- Make sure 2FA and app password are set up for Gmail');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has correct email configuration');
    console.log('2. Verify Gmail app password is correct');
    console.log('3. Ensure 2-factor authentication is enabled');
    console.log('4. Check internet connection');
    console.log('5. Try with a different email service');
  }
}

// Run tests
if (require.main === module) {
  testEmailSystem().then(() => {
    console.log('\n✨ Email system test completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Test script error:', error);
    process.exit(1);
  });
}

module.exports = testEmailSystem;