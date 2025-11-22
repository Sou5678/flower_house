const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Welcome to Amour Florals!',
      html: this.getWelcomeTemplate(user)
    };

    await this.sendEmail(mailOptions);
  }

  async sendOrderConfirmation(user, order) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: this.getOrderConfirmationTemplate(user, order)
    };

    await this.sendEmail(mailOptions);
  }

  async sendPaymentFailureNotification(user, order) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Payment Failed - ${order.orderNumber}`,
      html: this.getPaymentFailureTemplate(user, order)
    };

    await this.sendEmail(mailOptions);
  }

  async sendPasswordResetEmail(user, resetToken) {
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request - Amour Florals',
      html: this.getPasswordResetTemplate(user, resetURL)
    };

    await this.sendEmail(mailOptions);
  }

  async sendEmail(mailOptions) {
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Email could not be sent');
    }
  }

  getWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 30px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Amour Florals! 🌸</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName},</h2>
            <p>Thank you for joining Amour Florals! We're excited to have you as part of our flower-loving community.</p>
            <p>Start exploring our beautiful collections and create unforgettable moments with our artfully crafted bouquets.</p>
            <p>Happy shopping!<br>The Amour Florals Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Amour Florals. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getOrderConfirmationTemplate(order, user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 30px; text-align: center; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .item { display: flex; justify-content: space-between; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed! 🌺</h1>
            <p>Order #${order.orderNumber}</p>
          </div>
          <div class="content">
            <h2>Thank you for your order, ${user.fullName}!</h2>
            <p>We're preparing your beautiful flowers with care and love.</p>
            
            <div class="order-details">
              <h3>Order Summary</h3>
              ${order.items.map(item => `
                <div class="item">
                  <span>${item.name} x ${item.quantity}</span>
                  <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
              <hr>
              <div class="item">
                <strong>Total: $${order.total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
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
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; }
          .content { padding: 20px; }
          .button { background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Failed</h1>
            <p>Order #${order.orderNumber}</p>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName},</h2>
            <p>Unfortunately, we were unable to process your payment for order #${order.orderNumber}.</p>
            <p>Please try again or contact our support team for assistance.</p>
            <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">Retry Payment</a>
            <p>Thank you for choosing Amour Florals!</p>
          </div>
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
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; padding: 30px; text-align: center; }
          .button { background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.fullName},</h2>
            <p>You requested to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetURL}" class="button">Reset Password</a>
            </p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();