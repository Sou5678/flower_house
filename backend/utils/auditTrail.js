const AdminActivity = require('../models/AdminActivity');

/**
 * Create an audit trail entry for admin actions
 * @param {Object} options - Audit trail options
 * @param {ObjectId} options.admin - Admin user ID (optional for unauthorized attempts)
 * @param {string} options.action - Action performed
 * @param {string} options.resource - Resource type
 * @param {ObjectId} options.resourceId - Resource ID (optional)
 * @param {Object} options.details - Additional details
 * @param {string} options.ipAddress - IP address
 * @param {string} options.userAgent - User agent
 * @param {boolean} options.success - Whether action was successful
 * @param {string} options.errorMessage - Error message if failed
 */
const createAuditEntry = async (options) => {
  try {
    const auditEntry = new AdminActivity({
      admin: options.admin || null,
      action: options.action,
      resource: options.resource,
      resourceId: options.resourceId || null,
      details: options.details || {},
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      success: options.success !== false, // Default to true
      errorMessage: options.errorMessage || null
    });
    
    await auditEntry.save();
    return auditEntry;
  } catch (error) {
    console.error('Error creating audit entry:', error);
    // Don't throw error to avoid breaking the main operation
  }
};

/**
 * Middleware to automatically create audit trails for admin actions
 * @param {string} action - Action being performed
 * @param {string} resource - Resource type
 */
const auditMiddleware = (action, resource) => {
  return async (req, res, next) => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function(data) {
      // Create audit entry after successful response
      const auditOptions = {
        admin: req.user ? req.user._id : null,
        action,
        resource,
        resourceId: req.params.id || (data && data._id) || null,
        details: {
          method: req.method,
          url: req.originalUrl,
          body: req.method !== 'GET' ? req.body : undefined,
          query: Object.keys(req.query).length > 0 ? req.query : undefined
        },
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        success: res.statusCode >= 200 && res.statusCode < 400
      };
      
      // Don't wait for audit entry creation
      createAuditEntry(auditOptions);
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    // Handle errors
    const originalStatus = res.status;
    res.status = function(code) {
      if (code >= 400) {
        // Create audit entry for failed operations
        const auditOptions = {
          admin: req.user ? req.user._id : null,
          action,
          resource,
          resourceId: req.params.id || null,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.method !== 'GET' ? req.body : undefined,
            query: Object.keys(req.query).length > 0 ? req.query : undefined
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent') || 'Unknown',
          success: false,
          errorMessage: `HTTP ${code} error`
        };
        
        createAuditEntry(auditOptions);
      }
      
      return originalStatus.call(this, code);
    };
    
    next();
  };
};

/**
 * Log product changes with before/after data
 * @param {Object} options - Product change options
 * @param {ObjectId} options.admin - Admin user ID
 * @param {string} options.action - Action performed (create, update, delete)
 * @param {ObjectId} options.productId - Product ID
 * @param {Object} options.before - Product data before change
 * @param {Object} options.after - Product data after change
 * @param {string} options.ipAddress - IP address
 * @param {string} options.userAgent - User agent
 */
const logProductChange = async (options) => {
  const details = {
    before: options.before,
    after: options.after
  };
  
  // For updates, only include changed fields
  if (options.action === 'update' && options.before && options.after) {
    const changes = {};
    const beforeObj = options.before.toObject ? options.before.toObject() : options.before;
    const afterObj = options.after.toObject ? options.after.toObject() : options.after;
    
    for (const key in afterObj) {
      if (JSON.stringify(beforeObj[key]) !== JSON.stringify(afterObj[key])) {
        changes[key] = {
          from: beforeObj[key],
          to: afterObj[key]
        };
      }
    }
    
    details.changes = changes;
  }
  
  return createAuditEntry({
    admin: options.admin,
    action: options.action,
    resource: 'product',
    resourceId: options.productId,
    details,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    success: true
  });
};

/**
 * Log order changes with before/after data
 * @param {Object} options - Order change options
 * @param {ObjectId} options.admin - Admin user ID
 * @param {string} options.action - Action performed
 * @param {ObjectId} options.orderId - Order ID
 * @param {Object} options.before - Order data before change
 * @param {Object} options.after - Order data after change
 * @param {string} options.ipAddress - IP address
 * @param {string} options.userAgent - User agent
 */
const logOrderChange = async (options) => {
  const details = {
    before: options.before,
    after: options.after
  };
  
  // For status changes, highlight the status change
  if (options.action === 'status_change') {
    details.statusChange = {
      from: options.before?.status,
      to: options.after?.status
    };
  }
  
  return createAuditEntry({
    admin: options.admin,
    action: options.action,
    resource: 'order',
    resourceId: options.orderId,
    details,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    success: true
  });
};

/**
 * Log unauthorized access attempts
 * @param {Object} options - Unauthorized access options
 * @param {string} options.ipAddress - IP address
 * @param {string} options.userAgent - User agent
 * @param {string} options.attemptedUrl - URL that was attempted
 * @param {string} options.reason - Reason for denial
 */
const logUnauthorizedAccess = async (options) => {
  return createAuditEntry({
    admin: null,
    action: 'unauthorized_access',
    resource: 'auth',
    resourceId: null,
    details: {
      attemptedUrl: options.attemptedUrl,
      reason: options.reason
    },
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    success: false,
    errorMessage: options.reason
  });
};

module.exports = {
  createAuditEntry,
  auditMiddleware,
  logProductChange,
  logOrderChange,
  logUnauthorizedAccess
};