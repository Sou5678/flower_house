import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import API from '../utils/api';
import authUtils from '../utils/auth';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

// Operation types for logging and queue management
const OPERATION_TYPES = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  CLEAR: 'CLEAR',
  SYNC: 'SYNC',
  BULK_REMOVE: 'BULK_REMOVE',
  BULK_MOVE_TO_CART: 'BULK_MOVE_TO_CART'
};

// Sync status constants
const SYNC_STATUS = {
  SYNCED: 'synced',
  SYNCING: 'syncing',
  ERROR: 'error'
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(SYNC_STATUS.SYNCED);
  
  // Operation queue and concurrency control
  const operationQueue = useRef([]);
  const isProcessingQueue = useRef(false);
  const operationLock = useRef(false);
  
  // State snapshots for rollback
  const stateSnapshot = useRef(null);
  const pendingOperations = useRef(new Set());

  // Comprehensive logging utility
  const log = useCallback((level, operation, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      operation,
      message,
      data,
      syncStatus: syncStatus,
      queueLength: operationQueue.current.length
    };
    
    console[level](`[WishlistContext] ${operation}: ${message}`, data || '');
    
    // Store logs for debugging (keep last 100 entries)
    const logs = JSON.parse(localStorage.getItem('wishlistLogs') || '[]');
    logs.push(logEntry);
    if (logs.length > 100) logs.shift();
    localStorage.setItem('wishlistLogs', JSON.stringify(logs));
  }, [syncStatus]);

  // Create state snapshot for rollback
  const createSnapshot = useCallback(() => {
    stateSnapshot.current = {
      wishlist: [...wishlist],
      error,
      syncStatus,
      timestamp: Date.now()
    };
    log('debug', 'SNAPSHOT', 'State snapshot created');
  }, [wishlist, error, syncStatus, log]);

  // Restore from snapshot
  const restoreFromSnapshot = useCallback(() => {
    if (stateSnapshot.current) {
      setWishlist(stateSnapshot.current.wishlist);
      setError(stateSnapshot.current.error);
      setSyncStatus(stateSnapshot.current.syncStatus);
      log('info', 'ROLLBACK', 'State restored from snapshot');
    }
  }, [log]);

  // Intelligent sync with conflict resolution
  const syncWithBackend = useCallback(async (force = false) => {
    if (!authUtils.isAuthenticated()) {
      setWishlist([]);
      setSyncStatus(SYNC_STATUS.SYNCED);
      return;
    }

    if (syncStatus === SYNC_STATUS.SYNCING && !force) {
      log('debug', 'SYNC', 'Sync already in progress, skipping');
      return;
    }

    setSyncStatus(SYNC_STATUS.SYNCING);
    log('info', 'SYNC', 'Starting backend synchronization');

    try {
      const response = await API.get('/api/wishlist');
      if (response.data.status === 'success') {
        const backendWishlist = response.data.data.wishlist || [];
        const cachedWishlist = JSON.parse(localStorage.getItem('amourFloralsWishlist') || '[]');
        
        // Conflict resolution: backend takes precedence, but preserve local additions
        const resolvedWishlist = resolveWishlistConflicts(backendWishlist, cachedWishlist, wishlist);
        
        setWishlist(resolvedWishlist);
        localStorage.setItem('amourFloralsWishlist', JSON.stringify(resolvedWishlist));
        setSyncStatus(SYNC_STATUS.SYNCED);
        setError(null);
        
        log('info', 'SYNC', 'Synchronization completed successfully', { 
          backendCount: backendWishlist.length,
          resolvedCount: resolvedWishlist.length 
        });
      }
    } catch (err) {
      log('error', 'SYNC', 'Synchronization failed', err.message);
      setSyncStatus(SYNC_STATUS.ERROR);
      setError(err.response?.data?.message || 'Failed to sync wishlist');
    }
  }, [wishlist, syncStatus, log]);

  // Conflict resolution logic
  const resolveWishlistConflicts = useCallback((backend, cached, current) => {
    const backendIds = new Set(backend.map(item => item._id || item.id));
    const currentIds = new Set(current.map(item => item._id || item.id));
    
    // Start with backend data as source of truth
    const resolved = [...backend];
    
    // Add items that exist in current but not in backend (recent additions)
    current.forEach(item => {
      const itemId = item._id || item.id;
      if (!backendIds.has(itemId)) {
        resolved.push(item);
      }
    });
    
    log('debug', 'CONFLICT_RESOLUTION', 'Conflicts resolved', {
      backendCount: backend.length,
      currentCount: current.length,
      resolvedCount: resolved.length
    });
    
    return resolved;
  }, [log]);

  // Load wishlist with intelligent sync
  useEffect(() => {
    const initializeWishlist = async () => {
      const cachedWishlist = localStorage.getItem('amourFloralsWishlist');
      if (cachedWishlist) {
        try {
          const parsed = JSON.parse(cachedWishlist);
          setWishlist(parsed);
          log('info', 'INIT', 'Loaded cached wishlist', { count: parsed.length });
        } catch (err) {
          log('error', 'INIT', 'Failed to parse cached wishlist', err.message);
          localStorage.removeItem('amourFloralsWishlist');
        }
      }
      
      // Sync with backend after loading cache
      await syncWithBackend();
    };
    
    initializeWishlist();
  }, []);

  // Sync wishlist with localStorage whenever it changes
  useEffect(() => {
    if (wishlist.length > 0) {
      localStorage.setItem('amourFloralsWishlist', JSON.stringify(wishlist));
    } else {
      localStorage.removeItem('amourFloralsWishlist');
    }
  }, [wishlist]);

  // Operation queue processor
  const processOperationQueue = useCallback(async () => {
    if (isProcessingQueue.current || operationQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    log('debug', 'QUEUE', 'Processing operation queue', { length: operationQueue.current.length });

    while (operationQueue.current.length > 0) {
      const operation = operationQueue.current.shift();
      try {
        await operation.execute();
        log('debug', 'QUEUE', `Operation ${operation.type} completed`);
      } catch (error) {
        log('error', 'QUEUE', `Operation ${operation.type} failed`, error.message);
        // Re-queue failed operation with retry count
        if (operation.retryCount < 3) {
          operation.retryCount = (operation.retryCount || 0) + 1;
          operationQueue.current.unshift(operation);
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * operation.retryCount));
        }
      }
    }

    isProcessingQueue.current = false;
  }, [log]);

  // Add operation to queue
  const queueOperation = useCallback((type, execute, priority = 0) => {
    const operation = {
      id: Date.now() + Math.random(),
      type,
      execute,
      priority,
      retryCount: 0,
      timestamp: Date.now()
    };

    // Insert based on priority (higher priority first)
    const insertIndex = operationQueue.current.findIndex(op => op.priority < priority);
    if (insertIndex === -1) {
      operationQueue.current.push(operation);
    } else {
      operationQueue.current.splice(insertIndex, 0, operation);
    }

    log('debug', 'QUEUE', `Operation ${type} queued`, { queueLength: operationQueue.current.length });
    
    // Process queue
    processOperationQueue();
    
    return operation.id;
  }, [processOperationQueue, log]);

  // Fetch wishlist from backend with improved error handling
  const fetchWishlist = useCallback(async () => {
    return syncWithBackend(true);
  }, [syncWithBackend]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item._id === productId || item.id === productId);
  }, [wishlist]);

  // Idempotent add operation with concurrency control
  const addToWishlist = useCallback(async (product) => {
    if (!authUtils.isAuthenticated()) {
      setError('Please log in to add items to your wishlist');
      window.location.href = '/login';
      return;
    }

    const productId = product._id || product.id;
    
    // Check if already in wishlist (idempotent check)
    if (isInWishlist(productId)) {
      log('debug', 'ADD', 'Product already in wishlist, skipping', { productId });
      return;
    }

    // Check if operation is already pending
    if (pendingOperations.current.has(`add_${productId}`)) {
      log('debug', 'ADD', 'Add operation already pending', { productId });
      return;
    }

    // Acquire operation lock
    if (operationLock.current) {
      return queueOperation(OPERATION_TYPES.ADD, () => addToWishlist(product), 1);
    }

    operationLock.current = true;
    pendingOperations.current.add(`add_${productId}`);
    
    // Create snapshot for rollback
    createSnapshot();
    
    // Optimistic update
    setWishlist(prev => {
      // Double-check to prevent duplicates in race conditions
      if (prev.some(item => (item._id || item.id) === productId)) {
        return prev;
      }
      return [...prev, product];
    });
    setError(null);
    
    log('info', 'ADD', 'Adding product to wishlist', { productId, productName: product.name });

    try {
      const response = await API.post(`/api/wishlist/${productId}`);
      if (response.data.status === 'success') {
        // Update with actual data from backend
        const backendWishlist = response.data.data.wishlist || [];
        setWishlist(backendWishlist);
        localStorage.setItem('amourFloralsWishlist', JSON.stringify(backendWishlist));
        log('info', 'ADD', 'Product added successfully', { productId });
      }
    } catch (err) {
      log('error', 'ADD', 'Failed to add product', { productId, error: err.message });
      // Rollback on failure
      restoreFromSnapshot();
      
      const errorMessage = err.response?.data?.message || 'Failed to add to wishlist';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      operationLock.current = false;
      pendingOperations.current.delete(`add_${productId}`);
    }
  }, [isInWishlist, log, createSnapshot, restoreFromSnapshot, queueOperation]);

  // Remove product from wishlist with robust rollback
  const removeFromWishlist = useCallback(async (productId) => {
    if (!authUtils.isAuthenticated()) {
      setError('Please log in to manage your wishlist');
      return;
    }

    // Check if operation is already pending
    if (pendingOperations.current.has(`remove_${productId}`)) {
      log('debug', 'REMOVE', 'Remove operation already pending', { productId });
      return;
    }

    // Acquire operation lock
    if (operationLock.current) {
      return queueOperation(OPERATION_TYPES.REMOVE, () => removeFromWishlist(productId), 1);
    }

    operationLock.current = true;
    pendingOperations.current.add(`remove_${productId}`);
    
    // Create snapshot for rollback
    createSnapshot();

    // Optimistic update
    setWishlist(prev => prev.filter(item => 
      (item._id !== productId && item.id !== productId)
    ));
    setError(null);
    
    log('info', 'REMOVE', 'Removing product from wishlist', { productId });

    try {
      const response = await API.delete(`/api/wishlist/${productId}`);
      if (response.data.status === 'success') {
        // Update with actual data from backend
        const backendWishlist = response.data.data.wishlist || [];
        setWishlist(backendWishlist);
        localStorage.setItem('amourFloralsWishlist', JSON.stringify(backendWishlist));
        log('info', 'REMOVE', 'Product removed successfully', { productId });
      }
    } catch (err) {
      log('error', 'REMOVE', 'Failed to remove product', { productId, error: err.message });
      // Rollback on failure
      restoreFromSnapshot();
      
      const errorMessage = err.response?.data?.message || 'Failed to remove from wishlist';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      operationLock.current = false;
      pendingOperations.current.delete(`remove_${productId}`);
    }
  }, [log, createSnapshot, restoreFromSnapshot, queueOperation]);

  // Clear entire wishlist with robust rollback
  const clearWishlist = useCallback(async () => {
    if (!authUtils.isAuthenticated()) {
      setError('Please log in to manage your wishlist');
      return;
    }

    // Check if operation is already pending
    if (pendingOperations.current.has('clear_all')) {
      log('debug', 'CLEAR', 'Clear operation already pending');
      return;
    }

    // Acquire operation lock
    if (operationLock.current) {
      return queueOperation(OPERATION_TYPES.CLEAR, () => clearWishlist(), 2);
    }

    operationLock.current = true;
    pendingOperations.current.add('clear_all');
    
    // Create snapshot for rollback
    createSnapshot();

    // Optimistic update
    setWishlist([]);
    setError(null);
    
    log('info', 'CLEAR', 'Clearing entire wishlist');

    try {
      const response = await API.delete('/api/wishlist');
      if (response.data.status === 'success') {
        setWishlist([]);
        localStorage.removeItem('amourFloralsWishlist');
        log('info', 'CLEAR', 'Wishlist cleared successfully');
      }
    } catch (err) {
      log('error', 'CLEAR', 'Failed to clear wishlist', err.message);
      // Rollback on failure
      restoreFromSnapshot();
      
      const errorMessage = err.response?.data?.message || 'Failed to clear wishlist';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      operationLock.current = false;
      pendingOperations.current.delete('clear_all');
    }
  }, [log, createSnapshot, restoreFromSnapshot, queueOperation]);

  // Enhanced bulk operations with detailed feedback and partial failure handling
  const removeMultiple = useCallback(async (productIds) => {
    if (!authUtils.isAuthenticated()) {
      setError('Please log in to manage your wishlist');
      return { 
        successful: [], 
        failed: productIds.map(id => ({ id, error: 'Not authenticated' })), 
        totalProcessed: 0,
        summary: `Failed to remove ${productIds.length} items: Not authenticated`,
        operationId: Date.now()
      };
    }

    if (productIds.length === 0) {
      return { 
        successful: [], 
        failed: [], 
        totalProcessed: 0,
        summary: 'No items to remove',
        operationId: Date.now()
      };
    }

    const operationId = Date.now();
    log('info', 'BULK_REMOVE', 'Starting enhanced bulk remove operation', { 
      count: productIds.length, 
      operationId 
    });
    
    // Create comprehensive snapshot for potential rollback
    createSnapshot();
    
    const results = { 
      successful: [], 
      failed: [], 
      totalProcessed: 0,
      operationId,
      batchResults: [],
      partialFailures: []
    };
    const startTime = Date.now();
    
    // Enhanced batch processing with adaptive sizing
    let batchSize = Math.min(3, Math.max(1, Math.floor(productIds.length / 4))); // Adaptive batch size
    const batches = [];
    for (let i = 0; i < productIds.length; i += batchSize) {
      batches.push(productIds.slice(i, i + batchSize));
    }
    
    log('debug', 'BULK_REMOVE', 'Processing with adaptive batching', { 
      totalItems: productIds.length,
      batchCount: batches.length,
      batchSize,
      operationId 
    });
    
    // Process each batch with detailed tracking
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchStartTime = Date.now();
      
      log('debug', 'BULK_REMOVE', `Processing batch ${batchIndex + 1}/${batches.length}`, { 
        batchSize: batch.length,
        operationId 
      });
      
      const batchPromises = batch.map(async (productId) => {
        try {
          await removeFromWishlist(productId);
          results.successful.push(productId);
          log('debug', 'BULK_REMOVE', 'Item removed successfully', { productId, operationId });
          return { productId, success: true };
        } catch (err) {
          const failureInfo = { id: productId, error: err.message, timestamp: Date.now() };
          results.failed.push(failureInfo);
          results.partialFailures.push(failureInfo);
          log('debug', 'BULK_REMOVE', 'Item removal failed', { productId, error: err.message, operationId });
          return { productId, success: false, error: err.message };
        } finally {
          results.totalProcessed++;
        }
      });
      
      // Wait for current batch to complete
      const batchResults = await Promise.allSettled(batchPromises);
      const batchDuration = Date.now() - batchStartTime;
      const batchSuccessCount = batchResults.filter(r => 
        r.status === 'fulfilled' && r.value.success
      ).length;
      
      // Track batch results for detailed feedback
      results.batchResults.push({
        batchIndex: batchIndex + 1,
        itemCount: batch.length,
        successCount: batchSuccessCount,
        failureCount: batch.length - batchSuccessCount,
        duration: batchDuration,
        items: batch
      });
      
      log('debug', 'BULK_REMOVE', `Batch ${batchIndex + 1} completed`, { 
        batchSuccessCount,
        batchFailureCount: batch.length - batchSuccessCount,
        batchDuration: `${batchDuration}ms`,
        operationId 
      });
      
      // Adaptive delay between batches based on failure rate and remaining batches
      if (batchIndex < batches.length - 1) {
        const failureRate = (batch.length - batchSuccessCount) / batch.length;
        const baseDelay = 150;
        const adaptiveDelay = baseDelay + (failureRate * 300); // Longer delay for high failure rates
        
        log('debug', 'BULK_REMOVE', `Waiting ${adaptiveDelay}ms before next batch`, { 
          failureRate: `${Math.round(failureRate * 100)}%`,
          operationId 
        });
        
        await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
      }
    }
    
    const duration = Date.now() - startTime;
    const successRate = Math.round((results.successful.length / results.totalProcessed) * 100);
    
    // Enhanced summary with detailed feedback
    let summary;
    if (results.failed.length === 0) {
      summary = `Successfully removed all ${results.successful.length} items from wishlist`;
    } else if (results.successful.length === 0) {
      summary = `Failed to remove all ${results.failed.length} items from wishlist`;
    } else {
      summary = `Removed ${results.successful.length} of ${results.totalProcessed} items (${successRate}% success rate)`;
    }
    
    results.summary = summary;
    results.duration = duration;
    results.successRate = successRate;
    results.averageBatchTime = Math.round(duration / batches.length);
    
    // Log comprehensive completion information
    log('info', 'BULK_REMOVE', 'Enhanced bulk remove operation completed', { 
      operationId,
      totalItems: productIds.length,
      successful: results.successful.length,
      failed: results.failed.length,
      duration: `${duration}ms`,
      successRate: `${successRate}%`,
      batchCount: results.batchResults.length,
      averageBatchTime: `${results.averageBatchTime}ms`,
      partialFailureCount: results.partialFailures.length
    });
    
    // Log partial failures for debugging if any occurred
    if (results.partialFailures.length > 0) {
      log('warn', 'BULK_REMOVE', 'Partial failures detected', {
        operationId,
        partialFailures: results.partialFailures.map(f => ({ id: f.id, error: f.error }))
      });
    }
    
    return results;
  }, [removeFromWishlist, log, createSnapshot]);

  // Enhanced atomic move to cart operation with improved transaction-like behavior
  const moveToCart = useCallback(async (productId) => {
    if (!authUtils.isAuthenticated()) {
      setError('Please log in to manage your wishlist');
      throw new Error('Not authenticated');
    }

    // Check if operation is already pending
    if (pendingOperations.current.has(`move_to_cart_${productId}`)) {
      log('debug', 'MOVE_TO_CART', 'Move to cart operation already pending', { productId });
      return;
    }

    // Acquire operation lock
    if (operationLock.current) {
      return queueOperation(OPERATION_TYPES.BULK_MOVE_TO_CART, () => moveToCart(productId), 1);
    }

    operationLock.current = true;
    pendingOperations.current.add(`move_to_cart_${productId}`);

    // Find the product in wishlist
    const product = wishlist.find(item => (item._id || item.id) === productId);
    if (!product) {
      operationLock.current = false;
      pendingOperations.current.delete(`move_to_cart_${productId}`);
      throw new Error('Product not found in wishlist');
    }

    // Create comprehensive state snapshot for atomic rollback
    const transactionSnapshot = {
      wishlistState: [...wishlist],
      error: error,
      syncStatus: syncStatus,
      timestamp: Date.now(),
      productId: productId,
      product: { ...product }
    };
    
    log('info', 'MOVE_TO_CART', 'Starting enhanced atomic move to cart operation', { 
      productId, 
      productName: product.name,
      transactionId: transactionSnapshot.timestamp 
    });

    // Enhanced transaction state tracking with compensation actions
    const transaction = {
      id: transactionSnapshot.timestamp,
      steps: [],
      completed: false,
      rollbackRequired: false,
      compensationActions: [] // Track actions needed for rollback
    };

    try {
      // Use the new atomic backend endpoint for true database-level atomicity
      log('debug', 'MOVE_TO_CART', 'Using atomic backend endpoint for move-to-cart operation', { 
        productId, 
        transactionId: transaction.id 
      });

      // Optimistic UI update before backend call
      setWishlist(prev => prev.filter(item => 
        (item._id !== productId && item.id !== productId)
      ));

      // Call the atomic backend endpoint
      const atomicResponse = await API.post(`/api/wishlist/${productId}/move-to-cart`, {
        quantity: 1,
        price: product.price
      });
      
      if (atomicResponse.data.status !== 'success') {
        throw new Error(atomicResponse.data.message || 'Atomic move-to-cart operation failed');
      }

      // Record successful atomic operation
      transaction.steps.push({
        step: 'atomic_move_to_cart',
        success: true,
        data: atomicResponse.data,
        timestamp: Date.now(),
        backendTransactionId: atomicResponse.data.data.transactionId
      });

      // Update with confirmed backend state
      const backendWishlist = atomicResponse.data.data.wishlist || [];
      const backendCart = atomicResponse.data.data.cart;
      
      setWishlist(backendWishlist);
      localStorage.setItem('amourFloralsWishlist', JSON.stringify(backendWishlist));
      
      // Mark transaction as completed
      transaction.completed = true;
      
      log('info', 'MOVE_TO_CART', 'Atomic database transaction completed successfully', { 
        productId, 
        transactionId: transaction.id,
        backendTransactionId: atomicResponse.data.data.transactionId,
        steps: transaction.steps.length 
      });
      
      return { 
        success: true, 
        productId, 
        transactionId: transaction.id,
        backendTransactionId: atomicResponse.data.data.transactionId,
        steps: transaction.steps,
        atomic: true,
        cart: backendCart,
        wishlist: backendWishlist
      };

    } catch (err) {
      log('error', 'MOVE_TO_CART', 'Atomic transaction failed, initiating comprehensive rollback', { 
        productId, 
        transactionId: transaction.id,
        error: err.message,
        completedSteps: transaction.steps.length,
        rollbackRequired: transaction.rollbackRequired
      });

      // COMPREHENSIVE ROLLBACK MECHANISM
      // For atomic operations, rollback is simpler since the backend handles atomicity
      if (transaction.steps.some(step => step.step === 'atomic_move_to_cart')) {
        // Atomic operation failed, just restore UI state
        log('debug', 'MOVE_TO_CART', 'Atomic operation failed, restoring UI state', { 
          transactionId: transaction.id 
        });
        
        setWishlist(transactionSnapshot.wishlistState);
        setError(transactionSnapshot.error);
        setSyncStatus(transactionSnapshot.syncStatus);
        
        if (transactionSnapshot.wishlistState.length > 0) {
          localStorage.setItem('amourFloralsWishlist', JSON.stringify(transactionSnapshot.wishlistState));
        } else {
          localStorage.removeItem('amourFloralsWishlist');
        }
      } else {
        // Fallback to comprehensive rollback for non-atomic operations
        await performAtomicRollback(transaction, transactionSnapshot, productId);
      }

      const errorMessage = err.response?.data?.message || err.message || 'Failed to move item to cart';
      setError(errorMessage);
      throw new Error(errorMessage);

    } finally {
      operationLock.current = false;
      pendingOperations.current.delete(`move_to_cart_${productId}`);
    }
  }, [wishlist, error, syncStatus, log, queueOperation]);

  // Enhanced atomic rollback mechanism with compensation actions
  const performAtomicRollback = useCallback(async (transaction, snapshot, productId) => {
    log('info', 'ROLLBACK', 'Starting enhanced atomic rollback with compensation actions', { 
      transactionId: transaction.id,
      productId,
      stepsToRollback: transaction.steps.length,
      compensationActions: transaction.compensationActions?.length || 0
    });

    const rollbackResults = [];
    let rollbackSuccess = true;

    try {
      // Use compensation actions if available (more reliable)
      if (transaction.compensationActions && transaction.compensationActions.length > 0) {
        log('debug', 'ROLLBACK', 'Using compensation actions for rollback', { 
          transactionId: transaction.id,
          actionsCount: transaction.compensationActions.length 
        });
        
        // Execute compensation actions in reverse order
        for (let i = transaction.compensationActions.length - 1; i >= 0; i--) {
          const action = transaction.compensationActions[i];
          
          try {
            if (action.action === 'remove_from_cart' && action.cartItemId) {
              log('debug', 'ROLLBACK', 'Executing compensation: remove from cart', { 
                cartItemId: action.cartItemId,
                transactionId: transaction.id 
              });
              
              const removeResponse = await API.delete(`/api/cart/${action.cartItemId}`);
              if (removeResponse.data.status === 'success') {
                rollbackResults.push({ 
                  action: 'remove_from_cart', 
                  success: true, 
                  cartItemId: action.cartItemId 
                });
                log('debug', 'ROLLBACK', 'Cart item removed successfully via compensation', { 
                  cartItemId: action.cartItemId 
                });
              } else {
                rollbackResults.push({ 
                  action: 'remove_from_cart', 
                  success: false, 
                  error: removeResponse.data.message,
                  cartItemId: action.cartItemId 
                });
                rollbackSuccess = false;
              }
            }
            
            if (action.action === 'add_to_wishlist' && action.productId) {
              log('debug', 'ROLLBACK', 'Executing compensation: add to wishlist', { 
                productId: action.productId,
                transactionId: transaction.id 
              });
              
              const addResponse = await API.post(`/api/wishlist/${action.productId}`);
              if (addResponse.data.status === 'success') {
                rollbackResults.push({ 
                  action: 'add_to_wishlist', 
                  success: true, 
                  productId: action.productId 
                });
                log('debug', 'ROLLBACK', 'Product re-added to wishlist successfully via compensation', { 
                  productId: action.productId 
                });
              } else {
                rollbackResults.push({ 
                  action: 'add_to_wishlist', 
                  success: false, 
                  error: addResponse.data.message,
                  productId: action.productId 
                });
                rollbackSuccess = false;
              }
            }
          } catch (actionError) {
            rollbackResults.push({ 
              action: action.action, 
              success: false, 
              error: actionError.message 
            });
            rollbackSuccess = false;
            log('error', 'ROLLBACK', `Compensation action ${action.action} failed`, { 
              transactionId: transaction.id,
              error: actionError.message 
            });
          }
        }
      } else {
        // Fallback to legacy rollback method
        log('debug', 'ROLLBACK', 'Using legacy rollback method', { 
          transactionId: transaction.id 
        });
        
        // Rollback in reverse order of execution
        for (let i = transaction.steps.length - 1; i >= 0; i--) {
          const step = transaction.steps[i];
          
          try {
            if (step.step === 'wishlist_remove' && step.success) {
              log('debug', 'ROLLBACK', 'Rolling back wishlist removal', { 
                productId, 
                transactionId: transaction.id 
              });
              
              // Re-add to wishlist
              const rollbackResponse = await API.post(`/api/wishlist/${productId}`);
              if (rollbackResponse.data.status === 'success') {
                rollbackResults.push({ step: 'wishlist_readd', success: true });
                log('debug', 'ROLLBACK', 'Wishlist removal rolled back successfully', { productId });
              } else {
                rollbackResults.push({ step: 'wishlist_readd', success: false, error: rollbackResponse.data.message });
                rollbackSuccess = false;
              }
            }
            
            if (step.step === 'cart_add' && step.success) {
              log('debug', 'ROLLBACK', 'Rolling back cart addition', { 
                productId, 
                transactionId: transaction.id 
              });
              
              // Use cartItemId from step if available
              if (step.cartItemId) {
                const removeResponse = await API.delete(`/api/cart/${step.cartItemId}`);
                if (removeResponse.data.status === 'success') {
                  rollbackResults.push({ step: 'cart_remove', success: true });
                  log('debug', 'ROLLBACK', 'Cart addition rolled back successfully using cartItemId', { 
                    productId, 
                    cartItemId: step.cartItemId 
                  });
                } else {
                  rollbackResults.push({ step: 'cart_remove', success: false, error: removeResponse.data.message });
                  rollbackSuccess = false;
                }
              } else {
                // Find and remove the cart item (legacy method)
                const cartResponse = await API.get('/api/cart');
                if (cartResponse.data.status === 'success') {
                  const cartItem = cartResponse.data.data.cart.items.find(
                    item => (item.product._id === productId || item.product.id === productId)
                  );
                  
                  if (cartItem) {
                    const removeResponse = await API.delete(`/api/cart/${cartItem._id}`);
                    if (removeResponse.data.status === 'success') {
                      rollbackResults.push({ step: 'cart_remove', success: true });
                      log('debug', 'ROLLBACK', 'Cart addition rolled back successfully', { productId });
                    } else {
                      rollbackResults.push({ step: 'cart_remove', success: false, error: removeResponse.data.message });
                      rollbackSuccess = false;
                    }
                  } else {
                    // Item not found in cart - might have been removed already
                    rollbackResults.push({ step: 'cart_remove', success: true, note: 'Item not found in cart' });
                    log('debug', 'ROLLBACK', 'Cart item not found during rollback (may have been removed)', { productId });
                  }
                }
              }
            }
          } catch (stepError) {
            rollbackResults.push({ 
              step: step.step + '_rollback', 
              success: false, 
              error: stepError.message 
            });
            rollbackSuccess = false;
            log('error', 'ROLLBACK', `Failed to rollback step ${step.step}`, { 
              productId, 
              error: stepError.message 
            });
          }
        }
      }

      // Restore UI state from snapshot
      log('debug', 'ROLLBACK', 'Restoring UI state from transaction snapshot', { 
        transactionId: transaction.id 
      });
      
      setWishlist(snapshot.wishlistState);
      setError(snapshot.error);
      setSyncStatus(snapshot.syncStatus);
      
      // Update localStorage to match restored state
      if (snapshot.wishlistState.length > 0) {
        localStorage.setItem('amourFloralsWishlist', JSON.stringify(snapshot.wishlistState));
      } else {
        localStorage.removeItem('amourFloralsWishlist');
      }

      const successfulRollbacks = rollbackResults.filter(r => r.success).length;
      const failedRollbacks = rollbackResults.filter(r => !r.success).length;

      if (!rollbackSuccess || failedRollbacks > 0) {
        log('error', 'ROLLBACK', 'Partial rollback failure - manual intervention may be required', { 
          transactionId: transaction.id,
          productId,
          successfulRollbacks,
          failedRollbacks,
          rollbackResults 
        });
        
        // Force sync to attempt state recovery
        await syncWithBackend(true);
      } else {
        log('info', 'ROLLBACK', 'Enhanced atomic rollback completed successfully', { 
          transactionId: transaction.id,
          productId,
          rollbackSteps: successfulRollbacks,
          compensationActionsUsed: transaction.compensationActions?.length || 0
        });
      }

    } catch (rollbackError) {
      log('error', 'ROLLBACK', 'Critical rollback failure - forcing state sync', { 
        transactionId: transaction.id,
        productId,
        error: rollbackError.message 
      });
      
      // Last resort: force sync with backend to recover consistent state
      try {
        await syncWithBackend(true);
      } catch (syncError) {
        log('error', 'ROLLBACK', 'Failed to sync after rollback failure', { 
          transactionId: transaction.id,
          syncError: syncError.message 
        });
      }
    }
  }, [log, syncWithBackend]);

  const moveMultipleToCart = useCallback(async (productIds) => {
    if (!authUtils.isAuthenticated()) {
      setError('Please log in to manage your wishlist');
      return { 
        successful: [], 
        failed: productIds.map(id => ({ id, error: 'Not authenticated' })), 
        totalProcessed: 0,
        summary: `Failed to move ${productIds.length} items: Not authenticated`
      };
    }

    if (productIds.length === 0) {
      return { 
        successful: [], 
        failed: [], 
        totalProcessed: 0,
        summary: 'No items to move'
      };
    }

    log('info', 'BULK_MOVE_TO_CART', 'Starting enhanced bulk move to cart operation', { count: productIds.length });
    
    // Create comprehensive snapshot for potential bulk rollback
    const bulkTransactionSnapshot = {
      wishlistState: [...wishlist],
      error: error,
      syncStatus: syncStatus,
      timestamp: Date.now(),
      productIds: [...productIds]
    };
    
    const results = { 
      successful: [], 
      failed: [], 
      totalProcessed: 0,
      transactions: [],
      partialFailures: []
    };
    const startTime = Date.now();
    
    // Process items in smaller batches for better atomic operation handling
    const batchSize = 2; // Even smaller batch size for enhanced atomicity
    const batches = [];
    for (let i = 0; i < productIds.length; i += batchSize) {
      batches.push(productIds.slice(i, i + batchSize));
    }
    
    log('debug', 'BULK_MOVE_TO_CART', 'Processing items in batches', { 
      totalItems: productIds.length,
      batchCount: batches.length,
      batchSize 
    });
    
    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(async (productId) => {
          try {
            const transactionResult = await moveToCart(productId);
            results.successful.push(productId);
            results.transactions.push(transactionResult);
            log('debug', 'BULK_MOVE_TO_CART', 'Item moved to cart successfully', { 
              productId, 
              transactionId: transactionResult.transactionId 
            });
            return { productId, success: true, result: transactionResult };
          } catch (err) {
            const failureInfo = { id: productId, error: err.message, timestamp: Date.now() };
            results.failed.push(failureInfo);
            results.partialFailures.push(failureInfo);
            log('debug', 'BULK_MOVE_TO_CART', 'Item move to cart failed', { 
              productId, 
              error: err.message 
            });
            return { productId, success: false, error: err.message };
          } finally {
            results.totalProcessed++;
          }
        })
      );
      
      // Log batch completion
      const batchSuccessCount = batchResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const batchFailureCount = batchResults.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
      
      log('debug', 'BULK_MOVE_TO_CART', 'Batch completed', { 
        batchIndex: batches.indexOf(batch) + 1,
        totalBatches: batches.length,
        batchSuccessCount,
        batchFailureCount 
      });
      
      // Adaptive delay between batches based on failure rate
      if (batches.indexOf(batch) < batches.length - 1) {
        const failureRate = batchFailureCount / batch.length;
        const delay = failureRate > 0.5 ? 500 : 200; // Longer delay if high failure rate
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const duration = Date.now() - startTime;
    const successRate = Math.round((results.successful.length / results.totalProcessed) * 100);
    
    // Enhanced summary with transaction details
    let summary;
    if (results.failed.length === 0) {
      summary = `Successfully moved ${results.successful.length} items to cart atomically`;
    } else if (results.successful.length === 0) {
      summary = `Failed to move all ${results.failed.length} items to cart`;
    } else {
      summary = `Moved ${results.successful.length} items to cart, ${results.failed.length} failed (${successRate}% success rate)`;
    }
    
    results.summary = summary;
    results.duration = duration;
    results.successRate = successRate;
    results.bulkTransactionId = bulkTransactionSnapshot.timestamp;
    
    // Log detailed completion information
    log('info', 'BULK_MOVE_TO_CART', 'Enhanced bulk move to cart completed', { 
      bulkTransactionId: results.bulkTransactionId,
      totalItems: productIds.length,
      successful: results.successful.length,
      failed: results.failed.length,
      duration: `${duration}ms`,
      successRate: `${successRate}%`,
      transactionCount: results.transactions.length,
      partialFailureCount: results.partialFailures.length
    });
    
    // If there were partial failures, log them for debugging
    if (results.partialFailures.length > 0) {
      log('warn', 'BULK_MOVE_TO_CART', 'Partial failures detected in bulk operation', {
        bulkTransactionId: results.bulkTransactionId,
        partialFailures: results.partialFailures
      });
    }
    
    return results;
  }, [moveToCart, wishlist, error, syncStatus, log]);

  // Retry failed operation
  const retryFailedOperation = useCallback(async () => {
    if (operationQueue.current.length > 0) {
      log('info', 'RETRY', 'Retrying failed operations');
      await processOperationQueue();
    }
  }, [processOperationQueue, log]);

  // Refresh wishlist (force sync)
  const refreshWishlist = useCallback(async () => {
    log('info', 'REFRESH', 'Refreshing wishlist');
    await syncWithBackend(true);
  }, [syncWithBackend, log]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State
    wishlist,
    loading,
    error,
    syncStatus,
    
    // Core Operations
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    
    // Atomic Operations
    moveToCart,
    
    // Bulk Operations
    removeMultiple,
    moveMultipleToCart,
    
    // Utility Functions
    isInWishlist,
    fetchWishlist,
    refreshWishlist,
    retryFailedOperation,
    
    // Transaction utilities
    performAtomicRollback,
    
    // Debug utilities (for development)
    _debug: {
      getOperationQueue: () => operationQueue.current,
      getPendingOperations: () => Array.from(pendingOperations.current),
      getLogs: () => JSON.parse(localStorage.getItem('wishlistLogs') || '[]'),
      clearLogs: () => localStorage.removeItem('wishlistLogs')
    }
  }), [
    wishlist,
    loading,
    error,
    syncStatus,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    removeMultiple,
    moveMultipleToCart,
    isInWishlist,
    fetchWishlist,
    refreshWishlist,
    retryFailedOperation,
    performAtomicRollback
  ]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
