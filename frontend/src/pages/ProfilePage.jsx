// pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import Footer from '../components/Footer';
import authUtils from '../utils/auth';

const ProfilePage = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthday: ''
  });
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user data and orders from MongoDB on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!authUtils.isAuthenticated()) {
          navigate('/login');
          return;
        }

        // API call to get user data from MongoDB
        const response = await API.get('/api/auth/me');

        if (response.data.status === 'success') {
          const user = response.data.data.user;
          setUserData({
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            birthday: user.birthday || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If token is invalid, redirect to login
        if (error.response?.status === 401) {
          authUtils.clearAuth();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await API.get('/api/orders/my-orders');
      if (response.data.status === 'success') {
        setOrderHistory(response.data.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch orders when orders section is active
  useEffect(() => {
    if (activeSection === 'orders' && !ordersLoading && orderHistory.length === 0) {
      fetchOrders();
    }
  }, [activeSection]);

  const favorites = [
    { id: 1, name: 'Pastel Dreams', price: 75.00 },
    { id: 2, name: 'Sunny Radiance', price: 65.00 },
    { id: 3, name: 'Ivory Elegance', price: 85.00 },
    { id: 4, name: 'Crimson Passi', price: 95.00 }
  ];

  const [orderHistory, setOrderHistory] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const response = await API.put('/api/auth/updatedetails', {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        birthday: userData.birthday
      });

      if (response.data.status === 'success') {
        // Update localStorage with new user data
        const updatedUser = response.data.data.user;
        localStorage.setItem('amourFloralsUser', JSON.stringify(updatedUser));
        
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      await API.get('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth data regardless of API call result
      authUtils.clearAuth();
      
      // Dispatch auth updated event
      window.dispatchEvent(new Event('authUpdated'));
      
      // Redirect to login page
      navigate('/login');
      alert('Logged out successfully!');
    }
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!userData.fullName) return 'U';
    return userData.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
              <h2 className="text-3xl font-light text-gray-800 mb-2">
                Welcome back, {userData.fullName.split(' ')[0] || 'User'}
              </h2>
              <p className="text-gray-600">
                Manage your profile, view orders, and update your preferences.
              </p>
            </div>

            {/* Personal Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-light text-gray-800">Personal Details</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-rose-600 hover:text-rose-700 font-medium transition duration-300"
                  disabled={saveLoading}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Full Name */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <label className="text-gray-600 font-medium md:w-1/3">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={saveLoading}
                    />
                  ) : (
                    <span className="flex-1 text-gray-800">{userData.fullName}</span>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <label className="text-gray-600 font-medium md:w-1/3">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={saveLoading}
                    />
                  ) : (
                    <span className="flex-1 text-gray-800">{userData.email}</span>
                  )}
                </div>

                {/* Phone */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <label className="text-gray-600 font-medium md:w-1/3">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={saveLoading}
                    />
                  ) : (
                    <span className="flex-1 text-gray-800">{userData.phone || 'Not provided'}</span>
                  )}
                </div>

                {/* Birthday */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <label className="text-gray-600 font-medium md:w-1/3">Birthday</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.birthday}
                      onChange={(e) => handleInputChange('birthday', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      disabled={saveLoading}
                    />
                  ) : (
                    <span className="flex-1 text-gray-800">{userData.birthday || 'Not provided'}</span>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleSave}
                      disabled={saveLoading}
                      className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white px-6 py-2 rounded-lg font-medium transition duration-300 flex items-center"
                    >
                      {saveLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
              <h2 className="text-3xl font-light text-gray-800 mb-2">My Favorites</h2>
              <p className="text-gray-600">
                Your cherished floral arrangements, saved for easy access.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favorites.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center space-x-4">
                  <div className="bg-gray-100 rounded-lg w-16 h-16 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">🌷</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-rose-600 font-medium">${item.price.toFixed(2)}</p>
                  </div>
                  <button className="text-rose-600 hover:text-rose-700 transition duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
              <h2 className="text-3xl font-light text-gray-800 mb-2">Order History</h2>
              <p className="text-gray-600">
                Track your recent orders and their delivery status.
              </p>
            </div>

            {ordersLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            ) : orderHistory.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-4">You haven't placed any orders yet. Start shopping to see your order history here.</p>
                <Link
                  to="/products"
                  className="inline-block bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition duration-300"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orderHistory.map((order) => {
                  const getStatusColor = (status) => {
                    switch (status?.toLowerCase()) {
                      case 'delivered':
                        return 'bg-green-500 text-green-600';
                      case 'shipped':
                        return 'bg-blue-500 text-blue-600';
                      case 'processing':
                        return 'bg-yellow-500 text-yellow-600';
                      case 'confirmed':
                        return 'bg-purple-500 text-purple-600';
                      case 'cancelled':
                        return 'bg-red-500 text-red-600';
                      default:
                        return 'bg-gray-500 text-gray-600';
                    }
                  };

                  return (
                    <div key={order._id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <h4 className="text-gray-600 text-sm font-medium mb-1">Order Number</h4>
                          <p className="text-gray-800 font-medium">#{order.orderNumber}</p>
                        </div>
                        <div>
                          <h4 className="text-gray-600 text-sm font-medium mb-1">Date</h4>
                          <p className="text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <h4 className="text-gray-600 text-sm font-medium mb-1">Total</h4>
                          <p className="text-gray-800 font-semibold">₹{(order.totalAmount || order.total)?.toFixed(2)}</p>
                        </div>
                        <div>
                          <h4 className="text-gray-600 text-sm font-medium mb-1">Status</h4>
                          <div className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(order.orderStatus || order.status)}`}></span>
                            <span className={getStatusColor(order.orderStatus || order.status).split(' ')[1]}>
                              {(order.orderStatus || order.status)?.charAt(0).toUpperCase() + (order.orderStatus || order.status)?.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Items Preview */}
                      {order.items && order.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Items ({order.items.length})</h5>
                          <div className="flex flex-wrap gap-2">
                            {order.items.slice(0, 3).map((item, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {item.product?.name || item.name} x{item.quantity}
                              </span>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                +{order.items.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex space-x-4">
                          <Link
                            to={`/orders/${order._id}`}
                            className="text-rose-600 hover:text-rose-700 font-medium transition duration-300"
                          >
                            View Details
                          </Link>
                          {(order.orderStatus === 'delivered' || order.status === 'delivered') && (
                            <button className="text-blue-600 hover:text-blue-700 font-medium transition duration-300">
                              Reorder
                            </button>
                          )}
                        </div>
                        {order.paymentStatus === 'completed' && (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-8">
            <h2 className="text-3xl font-light text-gray-800 mb-2">
              Welcome back, {userData.fullName.split(' ')[0] || 'User'}
            </h2>
            <p className="text-gray-600">
              Manage your profile, view orders, and update your preferences.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">
              {/* User Info */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-light mx-auto mb-4">
                  {getUserInitials()}
                </div>
                <h1 className="text-2xl font-light text-gray-800 mb-1">{userData.fullName}</h1>
                <p className="text-gray-500 text-sm">{userData.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveSection('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition duration-300 ${
                    activeSection === 'profile'
                      ? 'bg-rose-100 text-rose-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setActiveSection('orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition duration-300 ${
                    activeSection === 'orders'
                      ? 'bg-rose-100 text-rose-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Order History
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition duration-300">
                  Saved Addresses
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition duration-300">
                  Payment Methods
                </button>
                <button
                  onClick={() => setActiveSection('favorites')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition duration-300 ${
                    activeSection === 'favorites'
                      ? 'bg-rose-100 text-rose-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  My Favorites
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition duration-300">
                  Preferences
                </button>
              </nav>

              {/* Logout Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition duration-300 flex items-center"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;