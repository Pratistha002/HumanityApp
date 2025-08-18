const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Database connection
const connectDB = require('./config/database');
const Collaboration = require('./models/Collaboration');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 5000;

// Initialize database connection
let isDBConnected = false;
connectDB().then((connection) => {
  isDBConnected = !!connection;
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:5000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Serve static files
app.use(express.static('public'));

// Serve the interactive frontend as the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'interactive.html'));
});

// Serve test page for JavaScript debugging
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// In-memory storage for demo (replace with database in production)
let posts = [];
let collaborations = [];
let donations = [];
let successStories = [];

// Load demo data
try {
    const { demoStories, demoDonations } = require('./demo-data.js');
    posts = [...demoStories];
    donations = [...demoDonations];
    console.log('✅ Demo data loaded successfully - 3 sample stories and 6 sample donations available');
} catch (error) {
    console.log('ℹ️  No demo data found, starting with empty data');
}

// Load demo collaboration data
try {
    const demoCollaborations = require('./demo-collaborations.js');
    collaborations = [...demoCollaborations];
    console.log('✅ Demo collaboration data loaded - 3 sample collaboration requests available');
} catch (error) {
    console.log('ℹ️  No demo collaboration data found, starting with empty collaborations');
}

// Import data service for Excel persistence
const dataService = require('./services/dataService');
const FileWatcher = require('./services/fileWatcher');
const SyncService = require('./services/syncService');
const PaymentGateway = require('./services/paymentGateway');

// Import routes and initialize admin controller
const adminRoutes = require('./routes/admin');
const { initializeCollaborations } = require('./controllers/adminController');

// Load existing data from Excel files (but keep demo data if Excel is empty or has fewer stories)
const existingData = dataService.loadAllData();
if (existingData.stories.length > 0 && posts.length === 0) {
  // Only load Excel data if we don't have demo data
  posts = existingData.stories.map(story => ({
    id: story.ID,
    title: story.Title,
    description: story.Description,
    location: story.Location,
    contactInfo: story.ContactInfo,
    urgencyLevel: story.UrgencyLevel,
    media: story.MediaFiles ? story.MediaFiles.split(', ').map(filename => ({ filename })) : [],
    donationAmount: story.DonationAmount || 0,
    donations: story.DonorCount || 0,
    status: story.Status || 'active',
    createdAt: story.CreatedAt,
    updatedAt: story.UpdatedAt
  }));
  console.log(`✅ Loaded ${posts.length} stories from Excel file`);
} else if (posts.length > 0) {
  console.log(`✅ Using demo data - ${posts.length} stories loaded`);
}

if (existingData.collaborations.length > 0) {
  // Convert Excel data back to in-memory format
  collaborations = existingData.collaborations.map(collab => ({
    id: collab.ID,
    organizationName: collab.OrganizationName,
    contactPerson: collab.ContactPerson,
    email: collab.Email,
    phone: collab.Phone,
    organizationType: collab.OrganizationType,
    collaborationType: collab.CollaborationType,
    resources: collab.Resources ? collab.Resources.split(', ') : [],
    description: collab.Description,
    status: collab.Status || 'pending',
    priority: collab.Priority || 'medium',
    adminNotes: collab.AdminNotes || '',
    submittedAt: collab.SubmittedAt,
    lastContactedAt: collab.LastContactedAt,
    createdAt: collab.SubmittedAt,
    updatedAt: collab.UpdatedAt
  }));
  console.log(`✅ Loaded ${collaborations.length} collaborations from Excel file`);
}

if (existingData.donations.length > 0 && donations.length === 0) {
  // Only load Excel donations if we don't have demo donations
  donations = existingData.donations.map(donation => ({
    id: donation.ID,
    postId: donation.StoryID,
    storyTitle: donation.StoryTitle,
    donorName: donation.DonorName,
    donorUPI: donation.DonorUPI,
    amount: donation.Amount,
    paymentMethod: donation.PaymentMethod,
    transactionId: donation.TransactionID,
    status: donation.Status,
    timestamp: donation.CompletedAt,
    createdAt: donation.CreatedAt
  }));
  console.log(`✅ Loaded ${donations.length} donations from Excel file`);
} else if (donations.length > 0) {
  console.log(`✅ Using demo donations - ${donations.length} donations loaded`);
}

// Initialize admin controller with collaboration data
initializeCollaborations(collaborations);

// Sync donation amounts after initial data loading
setTimeout(() => {
  syncPostDonationAmounts();
}, 1000); // Small delay to ensure all data is loaded

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });
});

