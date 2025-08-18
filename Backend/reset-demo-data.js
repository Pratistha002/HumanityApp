// Script to reset demo data and regenerate Excel files
const fs = require('fs');
const path = require('path');
const { demoStories, demoDonations } = require('./demo-data.js');
const dataService = require('./services/dataService');

console.log('🔄 Resetting demo data...');

// Clear existing Excel files
const excelDir = path.join(__dirname, 'excel-data');
if (fs.existsSync(excelDir)) {
    const files = fs.readdirSync(excelDir);
    files.forEach(file => {
        if (file.endsWith('.xlsx')) {
            fs.unlinkSync(path.join(excelDir, file));
            console.log(`🗑️  Deleted ${file}`);
        }
    });
}

// Initialize Excel files with demo data
console.log('📊 Creating new Excel files with demo data...');

// Save demo stories
demoStories.forEach(story => {
    dataService.saveStory(story);
    console.log(`✅ Saved story: ${story.title}`);
});

// Save demo donations
demoDonations.forEach(donation => {
    dataService.saveDonation(donation);
    console.log(`✅ Saved donation: ₹${donation.amount} for ${donation.storyTitle}`);
});

console.log('🎉 Demo data reset complete!');
console.log('📈 Statistics:');
console.log(`   - Stories: ${demoStories.length}`);
console.log(`   - Donations: ${demoDonations.length}`);
console.log(`   - Total Amount: ₹${demoDonations.reduce((sum, d) => sum + d.amount, 0)}`);
console.log(`   - Total Donors: ${demoDonations.length}`);

// Calculate per-story statistics
console.log('\n📊 Per-story statistics:');
demoStories.forEach(story => {
    const storyDonations = demoDonations.filter(d => d.postId === story.id);
    const totalAmount = storyDonations.reduce((sum, d) => sum + d.amount, 0);
    console.log(`   - ${story.title}: ₹${totalAmount} from ${storyDonations.length} donors`);
});

console.log('\n🚀 Restart the server to see the updated data!');