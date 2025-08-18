// Import in-memory data (for development mode)
// In production, this would use a proper database model
let collaborations = [];

// Import data service for Excel persistence
const dataService = require('../services/dataService');

// Initialize collaborations data
const initializeCollaborations = (collaborationsData) => {
  collaborations = collaborationsData;
};

// Admin-only: Get all collaborations with contact information
const getCollaborationsWithContact = async (req, res) => {
  try {
    // Return all collaborations with full contact information
    res.json({
      success: true,
      count: collaborations.length,
      data: collaborations,
      message: 'Collaborations with contact info retrieved successfully (admin access)'
    });
  } catch (error) {
    console.error('Error fetching collaborations with contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collaborations with contact information'
    });
  }
};

// Admin-only: Get single collaboration with contact information
const getCollaborationWithContact = async (req, res) => {
  try {
    const { id } = req.params;
    const collaboration = collaborations.find(c => c.id == id);
    
    if (!collaboration) {
      return res.status(404).json({
        success: false,
        error: 'Collaboration not found'
      });
    }
    
    res.json({
      success: true,
      data: collaboration,
      message: 'Collaboration with contact info retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching collaboration with contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collaboration with contact information'
    });
  }
};

// Admin-only: Update collaboration status and add notes
const updateCollaborationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, adminNotes, priority } = req.body;
    
    console.log('Updating collaboration:', { id, status, notes, adminNotes, priority });
    console.log('Available collaborations:', collaborations.map(c => ({ id: c.id, name: c.organizationName })));
    
    const collaborationIndex = collaborations.findIndex(c => c.id == id || c._id == id);
    if (collaborationIndex === -1) {
      console.log('Collaboration not found with id:', id);
      return res.status(404).json({
        success: false,
        error: 'Collaboration not found'
      });
    }
    
    const collaboration = collaborations[collaborationIndex];
    const oldStatus = collaboration.status;
    
    // Update fields
    if (status) collaboration.status = status;
    if (notes !== undefined) collaboration.notes = notes;
    if (adminNotes !== undefined) collaboration.adminNotes = adminNotes;
    if (priority) collaboration.priority = priority;
    
    // If marking as contacted, update timestamp
    if (status === 'contacted') {
      collaboration.lastContactedAt = new Date().toISOString();
    }
    
    // Update the collaboration in the array
    collaborations[collaborationIndex] = collaboration;
    
    // Save updated collaboration to Excel
    dataService.saveCollaboration(collaboration);
    
    // Save status update to Excel if status changed
    if (status && status !== oldStatus) {
      dataService.saveStatusUpdate({
        type: 'collaboration',
        itemId: collaboration.id,
        itemTitle: collaboration.organizationName,
        oldStatus: oldStatus,
        newStatus: status,
        updatedBy: 'admin',
        adminNotes: adminNotes || notes || ''
      });
    }
    
    console.log('Collaboration updated successfully:', collaboration.organizationName, 'status:', collaboration.status);
    
    res.json({
      success: true,
      data: collaboration,
      message: 'Collaboration updated successfully'
    });
  } catch (error) {
    console.error('Error updating collaboration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update collaboration: ' + error.message
    });
  }
};

// Admin-only: Get collaboration statistics
const getCollaborationStats = async (req, res) => {
  try {
    // Calculate status statistics
    const statusStats = {};
    const typeStats = {};
    
    collaborations.forEach(collab => {
      // Status stats
      const status = collab.status || 'pending';
      statusStats[status] = (statusStats[status] || 0) + 1;
      
      // Type stats
      const type = collab.organizationType || 'Unknown';
      typeStats[type] = (typeStats[type] || 0) + 1;
    });
    
    // Convert to array format
    const stats = Object.entries(statusStats).map(([status, count]) => ({
      _id: status,
      count
    }));
    
    const typeStatsArray = Object.entries(typeStats).map(([type, count]) => ({
      _id: type,
      count
    }));
    
    // Calculate collaboration type statistics
    const collaborationTypeStats = {};
    collaborations.forEach(collab => {
      const collabType = collab.collaborationType || 'Unknown';
      collaborationTypeStats[collabType] = (collaborationTypeStats[collabType] || 0) + 1;
    });
    
    const collaborationTypeStatsArray = Object.entries(collaborationTypeStats).map(([type, count]) => ({
      _id: type,
      count
    }));
    
    const totalCount = collaborations.length;
    const pendingCount = collaborations.filter(c => (c.status || 'pending') === 'pending').length;
    const approvedCount = collaborations.filter(c => c.status === 'approved').length;
    const contactedCount = collaborations.filter(c => c.status === 'contacted').length;
    const underReviewCount = collaborations.filter(c => c.status === 'under_review').length;
    
    res.json({
      success: true,
      data: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        contacted: contactedCount,
        under_review: underReviewCount,
        statusBreakdown: stats,
        organizationTypeBreakdown: typeStatsArray,
        collaborationTypeBreakdown: collaborationTypeStatsArray
      },
      message: 'Collaboration statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching collaboration stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collaboration statistics'
    });
  }
};

// Admin-only: Export collaborations data (for backup/analysis)
const exportCollaborations = async (req, res) => {
  try {
    // Format data for export
    const exportData = collaborations.map(collab => ({
      id: collab.id,
      organizationName: collab.organizationName,
      contactPerson: collab.contactPerson,
      email: collab.email,
      phone: collab.phone,
      organizationType: collab.organizationType,
      collaborationType: collab.collaborationType,
      description: collab.description,
      resources: Array.isArray(collab.resources) ? collab.resources.join(', ') : collab.resources || '',
      status: collab.status || 'pending',
      priority: collab.priority || 'medium',
      submittedAt: collab.submittedAt || collab.createdAt,
      lastContactedAt: collab.lastContactedAt || '',
      notes: collab.notes || '',
      adminNotes: collab.adminNotes || ''
    }));
    
    res.json({
      success: true,
      data: exportData,
      count: exportData.length,
      message: 'Collaborations exported successfully',
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting collaborations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export collaborations'
    });
  }
};

module.exports = {
  initializeCollaborations,
  getCollaborationsWithContact,
  getCollaborationWithContact,
  updateCollaborationStatus,
  getCollaborationStats,
  exportCollaborations
};