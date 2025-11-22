import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authUtils from '../utils/auth';

const AdminTestPage = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userData = authUtils.getUser();
    console.log('AdminTestPage - User Data:', userData);
    setUser(userData);
    setIsAdmin(userData?.role === 'admin');
  }, []);

  if (!authUtils.isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 text-center mb-6">
            You need to login to access the admin panel.
          </p>
          <Link
            to="/login"
            className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition duration-300 text-center block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center text-red-600 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 text-center mb-4">
            You don't have admin privileges.
          </p>
          <div className="bg-gray-100 p-4 rounded-md mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Current User:</h3>
            <p><strong>Name:</strong> {user?.fullName || 'N/A'}</p>
            <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
          </div>
          <Link
            to="/"
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300 text-center block"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-rose-600 hover:text-rose-700 mr-4">
                ← Back to Site
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.fullName}
              </span>
              <button
                onClick={() => {
                  authUtils.logout();
                  window.location.href = '/';
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎉 Admin Panel Working!
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Congratulations! You have successfully accessed the admin panel.
              </p>
              
              {/* User Info Card */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Details</h3>
                <div className="text-left space-y-2">
                  <p><strong>Name:</strong> {user?.fullName}</p>
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>Role:</strong> <span className="text-rose-600 font-semibold">{user?.role}</span></p>
                  <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-blue-600 mb-4">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Products</h3>
                  <p className="text-gray-600 text-sm mb-4">Manage your product catalog</p>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
                    Manage Products
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-green-600 mb-4">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Orders</h3>
                  <p className="text-gray-600 text-sm mb-4">View and manage orders</p>
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300">
                    View Orders
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="text-purple-600 mb-4">
                    <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics</h3>
                  <p className="text-gray-600 text-sm mb-4">View sales analytics</p>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-300">
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminTestPage;