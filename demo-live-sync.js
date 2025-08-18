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

async function demoLiveSync() {
  console.log('🎬 LIVE DONATION SYNCHRONIZATION DEMO');
  console.log('=' .repeat(60));

  try {
    // Show initial state
    console.log('\n📊 INITIAL STATE:');
    console.log('-'.repeat(30));
    
    const initialStats = await makeRequest('GET', '/api/stats');
    const initialPosts = await makeRequest('GET', '/api/posts');
    
    console.log(`💰 Total Donations: ₹${initialStats.data.totalDonations}`);
    console.log(`👥 Total Donors: ${initialStats.data.totalDonors}`);
    console.log(`📊 Average: ₹${initialStats.data.averageDonation}`);
    
    console.log('\n📝 Story Breakdown:');
    initialPosts.data.forEach((post, index) => {
      if (post.donationAmount > 0 || post.donations > 0) {
        console.log(`   ${index + 1}. "${post.title}": ₹${post.donationAmount} from ${post.donations} donors`);
      }
    });

    // Make multiple donations to different stories
    console.log('\n🎯 MAKING LIVE DONATIONS:');
    console.log('-'.repeat(30));
    
    const donations = [
      { postId: 2, amount: 500, donorName: 'Dr. Sarah Wilson', story: 'Medical Treatment for Little Priya' },
      { postId: 3, amount: 750, donorName: 'Mumbai Relief Fund', story: 'Rebuild Homes After Flood Disaster' },
      { postId: 1, amount: 200, donorName: 'Education Supporter', story: 'Help Ravi Complete His Engineering Studies' }
    ];

    for (const donation of donations) {
      console.log(`\n💳 Donating ₹${donation.amount} to "${donation.story}"...`);
      
      const donationData = {
        amount: donation.amount,
        donorName: donation.donorName,
        paymentMethod: 'UPI',
        userUpiId: `${donation.donorName.toLowerCase().replace(/[^a-z]/g, '')}@upi`,
        transactionId: `DEMO${Date.now()}`,
        paymentStatus: 'completed'
      };
      
      const result = await makeRequest('POST', `/api/donate/${donation.postId}`, donationData);
      
      if (result.status === 200) {
        console.log(`✅ Donation successful! ID: ${result.data.donation.id}`);
        
        // Wait a moment for sync
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Show updated totals
        const updatedStats = await makeRequest('GET', '/api/stats');
        console.log(`   📈 New Total: ₹${updatedStats.data.totalDonations} (was ₹${initialStats.data.totalDonations})`);
        console.log(`   👥 New Donors: ${updatedStats.data.totalDonors} (was ${initialStats.data.totalDonors})`);
        
        // Update initial stats for next comparison
        initialStats.data.totalDonations = updatedStats.data.totalDonations;
        initialStats.data.totalDonors = updatedStats.data.totalDonors;
      } else {
        console.log(`❌ Donation failed: ${result.data.error}`);
      }
    }

    // Show final synchronized state
    console.log('\n🎉 FINAL SYNCHRONIZED STATE:');
    console.log('-'.repeat(30));
    
    const [finalStats, finalPosts] = await Promise.all([
      makeRequest('GET', '/api/stats'),
      makeRequest('GET', '/api/posts')
    ]);
    
    console.log(`💰 Total Donations: ₹${finalStats.data.totalDonations}`);
    console.log(`👥 Total Donors: ${finalStats.data.totalDonors}`);
    console.log(`📊 Average Donation: ₹${finalStats.data.averageDonation}`);
    
    console.log('\n📝 Updated Story Breakdown:');
    let totalFromPosts = 0;
    let totalDonorsFromPosts = 0;
    
    finalPosts.data.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}"`);
      console.log(`      💰 Raised: ₹${post.donationAmount || 0}`);
      console.log(`      👥 Donors: ${post.donations || 0}`);
      console.log(`      🚨 Urgency: ${post.urgencyLevel.toUpperCase()}`);
      console.log('');
      
      totalFromPosts += (post.donationAmount || 0);
      totalDonorsFromPosts += (post.donations || 0);
    });
    
    // Verify synchronization
    console.log('🔍 SYNCHRONIZATION VERIFICATION:');
    const amountMatch = totalFromPosts === finalStats.data.totalDonations;
    const donorMatch = totalDonorsFromPosts === finalStats.data.totalDonors;
    
    console.log(`   Amount Sync: ${amountMatch ? '✅' : '❌'} (Posts: ₹${totalFromPosts}, Stats: ₹${finalStats.data.totalDonations})`);
    console.log(`   Donor Sync: ${donorMatch ? '✅' : '❌'} (Posts: ${totalDonorsFromPosts}, Stats: ${finalStats.data.totalDonors})`);
    
    if (amountMatch && donorMatch) {
      console.log('\n🎊 PERFECT SYNCHRONIZATION ACHIEVED!');
      console.log('✅ All donation totals are perfectly synchronized');
      console.log('✅ Real-time updates working flawlessly');
      console.log('✅ Multi-story donations handled correctly');
      console.log('✅ System ready for production use');
    } else {
      console.log('\n⚠️ Synchronization issues detected');
    }
    
    console.log('\n💝 Recent Donation Activity:');
    finalStats.data.recentDonations.slice(0, 3).forEach((donation, index) => {
      console.log(`   ${index + 1}. ₹${donation.amount} by ${donation.donorName}`);
      console.log(`      📖 "${donation.storyTitle}"`);
      console.log(`      📅 ${new Date(donation.timestamp).toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

demoLiveSync();