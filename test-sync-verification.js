const http = require('http');

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

async function testSyncVerification() {
  console.log('🔄 Testing Donation Synchronization After Fix');
  console.log('=' .repeat(60));

  try {
    // Step 1: Check current state
    console.log('\n📊 Step 1: Current Synchronized State');
    console.log('-'.repeat(40));
    
    const [statsResult, postsResult] = await Promise.all([
      makeRequest('GET', '/api/stats'),
      makeRequest('GET', '/api/posts')
    ]);
    
    console.log(`✅ Stats: ₹${statsResult.data.totalDonations} from ${statsResult.data.totalDonors} donors`);
    
    const postTotals = postsResult.data.reduce((acc, post) => {
      acc.amount += post.donationAmount || 0;
      acc.donors += post.donations || 0;
      return acc;
    }, { amount: 0, donors: 0 });
    
    console.log(`✅ Posts: ₹${postTotals.amount} from ${postTotals.donors} donors`);
    
    if (postTotals.amount === statsResult.data.totalDonations && 
        postTotals.donors === statsResult.data.totalDonors) {
      console.log('✅ Perfect synchronization confirmed!');
    } else {
      console.log('❌ Still out of sync!');
      return;
    }

    // Step 2: Make a test donation
    console.log('\n💰 Step 2: Making Test Donation');
    console.log('-'.repeat(40));
    
    const testDonation = {
      amount: 300,
      donorName: 'Sync Test Donor',
      paymentMethod: 'UPI',
      userUpiId: 'synctest@upi',
      transactionId: 'SYNC123456789',
      paymentStatus: 'completed'
    };
    
    const donationResult = await makeRequest('POST', '/api/donate/2', testDonation);
    
    if (donationResult.status === 200) {
      console.log(`✅ Donation successful: ₹${testDonation.amount} to Post 2`);
      
      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Verify updated sync
      console.log('\n📈 Step 3: Verifying Updated Synchronization');
      console.log('-'.repeat(40));
      
      const [newStatsResult, newPostsResult] = await Promise.all([
        makeRequest('GET', '/api/stats'),
        makeRequest('GET', '/api/posts')
      ]);
      
      const expectedTotal = statsResult.data.totalDonations + testDonation.amount;
      const expectedDonors = statsResult.data.totalDonors + 1;
      
      console.log(`✅ New Stats: ₹${newStatsResult.data.totalDonations} from ${newStatsResult.data.totalDonors} donors`);
      console.log(`   Expected: ₹${expectedTotal} from ${expectedDonors} donors`);
      
      const newPostTotals = newPostsResult.data.reduce((acc, post) => {
        acc.amount += post.donationAmount || 0;
        acc.donors += post.donations || 0;
        return acc;
      }, { amount: 0, donors: 0 });
      
      console.log(`✅ New Posts: ₹${newPostTotals.amount} from ${newPostTotals.donors} donors`);
      
      // Check specific post update
      const updatedPost = newPostsResult.data.find(p => p.id === 2);
      if (updatedPost) {
        console.log(`✅ Post 2 "${updatedPost.title}": ₹${updatedPost.donationAmount} from ${updatedPost.donations} donors`);
      }
      
      // Final verification
      const amountCorrect = newStatsResult.data.totalDonations === expectedTotal;
      const donorCorrect = newStatsResult.data.totalDonors === expectedDonors;
      const syncCorrect = newPostTotals.amount === newStatsResult.data.totalDonations && 
                         newPostTotals.donors === newStatsResult.data.totalDonors;
      
      console.log('\n🎯 Final Verification:');
      console.log(`   Amount Calculation: ${amountCorrect ? '✅' : '❌'}`);
      console.log(`   Donor Calculation: ${donorCorrect ? '✅' : '❌'}`);
      console.log(`   Post-Stats Sync: ${syncCorrect ? '✅' : '❌'}`);
      
      if (amountCorrect && donorCorrect && syncCorrect) {
        console.log('\n🎉 SYNCHRONIZATION SYSTEM FULLY OPERATIONAL!');
        console.log('✅ Real-time donation tracking works perfectly');
        console.log('✅ Post-level and stats-level data stay synchronized');
        console.log('✅ All calculations are accurate');
        console.log('✅ System ready for production use');
      } else {
        console.log('\n❌ Synchronization issues still exist');
      }
      
    } else {
      console.log(`❌ Test donation failed: ${donationResult.data.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSyncVerification();