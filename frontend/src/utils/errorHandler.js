import { toast } from 'react-hot-toast';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error messages
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network error. Please check your connection and try again.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.AUTHENTICATION]: 'Please log in to continue.',
  [ERROR_TYPES.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
  [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
  [ERROR_TYPES.SERVER]: 'Server error. Please try again later.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
};

// Determine error type based on status code and error details
export const getErrorType = (error) => {
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }

  const { status } = error.response;

  switch (status) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTHENTICATION;
    case 403:
      return ERROR_TYPES.AUTHORIZATION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

// Extract error message from API response
export const getErrorMessage = (error) => {
  if (!error.response) {
    return ERROR_MESSAGES[ERROR_TYPES.NETWORK];
  }

  const { data } = error.response;
  
  // Check for validation errors
  if (data?.errors && Array.isArray(data.errors)) {
    return data.errors.map(err => err.message).join(', ');
  }
  
  // Check for general error message
  if (data?.message) {
    return data.message;
  }
  
  // Fallback to default message based on error type
  const errorType = getErrorType(error);
  return ERROR_MESSAGES[errorType];
};

// Handle API errors with toast notifications
export const handleApiError = (error, customMessage = null) => {
  const errorType = getErrorType(error);
  const message = customMessage || getErrorMessage(error);
  
  console.error('API Error:', {
    type: errorType,
    message,
    status: error.response?.status,
    data: error.response?.data,
    error
  });

  // Show appropriate toast based on error type
  switch (errorType) {
    case ERROR_TYPES.VALIDATION:
      toast.error(message, { duration: 4000 });
      break;
    case ERROR_TYPES.AUTHENTICATION:
      toast.error(message);
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      break;
    case ERROR_TYPES.AUTHORIZATION:
      toast.error(message);
      break;
    case ERROR_TYPES.NOT_FOUND:
      toast.error(message);
      break;
    case ERROR_TYPES.NETWORK:
      toast.error(message, { duration: 6000 });
      break;
    case ERROR_TYPES.SERVER:
      toast.error(message, { duration: 5000 });
      break;
    default:
      toast.error(message);
  }

  return {
    type: errorType,
    message,
    status: error.response?.status
  };
};

// Validation error formatter for forms
export const formatValidationErrors = (errors) => {
  if (!Array.isArray(errors)) return {};
  
  return errors.reduce((acc, error) => {
    const field = error.field || error.path || error.param;
    if (field) {
      acc[field] = error.message;
    }
    return acc;
  }, {});
};

// Form validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password),
    errors: {
      length: password.length < 6 ? 'Password must be at least 6 characters' : null,
      uppercase: !/[A-Z]/.test(password) ? 'Password must contain an uppercase letter' : null,
      lowercase: !/[a-z]/.test(password) ? 'Password must contain a lowercase letter' : null,
      number: !/\d/.test(password) ? 'Password must contain a number' : null
    }
  };
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value, minLength, fieldName) => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateMaxLength = (value, maxLength, fieldName) => {
  if (value && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry for client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};

// Loading state manager
export class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
    this.listeners = new Set();
  }

  setLoading(key, isLoading) {
    this.loadingStates.set(key, isLoading);
    this.notifyListeners();
  }

  isLoading(key) {
    return this.loadingStates.get(key) || false;
  }

  isAnyLoading() {
    return Array.from(this.loadingStates.values()).some(loading => loading);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.loadingStates));
  }
}

// Global loading manager instance
export const globalLoadingManager = new LoadingManager();

// Error boundary helper (to be used in JSX files)
export const createErrorBoundary = () => {
  return {
    componentDidCatch: (error, errorInfo) => {
      console.error('Error Boundary caught an error:', error, errorInfo);
      
      // Log error to monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Send to error tracking service
      }
    },
    
    handleError: (error) => {
      console.error('Component error:', error);
      
      // Show user-friendly error message
      const errorMessage = 'Something went wrong. Please try refreshing the page.';
      
      // Create error notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        max-width: 400px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
      `;
      
      notification.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">Error</div>
        <div>${errorMessage}</div>
        <button onclick="window.location.reload()" style="
          margin-top: 8px;
          padding: 4px 8px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        ">Refresh Page</button>
      `;
      
      document.body.appendChild(notification);
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 10000);
    }
  };
};