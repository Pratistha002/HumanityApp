const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

class DataService {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.storiesFile = path.join(this.dataDir, 'stories.xlsx');
    this.collaborationsFile = path.join(this.dataDir, 'collaborations.xlsx');
    this.donationsFile = path.join(this.dataDir, 'donations.xlsx');
    this.statusUpdatesFile = path.join(this.dataDir, 'status_updates.xlsx');
    
    // Ensure data directory exists
    this.ensureDataDirectory();
    
    // Initialize Excel files if they don't exist
    this.initializeFiles();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
      console.log('✅ Data directory created for Excel storage');
    }
  }

  initializeFiles() {
    // Initialize stories file
    if (!fs.existsSync(this.storiesFile)) {
      const storiesData = [{
        ID: 'Story ID',
        Title: 'Story Title',
        Description: 'Story Description',
        Location: 'Location',
        ContactInfo: 'Contact Information',
        UrgencyLevel: 'Urgency Level',
        MediaFiles: 'Media Files',
        DonationAmount: 'Total Donations',
        DonorCount: 'Number of Donors',
        Status: 'Status',
        CreatedAt: 'Created Date',
        UpdatedAt: 'Last Updated'
      }];
      this.writeToExcel(this.storiesFile, storiesData, 'Stories');
    }

    // Initialize collaborations file
    if (!fs.existsSync(this.collaborationsFile)) {
      const collaborationsData = [{
        ID: 'Collaboration ID',
        OrganizationName: 'Organization Name',
        ContactPerson: 'Contact Person',
        Email: 'Email Address',
        Phone: 'Phone Number',
        OrganizationType: 'Organization Type',
        CollaborationType: 'Collaboration Type',
        Resources: 'Available Resources',
        Description: 'Description',
        Status: 'Status',
        Priority: 'Priority',
        AdminNotes: 'Admin Notes',
        SubmittedAt: 'Submitted Date',
        LastContactedAt: 'Last Contacted',
        UpdatedAt: 'Last Updated'
      }];
      this.writeToExcel(this.collaborationsFile, collaborationsData, 'Collaborations');
    }

    // Initialize donations file
    if (!fs.existsSync(this.donationsFile)) {
      const donationsData = [{
        ID: 'Donation ID',
        StoryID: 'Story ID',
        StoryTitle: 'Story Title',
        DonorName: 'Donor Name',
        DonorUPI: 'Donor UPI ID',
        Amount: 'Donation Amount',
        PaymentMethod: 'Payment Method',
        TransactionID: 'Transaction ID',
        Status: 'Payment Status',
        CompletedAt: 'Completion Date',
        CreatedAt: 'Created Date'
      }];
      this.writeToExcel(this.donationsFile, donationsData, 'Donations');
    }

    // Initialize status updates file
    if (!fs.existsSync(this.statusUpdatesFile)) {
      const statusUpdatesData = [{
        ID: 'Update ID',
        Type: 'Update Type',
        ItemID: 'Item ID',
        ItemTitle: 'Item Title',
        OldStatus: 'Previous Status',
        NewStatus: 'New Status',
        UpdatedBy: 'Updated By',
        AdminNotes: 'Admin Notes',
        Timestamp: 'Update Timestamp'
      }];
      this.writeToExcel(this.statusUpdatesFile, statusUpdatesData, 'Status Updates');
    }

    console.log('✅ Excel files initialized for data persistence');
  }

  writeToExcel(filePath, data, sheetName = 'Sheet1') {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Auto-size columns
      const colWidths = [];
      if (data.length > 0) {
        Object.keys(data[0]).forEach((key, index) => {
          const maxLength = Math.max(
            key.length,
            ...data.map(row => String(row[key] || '').length)
          );
          colWidths[index] = { width: Math.min(maxLength + 2, 50) };
        });
        worksheet['!cols'] = colWidths;
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, filePath);
      return true;
    } catch (error) {
      console.error(`Error writing to Excel file ${filePath}:`, error);
      return false;
    }
  }

  readFromExcel(filePath, sheetName = null) {
    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }
      
      const workbook = XLSX.readFile(filePath);
      const sheet = sheetName || workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet]);
      
      // Filter out header row if it exists
      return data.filter(row => row.ID !== 'Story ID' && row.ID !== 'Collaboration ID' && row.ID !== 'Donation ID' && row.ID !== 'Update ID');
    } catch (error) {
      console.error(`Error reading from Excel file ${filePath}:`, error);
      return [];
    }
  }

  // Save story to Excel
  saveStory(story) {
    try {
      const existingStories = this.readFromExcel(this.storiesFile);
      
      const storyData = {
        ID: story.id,
        Title: story.title,
        Description: story.description,
        Location: story.location,
        ContactInfo: story.contactInfo,
        UrgencyLevel: story.urgencyLevel,
        MediaFiles: Array.isArray(story.media) ? story.media.map(m => m.filename).join(', ') : '',
        DonationAmount: story.donationAmount || 0,
        DonorCount: story.donations || 0,
        Status: story.status || 'active',
        CreatedAt: story.createdAt || new Date().toISOString(),
        UpdatedAt: new Date().toISOString()
      };

      // Check if story already exists
      const existingIndex = existingStories.findIndex(s => s.ID === story.id);
      if (existingIndex >= 0) {
        existingStories[existingIndex] = storyData;
      } else {
        existingStories.push(storyData);
      }

      // Add header row back
      const dataWithHeader = [{
        ID: 'Story ID',
        Title: 'Story Title',
        Description: 'Story Description',
        Location: 'Location',
        ContactInfo: 'Contact Information',
        UrgencyLevel: 'Urgency Level',
        MediaFiles: 'Media Files',
        DonationAmount: 'Total Donations',
        DonorCount: 'Number of Donors',
        Status: 'Status',
        CreatedAt: 'Created Date',
        UpdatedAt: 'Last Updated'
      }, ...existingStories];

      this.writeToExcel(this.storiesFile, dataWithHeader, 'Stories');
      console.log(`✅ Story saved to Excel: ${story.title}`);
      return true;
    } catch (error) {
      console.error('Error saving story to Excel:', error);
      return false;
    }
  }

  // Save collaboration to Excel
  saveCollaboration(collaboration) {
    try {
      const existingCollaborations = this.readFromExcel(this.collaborationsFile);
      
      const collaborationData = {
        ID: collaboration.id,
        OrganizationName: collaboration.organizationName,
        ContactPerson: collaboration.contactPerson,
        Email: collaboration.email,
        Phone: collaboration.phone,
        OrganizationType: collaboration.organizationType,
        CollaborationType: collaboration.collaborationType,
        Resources: Array.isArray(collaboration.resources) ? collaboration.resources.join(', ') : collaboration.resources || '',
        Description: collaboration.description,
        Status: collaboration.status || 'pending',
        Priority: collaboration.priority || 'medium',
        AdminNotes: collaboration.adminNotes || '',
        SubmittedAt: collaboration.submittedAt || collaboration.createdAt || new Date().toISOString(),
        LastContactedAt: collaboration.lastContactedAt || '',
        UpdatedAt: new Date().toISOString()
      };

      // Check if collaboration already exists
      const existingIndex = existingCollaborations.findIndex(c => c.ID === collaboration.id);
      if (existingIndex >= 0) {
        existingCollaborations[existingIndex] = collaborationData;
      } else {
        existingCollaborations.push(collaborationData);
      }

      // Add header row back
      const dataWithHeader = [{
        ID: 'Collaboration ID',
        OrganizationName: 'Organization Name',
        ContactPerson: 'Contact Person',
        Email: 'Email Address',
        Phone: 'Phone Number',
        OrganizationType: 'Organization Type',
        CollaborationType: 'Collaboration Type',
        Resources: 'Available Resources',
        Description: 'Description',
        Status: 'Status',
        Priority: 'Priority',
        AdminNotes: 'Admin Notes',
        SubmittedAt: 'Submitted Date',
        LastContactedAt: 'Last Contacted',
        UpdatedAt: 'Last Updated'
      }, ...existingCollaborations];

      this.writeToExcel(this.collaborationsFile, dataWithHeader, 'Collaborations');
      console.log(`✅ Collaboration saved to Excel: ${collaboration.organizationName}`);
      return true;
    } catch (error) {
      console.error('Error saving collaboration to Excel:', error);
      return false;
    }
  }

  // Save donation to Excel
  saveDonation(donation) {
    try {
      const existingDonations = this.readFromExcel(this.donationsFile);
      
      const donationData = {
        ID: donation.id,
        StoryID: donation.postId || donation.storyId,
        StoryTitle: donation.storyTitle || '',
        DonorName: donation.donorName,
        DonorUPI: donation.donorUPI || '',
        Amount: donation.amount,
        PaymentMethod: donation.paymentMethod,
        TransactionID: donation.transactionId || '',
        Status: donation.status || 'completed',
        CompletedAt: donation.completedAt || donation.timestamp || new Date().toISOString(),
        CreatedAt: donation.createdAt || donation.timestamp || new Date().toISOString()
      };

      // Check if donation already exists
      const existingIndex = existingDonations.findIndex(d => d.ID === donation.id);
      if (existingIndex >= 0) {
        existingDonations[existingIndex] = donationData;
      } else {
        existingDonations.push(donationData);
      }

      // Add header row back
      const dataWithHeader = [{
        ID: 'Donation ID',
        StoryID: 'Story ID',
        StoryTitle: 'Story Title',
        DonorName: 'Donor Name',
        DonorUPI: 'Donor UPI ID',
        Amount: 'Donation Amount',
        PaymentMethod: 'Payment Method',
        TransactionID: 'UTR/Transaction ID',
        Status: 'Payment Status',
        CompletedAt: 'Completion Date',
        CreatedAt: 'Created Date'
      }, ...existingDonations];

      this.writeToExcel(this.donationsFile, dataWithHeader, 'Donations');
      console.log(`✅ Donation saved to Excel: ₹${donation.amount} from ${donation.donorName}`);
      return true;
    } catch (error) {
      console.error('Error saving donation to Excel:', error);
      return false;
    }
  }

  // Save status update to Excel
  saveStatusUpdate(update) {
    try {
      const existingUpdates = this.readFromExcel(this.statusUpdatesFile);
      
      const updateData = {
        ID: Date.now() + Math.random().toString(36).substr(2, 9),
        Type: update.type, // 'collaboration', 'story', 'donation'
        ItemID: update.itemId,
        ItemTitle: update.itemTitle || '',
        OldStatus: update.oldStatus,
        NewStatus: update.newStatus,
        UpdatedBy: update.updatedBy || 'admin',
        AdminNotes: update.adminNotes || '',
        Timestamp: new Date().toISOString()
      };

      existingUpdates.push(updateData);

      // Add header row back
      const dataWithHeader = [{
        ID: 'Update ID',
        Type: 'Update Type',
        ItemID: 'Item ID',
        ItemTitle: 'Item Title',
        OldStatus: 'Previous Status',
        NewStatus: 'New Status',
        UpdatedBy: 'Updated By',
        AdminNotes: 'Admin Notes',
        Timestamp: 'Update Timestamp'
      }, ...existingUpdates];

      this.writeToExcel(this.statusUpdatesFile, dataWithHeader, 'Status Updates');
      console.log(`✅ Status update saved to Excel: ${update.type} ${update.itemId} changed from ${update.oldStatus} to ${update.newStatus}`);
      return true;
    } catch (error) {
      console.error('Error saving status update to Excel:', error);
      return false;
    }
  }

  // Load all data from Excel files
  loadAllData() {
    return {
      stories: this.readFromExcel(this.storiesFile),
      collaborations: this.readFromExcel(this.collaborationsFile),
      donations: this.readFromExcel(this.donationsFile),
      statusUpdates: this.readFromExcel(this.statusUpdatesFile)
    };
  }

  // Enhanced method to validate data before saving
  validateStoryData(story) {
    const errors = [];
    
    if (!story.id) errors.push('Story ID is required');
    if (!story.title || story.title.trim().length === 0) errors.push('Story title is required');
    if (!story.description || story.description.trim().length === 0) errors.push('Story description is required');
    if (!story.location || story.location.trim().length === 0) errors.push('Location is required');
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  validateDonationData(donation) {
    const errors = [];
    
    if (!donation.id) errors.push('Donation ID is required');
    if (!donation.amount || isNaN(donation.amount) || donation.amount <= 0) errors.push('Valid donation amount is required');
    if (!donation.donorName || donation.donorName.trim().length === 0) errors.push('Donor name is required');
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  validateCollaborationData(collaboration) {
    const errors = [];
    
    if (!collaboration.id) errors.push('Collaboration ID is required');
    if (!collaboration.organizationName || collaboration.organizationName.trim().length === 0) errors.push('Organization name is required');
    if (!collaboration.email || !this.isValidEmail(collaboration.email)) errors.push('Valid email is required');
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Method to backup Excel files before major changes
  backupExcelFile(filePath) {
    try {
      const backupPath = filePath.replace('.xlsx', `_backup_${Date.now()}.xlsx`);
      if (fs.existsSync(filePath)) {
        fs.copyFileSync(filePath, backupPath);
        console.log(`✅ Backup created: ${backupPath}`);
        return backupPath;
      }
    } catch (error) {
      console.error('Error creating backup:', error);
    }
    return null;
  }

  // Method to get file modification time for conflict detection
  getFileModificationTime(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return stats.mtime;
      }
    } catch (error) {
      console.error('Error getting file modification time:', error);
    }
    return null;
  }

  // Enhanced save methods with validation and backup
  saveStoryWithValidation(story) {
    const validation = this.validateStoryData(story);
    if (!validation.isValid) {
      console.error('Story validation failed:', validation.errors);
      return { success: false, errors: validation.errors };
    }

    // Create backup before saving
    this.backupExcelFile(this.storiesFile);
    
    const success = this.saveStory(story);
    return { success: success, errors: success ? [] : ['Failed to save to Excel'] };
  }

  saveDonationWithValidation(donation) {
    const validation = this.validateDonationData(donation);
    if (!validation.isValid) {
      console.error('Donation validation failed:', validation.errors);
      return { success: false, errors: validation.errors };
    }

    // Create backup before saving
    this.backupExcelFile(this.donationsFile);
    
    const success = this.saveDonation(donation);
    return { success: success, errors: success ? [] : ['Failed to save to Excel'] };
  }

  saveCollaborationWithValidation(collaboration) {
    const validation = this.validateCollaborationData(collaboration);
    if (!validation.isValid) {
      console.error('Collaboration validation failed:', validation.errors);
      return { success: false, errors: validation.errors };
    }

    // Create backup before saving
    this.backupExcelFile(this.collaborationsFile);
    
    const success = this.saveCollaboration(collaboration);
    return { success: success, errors: success ? [] : ['Failed to save to Excel'] };
  }

  // Get file paths for backup/access
  getFilePaths() {
    return {
      stories: this.storiesFile,
      collaborations: this.collaborationsFile,
      donations: this.donationsFile,
      statusUpdates: this.statusUpdatesFile,
      dataDirectory: this.dataDir
    };
  }
}

module.exports = new DataService();