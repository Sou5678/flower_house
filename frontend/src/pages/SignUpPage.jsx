// pages/SignUpPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import authUtils from '../utils/auth';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    birthday: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

    try {
      // API call to backend for registration
      const response = await API.post('/api/auth/register', {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        birthday: formData.birthday
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

        alert('Account created successfully!');
        navigate('/profile'); // Redirect to profile page
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(
        error.response?.data?.message || 
        'Signup failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignup = (provider) => {
    // Social signup logic would go here
    alert(`Sign up with ${provider} - This would integrate with OAuth in a real app`);
  };

  // Test signup function for development
  const handleTestSignup = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Create test user data
      const testUserData = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+1 (555) 123-4567',
        birthday: 'January 1st'
      };

      // Simulate successful signup
      const mockResponse = {
        status: 'success',
        token: 'mock-jwt-token-' + Date.now(),
        data: {
          user: {
            _id: 'mock-user-id',
            fullName: testUserData.fullName,
            email: testUserData.email,
            phone: testUserData.phone,
            birthday: testUserData.birthday,
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

      alert('Test account created successfully!');
      navigate('/profile');
      
    } catch (error) {
      console.error('Test signup error:', error);
      setError('Test signup failed. Please try again.');
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
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Step 1 of 2</span>
              <div className="w-16 h-1 bg-rose-200 rounded-full">
                <div className="w-1/2 h-full bg-rose-600 rounded-full"></div>
              </div>
            </div>
            <h1 className="text-2xl font-light text-gray-800">Create an Account</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Social Signup */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => handleSocialSignup('Google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition duration-300 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Sign up with Google</span>
            </button>

            <button
              onClick={() => handleSocialSignup('Apple')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 px-4 hover:bg-gray-50 transition duration-300 disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-gray-700 font-medium">Sign up with Apple</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Sign up to discover exclusive collections and curated bouquets.
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-300"
                required
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-300"
                required
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-300"
                disabled={loading}
              />
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthday
              </label>
              <input
                type="text"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                placeholder="October 26th"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-300"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition duration-300"
                required
                disabled={loading}
              />
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 text-rose-600 focus:ring-rose-500 rounded"
                required
                disabled={loading}
              />
              <label className="text-sm text-gray-600">
                I agree to the <a href="#" className="text-rose-600 hover:text-rose-700">Terms of Service</a> and <a href="#" className="text-rose-600 hover:text-rose-700">Privacy Policy</a>.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white py-3 rounded-lg font-medium transition duration-300 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Test Signup Button for Development */}
            <button
              type="button"
              onClick={handleTestSignup}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg font-medium transition duration-300 flex items-center justify-center"
            >
              {loading ? 'Creating Test Account...' : 'Create Test Account (Demo)'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-rose-600 hover:text-rose-700 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;