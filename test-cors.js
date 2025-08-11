// Test script for CORS configuration
const API_BASE_URL = 'https://backend-production-7e4df.up.railway.app/api';

async function testCORS() {
  console.log('🌐 Testing CORS configuration...\n');

  try {
    // Test health endpoint (should work)
    console.log('🔍 Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthResult = await healthResponse.json();
    console.log('✅ Health endpoint:', healthResult);

    // Test auth endpoint (should work after CORS fix)
    console.log('\n🔐 Testing auth endpoint...');
    const authResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'testpassword',
        role: 'trainer'
      }),
    });

    if (authResponse.ok) {
      const authResult = await authResponse.json();
      console.log('✅ Auth endpoint working:', authResult.message);
    } else {
      const authResult = await authResponse.json();
      console.log('❌ Auth endpoint failed:', authResult.message);
    }

    // Test preflight request
    console.log('\n🔄 Testing preflight request...');
    const preflightResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });

    console.log('✅ Preflight response status:', preflightResponse.status);
    console.log('✅ CORS headers present:', {
      'Access-Control-Allow-Origin': preflightResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': preflightResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': preflightResponse.headers.get('Access-Control-Allow-Headers')
    });

  } catch (error) {
    console.error('❌ CORS test failed:', error);
  }
}

// Test specific origin
async function testOrigin(origin) {
  console.log(`🌐 Testing origin: ${origin}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        'Origin': origin
      }
    });
    
    if (response.ok) {
      console.log(`✅ Origin ${origin} is allowed`);
    } else {
      console.log(`❌ Origin ${origin} is blocked`);
    }
  } catch (error) {
    console.log(`❌ Origin ${origin} failed:`, error.message);
  }
}

// Test multiple origins
async function testMultipleOrigins() {
  console.log('🌐 Testing multiple origins...\n');
  
  const origins = [
    'https://telugu-frontend-1xt09gv6w-akhilesh2006s-projects.vercel.app',
    'https://telugu-basics.vercel.app',
    'https://telugu-learning.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://malicious-site.com'
  ];
  
  for (const origin of origins) {
    await testOrigin(origin);
  }
}

// Export functions for manual use
window.testCORS = testCORS;
window.testOrigin = testOrigin;
window.testMultipleOrigins = testMultipleOrigins;

console.log('🌐 CORS Test Script Loaded!');
console.log('\nAvailable functions:');
console.log('  - testCORS()                    : Test basic CORS functionality');
console.log('  - testOrigin(origin)            : Test specific origin');
console.log('  - testMultipleOrigins()         : Test multiple origins');
console.log('\n💡 Run testCORS() to test the CORS configuration');
