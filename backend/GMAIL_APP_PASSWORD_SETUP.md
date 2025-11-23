# Gmail App Password Setup Guide

## क्या है App Password?

App Password एक special 16-character password है जो Gmail account के लिए third-party applications (जैसे हमारा Node.js app) को access देने के लिए use होता है। यह आपका normal Gmail password नहीं है।

## Step-by-Step Setup:

### 1. **Gmail Account में 2-Factor Authentication Enable करें**
   - Gmail account में login करें
   - Google Account settings में जाएं: https://myaccount.google.com/
   - "Security" section में जाएं
   - "2-Step Verification" को enable करें (अगर already enabled नहीं है)

### 2. **App Password Generate करें**
   - Google Account Security page पर जाएं
   - "2-Step Verification" section में scroll करें
   - "App passwords" option को find करें और click करें
   - अगर यह option नहीं दिख रहा तो:
     - पहले 2FA properly setup करें
     - कुछ minutes wait करें

### 3. **App Password Create करें**
   - "Select app" dropdown में "Mail" select करें
   - "Select device" dropdown में "Other (custom name)" select करें
   - Name enter करें: "Apna Flar Backend" या कोई भी name
   - "Generate" button click करें

### 4. **Generated Password Copy करें**
   - 16-character password generate होगा (जैसे: `abcd efgh ijkl mnop`)
   - इसे copy करें (spaces ignore करें)
   - यह password केवल एक बार दिखेगा!

### 5. **Backend .env File में Add करें**
   ```env
   # Email Configuration (Gmail App Password)
   EMAIL_SERVICE=gmail
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop
   EMAIL_FROM=Apna Flar <your-email@gmail.com>
   ```

## Important Notes:

### ✅ **Do's:**
- हमेशा App Password use करें, normal password नहीं
- App Password को secure रखें
- Different apps के लिए different app passwords create करें
- .env file को .gitignore में add करें

### ❌ **Don'ts:**
- Normal Gmail password use न करें
- App Password को publicly share न करें
- App Password को code में hardcode न करें

## Alternative Email Services:

### **अगर Gmail App Password setup नहीं कर सकते:**

1. **Outlook/Hotmail:**
   ```env
   EMAIL_SERVICE=hotmail
   EMAIL_USERNAME=your-email@outlook.com
   EMAIL_PASSWORD=your-outlook-password
   ```

2. **Yahoo Mail:**
   ```env
   EMAIL_SERVICE=yahoo
   EMAIL_USERNAME=your-email@yahoo.com
   EMAIL_PASSWORD=your-yahoo-app-password
   ```

3. **Custom SMTP:**
   ```env
   EMAIL_HOST=smtp.your-provider.com
   EMAIL_PORT=587
   EMAIL_USERNAME=your-email@domain.com
   EMAIL_PASSWORD=your-password
   ```

## Testing Email Setup:

### **Backend में test करने के लिए:**
```javascript
// Test email function (temporary)
const testEmail = async () => {
  try {
    await EmailService.sendWelcomeEmail({
      email: 'test@example.com',
      fullName: 'Test User'
    });
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
};
```

## Troubleshooting:

### **Common Issues:**

1. **"Invalid login" error:**
   - Check if 2FA is enabled
   - Verify app password is correct
   - Make sure using app password, not normal password

2. **"App passwords" option missing:**
   - Enable 2-Step Verification first
   - Wait 5-10 minutes after enabling 2FA
   - Try refreshing the page

3. **"Authentication failed" error:**
   - Double-check email username
   - Verify app password (no spaces)
   - Check EMAIL_SERVICE is set to 'gmail'

## Security Best Practices:

1. **Environment Variables:**
   ```bash
   # Never commit .env file
   echo ".env" >> .gitignore
   ```

2. **Production Setup:**
   - Use different email account for production
   - Set up proper email templates
   - Monitor email sending limits

3. **Backup Options:**
   - Keep multiple app passwords
   - Have alternative email service ready
   - Document all email configurations

## Quick Setup Commands:

```bash
# 1. Update .env file
nano backend/.env

# 2. Add email configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=Apna Flar <your-email@gmail.com>

# 3. Restart backend server
npm start
```

## Email Templates Available:

- ✅ Welcome Email (Registration)
- ✅ Order Confirmation
- ✅ Order Status Updates
- ✅ Password Reset
- ✅ Payment Notifications

---

**📧 Need Help?**
- Gmail Help: https://support.google.com/accounts/answer/185833
- 2FA Setup: https://support.google.com/accounts/answer/185839
- App Passwords: https://support.google.com/accounts/answer/185833