// Fix script for authentication issues
console.log('🔧 Fixing Authentication Issues...\n');

// Function to clear all authentication data
function clearAllAuth() {
  console.log('🧹 Clearing all authentication data...');
  
  // Clear localStorage
  localStorage.removeItem('telugu-basics-token');
  localStorage.removeItem('telugu-basics-user');
  localStorage.removeItem('voice-recordings-backup');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  console.log('✅ All authentication data cleared');
  console.log('🔄 Redirecting to login page...');
  
  // Redirect to login
  window.location.href = '/login';
}

// Function to create a test user and login
async function createAndLoginTestUser() {
  console.log('👤 Creating and logging in test user...');
  
  const testUser = {
    name: 'Test Learner',
    email: 'testlearner@example.com',
    password: 'password123',
    role: 'learner'
  };
  
  try {
    // First try to register
    console.log('📡 Attempting registration...');
    const registerResponse = await fetch('https://backend-production-7e4df.up.railway.app/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const registerResult = await registerResponse.json();
    console.log('📊 Registration response:', registerResult);
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful');
    } else if (registerResult.message && registerResult.message.includes('already exists')) {
      console.log('ℹ️ User already exists, proceeding to login');
    } else {
      console.log('❌ Registration failed:', registerResult);
      return;
    }
    
    // Now try to login
    console.log('📡 Attempting login...');
    const loginResponse = await fetch('https://backend-production-7e4df.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
        role: testUser.role
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('📊 Login response:', loginResult);
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      
      // Store the new token and user data
      if (loginResult.token) {
        localStorage.setItem('telugu-basics-token', loginResult.token);
        console.log('💾 Token stored in localStorage');
      }
      if (loginResult.user) {
        localStorage.setItem('telugu-basics-user', JSON.stringify(loginResult.user));
        console.log('💾 User data stored in localStorage');
      }
      
      console.log('🔄 Redirecting to learner dashboard...');
      setTimeout(() => {
        window.location.href = '/learner';
      }, 1000);
    } else {
      console.log('❌ Login failed:', loginResult);
    }
  } catch (error) {
    console.log('❌ Error:', error);
  }
}

// Function to test with existing credentials
async function loginWithCredentials(email, password, role = 'learner') {
  console.log(`🔐 Logging in with credentials: ${email} (${role})`);
  
  try {
    const response = await fetch('https://backend-production-7e4df.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, role })
    });
    
    const result = await response.json();
    console.log('📊 Login response:', result);
    
    if (response.ok) {
      console.log('✅ Login successful');
      
      // Store the new token and user data
      if (result.token) {
        localStorage.setItem('telugu-basics-token', result.token);
        console.log('💾 Token stored in localStorage');
      }
      if (result.user) {
        localStorage.setItem('telugu-basics-user', JSON.stringify(result.user));
        console.log('💾 User data stored in localStorage');
      }
      
      console.log('🔄 Redirecting to appropriate dashboard...');
      setTimeout(() => {
        window.location.href = `/${role}`;
      }, 1000);
    } else {
      console.log('❌ Login failed:', result);
    }
  } catch (error) {
    console.log('❌ Login error:', error);
  }
}

// Function to check backend health
async function checkBackendHealth() {
  console.log('🏥 Checking backend health...');
  
  try {
    const response = await fetch('https://backend-production-7e4df.up.railway.app/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Health check status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Backend is healthy:', result);
    } else {
      console.log('❌ Backend health check failed');
    }
  } catch (error) {
    console.log('❌ Backend health check error:', error);
  }
}

// Function to list available users (if any)
async function listAvailableUsers() {
  console.log('👥 Checking for available users...');
  
  // Common test credentials
  const testUsers = [
    { email: 'learner@example.com', password: 'password123', role: 'learner' },
    { email: 'trainer@example.com', password: 'password123', role: 'trainer' },
    { email: 'evaluator@example.com', password: 'password123', role: 'evaluator' },
    { email: 'admin@example.com', password: 'password123', role: 'admin' },
    { email: 'testlearner@example.com', password: 'password123', role: 'learner' }
  ];
  
  console.log('📋 Available test users:');
  testUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.email} (${user.role})`);
  });
  
  console.log('\n💡 Use loginWithCredentials(email, password, role) to login with any of these users');
}

// Export functions for manual use
window.clearAllAuth = clearAllAuth;
window.createAndLoginTestUser = createAndLoginTestUser;
window.loginWithCredentials = loginWithCredentials;
window.checkBackendHealth = checkBackendHealth;
window.listAvailableUsers = listAvailableUsers;

console.log('🔧 Authentication Fix Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - clearAllAuth()              : Clear all auth data and redirect to login');
console.log('  - createAndLoginTestUser()    : Create and login with a test learner user');
console.log('  - loginWithCredentials()      : Login with specific credentials');
console.log('  - checkBackendHealth()        : Check if backend is running');
console.log('  - listAvailableUsers()        : List available test users');
console.log('\n💡 Quick fixes:');
console.log('  1. Run clearAllAuth() to start fresh');
console.log('  2. Run createAndLoginTestUser() to create a test account');
console.log('  3. Or use loginWithCredentials() with your existing credentials');
