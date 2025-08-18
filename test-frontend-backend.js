// Simple test to verify frontend-backend connectivity
const http = require('http');

function testEndpoint(host, port, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Frontend-Backend Connectivity');
  console.log('=' .repeat(50));

  // Test backend endpoints
  const backendTests = [
    { name: 'Stats API', path: '/api/stats' },
    { name: 'Posts API', path: '/api/posts' },
    { name: 'Collaborations API', path: '/api/collaborations' }
  ];

  console.log('\n📋 Testing Backend (localhost:5000)');
  console.log('-'.repeat(30));

  for (const test of backendTests) {
    try {
      const result = await testEndpoint('localhost', 5000, test.path);
      console.log(`✅ ${test.name}: Status ${result.status}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  // Test frontend
  console.log('\n📋 Testing Frontend (localhost:3000)');
  console.log('-'.repeat(30));

  try {
    const result = await testEndpoint('localhost', 3000, '/');
    console.log(`✅ Frontend: Status ${result.status}`);
  } catch (error) {
    console.log(`❌ Frontend: ${error.message}`);
  }

  // Test frontend proxy to backend
  console.log('\n📋 Testing Frontend Proxy');
  console.log('-'.repeat(30));

  for (const test of backendTests) {
    try {
      const result = await testEndpoint('localhost', 3000, test.path);
      console.log(`✅ Proxy ${test.name}: Status ${result.status}`);
    } catch (error) {
      console.log(`❌ Proxy ${test.name}: ${error.message}`);
    }
  }

  console.log('\n✨ Connectivity Test Complete!');
  console.log('=' .repeat(50));
}

runTests().catch(console.error);