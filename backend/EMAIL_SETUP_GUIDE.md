# Email System Setup Guide 📧

## Overview
The email system is now fully implemented with production-ready features including:
- Order confirmation emails
- Welcome emails for new users
- Password reset emails
- Order status update notifications
- Email queue for reliability
- Admin email management

## Environment Configuration

Add these variables to your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Amour Florals <noreply@amourflorals.com>

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

## Gmail Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

## Email Templates

### 1. Welcome Email
- Sent automatically when user registers
- Includes welcome offer code
- Links to browse products and complete profile

### 2. Order Confirmation
- Sent when order is created
- Detailed order summary with items
- Shipping address and tracking link
- Professional invoice-style layout

### 3. Password Reset
- Sent when user requests password reset
- Secure reset link with 1-hour expiry
- Security warnings and instructions

### 4. Order Status Updates
- Sent when admin updates order status
- Includes tracking number if available
- Status-specific messaging and colors

## Email Queue System

For production reliability, emails use a queue system:

- **Immediate sending** attempted first
- **Queue fallback** if immediate sending fails
- **Retry logic** with 3 attempts
- **5-second delays** between retries
- **Admin monitoring** via API endpoints

## API Endpoints

### Admin Email Management

```bash
# Get queue status
GET /api/email/queue/status

# Clear queue (emergency)
DELETE /api/email/queue

# Send test email
POST /api/email/test
{
  "to": "test@example.com",
  "type": "welcome|order-confirmation|password-reset|order-status",
  "testData": { "name": "Test User" }
}

# Send custom email
POST /api/email/custom
{
  "to": "user@example.com",
  "subject": "Custom Subject",
  "html": "<h1>Custom HTML content</h1>",
  "text": "Plain text version"
}
```

## Integration Points

### 1. User Registration
- `backend/controllers/auth.js` → `register` function
- Automatically sends welcome email

### 2. Order Creation
- `backend/controllers/orders.js` → `createOrder` function
- Sends order confirmation email

### 3. Order Status Updates
- `backend/controllers/orders.js` → `updateOrderStatus` function
- Sends status update email when status changes

### 4. Password Reset
- `backend/controllers/auth.js` → `forgotPassword` function
- Sends password reset email

## Production Considerations

### 1. Email Service Provider
- **Gmail**: Good for development/small scale
- **SendGrid**: Recommended for production
- **AWS SES**: Cost-effective for high volume
- **Mailgun**: Developer-friendly

### 2. Rate Limiting
- Gmail: 500 emails/day for free accounts
- Consider upgrading to Google Workspace for higher limits
- Implement proper rate limiting in production

### 3. Monitoring
- Monitor email queue status
- Set up alerts for failed emails
- Track email delivery rates
- Log email sending errors

### 4. Security
- Use app passwords, not account passwords
- Rotate email credentials regularly
- Monitor for suspicious email activity
- Implement email verification for sensitive actions

## Testing

### Test Email Functionality
```bash
# Test welcome email
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"to": "test@example.com", "type": "welcome"}'

# Test order confirmation
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"to": "test@example.com", "type": "order-confirmation"}'
```

### Check Queue Status
```bash
curl -X GET http://localhost:5000/api/email/queue/status \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Troubleshooting

### Common Issues

1. **"Authentication failed"**
   - Check if 2FA is enabled
   - Verify app password is correct
   - Ensure EMAIL_USERNAME is correct

2. **"Connection timeout"**
   - Check internet connection
   - Verify Gmail SMTP settings
   - Try different email service

3. **Emails not sending**
   - Check email queue status
   - Verify environment variables
   - Check server logs for errors

4. **Emails going to spam**
   - Set up proper SPF/DKIM records
   - Use professional email address
   - Avoid spam trigger words

### Debug Mode
Set `NODE_ENV=development` to see detailed email logs.

## Future Enhancements

1. **Email Templates Editor** - Admin panel for editing templates
2. **Email Analytics** - Track open rates, click rates
3. **Bulk Email System** - Newsletter and promotional emails
4. **Email Preferences** - User subscription management
5. **Advanced Queuing** - Redis-based queue for high volume

## Support

For email system issues:
1. Check server logs for error messages
2. Verify email configuration
3. Test with different email addresses
4. Monitor queue status regularly