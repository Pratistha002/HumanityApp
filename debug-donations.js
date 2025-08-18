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

async function debugDonations() {
  try {
    console.log('🔍 DEBUGGING DONATION SYNCHRONIZATION');
    console.log('=' .repeat(60));

    const stats = await makeRequest('/api/stats');
    
    console.log('\n📊 Stats Data:');
    console.log(`   Total: ₹${stats.totalDonations} from ${stats.totalDonors} donors`);
    
    console.log('\n💰 All Recent Donations:');
    stats.recentDonations.forEach((donation, index) => {
      console.log(`   ${index + 1}. ID: ${donation.id}`);
      console.log(`      Post ID: ${donation.postId} (Type: ${typeof donation.postId})`);
      console.log(`      Amount: ₹${donation.amount}`);
      console.log(`      Donor: ${donation.donorName}`);
      console.log(`      Status: ${donation.status}`);
      console.log(`      Story: ${donation.storyTitle}`);
      console.log('');
    });

    const posts = await makeRequest('/api/posts');
    
    console.log('📝 Posts Data:');
    posts.forEach(post => {
      console.log(`   Post ID: ${post.id} (Type: ${typeof post.id})`);
      console.log(`   Title: ${post.title}`);
      console.log(`   Amount: ₹${post.donationAmount || 0}`);
      console.log(`   Donors: ${post.donations || 0}`);
      console.log('');
    });

    console.log('🔍 Matching Analysis:');
    posts.forEach(post => {
      const matchingDonations = stats.recentDonations.filter(d => {
        // Check both string and number comparison
        return d.postId == post.id || d.postId === post.id;
      });
      
      console.log(`   Post ${post.id} "${post.title}": ${matchingDonations.length} matching donations`);
      matchingDonations.forEach(d => {
        console.log(`     - ₹${d.amount} by ${d.donorName} (PostID: ${d.postId}, Type: ${typeof d.postId})`);
      });
    });

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugDonations();