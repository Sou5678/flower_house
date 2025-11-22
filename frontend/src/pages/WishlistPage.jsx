// pages/WishlistPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useWishlist } from '../contexts/WishlistContext';
import authUtils from '../utils/auth';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, clearWishlist, fetchWishlist, loading, error, moveToCart, moveMultipleToCart, removeMultiple } = useWishlist();
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkOperationInProgress, setBulkOperationInProgress] = useState(false);
  const [operationProgress, setOperationProgress] = useState({ current: 0, total: 0, operation: '' });
  
  // Enhanced UI state management
  const [individualOperations, setIndividualOperations] = useState(new Set()); // Track individual item operations
  const [uiState, setUiState] = useState({
    isInitialLoad: true,
    hasError: false,
    lastOperation: null,
    operationFeedback: null
  });

  useEffect(() => {
    // Check if user is logged in using centralized auth utility
    if (!authUtils.requireAuth(navigate, { pathname: '/wishlist' })) {
      return;
    }

    // Fetch wishlist from backend on page load
    const initializeWishlist = async () => {
      try {
        setUiState(prev => ({ ...prev, isInitialLoad: true, hasError: false }));
        await fetchWishlist();
        setUiState(prev => ({ 
          ...prev, 
          isInitialLoad: false, 
          lastOperation: 'initial_load',
          operationFeedback: 'Wishlist loaded successfully'
        }));
      } catch (err) {
        setUiState(prev => ({ 
          ...prev, 
          isInitialLoad: false, 
          hasError: true,
          lastOperation: 'initial_load_failed',
          operationFeedback: 'Failed to load wishlist'
        }));
      }
    };

    initializeWishlist();
  }, [navigate, fetchWishlist]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleRemoveFromWishlist = useCallback(async (itemId) => {
    // Add to individual operations tracking for loading state
    setIndividualOperations(prev => new Set(prev).add(`remove_${itemId}`));
    
    try {
      await removeFromWishlist(itemId);
      // Clean up selection state immediately for better UX
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
      
      // Update UI state for consistent feedback
      setUiState(prev => ({
        ...prev,
        lastOperation: 'remove',
        operationFeedback: 'Item removed successfully'
      }));
      
      showToast('Item removed from wishlist', 'success');
    } catch (err) {
      setUiState(prev => ({
        ...prev,
        hasError: true,
        lastOperation: 'remove_failed',
        operationFeedback: 'Failed to remove item'
      }));
      showToast('Failed to remove item from wishlist', 'error');
    } finally {
      // Remove from individual operations tracking
      setIndividualOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(`remove_${itemId}`);
        return newSet;
      });
    }
  }, [removeFromWishlist]);

  const addToCart = (item) => {
    const cartItem = {
      product: item.name,
      productId: item._id || item.id,
      price: item.price,
      quantity: 1,
      image: item.images?.[0] || item.image
    };
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('amourFloralsCart') || '[]');
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(cartItem => 
      cartItem.productId === (item._id || item.id)
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // Add new item to cart
      existingCart.push(cartItem);
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('amourFloralsCart', JSON.stringify(existingCart));
    
    // Update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'));
    
    showToast(`${item.name} added to cart!`, 'success');
  };

  const handleMoveToCart = useCallback(async (item) => {
    const itemId = item._id || item.id;
    
    // Add to individual operations tracking for loading state
    setIndividualOperations(prev => new Set(prev).add(`move_${itemId}`));
    
    try {
      // Use the atomic moveToCart function from context
      await moveToCart(itemId);
      
      // Update localStorage cart for UI consistency
      const cartItem = {
        product: item.name,
        productId: itemId,
        price: item.price,
        quantity: 1,
        image: item.images?.[0] || item.image
      };
      
      const existingCart = JSON.parse(localStorage.getItem('amourFloralsCart') || '[]');
      const existingItemIndex = existingCart.findIndex(cartItem => 
        cartItem.productId === itemId
      );
      
      if (existingItemIndex > -1) {
        existingCart[existingItemIndex].quantity += 1;
      } else {
        existingCart.push(cartItem);
      }
      
      localStorage.setItem('amourFloralsCart', JSON.stringify(existingCart));
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Update UI state for consistent feedback
      setUiState(prev => ({
        ...prev,
        lastOperation: 'move_to_cart',
        operationFeedback: `${item.name} moved to cart successfully`
      }));
      
      showToast(`${item.name} moved to cart!`, 'success');
    } catch (err) {
      setUiState(prev => ({
        ...prev,
        hasError: true,
        lastOperation: 'move_to_cart_failed',
        operationFeedback: 'Failed to move item to cart'
      }));
      showToast(err.message || 'Failed to move item to cart', 'error');
    } finally {
      // Remove from individual operations tracking
      setIndividualOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(`move_${itemId}`);
        return newSet;
      });
    }
  }, [moveToCart]);

  // Enhanced selection state management with improved consistency
  const handleSelectItem = useCallback((itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        // Only add if item still exists in wishlist (prevents stale selections)
        const itemExists = wishlist.some(item => (item._id || item.id) === itemId);
        if (itemExists) {
          newSet.add(itemId);
        }
      }
      return newSet;
    });
  }, [wishlist]);

  // Improved select all/deselect all with better state consistency
  const handleSelectAll = useCallback(() => {
    const currentWishlistIds = wishlist.map(item => item._id || item.id);
    const currentSelectedCount = Array.from(selectedItems).filter(id => 
      currentWishlistIds.includes(id)
    ).length;
    
    if (currentSelectedCount === wishlist.length && wishlist.length > 0) {
      // Deselect all
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      // Select all current wishlist items
      setSelectedItems(new Set(currentWishlistIds));
      setSelectAll(true);
    }
  }, [wishlist, selectedItems]);

  // Enhanced effect to maintain selection state consistency
  useEffect(() => {
    const currentWishlistIds = new Set(wishlist.map(item => item._id || item.id));
    
    // Clean up stale selections (items no longer in wishlist)
    setSelectedItems(prev => {
      const cleanedSet = new Set();
      prev.forEach(id => {
        if (currentWishlistIds.has(id)) {
          cleanedSet.add(id);
        }
      });
      return cleanedSet;
    });
  }, [wishlist]);

  // Separate effect to update select all state based on current selections
  useEffect(() => {
    const totalItems = wishlist.length;
    const validSelectedCount = Array.from(selectedItems).filter(id => 
      wishlist.some(item => (item._id || item.id) === id)
    ).length;
    
    if (totalItems === 0) {
      setSelectAll(false);
    } else {
      setSelectAll(validSelectedCount === totalItems && totalItems > 0);
    }
  }, [wishlist, selectedItems]);

  // Clear operation feedback after delay for better UX
  useEffect(() => {
    if (uiState.operationFeedback && !uiState.hasError) {
      const timer = setTimeout(() => {
        setUiState(prev => ({ 
          ...prev, 
          operationFeedback: null,
          lastOperation: null 
        }));
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [uiState.operationFeedback, uiState.hasError]);

  const handleRemoveSelected = useCallback(async () => {
    if (selectedItems.size === 0) return;
    
    const selectedItemsArray = Array.from(selectedItems);
    setBulkOperationInProgress(true);
    setOperationProgress({ current: 0, total: selectedItems.size, operation: 'Removing items...' });
    
    try {
      const results = await removeMultiple(selectedItemsArray);
      
      // Enhanced selection state management after bulk operation
      if (results.successful?.length > 0) {
        // Remove only successfully removed items from selection
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          results.successful.forEach(id => newSet.delete(id));
          return newSet;
        });
      }
      
      // Update select all state based on remaining selections
      const remainingSelections = selectedItemsArray.filter(id => 
        !results.successful?.includes(id)
      );
      setSelectAll(remainingSelections.length === wishlist.length - (results.successful?.length || 0));
      
      // Enhanced feedback based on operation results
      if (results.failed?.length > 0 && results.successful?.length > 0) {
        // Partial success - show detailed feedback and maintain failed selections
        const detailedMessage = `${results.successful.length} items removed successfully. ${results.failed.length} items failed to remove.`;
        showToast(detailedMessage, 'warning');
        
        // Keep failed items selected for potential retry
        setSelectedItems(new Set(results.failed.map(f => f.id)));
        
        console.warn('Bulk remove partial failures:', results.failed);
      } else if (results.failed?.length > 0) {
        // Complete failure - keep all items selected
        showToast(`Failed to remove ${results.failed.length} items from wishlist`, 'error');
      } else {
        // Complete success - clear all selections
        setSelectedItems(new Set());
        setSelectAll(false);
        showToast(`Successfully removed ${results.successful.length} items from wishlist`, 'success');
      }
      
      // Show operation performance info in development
      if (process.env.NODE_ENV === 'development' && results.duration) {
        console.log(`Bulk remove operation completed in ${results.duration}ms with ${results.successRate}% success rate`);
      }
      
    } catch (err) {
      console.error('Bulk remove operation failed:', err);
      showToast('Failed to remove selected items', 'error');
      // Keep selections on complete failure for retry
    } finally {
      setBulkOperationInProgress(false);
      setOperationProgress({ current: 0, total: 0, operation: '' });
    }
  }, [selectedItems, removeMultiple, wishlist.length]);

  const handleMoveSelectedToCart = useCallback(async () => {
    if (selectedItems.size === 0) return;
    
    const selectedItemsArray = Array.from(selectedItems);
    setBulkOperationInProgress(true);
    setOperationProgress({ current: 0, total: selectedItems.size, operation: 'Moving items to cart...' });
    
    try {
      // Use the atomic bulk move to cart function from context
      const results = await moveMultipleToCart(selectedItemsArray);
      
      // Update localStorage cart for UI consistency - only for successful items
      const selectedWishlistItems = wishlist.filter(item => 
        results.successful.includes(item._id || item.id)
      );
      
      // Update cart in localStorage for successful items
      if (selectedWishlistItems.length > 0) {
        const existingCart = JSON.parse(localStorage.getItem('amourFloralsCart') || '[]');
        
        selectedWishlistItems.forEach(item => {
          const cartItem = {
            product: item.name,
            productId: item._id || item.id,
            price: item.price,
            quantity: 1,
            image: item.images?.[0] || item.image
          };
          
          const existingItemIndex = existingCart.findIndex(cartItem => 
            cartItem.productId === (item._id || item.id)
          );
          
          if (existingItemIndex > -1) {
            existingCart[existingItemIndex].quantity += 1;
          } else {
            existingCart.push(cartItem);
          }
        });
        
        localStorage.setItem('amourFloralsCart', JSON.stringify(existingCart));
        window.dispatchEvent(new Event('cartUpdated'));
      }
      
      // Enhanced selection state management after bulk operation
      if (results.successful?.length > 0) {
        // Remove only successfully moved items from selection
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          results.successful.forEach(id => newSet.delete(id));
          return newSet;
        });
      }
      
      // Enhanced feedback based on operation results
      if (results.failed?.length > 0 && results.successful?.length > 0) {
        // Partial success - show detailed feedback and maintain failed selections
        const detailedMessage = `${results.successful.length} items moved to cart successfully. ${results.failed.length} items failed to move.`;
        showToast(detailedMessage, 'warning');
        
        // Keep failed items selected for potential retry
        setSelectedItems(new Set(results.failed.map(f => f.id)));
        setSelectAll(false);
        
        console.warn('Bulk move to cart partial failures:', results.failed);
      } else if (results.failed?.length > 0) {
        // Complete failure - keep all items selected
        showToast(`Failed to move ${results.failed.length} items to cart`, 'error');
      } else {
        // Complete success - clear all selections
        setSelectedItems(new Set());
        setSelectAll(false);
        showToast(`Successfully moved ${results.successful.length} items to cart!`, 'success');
      }
      
      // Show operation performance info in development
      if (process.env.NODE_ENV === 'development' && results.duration) {
        console.log(`Bulk move to cart operation completed in ${results.duration}ms with ${results.successRate}% success rate`);
        if (results.transactions?.length > 0) {
          console.log(`${results.transactions.length} atomic transactions completed successfully`);
        }
      }
      
    } catch (err) {
      console.error('Bulk move to cart operation failed:', err);
      showToast('Failed to move selected items to cart', 'error');
      // Keep selections on complete failure for retry
    } finally {
      setBulkOperationInProgress(false);
      setOperationProgress({ current: 0, total: 0, operation: '' });
    }
  }, [selectedItems, moveMultipleToCart, wishlist]);

  if (loading && wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Enhanced Progress Indicator for Bulk Operations */}
      {bulkOperationInProgress && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-6 py-4 flex items-center space-x-3 min-w-80">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600 flex-shrink-0"></div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{operationProgress.operation}</span>
                <span className="text-xs text-gray-500 font-medium">
                  {operationProgress.total > 0 ? `${Math.round((operationProgress.current / operationProgress.total) * 100)}%` : '...'}
                </span>
              </div>
              {operationProgress.total > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-pink-600 h-2 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${(operationProgress.current / operationProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono min-w-12 text-right">
                    {operationProgress.current}/{operationProgress.total}
                  </span>
                </div>
              )}
              <div className="text-xs text-gray-400 mt-1">
                Processing items in batches for optimal performance...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in">
          <div className={`${
            toast.type === 'success' ? 'bg-green-500' : 
            toast.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          } text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : toast.type === 'warning' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header with UI state indicators */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  My Wishlist
                </h1>
                {/* Subtle operation status indicator */}
                {(individualOperations.size > 0 || bulkOperationInProgress) && (
                  <div className="flex items-center space-x-1 text-pink-600">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-pink-600"></div>
                    <span className="text-xs font-medium">
                      {bulkOperationInProgress ? 'Bulk operation' : `${individualOperations.size} operation${individualOperations.size !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-gray-600 text-sm">
                  {wishlist.length} item{wishlist.length !== 1 ? 's' : ''}
                </p>
                {/* Operation feedback indicator */}
                {uiState.operationFeedback && !uiState.hasError && (
                  <div className="flex items-center space-x-1 text-green-600 animate-fade-in">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs">{uiState.operationFeedback}</span>
                  </div>
                )}
                {uiState.hasError && uiState.operationFeedback && (
                  <div className="flex items-center space-x-1 text-red-600 animate-fade-in">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-xs">{uiState.operationFeedback}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/products" 
                className="text-pink-600 hover:text-pink-700 font-medium text-sm transition duration-200 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {uiState.isInitialLoad ? (
          /* Initial loading state */
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading your wishlist...</h2>
            <p className="text-gray-600">Please wait while we fetch your saved items.</p>
          </div>
        ) : wishlist.length === 0 ? (
          /* Enhanced Empty State without loading artifacts */
          <div className="bg-white rounded-lg shadow-sm p-12 text-center animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Add items that you like to your wishlist. Review them anytime and easily move them to the bag.</p>
            <Link 
              to="/products" 
              className="inline-flex items-center px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition duration-200 transform hover:scale-105"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div>
            {/* Enhanced Selection Controls */}
            {wishlist.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 animate-slide-up">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition duration-200">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 transition duration-200"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {selectAll ? 'Deselect All' : 'Select All'} ({wishlist.length})
                      </span>
                      {/* Enhanced visual indicator for partial selection */}
                      {selectedItems.size > 0 && selectedItems.size < wishlist.length && (
                        <span className="text-xs text-pink-600 bg-pink-50 px-2 py-1 rounded-full">
                          Partial
                        </span>
                      )}
                    </label>
                    {selectedItems.size > 0 && (
                      <div className="flex items-center space-x-2 animate-fade-in">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-pink-600 font-medium">
                            {selectedItems.size} selected
                          </span>
                        </div>
                        {selectedItems.size < wishlist.length && (
                          <span className="text-xs text-gray-500">
                            ({wishlist.length - selectedItems.size} remaining)
                          </span>
                        )}
                        {/* Selection progress indicator */}
                        <div className="flex items-center space-x-1">
                          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-pink-500 transition-all duration-300 ease-out"
                              style={{ width: `${(selectedItems.size / wishlist.length) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-400 font-mono">
                            {Math.round((selectedItems.size / wishlist.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedItems.size > 0 && (
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto animate-fade-in">
                      <button
                        onClick={handleMoveSelectedToCart}
                        disabled={bulkOperationInProgress}
                        className="w-full sm:w-auto px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
                      >
                        {bulkOperationInProgress ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                            </svg>
                            <span>Move to Bag ({selectedItems.size})</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleRemoveSelected}
                        disabled={bulkOperationInProgress}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 hover:border-red-300 hover:text-red-600 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 text-sm font-medium rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                      >
                        {bulkOperationInProgress ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove ({selectedItems.size})</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Enhanced quick selection helpers */}
                {wishlist.length > 5 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>Quick select:</span>
                      <button
                        onClick={() => {
                          const firstHalf = wishlist.slice(0, Math.ceil(wishlist.length / 2));
                          setSelectedItems(new Set(firstHalf.map(item => item._id || item.id)));
                        }}
                        className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-2 py-1 rounded transition duration-200"
                      >
                        First {Math.ceil(wishlist.length / 2)}
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => {
                          const secondHalf = wishlist.slice(Math.ceil(wishlist.length / 2));
                          setSelectedItems(new Set(secondHalf.map(item => item._id || item.id)));
                        }}
                        className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 px-2 py-1 rounded transition duration-200"
                      >
                        Last {Math.floor(wishlist.length / 2)}
                      </button>
                      {selectedItems.size > 0 && (
                        <>
                          <span>•</span>
                          <button
                            onClick={() => {
                              setSelectedItems(new Set());
                              setSelectAll(false);
                            }}
                            className="text-gray-600 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition duration-200"
                          >
                            Clear ({selectedItems.size})
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Items */}
            <div className="space-y-4">
              {wishlist.map((item, index) => (
                <div 
                  key={item._id || item.id} 
                  className={`rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 animate-slide-up relative ${
                    selectedItems.has(item._id || item.id) 
                      ? 'bg-pink-50 border-2 border-pink-200 ring-1 ring-pink-100' 
                      : 'bg-white border-2 border-transparent'
                  } ${
                    (individualOperations.has(`remove_${item._id || item.id}`) || 
                     individualOperations.has(`move_${item._id || item.id}`))
                      ? 'opacity-75' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Operation overlay for visual feedback */}
                  {(individualOperations.has(`remove_${item._id || item.id}`) || 
                    individualOperations.has(`move_${item._id || item.id}`)) && (
                    <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600"></div>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="flex items-start space-x-3">
                        {/* Enhanced Checkbox with visual feedback */}
                        <div className="flex-shrink-0 pt-1">
                          <label className="relative cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item._id || item.id)}
                              onChange={() => handleSelectItem(item._id || item.id)}
                              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 transition duration-200"
                            />
                            {selectedItems.has(item._id || item.id) && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping"></div>
                            )}
                          </label>
                        </div>

                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="relative group">
                            <img
                              src={item.images?.[0] || item.image || '/placeholder-image.jpg'}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg transition duration-200"
                            />
                          </div>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 pr-2">
                              <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-2">
                                {item.name}
                              </h3>
                              <p className="text-xs text-gray-600 mb-2 capitalize">
                                {item.category}
                              </p>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-base font-semibold text-gray-900">
                                  ₹{item.price}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <>
                                    <span className="text-xs text-gray-500 line-through">
                                      ₹{item.originalPrice}
                                    </span>
                                    <span className="text-xs text-green-600 font-medium bg-green-50 px-1 py-0.5 rounded">
                                      {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {/* Action Buttons - Mobile */}
                              <div className="flex flex-col space-y-2 mt-3">
                                <button
                                  onClick={() => handleMoveToCart(item)}
                                  disabled={individualOperations.has(`move_${item._id || item.id}`) || bulkOperationInProgress}
                                  className="w-full px-3 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                                >
                                  {individualOperations.has(`move_${item._id || item.id}`) ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                      <span>Moving...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                      </svg>
                                      <span>Move to Bag</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleRemoveFromWishlist(item._id || item.id)}
                                  disabled={individualOperations.has(`remove_${item._id || item.id}`) || bulkOperationInProgress}
                                  className="w-full px-3 py-2 border border-gray-300 hover:border-red-300 hover:text-red-600 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 text-sm font-medium rounded-lg transition duration-200 flex items-center justify-center space-x-1"
                                >
                                  {individualOperations.has(`remove_${item._id || item.id}`) ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                                      <span>Removing...</span>
                                    </>
                                  ) : (
                                    <span>Remove</span>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Remove Icon */}
                            <button
                              onClick={() => handleRemoveFromWishlist(item._id || item.id)}
                              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition duration-200"
                              title="Remove from wishlist"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-start space-x-4">
                      {/* Enhanced Checkbox with visual feedback */}
                      <div className="flex-shrink-0 pt-2">
                        <label className="relative cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item._id || item.id)}
                            onChange={() => handleSelectItem(item._id || item.id)}
                            className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500 transition duration-200"
                          />
                          {selectedItems.has(item._id || item.id) && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping"></div>
                          )}
                        </label>
                      </div>

                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative group">
                          <img
                            src={item.images?.[0] || item.image || '/placeholder-image.jpg'}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg transition duration-200 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition duration-200"></div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-1 hover:text-pink-600 transition duration-200 cursor-pointer">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 capitalize">
                              {item.category}
                            </p>
                            <div className="flex items-center space-x-4 mb-3">
                              <span className="text-lg font-semibold text-gray-900">
                                ₹{item.price}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <>
                                  <span className="text-sm text-gray-500 line-through">
                                    ₹{item.originalPrice}
                                  </span>
                                  <span className="text-sm text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                                    {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                            
                            {/* Stock Status */}
                            <div className="mb-3">
                              <span className="inline-flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                                In Stock
                              </span>
                            </div>
                            
                            {/* Enhanced Action Buttons with loading states */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleMoveToCart(item)}
                                disabled={individualOperations.has(`move_${item._id || item.id}`) || bulkOperationInProgress}
                                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none text-white text-sm font-medium rounded-lg transition duration-200 transform hover:scale-105 flex items-center space-x-2"
                              >
                                {individualOperations.has(`move_${item._id || item.id}`) ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                    <span>Moving...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                                    </svg>
                                    <span>Move to Bag</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleRemoveFromWishlist(item._id || item.id)}
                                disabled={individualOperations.has(`remove_${item._id || item.id}`) || bulkOperationInProgress}
                                className="px-4 py-2 border border-gray-300 hover:border-red-300 hover:text-red-600 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 text-sm font-medium rounded-lg transition duration-200 flex items-center space-x-1"
                              >
                                {individualOperations.has(`remove_${item._id || item.id}`) ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                                    <span>Removing...</span>
                                  </>
                                ) : (
                                  <span>Remove</span>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Remove Icon */}
                          <button
                            onClick={() => handleRemoveFromWishlist(item._id || item.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition duration-200"
                            title="Remove from wishlist"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-4 sm:p-6 animate-fade-in">
              <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="text-sm text-gray-600 flex items-center justify-center sm:justify-start space-x-2">
                  <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <span>
                    {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in your wishlist
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  <Link 
                    to="/products" 
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium rounded-lg transition duration-200 hover:bg-gray-50 text-center"
                  >
                    Continue Shopping
                  </Link>
                  {selectedItems.size > 0 && (
                    <button
                      onClick={handleMoveSelectedToCart}
                      disabled={bulkOperationInProgress}
                      className="w-full sm:w-auto px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition duration-200 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
                    >
                      {bulkOperationInProgress ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                          </svg>
                          <span className="hidden sm:inline">Move Selected to Bag ({selectedItems.size})</span>
                          <span className="sm:hidden">Move to Bag ({selectedItems.size})</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default WishlistPage;