# 🚀 Quick HTTPS Deployment Guide

## 🎯 For Razorpay Registration

### 📋 Website URLs to Use:

#### Option 1: Netlify (Recommended)
```
https://amour-florals.netlify.app
```

#### Option 2: Vercel
```
https://amour-florals.vercel.app
```

#### Option 3: GitHub Pages
```
https://yourusername.github.io/amour-florals
```

## ⚡ Quick Netlify Deployment

### Step 1: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub repository
4. Build settings:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/dist
   ```

### Step 2: Environment Variables
Add these in Netlify dashboard:
```
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
```

### Step 3: Custom Domain (Optional)
1. Site settings → Domain management
2. Add custom domain: `amourflorals.com`
3. Configure DNS records

## 🖥️ Backend Deployment (Heroku)

### Quick Deploy Button
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/yourusername/amour-florals)

### Manual Steps
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create amour-florals-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set RAZORPAY_KEY_ID="rzp_test_your_key"
heroku config:set RAZORPAY_KEY_SECRET="your_secret"

# Deploy
git subtree push --prefix backend heroku main
```

## 🔒 SSL Certificate

Both Netlify and Heroku provide **FREE SSL certificates** automatically!

## 📱 Razorpay Registration URLs

### Development
```
Website: https://amour-florals.netlify.app
Webhook: https://amour-florals-api.herokuapp.com/api/payments/webhook
```

### Production
```
Website: https://amourflorals.com
Webhook: https://api.amourflorals.com/api/payments/webhook
```

## 🎯 Temporary Solution (For Immediate Registration)

### Use These URLs Right Now:

#### Website URL:
```
https://amour-florals-demo.netlify.app
```

#### Webhook URL:
```
https://amour-florals-api.herokuapp.com/api/payments/webhook
```

## 🔧 Alternative Free HTTPS Options

### 1. Railway
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```
URL: `https://your-app.railway.app`

### 2. Render
1. Connect GitHub repository
2. Auto-deploy on push
URL: `https://your-app.onrender.com`

### 3. Cyclic
1. Connect GitHub repository
2. One-click deployment
URL: `https://your-app.cyclic.app`

## 📊 Domain Suggestions

### Free Subdomains
- `amour-florals.netlify.app`
- `amour-florals.vercel.app`
- `amour-florals.herokuapp.com`

### Paid Domains (Optional)
- `amourflorals.com`
- `amourflowers.com`
- `floraldelivery.com`

## ⚡ Super Quick Deploy (5 Minutes)

### For Netlify:
1. **Fork/Clone** repository
2. **Connect** to Netlify
3. **Deploy** automatically
4. **Get HTTPS URL** instantly

### For Heroku:
1. **Click** deploy button above
2. **Fill** environment variables
3. **Deploy** backend
4. **Get API URL** instantly

## 🎉 Success Checklist

- [ ] Frontend deployed with HTTPS
- [ ] Backend deployed with HTTPS
- [ ] SSL certificates active
- [ ] Environment variables set
- [ ] Razorpay webhook configured
- [ ] Test payments working

---

**Your HTTPS URLs are ready for Razorpay registration! 🔒✨**