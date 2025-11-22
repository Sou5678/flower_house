# MVP Implementation Guide - Amour Florals

## 🎯 IMMEDIATE TASKS (Next 7 Days)

### Day 1: Payment Integration Setup

#### Backend Payment Setup
```bash
cd backend
npm install stripe
```

#### Create Payment Controller
```javascript
// backend/controllers/payment.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      metadata: {
        userId: req.user.id,
        orderId: req.body.orderId
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        clientSecret: paymentIntent.client_secret
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Handle webhook
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed.`);
  }
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // Update order status to paid
    // Send confirmation email
    // Reduce inventory
  }
  
  res.json({ received: true });
};
```

#### Frontend Payment Setup
```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### Create Checkout Component
```jsx
// frontend/src/components/CheckoutForm.jsx
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ total, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    // Create payment intent
    const response = await fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total })
    });
    
    const { clientSecret } = await response.json();

    // Confirm payment
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (result.error) {
      console.error(result.error.message);
    } else {
      onSuccess(result.paymentIntent);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay $${total}`}
      </button>
    </form>
  );
};

export default function Checkout({ total, onSuccess }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm total={total} onSuccess={onSuccess} />
    </Elements>
  );
}
```

### Day 2: Email System Setup

#### Configure Nodemailer
```javascript
// backend/utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendOrderConfirmation = async (order, user) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <h1>Thank you for your order!</h1>
      <p>Order Number: ${order.orderNumber}</p>
      <p>Total: $${order.total}</p>
      <p>We'll send you updates as your order is processed.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
```

### Day 3: Image Upload Setup

#### Cloudinary Configuration
```javascript
// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

#### Image Upload Middleware
```javascript
// backend/middleware/upload.js
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadProductImage = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const result = await cloudinary.uploader.upload_stream(
      { folder: 'amour-florals/products' },
      (error, result) => {
        if (error) throw error;
        req.imageUrl = result.secure_url;
        next();
      }
    ).end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## 🚀 LAUNCH CHECKLIST

### Pre-Launch (Day 6-7)
- [ ] All payment flows tested
- [ ] Email system working
- [ ] Image uploads functional
- [ ] Real product data added
- [ ] Admin panel complete
- [ ] Error handling implemented
- [ ] Mobile responsive
- [ ] Performance optimized

### Launch Day (Day 7)
- [ ] Production environment ready
- [ ] Domain configured
- [ ] SSL certificate installed
- [ ] Analytics setup (Google Analytics)
- [ ] Monitoring setup
- [ ] Backup system ready

### Post-Launch (Week 2)
- [ ] Monitor for bugs
- [ ] Customer feedback collection
- [ ] Performance monitoring
- [ ] Feature usage analytics
- [ ] Plan next iteration

## 📊 SUCCESS METRICS

### Week 1 Targets
- [ ] Complete user registration flow
- [ ] Process first test order
- [ ] Send first confirmation email
- [ ] Upload first product image
- [ ] Admin can manage orders

### Month 1 Targets
- [ ] 100+ registered users
- [ ] 50+ orders processed
- [ ] 95%+ uptime
- [ ] <3s page load time
- [ ] Customer satisfaction >4/5

## 🛠️ DEVELOPMENT WORKFLOW

### Daily Routine
1. **Morning**: Check overnight issues
2. **Development**: Focus on priority tasks
3. **Testing**: Test new features
4. **Evening**: Deploy to staging
5. **Review**: Plan next day tasks

### Quality Assurance
- Test on multiple devices
- Check all user flows
- Verify payment processing
- Test email delivery
- Performance testing

## 🎯 NEXT STEPS

After MVP launch, focus on:
1. Customer feedback implementation
2. Advanced features (reviews, recommendations)
3. Mobile app development
4. Marketing integrations
5. Analytics and optimization

Remember: **Perfect is the enemy of good. Launch with MVP, iterate based on real user feedback!** 🚀