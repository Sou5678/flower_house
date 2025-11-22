const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    
    return JSON.stringify(logEntry);
  }

  writeToFile(level, message) {
    const filename = path.join(logsDir, `${level.toLowerCase()}.log`);
    const logEntry = this.formatMessage(level, message) + '\n';
    
    fs.appendFile(filename, logEntry, (err) => {
      if (err) console.error('Failed to write to log file:', err);
    });
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
  }

  error(message, meta = {}) {
    if (this.shouldLog('ERROR')) {
      console.error(`🚨 ERROR: ${message}`, meta);
      this.writeToFile('ERROR', message);
    }
  }

  warn(message, meta = {}) {
    if (this.shouldLog('WARN')) {
      console.warn(`⚠️  WARN: ${message}`, meta);
      this.writeToFile('WARN', message);
    }
  }

  info(message, meta = {}) {
    if (this.shouldLog('INFO')) {
      console.log(`ℹ️  INFO: ${message}`, meta);
      this.writeToFile('INFO', message);
    }
  }

  debug(message, meta = {}) {
    if (this.shouldLog('DEBUG')) {
      console.log(`🐛 DEBUG: ${message}`, meta);
      this.writeToFile('DEBUG', message);
    }
  }

  // HTTP request logger
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    };

    if (res.statusCode >= 400) {
      this.error(`HTTP ${res.statusCode} - ${req.method} ${req.originalUrl}`, logData);
    } else {
      this.info(`HTTP ${res.statusCode} - ${req.method} ${req.originalUrl}`, logData);
    }
  }

  // Database operation logger
  logDbOperation(operation, collection, query = {}, result = {}) {
    this.debug(`DB ${operation} on ${collection}`, {
      operation,
      collection,
      query,
      result: typeof result === 'object' ? Object.keys(result) : result
    });
  }

  // Authentication logger
  logAuth(action, userId, success, details = {}) {
    const message = `Auth ${action} - User: ${userId} - Success: ${success}`;
    
    if (success) {
      this.info(message, { action, userId, ...details });
    } else {
      this.warn(message, { action, userId, ...details });
    }
  }

  // Business logic logger
  logBusiness(action, details = {}) {
    this.info(`Business: ${action}`, details);
  }
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
  });
  
  next();
};

// Create singleton instance
const logger = new Logger();

module.exports = {
  logger,
  requestLogger
};