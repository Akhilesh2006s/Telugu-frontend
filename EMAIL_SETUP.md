# Email Setup for Forgot Password Feature

## Overview
The forgot password feature uses Gmail SMTP to send verification codes to users. Follow these steps to configure email functionality.

## Prerequisites
1. A Gmail account
2. Gmail App Password (not your regular password)

## Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

## Step 2: Generate App Password
1. Go to your Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", click on "App passwords"
4. Select "Mail" as the app and "Other" as the device
5. Click "Generate"
6. Copy the 16-character app password

## Step 3: Set Environment Variables
Add these environment variables to your Railway backend:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
FRONTEND_URL=https://your-frontend-url.com
```

### For Local Development (.env file):
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
FRONTEND_URL=http://localhost:3000
```

## Step 4: Test Email Configuration
You can test the email setup by running this script in your browser console:

```javascript
// Test email configuration
async function testEmail() {
  const response = await fetch('https://backend-production-7e4df.up.railway.app/api/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      email: 'test@example.com' 
    }),
  });
  
  const result = await response.json();
  console.log('Email test result:', result);
}

testEmail();
```

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**
   - Make sure you're using the App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Less secure app access" error**
   - Gmail no longer supports less secure apps
   - You must use App Passwords

3. **"Connection timeout" error**
   - Check your internet connection
   - Verify the EMAIL_USER and EMAIL_PASS are correct

4. **"Authentication failed" error**
   - Double-check the App Password
   - Make sure there are no extra spaces in the environment variables

### Security Notes:
- Never commit your email credentials to version control
- Use environment variables for all sensitive information
- The App Password is specific to this application - don't reuse it elsewhere
- Regularly rotate your App Password for security

## Email Template
The system sends a beautifully formatted HTML email with:
- Telugu Basics branding
- 6-digit verification code
- Security instructions
- Expiration information (10 minutes)

## Features
- ✅ 6-digit verification codes
- ✅ 10-minute expiration
- ✅ 3 attempts limit
- ✅ Automatic cleanup of expired codes
- ✅ Beautiful HTML email templates
- ✅ Secure password reset flow
