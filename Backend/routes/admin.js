const express = require('express');
const router = express.Router();
const {
  getCollaborationsWithContact,
  getCollaborationWithContact,
  updateCollaborationStatus,
  getCollaborationStats,
  exportCollaborations
} = require('../controllers/adminController');

// Simple admin authentication middleware (for development)
// In production, use proper JWT authentication
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
  
  // Simple admin key check (in production, use proper authentication)
  if (adminKey === process.env.ADMIN_KEY || adminKey === 'Pratistha@123') {
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin access required'
    });
  }
};

// Admin routes for collaboration management
router.get('/collaborations', adminAuth, getCollaborationsWithContact);
router.get('/collaborations/stats', adminAuth, getCollaborationStats);
router.get('/collaborations/export', adminAuth, exportCollaborations);
router.get('/collaborations/:id', adminAuth, getCollaborationWithContact);
router.put('/collaborations/:id', adminAuth, updateCollaborationStatus);

module.exports = router;