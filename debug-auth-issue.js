// Debug script for authentication issues
console.log('🔐 Debugging Authentication Issues...\n');

// Check authentication status
function checkAuthStatus() {
  console.log('🔍 Checking Authentication Status...');
  
  // Check localStorage for token
  const token = localStorage.getItem('telugu-basics-token');
  console.log('📦 Token in localStorage:', token ? 'Present' : 'Missing');
  
  if (token) {
    console.log('📦 Token length:', token.length);
    console.log('📦 Token preview:', token.substring(0, 20) + '...');
    
    // Try to decode JWT payload (without verification)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔓 Token payload:', {
        userId: payload.userId || payload._id,
        email: payload.email,
        role: payload.role,
        exp: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No expiry',
        iat: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'No issued date'
      });
      
      // Check if token is expired
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        const isExpired = now > payload.exp;
        console.log('⏰ Token expired:', isExpired);
        if (isExpired) {
          console.log('❌ Token is expired! You need to login again.');
        }
      }
    } catch (error) {
      console.log('❌ Error decoding token:', error);
    }
  }
  
  // Check if user data exists
  const userData = localStorage.getItem('telugu-basics-user');
  console.log('👤 User data in localStorage:', userData ? 'Present' : 'Missing');
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('👤 User details:', {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    } catch (error) {
      console.log('❌ Error parsing user data:', error);
    }
  }
  
  // Check current URL
  console.log('🌐 Current URL:', window.location.href);
  console.log('📍 Current pathname:', window.location.pathname);
}

// Test authentication with backend
async function testBackendAuth() {
  console.log('\n🔐 Testing Backend Authentication...');
  
  const token = localStorage.getItem('telugu-basics-token');
  if (!token) {
    console.log('❌ No token found - cannot test backend auth');
    return;
  }
  
  try {
    console.log('📡 Testing /api/auth/me endpoint...');
    const response = await fetch('https://backend-production-7e4df.up.railway.app/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response ok:', response.ok);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Backend auth successful:', result.data);
    } else {
      const error = await response.json();
      console.log('❌ Backend auth failed:', error);
    }
  } catch (error) {
    console.log('❌ Backend auth error:', error);
  }
}

// Test specific endpoints that are failing
async function testFailingEndpoints() {
  console.log('\n🔍 Testing Failing Endpoints...');
  
  const token = localStorage.getItem('telugu-basics-token');
  if (!token) {
    console.log('❌ No token found - cannot test endpoints');
    return;
  }
  
  const endpoints = [
    '/api/exams/student',
    '/api/submissions/student',
    '/api/video-lectures/student'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testing ${endpoint}...`);
      const response = await fetch(`https://backend-production-7e4df.up.railway.app${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📊 ${endpoint} status:`, response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${endpoint} successful:`, result);
      } else {
        const error = await response.json();
        console.log(`❌ ${endpoint} failed:`, error);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} error:`, error);
    }
  }
}

// Test login flow
async function testLoginFlow() {
  console.log('\n🔐 Testing Login Flow...');
  
  // Test with a sample user (you can modify these credentials)
  const testUser = {
    email: 'learner@example.com',
    password: 'password123',
    role: 'learner'
  };
  
  try {
    console.log('📡 Attempting login...');
    const response = await fetch('https://backend-production-7e4df.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const result = await response.json();
    console.log('📊 Login response status:', response.status);
    console.log('📊 Login response:', result);
    
    if (response.ok) {
      console.log('✅ Login successful');
      console.log('💡 Token received:', result.token ? 'Yes' : 'No');
      console.log('💡 User data received:', result.user ? 'Yes' : 'No');
      
      // Store the new token and user data
      if (result.token) {
        localStorage.setItem('telugu-basics-token', result.token);
        console.log('💾 Token stored in localStorage');
      }
      if (result.user) {
        localStorage.setItem('telugu-basics-user', JSON.stringify(result.user));
        console.log('💾 User data stored in localStorage');
      }
      
      console.log('🔄 Now you can test the endpoints again');
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.log('❌ Login error:', error);
  }
}

// Clear authentication and redirect to login
function clearAuthAndRedirect() {
  console.log('\n🧹 Clearing authentication...');
  
  localStorage.removeItem('telugu-basics-token');
  localStorage.removeItem('telugu-basics-user');
  
  console.log('✅ Authentication cleared');
  console.log('🔄 Redirecting to login...');
  
  window.location.href = '/login';
}

// Test token refresh (if available)
async function testTokenRefresh() {
  console.log('\n🔄 Testing Token Refresh...');
  
  const token = localStorage.getItem('telugu-basics-token');
  if (!token) {
    console.log('❌ No token found - cannot test refresh');
    return;
  }
  
  try {
    const response = await fetch('https://backend-production-7e4df.up.railway.app/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Refresh response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Token refresh successful:', result);
      
      if (result.token) {
        localStorage.setItem('telugu-basics-token', result.token);
        console.log('💾 New token stored');
      }
    } else {
      const error = await response.json();
      console.log('❌ Token refresh failed:', error);
    }
  } catch (error) {
    console.log('❌ Token refresh error:', error);
  }
}

// Export functions for manual use
window.checkAuthStatus = checkAuthStatus;
window.testBackendAuth = testBackendAuth;
window.testFailingEndpoints = testFailingEndpoints;
window.testLoginFlow = testLoginFlow;
window.clearAuthAndRedirect = clearAuthAndRedirect;
window.testTokenRefresh = testTokenRefresh;

console.log('🔐 Authentication Debug Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - checkAuthStatus()        : Check current auth status');
console.log('  - testBackendAuth()        : Test backend authentication');
console.log('  - testFailingEndpoints()   : Test the failing endpoints');
console.log('  - testLoginFlow()          : Test login with sample user');
console.log('  - clearAuthAndRedirect()   : Clear auth and go to login');
console.log('  - testTokenRefresh()       : Test token refresh (if available)');
console.log('\n💡 Run checkAuthStatus() to start debugging');
