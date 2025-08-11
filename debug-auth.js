// Debug script to check authentication state and help migrate user data
const API_BASE_URL = 'https://backend-production-7e4df.up.railway.app/api';

async function debugAuth() {
  console.log('🔍 Debugging Authentication State...\n');

  // Check localStorage
  const token = localStorage.getItem('telugu-basics-token');
  const savedUser = localStorage.getItem('telugu-basics-user');

  console.log('📱 Local Storage:');
  console.log('  Token:', token ? `${token.substring(0, 20)}...` : 'Missing');
  console.log('  User:', savedUser ? JSON.parse(savedUser) : 'Missing');

  if (!token) {
    console.log('\n❌ No token found. Please login first.');
    return;
  }

  // Test token with Railway backend
  console.log('\n🌐 Testing Railway Backend Connection...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('  Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('  ✅ Token is valid!');
      console.log('  User Data:', data.data);
    } else {
      const errorData = await response.json();
      console.log('  ❌ Token validation failed:');
      console.log('  Error:', errorData);
      
      if (errorData.message === 'User not found in database.') {
        console.log('\n🔧 SOLUTION: User needs to be created in Railway backend');
        console.log('  You can either:');
        console.log('  1. Register a new account on the Railway backend');
        console.log('  2. Create the user directly in the Railway database');
        console.log('  3. Use the migration script to copy user data');
        
        // Try to get user info from local storage
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('\n📋 Local User Data for Migration:');
          console.log('  Name:', userData.name);
          console.log('  Email:', userData.email);
          console.log('  Role:', userData.role);
          console.log('  Phone:', userData.phone);
        }
      }
    }
  } catch (error) {
    console.log('  ❌ Network error:', error.message);
  }

  // Test other endpoints
  console.log('\n🧪 Testing Other Endpoints...');
  
  const endpoints = [
    '/exams/student',
    '/video-lectures/student',
    '/submissions/student'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`  ${endpoint}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`  ${endpoint}: Network Error - ${error.message}`);
    }
  }
}

// Function to create a test user in Railway backend
async function createTestUser() {
  console.log('\n👤 Creating Test User in Railway Backend...');
  
  const testUser = {
    name: 'Test Learner',
    email: 'test.learner@example.com',
    phone: '1234567890',
    password: 'testpassword123',
    role: 'learner'
  };

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('  ✅ Test user created successfully!');
      console.log('  User ID:', data.data.user._id);
      console.log('  Token:', data.data.token.substring(0, 20) + '...');
      
      // Store the new token
      localStorage.setItem('telugu-basics-token', data.data.token);
      localStorage.setItem('telugu-basics-user', JSON.stringify(data.data.user));
      
      console.log('  📱 Token stored in localStorage');
      console.log('  🔄 Please refresh the page to use the new authentication');
    } else {
      console.log('  ❌ Failed to create test user:');
      console.log('  Error:', data);
    }
  } catch (error) {
    console.log('  ❌ Network error:', error.message);
  }
}

// Function to migrate existing user data
async function migrateUserData() {
  console.log('\n🔄 Migrating User Data...');
  
  const savedUser = localStorage.getItem('telugu-basics-user');
  if (!savedUser) {
    console.log('  ❌ No user data found in localStorage');
    return;
  }

  const userData = JSON.parse(savedUser);
  console.log('  📋 Migrating user:', userData.name, `(${userData.email})`);

  // Note: This would require the password, which we don't have stored
  console.log('  ⚠️  Cannot migrate user without password');
  console.log('  💡 Solution: User needs to login again with their password');
}

// Run the debug
console.log('🚀 Starting Authentication Debug...\n');
debugAuth().then(() => {
  console.log('\n📝 Debug Complete!');
  console.log('\n💡 Next Steps:');
  console.log('  1. If token is invalid, login again');
  console.log('  2. If user not found, create a new account');
  console.log('  3. If network issues, check Railway backend status');
});

// Export functions for manual use
window.debugAuth = debugAuth;
window.createTestUser = createTestUser;
window.migrateUserData = migrateUserData;
