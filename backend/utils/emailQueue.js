// emailService will be required dynamically to avoid circular dependency

class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.retryAttempts = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  // Add email to queue
  async addToQueue(emailData) {
    const emailJob = {
      id: Date.now() + Math.random(),
      ...emailData,
      attempts: 0,
      createdAt: new Date(),
      status: 'pending'
    };

    this.queue.push(emailJob);
    console.log(`Email added to queue: ${emailJob.type} for ${emailJob.to}`);
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }

    return emailJob.id;
  }

  // Process email queue
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    console.log(`Processing email queue: ${this.queue.length} emails pending`);

    while (this.queue.length > 0) {
      const emailJob = this.queue.shift();
      
      try {
        await this.processEmailJob(emailJob);
        console.log(`Email sent successfully: ${emailJob.type} to ${emailJob.to}`);
      } catch (error) {
        console.error(`Failed to send email: ${emailJob.type} to ${emailJob.to}`, error);
        
        // Retry logic
        emailJob.attempts++;
        if (emailJob.attempts < this.retryAttempts) {
          console.log(`Retrying email (attempt ${emailJob.attempts + 1}/${this.retryAttempts})`);
          
          // Add back to queue with delay
          setTimeout(() => {
            this.queue.unshift(emailJob);
          }, this.retryDelay);
        } else {
          console.error(`Email failed after ${this.retryAttempts} attempts:`, emailJob);
        }
      }

      // Small delay between emails to avoid rate limiting
      await this.delay(1000);
    }

    this.processing = false;
    console.log('Email queue processing completed');
  }

  // Process individual email job
  async processEmailJob(emailJob) {
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransporter({
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

    let mailOptions;
    
    switch (emailJob.type) {
      case 'order-confirmation':
        mailOptions = {
          from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
          to: emailJob.to,
          subject: `Order Confirmation - #${emailJob.orderData.orderId}`,
          html: this.generateOrderConfirmationHTML(emailJob.orderData)
        };
        break;
      
      case 'welcome':
        mailOptions = {
          from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
          to: emailJob.to,
          subject: 'Welcome to Amour Florals! 🌸',
          html: this.generateWelcomeHTML(emailJob.userName)
        };
        break;
      
      case 'password-reset':
        mailOptions = {
          from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
          to: emailJob.to,
          subject: 'Reset Your Password - Amour Florals',
          html: this.generatePasswordResetHTML(emailJob.resetToken, emailJob.userName)
        };
        break;
      
      case 'order-status-update':
        mailOptions = {
          from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
          to: emailJob.to,
          subject: `Order Update - #${emailJob.orderData.orderId}`,
          html: this.generateOrderStatusHTML(emailJob.orderData)
        };
        break;
      
      case 'custom':
        mailOptions = {
          from: process.env.EMAIL_FROM || 'Amour Florals <noreply@amourflorals.com>',
          to: emailJob.to,
          subject: emailJob.subject,
          html: emailJob.html,
          text: emailJob.text
        };
        break;
      
      default:
        throw new Error(`Unknown email type: ${emailJob.type}`);
    }

    return await transporter.sendMail(mailOptions);
  }

  // Utility methods for adding specific email types
  async queueOrderConfirmation(userEmail, orderData) {
    return this.addToQueue({
      type: 'order-confirmation',
      to: userEmail,
      orderData
    });
  }

  async queueWelcomeEmail(userEmail, userName) {
    return this.addToQueue({
      type: 'welcome',
      to: userEmail,
      userName
    });
  }

  async queuePasswordResetEmail(userEmail, resetToken, userName) {
    return this.addToQueue({
      type: 'password-reset',
      to: userEmail,
      resetToken,
      userName
    });
  }

  async queueOrderStatusUpdate(userEmail, orderData) {
    return this.addToQueue({
      type: 'order-status-update',
      to: userEmail,
      orderData
    });
  }

  async queueCustomEmail(to, subject, html, text = null) {
    return this.addToQueue({
      type: 'custom',
      to,
      subject,
      html,
      text
    });
  }

  // Get queue status
  getQueueStatus() {
    return {
      pending: this.queue.length,
      processing: this.processing,
      totalProcessed: this.totalProcessed || 0
    };
  }

  // Clear queue
  clearQueue() {
    this.queue = [];
    console.log('Email queue cleared');
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTML template generation methods
  generateWelcomeHTML(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Amour Florals</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🌸 Welcome to Amour Florals!</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea;">Hello ${userName}!</h2>
          <p>Welcome to Amour Florals - where every bloom tells a story of love and beauty! 🌹</p>
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404;">🎁 Special Welcome Offer!</h3>
            <p style="color: #856404;">Use code <strong>WELCOME10</strong> for 10% off your first order!</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/products" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px;">Browse Our Collection</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateOrderConfirmationHTML(orderData) {
    const itemsHTML = orderData.items.map(item => `
      <tr>
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
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🌸 Order Confirmed!</h1>
          <p>Order #${orderData.orderId}</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea;">Thank you for your order!</h2>
          <p>Hi ${orderData.customerName}, we've received your order and it's being processed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tbody>${itemsHTML}</tbody>
          </table>
          <div style="text-align: right; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <p style="font-size: 18px; color: #667eea;"><strong>Total: ₹${orderData.total}</strong></p>
          </div>
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
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🌸 Password Reset</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea;">Reset Your Password</h2>
          <p>Hi ${userName}, click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Reset My Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        </div>
      </body>
      </html>
    `;
  }

  generateOrderStatusHTML(orderData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Status Update</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🌸 Order Update</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea;">Order Status Update</h2>
          <p>Hi ${orderData.customerName}, your order #${orderData.orderId} status: <strong>${orderData.status}</strong></p>
          ${orderData.trackingNumber ? `<div style="background: #d4edda; padding: 20px; border-radius: 8px;"><p><strong>Tracking:</strong> ${orderData.trackingNumber}</p></div>` : ''}
          ${orderData.statusMessage ? `<div style="background: #e2e3e5; padding: 20px; border-radius: 8px;"><p>"${orderData.statusMessage}"</p></div>` : ''}
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailQueue();