const nodemailer = require('nodemailer');
const emailQueue = require('./emailQueue');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email service is disabled
      if (process.env.EMAIL_DISABLED === 'true') {
        console.log('📧 Email service is disabled');
        this.transporter = null;
        return;
      }

      // Check if email credentials are provided
      if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
        console.log('📧 Email credentials not provided, disabling email service');
        this.transporter = null;
        return;
      }

      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        },
        secure: true,
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service connection failed:', error);
        } else {
          console.log('Email service ready');
        }
      });
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
    }
  }

  async sendEmail(mailOptions) {
    try {
      if (!this.transporter) {
        console.log('📧 Email service disabled - skipping email:', mailOptions.subject);
        return { messageId: 'disabled', status: 'skipped' };
      }

      const result = await this.transporter.sendMail(mailOptions);
      console.log('📧 Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      // Don't throw error, just log it to prevent app crashes
      return { error: error.message, status: 'failed' };
    }
  }

  // Queue-based email methods for production reliability
  async sendWelcomeEmail(user) {
    try {
      // For immediate sending (existing functionality)
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
        to: user.email,
        subject: 'Welcome to Amour Florals! 🌸',
        html: this.getWelcomeTemplate(user)
      };

      await this.sendEmail(mailOptions);
    } catch (error) {
      // Fallback to queue if immediate sending fails
      console.log('Immediate email failed, adding to queue:', error.message);
      await emailQueue.queueWelcomeEmail(user.email, user.fullName);
    }
  }

  async sendOrderConfirmation(user, order) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
        to: user.email,
        subject: `Order Confirmation - #${order.orderNumber}`,
        html: this.getOrderConfirmationTemplate(order, user)
      };

      await this.sendEmail(mailOptions);
    } catch (error) {
      console.log('Immediate email failed, adding to queue:', error.message);
      // Transform order data for queue
      const orderData = {
        orderId: order.orderNumber,
        customerName: user.fullName,
        items: order.items,
        total: order.total,
        subtotal: order.subtotal || order.total,
        shippingCost: order.shippingCost || 0,
        status: order.status || 'confirmed',
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        _id: order._id
      };
      await emailQueue.queueOrderConfirmation(user.email, orderData);
    }
  }

  async sendPaymentFailureNotification(user, order) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
      to: user.email,
      subject: `Payment Failed - ${order.orderNumber}`,
      html: this.getPaymentFailureTemplate(user, order)
    };

    try {
      await this.sendEmail(mailOptions);
    } catch (error) {
      console.log('Payment failure email could not be sent:', error.message);
      // This is critical, so we might want to retry or alert admin
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
        to: user.email,
        subject: 'Reset Your Password - Amour Florals',
        html: this.getPasswordResetTemplate(user, resetURL)
      };

      await this.sendEmail(mailOptions);
    } catch (error) {
      console.log('Immediate email failed, adding to queue:', error.message);
      await emailQueue.queuePasswordResetEmail(user.email, resetToken, user.fullName);
    }
  }

  async sendOrderStatusUpdate(user, order) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
        to: user.email,
        subject: `Order Update - #${order.orderNumber}`,
        html: this.getOrderStatusUpdateTemplate(user, order)
      };

      await this.sendEmail(mailOptions);
    } catch (error) {
      console.log('Immediate email failed, adding to queue:', error.message);
      const orderData = {
        orderId: order.orderNumber,
        customerName: user.fullName,
        status: order.status,
        trackingNumber: order.trackingNumber,
        statusMessage: order.statusMessage,
        _id: order._id
      };
      await emailQueue.queueOrderStatusUpdate(user.email, orderData);
    }
  }

  getWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Amour Florals</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🌸 Welcome to Amour Florals!</h1>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Hello ${user.fullName}!</h2>
          
          <p>Welcome to Amour Florals - where every bloom tells a story of love and beauty! 🌹</p>
          
          <p>We're thrilled to have you join our community of flower lovers. Here's what you can look forward to:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul style="margin: 0; padding-left: 20px;">
              <li>🌺 Fresh, premium quality flowers delivered to your doorstep</li>
              <li>💝 Special occasion arrangements and custom bouquets</li>
              <li>🎉 Exclusive member discounts and early access to new collections</li>
              <li>📱 Easy ordering through our user-friendly website</li>
              <li>🚚 Fast and reliable delivery service</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/products" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px;">
              Browse Our Collection
            </a>
            <a href="${process.env.FRONTEND_URL}/profile" 
               style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px;">
              Complete Your Profile
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="margin-top: 0; color: #856404;">🎁 Special Welcome Offer!</h3>
            <p style="margin-bottom: 0; color: #856404;">Use code <strong>WELCOME10</strong> for 10% off your first order!</p>
          </div>
          
          <p>If you have any questions or need assistance, our customer support team is always here to help.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #666; font-size: 14px;">
            Happy shopping!<br>
            The Amour Florals Team<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #667eea;">www.amourflorals.com</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getOrderConfirmationTemplate(order, user) {
    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.image || '/placeholder-flower.jpg'}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <small>Quantity: ${item.quantity}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🌸 Amour Florals</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Order Confirmation</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Thank you for your order!</h2>
          
          <p>Hi ${user.fullName},</p>
          <p>We've received your order and it's being processed. Here are the details:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Order Details</h3>
            <p><strong>Order ID:</strong> #${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${order.status || 'Confirmed'}</span></p>
          </div>
          
          <h3>Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Details</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div style="text-align: right; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Subtotal: ₹${(order.subtotal || order.total).toFixed(2)}</strong></p>
            <p style="margin: 5px 0;"><strong>Shipping: ₹${(order.shippingCost || 0).toFixed(2)}</strong></p>
            <p style="margin: 5px 0; font-size: 18px; color: #667eea;"><strong>Total: ₹${order.total.toFixed(2)}</strong></p>
          </div>
          
          ${order.shippingAddress ? `
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1976d2;">Shipping Address</h3>
            <p style="margin: 0;">
              ${order.shippingAddress.name || user.fullName}<br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}<br>
              Phone: ${order.shippingAddress.phone}
            </p>
          </div>
          ` : ''}
          
          <p>We'll send you another email when your order ships. If you have any questions, please contact us.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
              Track Your Order
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #666; font-size: 14px;">
            Thank you for choosing Amour Florals!<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #667eea;">Visit our website</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getPaymentFailureTemplate(user, order) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Failed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">⚠️ Payment Failed</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Order #${order.orderNumber}</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #dc3545; margin-top: 0;">Payment Processing Failed</h2>
          
          <p>Hello ${user.fullName},</p>
          <p>Unfortunately, we were unable to process your payment for order #${order.orderNumber}.</p>
          
          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="margin-top: 0; color: #721c24;">What happened?</h3>
            <p style="margin-bottom: 0; color: #721c24;">Your payment could not be processed. This might be due to insufficient funds, card restrictions, or a temporary issue with your payment method.</p>
          </div>
          
          <h3>Next Steps:</h3>
          <ul>
            <li>Check your payment method details</li>
            <li>Ensure sufficient funds are available</li>
            <li>Try a different payment method</li>
            <li>Contact your bank if the issue persists</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
               style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px;">
              Retry Payment
            </a>
            <a href="${process.env.FRONTEND_URL}/contact" 
               style="background: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 10px;">
              Contact Support
            </a>
          </div>
          
          <p>Your order is still reserved for 24 hours. Please complete the payment to secure your beautiful flowers!</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #666; font-size: 14px;">
            Need help? We're here for you!<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #667eea;">Amour Florals</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(user, resetURL) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🌸 Amour Florals</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Password Reset Request</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Reset Your Password</h2>
          
          <p>Hi ${user.fullName},</p>
          <p>We received a request to reset your password for your Amour Florals account.</p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetURL}
          </p>
          
          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <p style="margin: 0; color: #721c24;"><strong>⏰ Important:</strong> This password reset link will expire in 1 hour for security reasons.</p>
          </div>
          
          <p>If you're having trouble with the button above, you can also reset your password by visiting our website and using the "Forgot Password" option.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #666; font-size: 14px;">
            Need help? Contact our support team<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #667eea;">Amour Florals</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }

  getOrderStatusUpdateTemplate(user, order) {
    const statusColors = {
      'pending': '#ffc107',
      'confirmed': '#17a2b8',
      'processing': '#fd7e14',
      'shipped': '#6f42c1',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };

    const statusColor = statusColors[order.status.toLowerCase()] || '#6c757d';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🌸 Amour Florals</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Order Status Update</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Order Update</h2>
          
          <p>Hi ${user.fullName},</p>
          <p>Your order status has been updated:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Order #${order.orderNumber}</h3>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${order.status}</span></p>
            <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${order.trackingNumber ? `
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #155724;">📦 Tracking Information</h3>
            <p style="margin-bottom: 0; color: #155724;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
          </div>
          ` : ''}
          
          ${order.statusMessage ? `
          <div style="background: #e2e3e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${order.statusMessage}"</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
              View Order Details
            </a>
          </div>
          
          <p>Thank you for your patience. If you have any questions about your order, please don't hesitate to contact us.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #666; font-size: 14px;">
            Thank you for choosing Amour Florals!<br>
            <a href="${process.env.FRONTEND_URL}" style="color: #667eea;">Visit our website</a>
          </p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();