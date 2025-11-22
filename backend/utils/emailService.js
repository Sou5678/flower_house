const nodemailer = require('nodemailer');
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
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

  async sendEmail(to, subject, html, text = null) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Order confirmation email
  async sendOrderConfirmation(userEmail, orderData) {
    const subject = `Order Confirmation - #${orderData.orderId}`;
    const html = this.generateOrderConfirmationHTML(orderData);
    return this.sendEmail(userEmail, subject, html);
  }

  // Welcome email
  async sendWelcomeEmail(userEmail, userName) {
    const subject = 'Welcome to Amour Florals! 🌸';
    const html = this.generateWelcomeHTML(userName);
    return this.sendEmail(userEmail, subject, html);
  }

  // Password reset email
  async sendPasswordResetEmail(userEmail, resetToken, userName) {
    const subject = 'Reset Your Password - Amour Florals';
    const html = this.generatePasswordResetHTML(resetToken, userName);
    return this.sendEmail(userEmail, subject, html);
  }

  // Order status update email
  async sendOrderStatusUpdate(userEmail, orderData) {
    const subject = `Order Update - #${orderData.orderId}`;
    const html = this.generateOrderStatusHTML(orderData);
    return this.sendEmail(userEmail, subject, html);
  }

  generateOrderConfirmationHTML(orderData) {
    const itemsHTML = orderData.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br>
          <small>Quantity: ${item.quantity}</small>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${item.price * item.quantity}
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
          
          <p>Hi ${orderData.customerName},</p>
          <p>We've received your order and it's being processed. Here are the details:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderData.orderId}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">${orderData.status}</span></p>
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
            <p style="margin: 5px 0;"><strong>Subtotal: ₹${orderData.subtotal}</strong></p>
            <p style="margin: 5px 0;"><strong>Shipping: ₹${orderData.shippingCost || 0}</strong></p>
            <p style="margin: 5px 0; font-size: 18px; color: #667eea;"><strong>Total: ₹${orderData.total}</strong></p>
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1976d2;">Shipping Address</h3>
            <p style="margin: 0;">
              ${orderData.shippingAddress.name}<br>
              ${orderData.shippingAddress.address}<br>
              ${orderData.shippingAddress.city}, ${orderData.shippingAddress.state} ${orderData.shippingAddress.pincode}<br>
              Phone: ${orderData.shippingAddress.phone}
            </p>
          </div>
          
          <p>We'll send you another email when your order ships. If you have any questions, please contact us.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${orderData._id}" 
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

  generateWelcomeHTML(userName) {
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
          <h2 style="color: #667eea; margin-top: 0;">Hello ${userName}!</h2>
          
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

  generatePasswordResetHTML(resetToken, userName) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
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
          
          <p>Hi ${userName},</p>
          <p>We received a request to reset your password for your Amour Florals account.</p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;"><strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
              Reset My Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetUrl}
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

  generateOrderStatusHTML(orderData) {
    const statusColors = {
      'pending': '#ffc107',
      'confirmed': '#17a2b8',
      'processing': '#fd7e14',
      'shipped': '#6f42c1',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };

    const statusColor = statusColors[orderData.status.toLowerCase()] || '#6c757d';

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
          
          <p>Hi ${orderData.customerName},</p>
          <p>Your order status has been updated:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Order #${orderData.orderId}</h3>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase;">${orderData.status}</span></p>
            <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          ${orderData.trackingNumber ? `
          <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="margin-top: 0; color: #155724;">📦 Tracking Information</h3>
            <p style="margin-bottom: 0; color: #155724;"><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>
          </div>
          ` : ''}
          
          ${orderData.statusMessage ? `
          <div style="background: #e2e3e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic;">"${orderData.statusMessage}"</p>
          </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/orders/${orderData._id}" 
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