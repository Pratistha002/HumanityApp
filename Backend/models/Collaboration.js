const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  organizationName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    // This field will be stored in DB but not returned in API responses
    select: false
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    // This field will be stored in DB but not returned in API responses
    select: false
  },
  organizationType: {
    type: String,
    required: true,
    enum: ['NGO', 'Corporate', 'Government', 'Educational', 'Healthcare', 'Religious', 'Community', 'Other']
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  resources: [{
    type: String,
    trim: true
  }],
  collaborationType: {
    type: String,
    required: true,
    enum: ['funding', 'volunteering', 'resources', 'expertise', 'partnership']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'contacted'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastContactedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  // Admin-only fields for internal tracking
  adminNotes: {
    type: String,
    trim: true,
    select: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    select: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remove sensitive fields from JSON output
      delete ret.email;
      delete ret.phone;
      delete ret.adminNotes;
      delete ret.priority;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      // Remove sensitive fields from object output
      delete ret.email;
      delete ret.phone;
      delete ret.adminNotes;
      delete ret.priority;
      return ret;
    }
  }
});

// Index for efficient queries
collaborationSchema.index({ status: 1, submittedAt: -1 });
collaborationSchema.index({ organizationType: 1 });
collaborationSchema.index({ collaborationType: 1 });

// Static method to get collaboration with contact info (admin only)
collaborationSchema.statics.getWithContactInfo = function(id) {
  return this.findById(id).select('+email +phone +adminNotes +priority');
};

// Static method to get all collaborations with contact info (admin only)
collaborationSchema.statics.getAllWithContactInfo = function(filter = {}) {
  return this.find(filter).select('+email +phone +adminNotes +priority').sort({ submittedAt: -1 });
};

// Method to update contact status
collaborationSchema.methods.markAsContacted = function() {
  this.lastContactedAt = new Date();
  this.status = 'contacted';
  return this.save();
};

module.exports = mongoose.model('Collaboration', collaborationSchema);