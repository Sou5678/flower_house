// Utility to clear all authentication data
// Use this in browser console if needed: clearAllAuthData()

export const clearAllAuthData = () => {
  // Clear all auth-related localStorage items
  localStorage.removeItem('amourFloralsToken');
  localStorage.removeItem('amourFloralsUser');
  localStorage.removeItem('amourFloralsWishlist');
  localStorage.removeItem('amourFloralsCart');
  
  // Clear any other auth-related items
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear session storage as well
  sessionStorage.clear();
  
  console.log('✅ All authentication data cleared');
  
  // Reload page to reset state
  window.location.reload();
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.clearAllAuthData = clearAllAuthData;
}