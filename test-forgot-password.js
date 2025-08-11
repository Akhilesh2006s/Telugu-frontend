// Test script for forgot password functionality
const API_BASE_URL = 'https://backend-production-7e4df.up.railway.app/api';

// Test the complete forgot password flow
async function testForgotPasswordFlow() {
  console.log('🧪 Testing Forgot Password Flow...\n');

  const testEmail = 'test@example.com'; // Replace with a real email for testing

  try {
    // Step 1: Request password reset
    console.log('📧 Step 1: Requesting password reset...');
    const resetResponse = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });

    const resetResult = await resetResponse.json();
    console.log('📧 Reset request result:', resetResult);

    if (!resetResponse.ok) {
      console.log('❌ Failed to request password reset');
      return;
    }

    console.log('✅ Password reset code sent successfully!');
    console.log('📧 Check your email for the 6-digit verification code\n');

    // Note: In a real test, you would:
    // 1. Check your email for the verification code
    // 2. Use that code in the next steps
    // 3. Set a new password

    console.log('💡 To complete the test:');
    console.log('1. Check your email for the verification code');
    console.log('2. Run testVerifyCode(code) with the actual code');
    console.log('3. Run testResetPassword(tempToken, newPassword) with the temp token');

  } catch (error) {
    console.error('❌ Error testing forgot password:', error);
  }
}

// Test code verification
async function testVerifyCode(code) {
  console.log('🔐 Testing code verification...');
  
  const testEmail = 'test@example.com'; // Replace with the email you used

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: testEmail,
        code: code 
      }),
    });

    const result = await response.json();
    console.log('🔐 Verification result:', result);

    if (response.ok) {
      console.log('✅ Code verified successfully!');
      console.log('🔐 Temp token:', result.data.tempToken);
      console.log('💡 Run testResetPassword(tempToken, newPassword) to complete the reset');
    } else {
      console.log('❌ Code verification failed');
    }

  } catch (error) {
    console.error('❌ Error verifying code:', error);
  }
}

// Test password reset
async function testResetPassword(tempToken, newPassword) {
  console.log('🔐 Testing password reset...');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        tempToken: tempToken,
        newPassword: newPassword 
      }),
    });

    const result = await response.json();
    console.log('🔐 Reset result:', result);

    if (response.ok) {
      console.log('✅ Password reset successfully!');
      console.log('🎉 You can now login with your new password');
    } else {
      console.log('❌ Password reset failed');
    }

  } catch (error) {
    console.error('❌ Error resetting password:', error);
  }
}

// Test email configuration
async function testEmailConfig() {
  console.log('📧 Testing email configuration...');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'test@example.com' 
      }),
    });

    const result = await response.json();
    console.log('📧 Email test result:', result);

    if (response.ok) {
      console.log('✅ Email configuration is working!');
      console.log('📧 Check if you received the email');
    } else {
      console.log('❌ Email configuration failed');
      console.log('💡 Check your EMAIL_USER and EMAIL_PASS environment variables');
    }

  } catch (error) {
    console.error('❌ Error testing email config:', error);
  }
}

// Check environment variables (for debugging)
function checkEmailConfig() {
  console.log('🔍 Checking email configuration...');
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('🔐 EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');
  console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL || 'Not set');
}

// Export functions for manual use
window.testForgotPasswordFlow = testForgotPasswordFlow;
window.testVerifyCode = testVerifyCode;
window.testResetPassword = testResetPassword;
window.testEmailConfig = testEmailConfig;
window.checkEmailConfig = checkEmailConfig;

console.log('🧪 Forgot Password Test Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - testForgotPasswordFlow()     : Test the complete flow');
console.log('  - testVerifyCode(code)         : Test code verification');
console.log('  - testResetPassword(token, pwd): Test password reset');
console.log('  - testEmailConfig()            : Test email configuration');
console.log('  - checkEmailConfig()           : Check environment variables');
console.log('\n💡 Run testForgotPasswordFlow() to start testing');
