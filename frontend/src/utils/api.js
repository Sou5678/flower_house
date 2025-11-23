// src/utils/api.js
import axios from 'axios';
import authUtils from './auth';

// ✅ CORRECT: Base URL without /api
const API_URL = 'https://flower-house.onrender.com';

// Authentication error types for better categorization
const AUTH_ERROR_TYPES = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN'
};

// Enhanced authentication error handler
class AuthErrorHandler {
  static preserveContext() {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;
    
    const contextData = {
      returnUrl: currentPath + currentSearch + currentHash,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      preservedState: this.extractPreservableState()
    };
    
    sessionStorage.setItem('authRedirectContext', JSON.stringify(contextData));
    localStorage.setItem('authRedirectContext', JSON.stringify(contextData));
    
    return contextData;
  }
  
  static extractPreservableState() {
    const preservableState = {};
    
    if (window.location.pathname === '/wishlist') {
      const selectedItems = document.querySelectorAll('[data-selected="true"]');
      if (selectedItems.length > 0) {
        preservableState.wishlistSelections = Array.from(selectedItems).map(
          item => item.getAttribute('data-product-id')
        ).filter(Boolean);
      }
    }
    
    const cartCount = localStorage.getItem('cartCount');
    if (cartCount) {
      preservableState.cartCount = cartCount;
    }
    
    const formInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
    const formData = {};
    formInputs.forEach(input => {
      if (input.value && input.name) {
        formData[input.name] = input.value;
      }
    });
    
    if (Object.keys(formData).length > 0) {
      preservableState.formData = formData;
    }
    
    return preservableState;
  }
  
  static restoreContext() {
    let contextData = null;
    
    try {
      const sessionContext = sessionStorage.getItem('authRedirectContext');
      const localContext = localStorage.getItem('authRedirectContext');
      
      contextData = sessionContext ? JSON.parse(sessionContext) : 
                   localContext ? JSON.parse(localContext) : null;
      
      if (contextData) {
        sessionStorage.removeItem('authRedirectContext');
        localStorage.removeItem('authRedirectContext');
        return contextData;
      }
    } catch (error) {
      console.error('[AuthErrorHandler] Failed to restore context:', error);
      sessionStorage.removeItem('authRedirectContext');
      localStorage.removeItem('authRedirectContext');
    }
    
    return null;
  }
  
  static categorizeAuthError(error) {
    const status = error.response?.status;
    const message = error.response?.data?.message?.toLowerCase() || '';
    
    if (status === 401) {
      if (message.includes('expired') || message.includes('token')) {
        return AUTH_ERROR_TYPES.TOKEN_EXPIRED;
      } else if (message.includes('user no longer exists')) {
        return AUTH_ERROR_TYPES.USER_NOT_FOUND;
      } else if (message.includes('deactivated')) {
        return AUTH_ERROR_TYPES.USER_DEACTIVATED;
      } else if (message.includes('invalid')) {
        return AUTH_ERROR_TYPES.TOKEN_INVALID;
      } else {
        return AUTH_ERROR_TYPES.UNAUTHORIZED;
      }
    } else if (status === 403) {
      return AUTH_ERROR_TYPES.FORBIDDEN;
    }
    
    return AUTH_ERROR_TYPES.UNAUTHORIZED;
  }
  
  static getErrorMessage(errorType) {
    const messages = {
      [AUTH_ERROR_TYPES.TOKEN_EXPIRED]: 'Your session has expired. Please log in again to continue.',
      [AUTH_ERROR_TYPES.TOKEN_INVALID]: 'Your session is invalid. Please log in again.',
      [AUTH_ERROR_TYPES.USER_NOT_FOUND]: 'Your account could not be found. Please log in again.',
      [AUTH_ERROR_TYPES.USER_DEACTIVATED]: 'Your account has been deactivated. Please contact support.',
      [AUTH_ERROR_TYPES.UNAUTHORIZED]: 'You need to log in to access this feature.',
      [AUTH_ERROR_TYPES.FORBIDDEN]: 'You do not have permission to access this resource.'
    };
    
    return messages[errorType] || 'Authentication required. Please log in to continue.';
  }
  
  static handleAuthError(error) {
    const errorType = this.categorizeAuthError(error);
    const errorMessage = this.getErrorMessage(errorType);
    
    this.clearAuthData();
    const context = this.preserveContext();
    this.showAuthErrorNotification(errorMessage);
    this.redirectToLogin(context);
    
    return {
      type: errorType,
      message: errorMessage,
      context
    };
  }
  
  static clearAuthData() {
    authUtils.clearAuth();
  }
  
  static showAuthErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'auth-error-notification';
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
      line-height: 1.4;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 8px;">
        <svg style="width: 20px; height: 20px; flex-shrink: 0; margin-top: 1px;" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Authentication Required</div>
          <div>${message}</div>
          <div style="margin-top: 8px; font-size: 12px; opacity: 0.8;">
            Redirecting to login page...
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
  
  static redirectToLogin(context) {
    setTimeout(() => {
      const loginUrl = '/login';
      
      if (window.history && window.history.pushState) {
        window.history.pushState(
          { from: context?.returnUrl || window.location.pathname },
          '',
          loginUrl
        );
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        window.location.href = loginUrl;
      }
    }, 1500);
  }
}

// ✅ CORRECT: Create axios instance with baseURL that includes /api
const API = axios.create({
  baseURL: `${API_URL}/api`, // ✅ Include /api here
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = authUtils.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.metadata = { startTime: Date.now() };
    }
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor for comprehensive error handling
API.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    }
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? Date.now() - error.config.metadata.startTime : 0;
    console.error(`[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'NETWORK_ERROR'} (${duration}ms)`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      const authErrorInfo = AuthErrorHandler.handleAuthError(error);
      const enhancedError = new Error(authErrorInfo.message);
      enhancedError.name = 'AuthenticationError';
      enhancedError.type = authErrorInfo.type;
      enhancedError.context = authErrorInfo.context;
      enhancedError.originalError = error;
      enhancedError.isAuthError = true;
      return Promise.reject(enhancedError);
    }
    
    if (!error.response) {
      console.error('[API] Network error - server may be unavailable');
      const networkError = new Error('Network error - please check your connection and try again');
      networkError.name = 'NetworkError';
      networkError.isNetworkError = true;
      networkError.originalError = error;
      return Promise.reject(networkError);
    }
    
    const httpError = new Error(error.response?.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`);
    httpError.name = 'HTTPError';
    httpError.status = error.response.status;
    httpError.statusText = error.response.statusText;
    httpError.data = error.response.data;
    httpError.originalError = error;
    
    return Promise.reject(httpError);
  }
);

// Export the enhanced AuthErrorHandler for use in components
export { AuthErrorHandler, AUTH_ERROR_TYPES };
export default API;