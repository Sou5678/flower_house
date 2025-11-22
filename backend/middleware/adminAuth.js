const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AdminActivity = require('../models/AdminActivity');

// Admin authentication middleware with role verification
exports.adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      // Log unauthorized access attempt
      await logAdminActivity(null, 'unauthorized_access', 'auth', null, {
        reason: 'No token provided',
        endpoint: req.originalUrl,
        method: req.method
      }, req, false, 'No authorization token provided');

      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      // Log unauthorized access attempt
      await logAdminActivity(decoded.id, 'unauthorized_access', 'auth', null, {
        reason: 'User no longer exists',
        endpoint: req.originalUrl,
        method: req.method
      }, req, false, 'User no longer exists');

      return res.status(401).json({
        status: 'error',
        message: 'User no longer exists'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      // Log unauthorized access attempt
      await logAdminActivity(user._id, 'unauthorized_access', 'auth', null, {
        reason: 'User account deactivated',
        endpoint: req.originalUrl,
        method: req.method
      }, req, false, 'User account is deactivated');

      return res.status(401).json({
        status: 'error',
        message: 'User account is deactivated'
      });
    }

    // Check if user has admin role
    if (user.role !== 'admin') {
      // Log unauthorized access attempt
      await logAdminActivity(user._id, 'unauthorized_access', 'auth', null, {
        reason: 'Insufficient privileges',
        userRole: user.role,
        endpoint: req.originalUrl,
        method: req.method
      }, req, false, 'User does not have admin privileges');

      return res.status(403).json({
        status: 'error',
        message: 'User does not have admin privileges'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // Log unauthorized access attempt
    await logAdminActivity(null, 'unauthorized_access', 'auth', null, {
      reason: 'Token verification failed',
      error: error.message,
      endpoint: req.originalUrl,
      method: req.method
    }, req, false, 'Invalid or expired token');

    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }
};

// Admin activity logging middleware
exports.logAdminActivity = (action, resource, resourceId = null, details = {}) => {
  return async (req, res, next) => {
    try {
      // Store original res.json to intercept response
      const originalJson = res.json;
      let responseData = null;
      let success = true;

      res.json = function(data) {
        responseData = data;
        success = res.statusCode < 400;
        return originalJson.call(this, data);
      };

      // Continue to next middleware
      next();

      // Log activity after response is sent
      res.on('finish', async () => {
        try {
          await logAdminActivity(
            req.user ? req.user._id : null,
            action,
            resource,
            resourceId,
            {
              ...details,
              endpoint: req.originalUrl,
              method: req.method,
              statusCode: res.statusCode,
              responseData: success ? null : responseData // Only log response data on errors
            },
            req,
            success,
            success ? null : (responseData ? responseData.message : 'Unknown error')
          );
        } catch (logError) {
          console.error('Failed to log admin activity:', logError);
        }
      });
    } catch (error) {
      console.error('Admin activity logging middleware error:', error);
      next();
    }
  };
};

// Helper function to log admin activities
async function logAdminActivity(adminId, action, resource, resourceId, details, req, success = true, errorMessage = null) {
  try {
    const activity = new AdminActivity({
      admin: adminId,
      action,
      resource,
      resourceId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      success,
      errorMessage
    });

    await activity.save();
  } catch (error) {
    console.error('Failed to save admin activity log:', error);
    // Don't throw error to avoid breaking the main request flow
  }
}

// Require confirmation for sensitive operations
exports.requireConfirmation = (req, res, next) => {
  const confirmationHeader = req.headers['x-admin-confirmation'];
  
  if (!confirmationHeader || confirmationHeader !== 'confirmed') {
    return res.status(400).json({
      status: 'error',
      message: 'This operation requires confirmation. Please include X-Admin-Confirmation: confirmed header.',
      requiresConfirmation: true
    });
  }
  
  next();
};

module.exports = exports;