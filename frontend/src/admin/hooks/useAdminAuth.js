import { useState, useEffect, useCallback } from 'react';
import authUtils from '../../utils/auth';
import { adminApi } from '../services/adminApi';

export const useAdminAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if current user is admin
  const isAdmin = user?.role === 'admin';

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is authenticated
        if (!authUtils.isAuthenticated()) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Get user from localStorage first for immediate UI update
        const storedUser = authUtils.getUser();
        if (storedUser) {
          setUser(storedUser);
        }

        // Verify token and get fresh user data from server
        try {
          const response = await adminApi.verifyAuth();
          const freshUser = response.data.user;
          
          // Update stored user data if different
          if (JSON.stringify(storedUser) !== JSON.stringify(freshUser)) {
            authUtils.setAuth(authUtils.getToken(), freshUser);
            setUser(freshUser);
          }
        } catch (authError) {
          // Token is invalid or expired
          console.warn('Auth verification failed:', authError.message);
          authUtils.clearAuth();
          setUser(null);
          setError('Session expired. Please log in again.');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminApi.login(credentials);
      const { token, user: userData } = response.data;

      // Store auth data
      authUtils.setAuth(token, userData);
      setUser(userData);

      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Call logout endpoint to invalidate token on server
      try {
        await adminApi.logout();
      } catch (logoutError) {
        // Continue with local logout even if server logout fails
        console.warn('Server logout failed:', logoutError.message);
      }

      // Clear local auth data
      authUtils.clearAuth();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear local data even if there's an error
      authUtils.clearAuth();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!authUtils.isAuthenticated()) {
      return null;
    }

    try {
      const response = await adminApi.verifyAuth();
      const freshUser = response.data.user;
      
      authUtils.setAuth(authUtils.getToken(), freshUser);
      setUser(freshUser);
      
      return freshUser;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      // Don't clear auth on refresh failure - might be temporary network issue
      throw err;
    }
  }, []);

  // Check admin permissions
  const requireAdmin = useCallback(() => {
    if (!user) {
      throw new Error('Authentication required');
    }
    if (!isAdmin) {
      throw new Error('Admin privileges required');
    }
    return true;
  }, [user, isAdmin]);

  // Update user data (for profile updates, etc.)
  const updateUser = useCallback((userData) => {
    const updatedUser = { ...user, ...userData };
    authUtils.setAuth(authUtils.getToken(), updatedUser);
    setUser(updatedUser);
  }, [user]);

  return {
    user,
    loading,
    error,
    isAdmin,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    requireAdmin,
    updateUser,
    clearError: () => setError(null),
  };
};