const http = require('http');

// Simulate the exact same API calls that Dashboard component makes
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000, // Use frontend port to test proxy
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (parseError) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
            parseError: parseError.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function simulateDashboardCalls() {
  console.log('🧪 Simulating Dashboard API Calls');
  console.log('=' .repeat(50));

  const endpoints = [
    { name: 'Stats API', path: '/api/stats' },
    { name: 'Collaborations API', path: '/api/collaborations' },
    { name: 'Posts API', path: '/api/posts' }
  ];

  // Test individual calls first
  console.log('\n📋 Individual API Calls');
  console.log('-'.repeat(30));

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Testing ${endpoint.name}...`);
      const result = await makeRequest(endpoint.path);
      
      if (result.status === 200) {
        console.log(`✅ ${endpoint.name}: Status ${result.status}`);
        if (endpoint.name === 'Stats API') {
          console.log(`   Total Donations: ${result.data.totalDonations}`);
          console.log(`   Total Posts: ${result.data.totalPosts}`);
        } else if (endpoint.name === 'Collaborations API') {
          console.log(`   Success: ${result.data.success}`);
          console.log(`   Count: ${result.data.data?.length || 0}`);
        } else if (endpoint.name === 'Posts API') {
          console.log(`   Posts Count: ${result.data.length}`);
        }
      } else {
        console.log(`❌ ${endpoint.name}: Status ${result.status}`);
        console.log(`   Response: ${JSON.stringify(result.data)}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.message}`);
    }
  }

  // Test Promise.all (like Dashboard does)
  console.log('\n📋 Promise.all Test (Dashboard Style)');
  console.log('-'.repeat(30));

  try {
    console.log('🔄 Making all requests simultaneously...');
    
    const promises = endpoints.map(endpoint => makeRequest(endpoint.path));
    const results = await Promise.all(promises);
    
    console.log('✅ Promise.all completed successfully');
    
    results.forEach((result, index) => {
      const endpoint = endpoints[index];
      console.log(`   ${endpoint.name}: Status ${result.status}`);
    });
    
  } catch (error) {
    console.log(`❌ Promise.all failed: ${error.message}`);
  }

  console.log('\n✨ Dashboard Simulation Complete!');
  console.log('=' .repeat(50));
}

simulateDashboardCalls().catch(console.error);