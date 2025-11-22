// components/Nav.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authUtils from '../utils/auth';

const Nav = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState('Select Location');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('amourFloralsCart') || '[]');
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(totalItems);
    };

    const checkAuthStatus = () => {
      const user = authUtils.getUser();
      const isAuthenticated = authUtils.isAuthenticated();
      
      console.log('Nav - Auth Status:', { isAuthenticated, user, role: user?.role }); // Debug log
      
      setIsLoggedIn(isAuthenticated);
      setIsAdmin(user?.role === 'admin');
      
      if (isAuthenticated && user?.fullName) {
        // Get first name from full name
        const firstName = user.fullName.split(' ')[0];
        setUserName(firstName);
      } else {
        setUserName('');
      }
    };

    // Initial load
    updateCartCount();
    checkAuthStatus();

    // Listen for cart updates
    window.addEventListener('cartUpdated', updateCartCount);
    // Listen for auth updates
    window.addEventListener('authUpdated', checkAuthStatus);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('authUpdated', checkAuthStatus);
    };
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/products', { 
        state: { 
          searchQuery: searchQuery.trim(),
          fromSearch: true 
        } 
      });
      setSearchQuery('');
    }
  }, [searchQuery, navigate]);

  const handleProfileClick = useCallback((e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      navigate('/login', { state: { from: { pathname: '/profile' } } });
    }
  }, [isLoggedIn, navigate]);

  const getUserLocation = useCallback(() => {
    setIsLocationLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Use reverse geocoding to get city name
            // For demo purposes, we'll use a mock response
            // In production, you'd use Google Maps API or similar
            const mockCities = [
              'New York, NY',
              'Los Angeles, CA', 
              'Chicago, IL',
              'Houston, TX',
              'Phoenix, AZ',
              'Philadelphia, PA',
              'San Antonio, TX',
              'San Diego, CA',
              'Dallas, TX',
              'San Jose, CA'
            ];
            
            // Simulate API call delay
            setTimeout(() => {
              const randomCity = mockCities[Math.floor(Math.random() * mockCities.length)];
              setUserLocation(randomCity);
              localStorage.setItem('userLocation', randomCity);
              setIsLocationLoading(false);
            }, 1000);
            
          } catch (error) {
            console.error('Error getting location name:', error);
            setUserLocation('Location unavailable');
            setIsLocationLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setUserLocation('Location denied');
          setIsLocationLoading(false);
        }
      );
    } else {
      setUserLocation('Location not supported');
      setIsLocationLoading(false);
    }
  }, []);

  // Memoized menu close handler with scroll to top
  const handleMenuClose = useCallback(() => {
    setIsMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Memoized search input handler
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Memoized menu items to prevent re-renders
  const menuItems = useMemo(() => [
    { to: '/', label: 'Home' },
    { to: '/collections', label: 'Collections' },
    { to: '/products', label: 'Shop' },
    { to: '/about', label: 'Our Story' }
  ], []);

  const authMenuItems = useMemo(() => {
    if (isLoggedIn) {
      return [{ to: '/profile', label: userName ? `Hi, ${userName}` : 'My Profile' }];
    }
    return [
      { to: '/login', label: 'Login' },
      { to: '/signup', label: 'Sign Up' }
    ];
  }, [isLoggedIn, userName]);

  const bottomMenuItems = useMemo(() => [
    { to: '/wishlist', label: 'Wishlist' },
    { 
      to: '/cart', 
      label: 'Bag',
      badge: cartCount > 0 ? cartCount : null
    }
  ], [cartCount]);

  // Load saved location on component mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setUserLocation(savedLocation);
    }
  }, []);

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-soft border-b border-primary-100 fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12">
        <div className="flex items-center py-4 gap-2 sm:gap-4">
          {/* Left Side - Menu Button and Logo */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Menu Button - Ekdum Left Side */}
            <button 
              className="text-neutral-600 hover:text-primary-500 transition-all duration-300 p-2 rounded-lg hover:bg-primary-50"
              onClick={toggleMenu}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-display text-2xl font-semibold text-neutral-800 hover:text-primary-500 transition-all duration-300 whitespace-nowrap"
            >
              <span className="text-primary-500">Apna</span>
              <span className="text-script text-3xl ml-1">Flar</span>
            </Link>
          </div>

          {/* Center - Expanded Search Bar */}
          <div className="flex-1 mx-3 sm:mx-4 lg:mx-6 xl:mx-8">
            <form onSubmit={handleSearchSubmit} className="flex">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for flowers, bouquets and more"
                  className="w-full border border-gray-300 rounded-l-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 focus:border-rose-500 bg-gray-50"
                />
              </div>
              <button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white px-4 sm:px-6 py-2.5 rounded-r-lg transition duration-300 flex items-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Right Side Icons - Better Spaced */}
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5 flex-shrink-0">
            {/* Location */}
            <button 
              onClick={getUserLocation}
              disabled={isLocationLoading}
              className="flex flex-col items-center text-gray-700 hover:text-rose-600 transition duration-300 disabled:opacity-50 min-w-[70px]"
            >
              <div className="relative">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isLocationLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 text-rose-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium max-w-[70px] truncate text-center">
                {isLocationLoading ? 'Loading...' : userLocation}
              </span>
            </button>

            {/* Admin Panel - Only show for admin users */}
            {isAdmin && (
              <Link 
                to="/admin-complete"
                className="flex flex-col items-center text-rose-600 hover:text-rose-700 transition duration-300 min-w-[50px]"
                onClick={() => console.log('Admin link clicked, isAdmin:', isAdmin)}
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-medium text-center">Admin</span>
              </Link>
            )}

            {/* Profile */}
            <Link 
              to={isLoggedIn ? "/profile" : "/login"}
              onClick={!isLoggedIn ? handleProfileClick : undefined}
              className="flex flex-col items-center text-gray-700 hover:text-rose-600 transition duration-300 min-w-[60px]"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium max-w-[60px] truncate text-center">
                {isLoggedIn && userName ? userName : 'Profile'}
              </span>
            </Link>

            {/* Wishlist */}
            <Link 
              to="/wishlist"
              className="flex flex-col items-center text-gray-700 hover:text-rose-600 transition duration-300 min-w-[50px]"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs font-medium text-center">Wishlist</span>
            </Link>

            {/* Bag/Cart */}
            <Link 
              to="/cart" 
              className="flex flex-col items-center text-gray-700 hover:text-rose-600 transition duration-300 relative min-w-[40px]"
            >
              <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-medium text-center">Bag</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu - Now positioned as dropdown from RIGHT side */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 bg-white shadow-lg border border-gray-200 rounded-bl-lg w-64 z-40">
            <div className="flex flex-col space-y-0 py-2">
              {menuItems.map(item => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className="text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition duration-300 font-medium px-4 py-3"
                  onClick={handleMenuClose}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t border-gray-100 my-2"></div>

              {/* Conditional Auth Links in Menu */}
              {authMenuItems.map(item => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className="text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition duration-300 font-medium px-4 py-3"
                  onClick={handleMenuClose}
                >
                  {item.label}
                </Link>
              ))}

              {/* Admin Panel Link - Only show for admin users */}
              {isAdmin && (
                <Link 
                  to="/admin-complete" 
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition duration-300 font-semibold px-4 py-3 border-l-4 border-rose-500 bg-rose-25"
                  onClick={handleMenuClose}
                >
                  🛠️ Admin Panel
                </Link>
              )}

              {bottomMenuItems.map(item => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className="text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition duration-300 font-medium px-4 py-3 flex items-center"
                  onClick={handleMenuClose}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 z-30"
          onClick={handleMenuClose}
        ></div>
      )}
    </nav>
  );
});

Nav.displayName = 'Nav';

export default Nav;