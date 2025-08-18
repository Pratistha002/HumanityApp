const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function checkSyncStatus() {
  try {
    console.log('🔍 Checking Donation Synchronization Status');
    console.log('=' .repeat(60));

    // Get stats and posts data
    const [stats, posts] = await Promise.all([
      makeRequest('/api/stats'),
      makeRequest('/api/posts')
    ]);

    console.log('\n📊 Stats API Data:');
    console.log(`   Total Donations: ₹${stats.totalDonations}`);
    console.log(`   Total Donors: ${stats.totalDonors}`);
    console.log(`   Average Donation: ₹${stats.averageDonation}`);
    console.log(`   Total Posts: ${stats.totalPosts}`);
    console.log(`   Recent Donations: ${stats.recentDonations.length}`);

    console.log('\n📝 Individual Posts Data:');
    let totalFromPosts = 0;
    let totalDonorsFromPosts = 0;
    
    posts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}"`);
      console.log(`      💰 Amount: ₹${post.donationAmount || 0}`);
      console.log(`      👥 Donors: ${post.donations || 0}`);
      console.log(`      📍 Location: ${post.location}`);
      console.log(`      🚨 Urgency: ${post.urgencyLevel}`);
      console.log('');
      
      totalFromPosts += (post.donationAmount || 0);
      totalDonorsFromPosts += (post.donations || 0);
    });

    console.log('📈 Post-Level Totals:');
    console.log(`   Total Amount: ₹${totalFromPosts}`);
    console.log(`   Total Donors: ${totalDonorsFromPosts}`);

    console.log('\n🔄 Synchronization Check:');
    const amountMatch = totalFromPosts === stats.totalDonations;
    const donorMatch = totalDonorsFromPosts === stats.totalDonors;
    
    console.log(`   Amount Sync: ${amountMatch ? '✅' : '❌'} (Posts: ₹${totalFromPosts}, Stats: ₹${stats.totalDonations})`);
    console.log(`   Donor Sync: ${donorMatch ? '✅' : '❌'} (Posts: ${totalDonorsFromPosts}, Stats: ${stats.totalDonors})`);

    if (amountMatch && donorMatch) {
      console.log('\n🎉 Perfect Synchronization! All systems are in sync.');
    } else {
      console.log('\n⚠️  Synchronization Issue Detected!');
      console.log('   Triggering manual sync...');
      
      // Trigger manual sync
      const syncResult = await makeRequest('/api/reload-data');
      console.log(`   Sync Result: ${syncResult.success ? '✅' : '❌'} ${syncResult.message}`);
    }

    console.log('\n💰 Recent Donations:');
    stats.recentDonations.slice(0, 3).forEach((donation, index) => {
      console.log(`   ${index + 1}. ₹${donation.amount} by ${donation.donorName}`);
      console.log(`      Story: ${donation.storyTitle}`);
      console.log(`      Date: ${new Date(donation.timestamp).toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking sync status:', error.message);
  }
}

checkSyncStatus();