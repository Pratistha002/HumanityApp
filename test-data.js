// Quick test script to verify the data is correct
const fetch = require('node-fetch');

async function testData() {
    try {
        console.log('🧪 Testing API Data...\n');
        
        // Test posts
        const postsResponse = await fetch('http://localhost:5000/api/posts');
        const posts = await postsResponse.json();
        
        console.log('📋 Posts Data:');
        posts.forEach(post => {
            console.log(`  - ${post.title}`);
            console.log(`    💰 ₹${post.donationAmount} raised from ${post.donations} donors`);
        });
        
        // Test stats
        const statsResponse = await fetch('http://localhost:5000/api/stats');
        const stats = await statsResponse.json();
        
        console.log('\n📊 Dashboard Stats:');
        console.log(`  - Total Donations: ₹${stats.totalDonations}`);
        console.log(`  - Stories Shared: ${stats.totalPosts}`);
        console.log(`  - Collaborations: ${stats.totalCollaborations}`);
        
        console.log('\n✅ Expected Results:');
        console.log('  - Ravi\'s Card: ₹400 raised from 4 donors');
        console.log('  - Dashboard: ₹100 total, 1 story, 1 collaboration');
        
        // Verify expectations
        const raviPost = posts.find(p => p.title.includes('Ravi'));
        if (raviPost && raviPost.donationAmount === 400 && raviPost.donations === 4) {
            console.log('\n🎉 Ravi\'s card data is CORRECT!');
        } else {
            console.log('\n❌ Ravi\'s card data is incorrect');
        }
        
        if (stats.totalDonations === 100 && stats.totalPosts === 1 && stats.totalCollaborations === 1) {
            console.log('🎉 Dashboard stats are CORRECT!');
        } else {
            console.log('❌ Dashboard stats are incorrect');
        }
        
    } catch (error) {
        console.error('❌ Error testing data:', error.message);
    }
}

testData();