// Callback function to update in-memory data when Excel files change
function updateDataFromExcel(allData, changedFile) {
  console.log(`[UPDATE] Excel file changed: ${changedFile}`);
  
  let dataUpdated = false;
  
  // Update stories/posts
  if (allData.stories.length > 0) {
    const newPosts = allData.stories.map(story => ({
      id: story.ID,
      title: story.Title,
      description: story.Description,
      location: story.Location,
      contactInfo: story.ContactInfo,
      urgencyLevel: story.UrgencyLevel,
      media: story.MediaFiles ? story.MediaFiles.split(', ').map(filename => ({ filename })) : [],
      donationAmount: story.DonationAmount || 0,
      donations: story.DonorCount || 0,
      status: story.Status || 'active',
      createdAt: story.CreatedAt,
      updatedAt: story.UpdatedAt
    }));
    
    posts.length = 0; // Clear existing posts
    posts.push(...newPosts); // Add new posts
    console.log(`[UPDATE] Updated ${posts.length} stories from Excel`);
    dataUpdated = true;
  }
  
  // Update donations
  if (allData.donations.length > 0) {
    const newDonations = allData.donations.map(donation => ({
      id: donation.ID,
      postId: donation.StoryID,
      storyTitle: donation.StoryTitle,
      donorName: donation.DonorName,
      donorUPI: donation.DonorUPI,
      amount: donation.Amount,
      paymentMethod: donation.PaymentMethod,
      transactionId: donation.TransactionID,
      status: donation.Status,
      timestamp: donation.CompletedAt,
      createdAt: donation.CreatedAt
    }));
    
    donations.length = 0; // Clear existing donations
    donations.push(...newDonations); // Add new donations
    console.log(`[UPDATE] Updated ${donations.length} donations from Excel`);
    dataUpdated = true;
  }
  
  // Update collaborations
  if (allData.collaborations.length > 0) {
    const newCollaborations = allData.collaborations.map(collab => ({
      id: collab.ID,
      organizationName: collab.OrganizationName,
      contactPerson: collab.ContactPerson,
      email: collab.Email,
      phone: collab.Phone,
      organizationType: collab.OrganizationType,
      collaborationType: collab.CollaborationType,
      resources: collab.Resources ? collab.Resources.split(', ') : [],
      description: collab.Description,
      status: collab.Status || 'pending',
      priority: collab.Priority || 'medium',
      adminNotes: collab.AdminNotes || '',
      submittedAt: collab.SubmittedAt,
      lastContactedAt: collab.LastContactedAt,
      createdAt: collab.SubmittedAt,
      updatedAt: collab.UpdatedAt
    }));
    
    collaborations.length = 0; // Clear existing collaborations
    collaborations.push(...newCollaborations); // Add new collaborations
    console.log(`[UPDATE] Updated ${collaborations.length} collaborations from Excel`);
    dataUpdated = true;
  }
  
  if (dataUpdated) {
    console.log('[UPDATE] In-memory data synchronized with Excel files');
    
    // Emit real-time updates to all connected clients
    const totalDonations = donations.reduce((sum, d) => sum + (d.status === 'completed' ? d.amount : 0), 0);
    const updateData = {
      posts: posts,
      stats: {
        totalDonations,
        totalPosts: posts.length,
        totalCollaborations: collaborations.length,
        totalDonors: donations.filter(d => d.status === 'completed').length,
        recentDonations: donations.filter(d => d.status === 'completed').slice(-5).reverse()
      },
      timestamp: new Date().toISOString(),
      changedFile: changedFile
    };
    
    io.emit('dataUpdated', updateData);
    console.log(`[SOCKET] Broadcasted data update to ${io.engine.clientsCount} clients`);
  }
}

// Initialize sync service
const syncService = new SyncService(dataService, io);
syncService.initializePreviousDataState();

// Initialize payment gateway
const paymentGateway = new PaymentGateway();

// Function to sync donation amounts between posts and donations
function syncPostDonationAmounts() {
  console.log('[SYNC] Syncing donation amounts between posts and donations...');
  
  posts.forEach(post => {
    // Calculate total donations for this post
    const postDonations = donations.filter(d => 
      d.postId === post.id && d.status === 'completed'
    );
    
    const totalAmount = postDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const donorCount = postDonations.length;
    
    // Update post with calculated values
    const oldAmount = post.donationAmount || 0;
    const oldCount = post.donations || 0;
    
    post.donationAmount = totalAmount;
    post.donations = donorCount;
    
    if (oldAmount !== totalAmount || oldCount !== donorCount) {
      console.log(`[SYNC] Post "${post.title}": ₹${oldAmount} → ₹${totalAmount}, ${oldCount} → ${donorCount} donors`);
    }
  });
  
  console.log('[SYNC] Donation amounts synchronized');
}

