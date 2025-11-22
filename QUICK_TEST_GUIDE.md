# 🚀 Quick Test Guide - Amour Florals

## ⚡ Quick Start Testing

### 1. 👤 Login as Customer
```
URL: http://localhost:5173/login
Email: customer@test.com
Password: customer123
```

### 2. 🛒 Test Shopping Flow
1. Browse products on homepage
2. Add flowers to cart
3. Go to checkout
4. Use pre-filled address (Bangalore)
5. Pay with test card: `4111 1111 1111 1111`

### 3. 👨‍💼 Login as Admin
```
URL: http://localhost:5173/login
Email: admin@test.com
Password: admin123
```
Then click the gear icon → Admin Panel

## 💳 Razorpay Test Cards

### ✅ Successful Payment
```
Card: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
```

### ❌ Failed Payment
```
Card: 4000 0000 0000 0002
Expiry: 12/25
CVV: 123
```

### 💰 Insufficient Funds
```
Card: 4000 0000 0000 9995
Expiry: 12/25
CVV: 123
```

## 📱 Test UPI IDs
```
success@razorpay (Success)
failure@razorpay (Failure)
```

## 🏦 Test Net Banking
- Select any bank
- Use any username/password
- Payment will succeed in test mode

## 🎯 Quick Test Scenarios

### Scenario 1: Complete Purchase
1. Login: `customer@test.com` / `customer123`
2. Add products to cart
3. Checkout with saved address
4. Pay with: `4111 1111 1111 1111`
5. Verify order confirmation

### Scenario 2: Admin Management
1. Login: `admin@test.com` / `admin123`
2. Access admin panel
3. View dashboard analytics
4. Manage products/orders

### Scenario 3: Payment Failure
1. Login as any user
2. Add products to cart
3. Try payment with: `4000 0000 0000 0002`
4. Verify failure handling

## 🔧 Troubleshooting

### Common Issues
- **Payment not working?** Check Razorpay keys in .env
- **Admin panel not showing?** Clear browser cache
- **Orders not creating?** Check backend logs

### Reset Commands
```bash
# Reset admin password
npm run reset-admin-password

# Recreate test users
npm run create-test-users
```

## 📊 Test Data

All test users have:
- ✅ Valid addresses
- ✅ Phone numbers
- ✅ Different cities (Mumbai, Delhi, Bangalore, Chennai)
- ✅ Ready for checkout

## 🎉 Success Indicators

### Frontend Working ✅
- [ ] Homepage loads
- [ ] Products display
- [ ] Cart functionality
- [ ] Checkout process
- [ ] Payment integration

### Backend Working ✅
- [ ] API responses
- [ ] Database connections
- [ ] Payment processing
- [ ] Order creation
- [ ] Email notifications

### Admin Panel Working ✅
- [ ] Admin login
- [ ] Dashboard analytics
- [ ] Product management
- [ ] Order management
- [ ] User management

---
**Happy Testing! 🎊**