// pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API, { AuthErrorHandler } from '../utils/api';
import authUtils from '../utils/auth';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contextInfo, setContextInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced context restoration and destination handling
  const [redirectDestination, setRedirectDestination] = useState('/profile');

  useEffect(() => {
    // Clear any existing invalid auth data first
    if (!authUtils.isAuthenticated()) {
      authUtils.clearAuth();
    }
    
    // Restore authentication context if available
    const restoredContext = AuthErrorHandler.restoreContext();
    
    if (restoredContext) {
      setContextInfo(restoredContext);
      setRedirectDestination(restoredContext.returnUrl || '/profile');
      
      // Show context restoration message
      if (restoredContext.returnUrl && restoredContext.returnUrl !== '/login') {
        setError(`Please log in to continue to ${restoredContext.returnUrl}`);
      }
    } else {
      // Fallback to React Router state
      const from = location.state?.from?.pathname || '/profile';
      setRedirectDestination(from);
    }
  }, [location.state]);

  // Get the intended destination from context or navigation state
  const getRedirectDestination = () => {
    return contextInfo?.returnUrl || location.state?.from?.pathname || '/profile';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      // API call to backend for login
      const response = await API.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });



      if (response.data.status === 'success') {
        const { token, data: { user } } = response.data;
        
        // Store token and user data using centralized auth utility
        authUtils.setAuth(token, {
          ...user,
          isLoggedIn: true
        });
        
        // Dispatch auth updated event
        window.dispatchEvent(new Event('authUpdated'));
        
        // Enhanced success handling with context restoration
        const destination = getRedirectDestination();
        
        // Restore any preserved state if available
        if (contextInfo?.preservedState) {
          await restorePreservedState(contextInfo.preservedState);
        }
        

        
        // Show success message with destination info
        if (destination !== '/profile') {
          alert(`Logged in successfully! Returning to ${destination}`);
        } else {
          alert('Logged in successfully!');
        }
        
        navigate(destination, { replace: true }); // Use replace to avoid back button issues
      }
    } catch (error) {
      console.error('Login error details:', error);
      
      // Enhanced error handling for different error types
      let errorMessage;
      
      if (error.isAuthError) {
        errorMessage = error.message; // Already formatted by AuthErrorHandler
      } else if (error.isNetworkError) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.status === 429) {
        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else {
        errorMessage = error.response?.data?.message || 
                      error.message || 
                      'Login failed. Please check your credentials and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to restore preserved state after successful login
  const restorePreservedState = async (preservedState) => {
    try {

      
      // Restore wishlist selections
      if (preservedState.wishlistSelections && preservedState.wishlistSelections.length > 0) {
        // Store selections to be restored when wishlist page loads
        sessionStorage.setItem('restoreWishlistSelections', JSON.stringify(preservedState.wishlistSelections));
      }
      
      // Restore cart count
      if (preservedState.cartCount) {
        localStorage.setItem('cartCount', preservedState.cartCount);
      }
      
      // Restore form data will be handled by individual pages
      if (preservedState.formData) {
        sessionStorage.setItem('restoreFormData', JSON.stringify(preservedState.formData));
      }
      
    } catch (error) {
      console.error('[LoginPage] Failed to restore preserved state:', error);
      // Don't fail the login process if state restoration fails
    }
  };

  // Test function to check backend connection
  const testBackendConnection = async () => {
    try {
      setLoading(true);
      const response = await API.get('/api/health');
      alert(`Backend is running: ${response.data.message}`);

    } catch (error) {
      alert(`Backend connection failed: ${error.message}`);
      console.error('Health check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Login with ${provider} - This would integrate with OAuth in a real app`);
  };

  // Test login function for development
  const handleTestLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Simulate successful login
      const mockResponse = {
        status: 'success',
        token: 'mock-jwt-token-' + Date.now(),
        data: {
          user: {
            _id: 'mock-user-id',
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '+1 (555) 123-4567',
            birthday: 'January 1st',
            role: 'user',
            isActive: true
          }
        }
      };

      // Store token and user data using centralized auth utility
      authUtils.setAuth(mockResponse.token, {
        ...mockResponse.data.user,
        isLoggedIn: true
      });
      
      // Dispatch auth updated event
      window.dispatchEvent(new Event('authUpdated'));
      
      // Enhanced test login with context restoration
      const destination = getRedirectDestination();
      
      // Restore any preserved state if available
      if (contextInfo?.preservedState) {
        await restorePreservedState(contextInfo.preservedState);
      }
      

      
      if (destination !== '/profile') {
        alert(`Test login successful! Returning to ${destination}`);
      } else {
        alert('Test login successful!');
      }
      
      navigate(destination, { replace: true });
      
    } catch (error) {
      console.error('Test login error:', error);
      setError('Test login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Back to Home */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-light text-gray-800 hover:text-rose-600 transition duration-300">
            Amour Florals
          </Link>
          {/* Test Backend Button */}
          <button
            onClick={testBackendConnection}
            className="mt-4 text-sm text-rose-600 hover:text-rose-700 underline"
          >
            Test Backend Connection
          </button>
        </div>

        {/* Login Card */}
        <div className="card-elegant p-8">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-display text-3xl font-semibold text-neutral-800 mb-2">Welcome Back, <span className="text-script text-primary-500">Bloom Lover</span></h1>
            <p className="text-body text-neutral-600">Sign in to your garden of beautiful moments.</p>
          </div>

          {/* Context Information */}
          {contextInfo && contextInfo.returnUrl && contextInfo.returnUrl !== '/login' && (
            <div className="mb-4 p-4 bg-accent-50 border border-accent-200 rounded-xl">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-accent-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-accent-800 text-sm font-heading font-medium">Session Expired</p>
                  <p className="text-accent-700 text-sm text-body">
                    Please log in to continue to <span className="font-medium">{contextInfo.returnUrl}</span>
                  </p>
                  {contextInfo.preservedState && Object.keys(contextInfo.preservedState).length > 0 && (
                    <p className="text-accent-600 text-xs mt-1 text-body">
                      Your previous selections will be restored after login.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-xl">
              <p className="text-error-700 text-sm text-body">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-heading font-medium text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="input-elegant"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-heading font-medium text-neutral-700">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary-500 hover:text-primary-600 font-body"
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input-elegant"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:bg-primary-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Test Login Button for Development */}
            <button
              type="button"
              onClick={handleTestLogin}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition duration-300 flex items-center justify-center"
            >
              {loading ? 'Signing In...' : 'Test Login (Demo)'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign in with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('Google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition duration-300 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Google</span>
            </button>
          </div>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-rose-600 hover:text-rose-700 font-medium">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;