// Enhanced callback function with sync service integration
function enhancedUpdateDataFromExcel(allData, changedFile) {
  // First, update in-memory data (existing functionality)
  updateDataFromExcel(allData, changedFile);
  
  // Sync donation amounts after data update
  syncPostDonationAmounts();
  
  // Then, use sync service for enhanced synchronization
  syncService.syncFromExcel(changedFile, allData);
}

// Initialize file watcher for Excel files
const fileWatcher = new FileWatcher(dataService, enhancedUpdateDataFromExcel);

// Graceful shutdown - cleanup file watchers
process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Cleaning up file watchers...');
  fileWatcher.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[SHUTDOWN] Cleaning up file watchers...');
  fileWatcher.destroy();
  process.exit(0);
});

// Sync management endpoints
app.get('/api/sync/status', (req, res) => {
  try {
    const status = syncService.getSyncStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/sync/force', async (req, res) => {
  try {
    const result = await syncService.forceSyncFromExcel();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/sync/cleanup-backups', (req, res) => {
  try {
    syncService.cleanupBackups();
    res.json({
      success: true,
      message: 'Backup cleanup completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Payment Gateway Routes

// Initiate payment
app.post('/api/payment/initiate', async (req, res) => {
  try {
    const { storyId, amount, donorName, donorUpiId } = req.body;
    
    // Find the story
    const story = posts.find(p => p.id === storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found'
      });
    }

    // Get payment configuration
    const paymentConfig = {
      recipientUpiId: process.env.UPI_ID || 'pratisthasingh002003-1@okaxis',
      organizationName: 'Humanity Charity Platform'
    };

    const paymentRequest = {
      storyId,
      storyTitle: story.title,
      amount,
      donorName,
      donorUpiId,
      recipientUpiId: paymentConfig.recipientUpiId,
      organizationName: paymentConfig.organizationName
    };

    const result = await paymentGateway.initiatePayment(paymentRequest);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error initiating payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate payment'
    });
  }
});

// Verify payment
app.post('/api/payment/verify', async (req, res) => {
  try {
    const { paymentId, utr, paymentApp } = req.body;
    
    if (!paymentId || !utr) {
      return res.status(400).json({
        success: false,
        error: 'Payment ID and UTR are required'
      });
    }

    const result = await paymentGateway.verifyPayment(paymentId, {
      utr,
      paymentApp
    });

    if (result.success) {
      // Get payment details
      const paymentStatus = paymentGateway.getPaymentStatus(paymentId);
      
      if (paymentStatus.success && paymentStatus.payment) {
        const payment = paymentStatus.payment;
        
        // Create donation record
        const donationData = {
          id: `donation_${Date.now()}`,
          storyId: payment.storyId,
          storyTitle: payment.storyTitle,
          donorName: payment.donorName,
          donorUpiId: payment.donorUpiId,
          amount: payment.amount,
          paymentMethod: 'UPI',
          transactionId: utr,
          paymentId: paymentId,
          status: 'completed',
          completedAt: payment.completedAt,
          createdAt: payment.createdAt
        };

        // Update story donation amount
        const story = posts.find(p => p.id === payment.storyId);
        if (story) {
          story.donationAmount = (story.donationAmount || 0) + payment.amount;
          story.donorCount = (story.donorCount || 0) + 1;
          story.updatedAt = new Date().toISOString();
        }

        // Save donation using sync service
        const syncResult = await syncService.syncToExcel('donation', donationData, 'create');
        
        // Broadcast update to all clients
        io.emit('dataUpdated', {
          type: 'donation_completed',
          storyId: payment.storyId,
          donation: donationData,
          updatedStory: story
        });

        res.json({
          ...result,
          donation: donationData
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Payment verification failed'
        });
      }
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
});

// Get payment status
app.get('/api/payment/status/:paymentId', (req, res) => {
  try {
    const { paymentId } = req.params;
    const result = paymentGateway.getPaymentStatus(paymentId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status'
    });
  }
});

// Get payment receipt
app.get('/api/receipt/:receiptId', (req, res) => {
  try {
    const { receiptId } = req.params;
    const result = paymentGateway.getReceipt(receiptId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error getting receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get receipt'
    });
  }
});

// Download payment receipt
app.get('/api/receipt/:receiptId/download', (req, res) => {
  try {
    const { receiptId } = req.params;
    const result = paymentGateway.getReceipt(receiptId);
    
    if (result.success) {
      const receipt = result.receipt;
      
      // Generate receipt content
      const receiptContent = `
PAYMENT RECEIPT
===============

Receipt ID: ${receipt.receiptId}
Payment ID: ${receipt.paymentId}
Date: ${new Date(receipt.timestamps.completedAt).toLocaleString()}

TRANSACTION DETAILS
-------------------
Amount: ₹${receipt.transactionDetails.amount}
UTR: ${receipt.transactionDetails.utr}
Payment Method: ${receipt.transactionDetails.paymentMethod}
Status: ${receipt.transactionDetails.status}

DONOR DETAILS
-------------
Name: ${receipt.donorDetails.name}
UPI ID: ${receipt.donorDetails.upiId || 'N/A'}

DONATION DETAILS
----------------
Story: ${receipt.donationDetails.storyTitle}
Purpose: ${receipt.donationDetails.purpose}

RECIPIENT DETAILS
-----------------
Organization: ${receipt.recipientDetails.name}
UPI ID: ${receipt.recipientDetails.upiId}

Thank you for your generous donation!
Generated on: ${new Date(receipt.timestamps.receiptGeneratedAt).toLocaleString()}
      `;
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="receipt_${receiptId}.txt"`);
      res.send(receiptContent);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    console.error('Error downloading receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download receipt'
    });
  }
});

// Get payment statistics (admin only)
app.get('/api/payment/stats', (req, res) => {
  try {
    const stats = paymentGateway.getPaymentStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting payment stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment statistics'
    });
  }
});

// Routes
app.use('/api/admin', adminRoutes);

// Get all posts
app.get('/api/posts', (req, res) => {
  // Add cache-busting headers
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  console.log(`[API] Serving ${posts.length} posts`);
  posts.forEach(post => {
    console.log(`  - ${post.title}: Rs.${post.donationAmount} from ${post.donations} donors`);
  });
  
  res.json(posts);
});

// Create new post
app.post('/api/posts', upload.array('media', 5), async (req, res) => {
  try {
    const { title, description, location, contactInfo, urgencyLevel } = req.body;
    
    const mediaFiles = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      path: `/uploads/${file.filename}`
    }));

    const newPost = {
      id: Date.now().toString(),
      title,
      description,
      location,
      contactInfo,
      urgencyLevel: urgencyLevel || 'medium',
      media: mediaFiles,
      createdAt: new Date().toISOString(),
      donations: 0,
      donationAmount: 0
    };

    posts.unshift(newPost);
    
    // Save to Excel file using sync service
    const syncResult = await syncService.syncToExcel('story', newPost, 'create');
    
    if (syncResult.success) {
      res.status(201).json(newPost);
    } else {
      res.status(500).json({ error: syncResult.error || 'Failed to save story' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record donation
app.post('/api/donate/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { amount, donorName, paymentMethod, userUpiId, transactionId, paymentStatus } = req.body;

    console.log('Processing donation:', { postId, amount, donorName, paymentMethod, userUpiId, transactionId, paymentStatus });
    console.log('Available posts:', posts.map(p => ({ id: p.id, title: p.title })));

    const post = posts.find(p => p.id == postId || p.id === postId);
    if (!post) {
      console.log('Post not found with id:', postId);
      console.log('Available post IDs:', posts.map(p => p.id));
      return res.status(404).json({ 
        success: false,
        error: 'Post not found' 
      });
    }

    const donation = {
      id: Date.now().toString(),
      postId: parseInt(postId), // Ensure postId is a number
      postTitle: post.title,
      storyTitle: post.title, // Add storyTitle for consistency
      amount: parseFloat(amount),
      donorName: donorName || 'Anonymous',
      paymentMethod,
      userUpiId: userUpiId || null,
      transactionId: transactionId || null,
      paymentStatus: paymentStatus || 'completed',
      status: paymentStatus || 'completed', // Add status field for consistency
      timestamp: new Date().toISOString()
    };

    donations.push(donation);

    // Sync donation amounts to ensure consistency
    syncPostDonationAmounts();
    
    // Update story in Excel with new donation amounts
    const updatedPost = posts.find(p => p.id == postId || p.id === postId);
    if (updatedPost) {
      dataService.saveStory(updatedPost);
    }
    
    // Save donation to Excel file using sync service
    const donationForExcel = {
      ...donation,
      storyTitle: post.title,
      donorUPI: userUpiId,
      status: paymentStatus || 'completed'
    };
    
    console.log('Saving donation to Excel via sync service:', donationForExcel);
    const syncResult = await syncService.syncToExcel('donation', donationForExcel, 'create');
    console.log('Sync result:', syncResult);

    console.log('Donation processed successfully:', donation.id, 'Amount:', donation.amount);

    res.json({ 
      success: true,
      message: 'Donation recorded successfully', 
      donation 
    });
  } catch (error) {
    console.error('Error recording donation:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process donation: ' + error.message 
    });
  }
});

// Delete a post
app.delete('/api/posts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const postIndex = posts.findIndex(p => p.id === id);
    
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Remove associated media files
    const post = posts[postIndex];
    if (post.media && post.media.length > 0) {
      post.media.forEach(media => {
        const filePath = path.join(__dirname, media.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    posts.splice(postIndex, 1);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all success stories
app.get('/api/success-stories', (req, res) => {
  res.json(successStories);
});

// Submit success story
app.post('/api/success-stories', upload.array('media', 5), (req, res) => {
  try {
    const { 
      title, 
      description, 
      beforeDescription, 
      afterDescription, 
      donationAmount, 
      helpedBy, 
      location 
    } = req.body;

    const mediaFiles = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`
    })) : [];

    const newSuccessStory = {
      id: Date.now().toString(),
      title,
      description,
      beforeDescription,
      afterDescription,
      donationAmount: donationAmount ? parseFloat(donationAmount) : 0,
      helpedBy,
      location,
      media: mediaFiles,
      createdAt: new Date().toISOString()
    };

    successStories.unshift(newSuccessStory);
    res.status(201).json(newSuccessStory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get collaboration requests (public - without contact info)
app.get('/api/collaborations', async (req, res) => {
  try {
    if (isDBConnected) {
      // Get from database without sensitive fields
      const collaborations = await Collaboration.find().sort({ submittedAt: -1 });
      res.json({
        success: true,
        data: collaborations,
        count: collaborations.length,
        message: 'Collaborations retrieved successfully (contact info hidden for privacy)'
      });
    } else {
      // Fallback to in-memory storage
      res.json({
        success: true,
        data: collaborations,
        count: collaborations.length,
        message: 'Collaborations retrieved successfully (development mode)'
      });
    }
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collaborations'
    });
  }
});

// Submit collaboration request
app.post('/api/collaborate', async (req, res) => {
  try {
    const { 
      organizationName, 
      contactPerson, 
      email, 
      phone, 
      organizationType, 
      description, 
      resources, 
      collaborationType 
    } = req.body;

    if (isDBConnected) {
      // Use database
      const newCollaboration = new Collaboration({
        organizationName,
        contactPerson,
        email,
        phone,
        organizationType,
        description,
        resources: resources || [],
        collaborationType
      });

      const savedCollaboration = await newCollaboration.save();
      
      // Return collaboration without sensitive data
      const publicCollaboration = savedCollaboration.toJSON();
      
      res.status(201).json({
        success: true,
        data: publicCollaboration,
        message: 'Collaboration request submitted successfully. Contact information is securely stored.'
      });
    } else {
      // Fallback to in-memory storage with full data for Excel persistence
      const newCollaboration = {
        id: Date.now().toString(),
        organizationName,
        contactPerson,
        email,
        phone,
        organizationType,
        description,
        resources: resources || [],
        collaborationType,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      collaborations.push(newCollaboration);
      
      // Save to Excel file with full contact information using sync service
      const syncResult = await syncService.syncToExcel('collaboration', newCollaboration, 'create');
      
      // Update admin controller with new data
      initializeCollaborations(collaborations);
      
      // Return collaboration without sensitive data for public response
      const publicCollaboration = {
        id: newCollaboration.id,
        organizationName: newCollaboration.organizationName,
        contactPerson: newCollaboration.contactPerson,
        organizationType: newCollaboration.organizationType,
        description: newCollaboration.description,
        resources: newCollaboration.resources,
        collaborationType: newCollaboration.collaborationType,
        status: newCollaboration.status,
        submittedAt: newCollaboration.submittedAt
      };
      
      res.status(201).json({
        success: true,
        data: publicCollaboration,
        message: 'Collaboration request submitted successfully. Contact information is securely stored.'
      });
    }
  } catch (error) {
    console.error('Error submitting collaboration:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit collaboration request' 
    });
  }
});

// Get payment configuration
app.get('/api/payment-config', (req, res) => {
  res.json({
    upiId: process.env.UPI_ID || 'pratisthasingh002003-1@okaxis',
    organizationName: process.env.ORGANIZATION_NAME || 'Humanity - Charity Platform',
    accountHolderName: process.env.ACCOUNT_HOLDER_NAME || 'PRATISTHA SINGH',
    bankDetails: {
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || '75113959698',
      ifscCode: process.env.IFSC_CODE || 'BARB0BUPGBX',
      bankName: process.env.BANK_NAME || 'Bank of Baroda UP Gramin',
      branchName: process.env.BRANCH_NAME || 'UP Gramin'
    },
    qrCodePath: '/qr-code.jpg'
  });
});

// Get donation statistics
app.get('/api/stats', (req, res) => {
  // Add cache-busting headers
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  // Calculate actual totals from data
  const totalDonations = donations.reduce((sum, donation) => {
    return sum + (donation.status === 'completed' ? donation.amount : 0);
  }, 0);
  
  const totalPosts = posts.length;
  const totalCollaborations = collaborations.length;
  
  // Calculate total donors (unique donation count)
  const totalDonors = donations.filter(d => d.status === 'completed').length;
  
  // Calculate average donation
  const completedDonations = donations.filter(d => d.status === 'completed');
  const averageDonation = completedDonations.length > 0 
    ? totalDonations / completedDonations.length 
    : 0;
  
  console.log(`[STATS] Calculated stats: ₹${totalDonations} total from ${totalDonors} donors, ${totalPosts} stories, ${totalCollaborations} collaborations`);
  
  res.json({
    totalDonations,
    totalPosts,
    totalCollaborations,
    totalDonors,
    averageDonation: Math.round(averageDonation),
    recentDonations: donations
      .filter(d => d.status === 'completed')
      .slice(-5)
      .reverse()
      .map(donation => ({
        ...donation,
        // Ensure amount is a number
        amount: typeof donation.amount === 'string' ? parseFloat(donation.amount) : donation.amount
      }))
  });
});

// Manual sync endpoint for donations
app.post('/api/sync-donations', (req, res) => {
  try {
    console.log('[API] Manual donation sync requested');
    
    // Force sync donation amounts
    syncPostDonationAmounts();
    
    // Get updated stats
    const totalDonations = donations.reduce((sum, donation) => {
      return sum + (donation.status === 'completed' ? donation.amount : 0);
    }, 0);
    
    const totalDonors = donations.filter(d => d.status === 'completed').length;
    
    res.json({
      success: true,
      message: 'Donation synchronization completed',
      data: {
        totalDonations,
        totalDonors,
        postsUpdated: posts.length,
        donationsProcessed: donations.length
      }
    });
  } catch (error) {
    console.error('[API] Manual sync failed:', error);
    res.status(500).json({
      success: false,
      error: 'Sync failed: ' + error.message
    });
  }
});

// Manual reload endpoint for Excel data
app.post('/api/reload-data', (req, res) => {
  try {
    console.log('[API] Manual data reload requested');
    const allData = fileWatcher.reloadAllData();
    
    res.json({
      success: true,
      message: 'Data reloaded successfully',
      data: {
        stories: allData.stories.length,
        donations: allData.donations.length,
        collaborations: allData.collaborations.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error during manual reload:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reload data',
      message: error.message
    });
  }
});

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../Frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../Frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

server.listen(PORT, () => {
  console.log('\n[SERVER] Humanity Server Started Successfully!');
  console.log('==========================================');
  console.log(`[SERVER] Server running on port: ${PORT}`);
  console.log(`[SERVER] Local URL: http://localhost:${PORT}`);
  console.log(`[SERVER] Network URL: http://127.0.0.1:${PORT}`);
  console.log('[SERVER] WebSocket enabled for real-time updates');
  console.log('[WATCHER] Excel file monitoring active');
  console.log('==========================================');
  console.log('[INFO] Click on any URL above to open Humanity website');
  console.log('[INFO] Your real UPI: pratisthasingh002003-1@okaxis');
  console.log('[INFO] Ready to accept donations and help people!');
  console.log('[INFO] Excel files will auto-sync with portal');
  console.log('==========================================\n');
});