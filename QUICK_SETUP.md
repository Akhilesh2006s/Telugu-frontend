# Quick Setup Guide - Forgot Password Feature

## 🚀 What's Already Done

✅ **Backend Routes** - All forgot password endpoints are implemented
✅ **Email Service** - Gmail SMTP integration with beautiful templates
✅ **Password Reset Storage** - Secure code management with expiration
✅ **Frontend UI** - Complete 3-step password reset flow
✅ **Security Features** - 6-digit codes, 10-minute expiration, 3 attempts limit

## 🔧 What You Need to Do

### Step 1: Configure Email (Required)

1. **Enable 2-Factor Authentication on Gmail**
   - Go to Google Account → Security → 2-Step Verification
   - Enable it if not already enabled

2. **Generate App Password**
   - Go to Google Account → Security → App passwords
   - Select "Mail" and "Other"
   - Copy the 16-character password

3. **Set Environment Variables in Railway**
   - Go to your Railway project dashboard
   - Add these environment variables:
   ```
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   FRONTEND_URL=https://your-frontend-url.com
   ```

### Step 2: Deploy Backend Changes

1. **Commit and push** your backend changes to GitHub
2. **Railway will automatically deploy** the updates
3. **Wait for deployment** to complete

### Step 3: Test the Feature

1. **Load the test script** in your browser console:
   ```javascript
   // Copy and paste the content from test-forgot-password.js
   ```

2. **Test email configuration**:
   ```javascript
   testEmailConfig()
   ```

3. **Test the complete flow**:
   ```javascript
   testForgotPasswordFlow()
   ```

## 🎯 How to Use

### For Users:
1. Go to login page
2. Click "Forgot your password?"
3. Enter email address
4. Check email for 6-digit code
5. Enter the code
6. Set new password
7. Login with new password

### For Testing:
1. Use the test script in browser console
2. Replace `test@example.com` with a real email
3. Follow the console instructions

## 🔍 Troubleshooting

### If emails aren't sending:
- Check EMAIL_USER and EMAIL_PASS are set correctly
- Ensure 2-Factor Authentication is enabled
- Verify you're using App Password, not regular password

### If codes aren't working:
- Check the backend logs in Railway
- Verify the user exists in the database
- Check if the code has expired (10 minutes)

### If frontend isn't working:
- Check browser console for errors
- Verify the API endpoints are accessible
- Ensure the backend is deployed and running

## 📧 Email Template Features

- ✅ Professional Telugu Basics branding
- ✅ Clear 6-digit verification code
- ✅ Security instructions
- ✅ 10-minute expiration notice
- ✅ Mobile-responsive design
- ✅ Professional styling

## 🛡️ Security Features

- ✅ 6-digit verification codes (100,000 combinations)
- ✅ 10-minute expiration
- ✅ 3 attempts limit per code
- ✅ Temporary tokens (5 minutes)
- ✅ Secure password hashing
- ✅ Input validation
- ✅ Automatic cleanup

## 🎉 Ready to Go!

Once you've configured the email settings and deployed the backend, the forgot password feature will be fully functional!

**Next Steps:**
1. Configure email in Railway
2. Deploy backend changes
3. Test with the provided script
4. Users can start using the feature

The system is production-ready with enterprise-level security! 🚀
