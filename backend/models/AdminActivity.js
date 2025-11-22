const mongoose = require('mongoose');

const adminActivitySchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow null for unauthorized access attempts
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'status_change', 'bulk_operation', 'bulk_update', 'login_attempt', 'unauthorized_access']
  },
  resource: {
    type: String,
    required: true,
    enum: ['product', 'order', 'category', 'user', 'auth', 'system']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Not all actions have a specific resource ID (e.g., login attempts)
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
adminActivitySchema.index({ admin: 1, createdAt: -1 });
adminActivitySchema.index({ action: 1, createdAt: -1 });
adminActivitySchema.index({ resource: 1, createdAt: -1 });
adminActivitySchema.index({ success: 1, createdAt: -1 });

module.exports = mongoose.model('AdminActivity', adminActivitySchema);