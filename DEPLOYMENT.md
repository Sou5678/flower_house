# Amour Florals - Deployment Guide

## 🚀 Frontend Deployment (Netlify)

### Quick Deploy Button
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/yourusername/amour-florals)

### Manual Deployment Steps

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Connect Repository**
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository

3. **Build Settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.herokuapp.com
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
   ```

5. **Deploy**
   - Click "Deploy site"
   - Your URL: `https://amazing-app-name.netlify.app`

## 🖥️ Backend Deployment (Heroku)

### Quick Deploy Button
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yourusername/amour-florals)

### Manual Deployment Steps

1. **Create Heroku Account**
   - Go to [heroku.com](https://heroku.com)
   - Create free account

2. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

3. **Login and Create App**
   ```bash
   heroku login
   heroku create amour-florals-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set RAZORPAY_KEY_ID=rzp_live_your_key_id
   heroku config:set RAZORPAY_KEY_SECRET=your_key_secret
   heroku config:set RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
   ```

5. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

## 🌐 Custom Domain (Optional)

### Netlify Custom Domain
1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records

### Razorpay Website URL
Use your deployed URL:
```
https://amour-florals.netlify.app
```

## 📱 Mobile App (Future)

### React Native Setup
- Expo CLI for quick development
- React Native CLI for production builds
- App Store & Play Store deployment

## 🔒 SSL Certificate

Both Netlify and Heroku provide free SSL certificates automatically.

## 📊 Analytics Integration

### Google Analytics
```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Facebook Pixel
```javascript
// Add to index.html for marketing tracking
```

## 🚀 Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization with WebP
- CDN for static assets
- Service worker for caching

### Backend
- Database indexing
- Redis caching
- API rate limiting
- Image compression

## 🔧 Monitoring

### Frontend
- Sentry for error tracking
- Google PageSpeed Insights
- Lighthouse CI

### Backend
- New Relic for performance
- LogRocket for user sessions
- Uptime monitoring

## 📈 SEO Optimization

### Meta Tags
```html
<meta name="description" content="Beautiful flower arrangements and bouquets for every occasion">
<meta name="keywords" content="flowers, bouquets, delivery, gifts">
<meta property="og:title" content="Amour Florals - Premium Flower Delivery">
```

### Sitemap
- Generate sitemap.xml
- Submit to Google Search Console
- Bing Webmaster Tools

## 🎯 Marketing Integration

### Email Marketing
- Mailchimp integration
- Newsletter signup
- Abandoned cart emails

### Social Media
- Instagram API for gallery
- Facebook Shop integration
- WhatsApp Business API

## 💳 Payment Gateway URLs

### Razorpay Webhook URLs
- Production: `https://amour-florals-backend.herokuapp.com/api/payments/webhook`
- Staging: `https://amour-florals-staging.herokuapp.com/api/payments/webhook`

### Return URLs
- Success: `https://amour-florals.netlify.app/order-confirmation`
- Cancel: `https://amour-florals.netlify.app/checkout`

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
```

## 📞 Support

For deployment issues:
- Check logs: `heroku logs --tail`
- Netlify deploy logs in dashboard
- Contact support if needed