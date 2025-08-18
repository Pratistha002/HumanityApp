const axios = require('axios');

// Test script to verify dashboard API endpoints
console.log('🧪 Testing Dashboard API Endpoints');
console.log('=' .repeat(50));

async function testDashboardEndpoints() {
  const baseUrl = 'http://localhost:5000';
  
  try {
    console.log('\n📋 Test 1: /api/stats endpoint');
    console.log('-'.repeat(30));
    
    const statsResponse = await axios.get(`${baseUrl}/api/stats`);
    console.log('✅ Stats endpoint working');
    console.log('Response:', JSON.stringify(statsResponse.data, null, 2));
    
    console.log('\n📋 Test 2: /api/collaborations endpoint');
    console.log('-'.repeat(30));
    
    const collaborationsResponse = await axios.get(`${baseUrl}/api/collaborations`);
    console.log('✅ Collaborations endpoint working');
    console.log('Response structure:', {
      success: collaborationsResponse.data.success,
      dataCount: collaborationsResponse.data.data?.length || 0,
      message: collaborationsResponse.data.message
    });
    
    console.log('\n📋 Test 3: /api/posts endpoint');
    console.log('-'.repeat(30));
    
    const postsResponse = await axios.get(`${baseUrl}/api/posts`);
    console.log('✅ Posts endpoint working');
    console.log('Posts count:', postsResponse.data.length);
    console.log('First post:', postsResponse.data[0]?.title || 'No posts');
    
    console.log('\n✨ All Dashboard API Endpoints Working!');
    console.log('=' .repeat(50));
    
    console.log('\n🎯 Test Results Summary:');
    console.log('✅ /api/stats - Working');
    console.log('✅ /api/collaborations - Working');
    console.log('✅ /api/posts - Working');
    
    console.log('\n🚀 Dashboard should now work properly!');
    console.log('Visit: http://localhost:3001/dashboard');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testDashboardEndpoints();