const http = require('http');

// Test script to verify donation synchronization
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (parseError) {
          resolve({
            status: res.statusCode,
            data: responseData,
            parseError: parseError.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testDonationSync() {
  console.log('🧪 Testing Donation Synchronization');
  console.log('=' .repeat(50));

  try {
    // Test 1: Get current stats
    console.log('\n📊 Test 1: Current Statistics');
    console.log('-'.repeat(30));
    
    const statsResult = await makeRequest('GET', '/api/stats');
    if (statsResult.status === 200) {
      console.log('✅ Stats retrieved successfully');
      console.log(`   Total Donations: ₹${statsResult.data.totalDonations}`);
      console.log(`   Total Donors: ${statsResult.data.totalDonors}`);
      console.log(`   Average Donation: ₹${statsResult.data.averageDonation}`);
      console.log(`   Total Posts: ${statsResult.data.totalPosts}`);
      console.log(`   Recent Donations: ${statsResult.data.recentDonations.length}`);
    } else {
      console.log(`❌ Failed to get stats: ${statsResult.status}`);
    }

    // Test 2: Get posts and check donation amounts
    console.log('\n📝 Test 2: Posts Donation Amounts');
    console.log('-'.repeat(30));
    
    const postsResult = await makeRequest('GET', '/api/posts');
    if (postsResult.status === 200) {
      console.log('✅ Posts retrieved successfully');
      postsResult.data.forEach(post => {
        console.log(`   "${post.title}": ₹${post.donationAmount || 0} from ${post.donations || 0} donors`);
      });
      
      // Calculate total from posts
      const totalFromPosts = postsResult.data.reduce((sum, post) => sum + (post.donationAmount || 0), 0);
      console.log(`   Total from posts: ₹${totalFromPosts}`);
      
      // Compare with stats
      if (totalFromPosts === statsResult.data.totalDonations) {
        console.log('✅ Posts and stats are synchronized!');
      } else {
        console.log(`❌ Mismatch: Posts total (₹${totalFromPosts}) != Stats total (₹${statsResult.data.totalDonations})`);
      }
    } else {
      console.log(`❌ Failed to get posts: ${postsResult.status}`);
    }

    // Test 3: Test making a new donation
    console.log('\n💰 Test 3: Making a Test Donation');
    console.log('-'.repeat(30));
    
    const testDonation = {
      amount: 50,
      donorName: 'Test Donor',
      paymentMethod: 'UPI',
      userUpiId: 'testdonor@upi',
      transactionId: 'TEST123456789',
      paymentStatus: 'completed'
    };
    
    const donationResult = await makeRequest('POST', '/api/donate/1', testDonation);
    if (donationResult.status === 200) {
      console.log('✅ Test donation successful');
      console.log(`   Donation ID: ${donationResult.data.donation.id}`);
      console.log(`   Amount: ₹${donationResult.data.donation.amount}`);
      
      // Wait a moment for sync to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check updated stats
      const updatedStatsResult = await makeRequest('GET', '/api/stats');
      if (updatedStatsResult.status === 200) {
        console.log('✅ Updated stats retrieved');
        console.log(`   New Total Donations: ₹${updatedStatsResult.data.totalDonations}`);
        console.log(`   New Total Donors: ${updatedStatsResult.data.totalDonors}`);
        console.log(`   New Average Donation: ₹${updatedStatsResult.data.averageDonation}`);
        
        // Check if the increase is correct
        const expectedTotal = statsResult.data.totalDonations + testDonation.amount;
        if (updatedStatsResult.data.totalDonations === expectedTotal) {
          console.log('✅ Donation amount correctly added to total!');
        } else {
          console.log(`❌ Expected ₹${expectedTotal}, got ₹${updatedStatsResult.data.totalDonations}`);
        }
      }
    } else {
      console.log(`❌ Test donation failed: ${donationResult.status}`);
      console.log(`   Error: ${donationResult.data.error || 'Unknown error'}`);
    }

    console.log('\n✨ Donation Sync Test Complete!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDonationSync().catch(console.error);