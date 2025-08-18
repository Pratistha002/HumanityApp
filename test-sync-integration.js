const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Test script to verify bidirectional Excel-Portal synchronization
console.log('🧪 Testing Bidirectional Excel-Portal Synchronization');
console.log('=' .repeat(60));

const dataDir = path.join(__dirname, 'Backend', 'data');
const storiesFile = path.join(dataDir, 'stories.xlsx');
const donationsFile = path.join(dataDir, 'donations.xlsx');
const collaborationsFile = path.join(dataDir, 'collaborations.xlsx');

// Helper function to read Excel data
function readExcelData(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return [];
    }
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    
    // Filter out header rows
    return data.filter(row => 
      row.ID !== 'Story ID' && 
      row.ID !== 'Donation ID' && 
      row.ID !== 'Collaboration ID'
    );
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return [];
  }
}

// Helper function to add test data to Excel
function addTestDataToExcel(filePath, testData, sheetName) {
  try {
    let existingData = [];
    let headers = [];
    
    if (fs.existsSync(filePath)) {
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      existingData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      
      if (existingData.length > 0) {
        headers = Object.keys(existingData[0]);
      }
    }
    
    // Add test data
    const newData = [...existingData, testData];
    
    // Create new workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(newData);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filePath);
    
    console.log(`✅ Test data added to ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error adding test data to ${filePath}:`, error.message);
    return false;
  }
}

// Test 1: Check if Excel files exist
console.log('\n📋 Test 1: Checking Excel Files');
console.log('-'.repeat(30));

const files = [
  { path: storiesFile, name: 'Stories' },
  { path: donationsFile, name: 'Donations' },
  { path: collaborationsFile, name: 'Collaborations' }
];

files.forEach(file => {
  if (fs.existsSync(file.path)) {
    const data = readExcelData(file.path);
    console.log(`✅ ${file.name}: ${data.length} records found`);
  } else {
    console.log(`❌ ${file.name}: File not found`);
  }
});

// Test 2: Read current data
console.log('\n📊 Test 2: Current Data State');
console.log('-'.repeat(30));

const currentStories = readExcelData(storiesFile);
const currentDonations = readExcelData(donationsFile);
const currentCollaborations = readExcelData(collaborationsFile);

console.log(`Stories: ${currentStories.length} records`);
console.log(`Donations: ${currentDonations.length} records`);
console.log(`Collaborations: ${currentCollaborations.length} records`);

// Test 3: Add test data to simulate Excel changes
console.log('\n🧪 Test 3: Adding Test Data to Excel');
console.log('-'.repeat(30));

const testStory = {
  ID: `test_story_${Date.now()}`,
  Title: 'Test Story for Sync',
  Description: 'This is a test story to verify Excel-to-Portal sync',
  Location: 'Test Location',
  ContactInfo: 'test@example.com',
  UrgencyLevel: 'medium',
  MediaFiles: '',
  DonationAmount: 0,
  DonorCount: 0,
  Status: 'active',
  CreatedAt: new Date().toISOString(),
  UpdatedAt: new Date().toISOString()
};

const testDonation = {
  ID: `test_donation_${Date.now()}`,
  StoryID: testStory.ID,
  StoryTitle: testStory.Title,
  DonorName: 'Test Donor',
  DonorUPI: 'test@upi',
  Amount: 100,
  PaymentMethod: 'UPI',
  TransactionID: `TXN${Date.now()}`,
  Status: 'completed',
  CompletedAt: new Date().toISOString(),
  CreatedAt: new Date().toISOString()
};

const testCollaboration = {
  ID: `test_collab_${Date.now()}`,
  OrganizationName: 'Test Organization',
  ContactPerson: 'Test Contact',
  Email: 'test@organization.com',
  Phone: '+1234567890',
  OrganizationType: 'NGO',
  CollaborationType: 'funding',
  Resources: 'Financial Support',
  Description: 'Test collaboration for sync verification',
  Status: 'pending',
  Priority: 'medium',
  AdminNotes: '',
  SubmittedAt: new Date().toISOString(),
  LastContactedAt: '',
  UpdatedAt: new Date().toISOString()
};

// Add test data
addTestDataToExcel(storiesFile, testStory, 'Stories');
addTestDataToExcel(donationsFile, testDonation, 'Donations');
addTestDataToExcel(collaborationsFile, testCollaboration, 'Collaborations');

// Test 4: Verify data was added
console.log('\n✅ Test 4: Verifying Test Data Addition');
console.log('-'.repeat(30));

setTimeout(() => {
  const updatedStories = readExcelData(storiesFile);
  const updatedDonations = readExcelData(donationsFile);
  const updatedCollaborations = readExcelData(collaborationsFile);
  
  console.log(`Stories: ${updatedStories.length} records (was ${currentStories.length})`);
  console.log(`Donations: ${updatedDonations.length} records (was ${currentDonations.length})`);
  console.log(`Collaborations: ${updatedCollaborations.length} records (was ${currentCollaborations.length})`);
  
  // Check if our test data exists
  const storyExists = updatedStories.some(s => s.ID === testStory.ID);
  const donationExists = updatedDonations.some(d => d.ID === testDonation.ID);
  const collabExists = updatedCollaborations.some(c => c.ID === testCollaboration.ID);
  
  console.log(`Test Story Added: ${storyExists ? '✅' : '❌'}`);
  console.log(`Test Donation Added: ${donationExists ? '✅' : '❌'}`);
  console.log(`Test Collaboration Added: ${collabExists ? '✅' : '❌'}`);
  
  // Test 5: Instructions for manual testing
  console.log('\n📝 Test 5: Manual Testing Instructions');
  console.log('-'.repeat(30));
  console.log('1. Start the server: npm start (in Backend directory)');
  console.log('2. Start the frontend: npm start (in Frontend directory)');
  console.log('3. Open Excel files in Backend/data/ directory');
  console.log('4. Make changes to the Excel files and save them');
  console.log('5. Check the portal - changes should appear automatically');
  console.log('6. Create new stories/donations through the portal');
  console.log('7. Check Excel files - new data should appear automatically');
  console.log('8. Watch the browser console for sync notifications');
  
  console.log('\n🎯 Expected Behavior:');
  console.log('- Excel changes → Portal updates in real-time');
  console.log('- Portal changes → Excel files updated immediately');
  console.log('- Sync notifications appear in top-right corner');
  console.log('- Admin dashboard shows sync status');
  console.log('- Backup files created before major changes');
  
  console.log('\n🔍 Monitoring:');
  console.log('- Check server console for [WATCHER] and [SYNC] messages');
  console.log('- Check browser console for [SOCKET] messages');
  console.log('- Look for sync notifications in the UI');
  console.log('- Verify data consistency between Excel and Portal');
  
  console.log('\n✨ Test Complete!');
  console.log('The bidirectional sync system is ready for testing.');
  
}, 1000);