# 🧪 Test Credentials & Demo Accounts

## 👥 Test User Accounts

### 🔑 Admin Account
```
Email: admin@test.com
Password: admin123
Role: Administrator
Access: Full admin panel access
```

### 👤 Regular Users

#### User 1 - John Doe
```
Email: john@test.com
Password: user123
Phone: +91-9876543211
Address: 123 Main Street, Mumbai, Maharashtra 400001
```

#### User 2 - Jane Smith
```
Email: jane@test.com
Password: user123
Phone: +91-9876543212
Address: 456 Park Avenue, Delhi, Delhi 110001
```

#### User 3 - Test Customer
```
Email: customer@test.com
Password: customer123
Phone: +91-9876543213
Address: 789 Rose Garden, Bangalore, Karnataka 560001
```

#### User 4 - Demo User
```
Email: demo@test.com
Password: demo123
Phone: +91-9876543214
Address: 321 Flower Street, Chennai, Tamil Nadu 600001
```

## 💳 Razorpay Test Credentials

### Test API Keys
```
Key ID: rzp_test_1DP5mmOlF5G5ag
Key Secret: thisissecretkey
```

### Test Payment Methods

#### Test Credit Cards
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
Name: Any name
```

#### Test Debit Cards
```
Card Number: 5555 5555 5555 4444
Expiry: Any future date
CVV: Any 3 digits
```

#### Test UPI IDs
```
UPI ID: success@razorpay
UPI ID: failure@razorpay (for testing failures)
```

#### Test Net Banking
```
Bank: Any bank from the list
Username: Any username
Password: Any password
```

### Test Payment Scenarios

#### Successful Payment
- Use card: `4111 1111 1111 1111`
- Any future expiry date
- Any CVV

#### Failed Payment
- Use card: `4000 0000 0000 0002`
- Any future expiry date
- Any CVV

#### Insufficient Funds
- Use card: `4000 0000 0000 9995`

## 🌐 Test Environment URLs

### Local Development
```
Frontend: http://localhost:5173
Backend: http://localhost:5000
Admin Panel: http://localhost:5173/admin-complete
```

### Staging/Demo (After Deployment)
```
Frontend: https://amour-florals.netlify.app
Backend: https://amour-florals-api.herokuapp.com
Admin Panel: https://amour-florals.netlify.app/admin-complete
```

## 📱 Test Mobile Numbers

### For OTP Testing (if implemented)
```
+91-9999999999 (Always receives OTP: 123456)
+91-8888888888 (Always receives OTP: 654321)
```

## 📧 Test Email Addresses

### For Email Testing
```
test@mailinator.com
demo@10minutemail.com
temp@guerrillamail.com
```

## 🛒 Test Shopping Flow

### Sample Test Order
1. **Login:** `customer@test.com` / `customer123`
2. **Add Products:** Browse and add flowers to cart
3. **Checkout:** Use saved address
4. **Payment:** Use test card `4111 1111 1111 1111`
5. **Confirmation:** Check order confirmation page

### Sample Admin Flow
1. **Login:** `admin@test.com` / `admin123`
2. **Dashboard:** View analytics and stats
3. **Products:** Add/edit/delete products
4. **Orders:** Manage customer orders
5. **Reports:** Generate sales reports

## 🔧 Setup Test Data

### Run Test User Creation
```bash
cd backend
npm run create-test-users
```

### Reset All Test Data
```bash
cd backend
npm run reset-test-data
```

## 🎯 Testing Scenarios

### User Registration & Login
- [x] New user registration
- [x] Email verification (if enabled)
- [x] Login with valid credentials
- [x] Login with invalid credentials
- [x] Password reset flow

### Shopping Cart
- [x] Add products to cart
- [x] Update quantities
- [x] Remove items
- [x] Cart persistence across sessions

### Checkout Process
- [x] Address selection/addition
- [x] Payment method selection
- [x] Order summary review
- [x] Payment processing
- [x] Order confirmation

### Admin Functions
- [x] Product management
- [x] Order management
- [x] User management
- [x] Analytics dashboard
- [x] Reports generation

## 🚨 Important Notes

### Security
- ⚠️ **Never use test credentials in production**
- ⚠️ **Always use HTTPS in production**
- ⚠️ **Rotate API keys before going live**

### Data
- 🗑️ **Test data should be cleared before production**
- 📊 **Use realistic test data for better testing**
- 🔄 **Regularly refresh test data**

### Payments
- 💳 **Test payments are not real transactions**
- 🔒 **Switch to live keys for production**
- 📝 **Document all test scenarios**

## 📞 Support

For testing issues:
- Check console logs for errors
- Verify API endpoints are working
- Ensure database connection is stable
- Contact development team if needed

---

**Last Updated:** $(date)
**Version:** 1.0.0