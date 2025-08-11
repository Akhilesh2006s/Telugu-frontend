// Debug script for routing and authentication issues
console.log('🔍 Debugging Routing and Authentication...\n');

// Check authentication status
function checkAuthStatus() {
  console.log('🔐 Checking Authentication Status...');
  
  // Check localStorage for token
  const token = localStorage.getItem('telugu-basics-token');
  console.log('📦 Token in localStorage:', token ? 'Present' : 'Missing');
  
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
    const response = await fetch('https://backend-production-7e4df.up.railway.app/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
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

// Test specific route access
async function testRouteAccess(route) {
  console.log(`\n🛣️ Testing route access: ${route}`);
  
  try {
    const response = await fetch(`https://telugu-frontend-hk8svrpyv-akhilesh2006s-projects.vercel.app${route}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response ok: ${response.ok}`);
    
    if (response.ok) {
      console.log('✅ Route is accessible');
    } else {
      console.log('❌ Route returned error');
    }
  } catch (error) {
    console.log('❌ Route test error:', error);
  }
}

// Check React Router state
function checkRouterState() {
  console.log('\n🔄 Checking React Router State...');
  
  // Check if React Router is working
  if (window.location.pathname) {
    console.log('✅ React Router pathname detected:', window.location.pathname);
  } else {
    console.log('❌ No pathname detected');
  }
  
  // Check for any React errors in console
  console.log('🔍 Check browser console for React errors');
}

// Test login flow
async function testLoginFlow() {
  console.log('\n🔐 Testing Login Flow...');
  
  const testUser = {
    email: 'test@example.com',
    password: 'testpassword',
    role: 'evaluator'
  };
  
  try {
    const response = await fetch('https://backend-production-7e4df.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const result = await response.json();
    console.log('📊 Login response:', result);
    
    if (response.ok) {
      console.log('✅ Login successful');
      console.log('💡 You can now try accessing /evaluator');
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

// Export functions for manual use
window.checkAuthStatus = checkAuthStatus;
window.testBackendAuth = testBackendAuth;
window.testRouteAccess = testRouteAccess;
window.checkRouterState = checkRouterState;
window.testLoginFlow = testLoginFlow;
window.clearAuthAndRedirect = clearAuthAndRedirect;

console.log('🔍 Debug Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - checkAuthStatus()        : Check authentication status');
console.log('  - testBackendAuth()        : Test backend authentication');
console.log('  - testRouteAccess(route)   : Test specific route access');
console.log('  - checkRouterState()       : Check React Router state');
console.log('  - testLoginFlow()          : Test login flow');
console.log('  - clearAuthAndRedirect()   : Clear auth and go to login');
console.log('\n💡 Run checkAuthStatus() to start debugging');
