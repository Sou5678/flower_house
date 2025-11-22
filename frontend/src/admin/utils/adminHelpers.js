// Admin utility helper functions

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatDateShort = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const getOrderStatusColor = (status) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getInventoryStatusColor = (inventory, lowStockThreshold = 10) => {
  if (inventory === 0) {
    return 'bg-red-100 text-red-800';
  } else if (inventory <= lowStockThreshold) {
    return 'bg-yellow-100 text-yellow-800';
  } else {
    return 'bg-green-100 text-green-800';
  }
};

export const getInventoryStatusText = (inventory, lowStockThreshold = 10) => {
  if (inventory === 0) {
    return 'Out of Stock';
  } else if (inventory <= lowStockThreshold) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateSKU = (productName, category) => {
  const namePrefix = productName.substring(0, 3).toUpperCase();
  const categoryPrefix = category.substring(0, 2).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `${namePrefix}${categoryPrefix}${timestamp}`;
};

export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

export const sortByField = (array, field, direction = 'asc') => {
  return [...array].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];
    
    // Handle nested fields (e.g., 'user.name')
    if (field.includes('.')) {
      const fields = field.split('.');
      aValue = fields.reduce((obj, key) => obj?.[key], a);
      bValue = fields.reduce((obj, key) => obj?.[key], b);
    }
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) {
      return direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

export const filterBySearch = (array, searchTerm, searchFields) => {
  if (!searchTerm) return array;
  
  const lowercaseSearch = searchTerm.toLowerCase();
  
  return array.filter(item => {
    return searchFields.some(field => {
      let value = item[field];
      
      // Handle nested fields
      if (field.includes('.')) {
        const fields = field.split('.');
        value = fields.reduce((obj, key) => obj?.[key], item);
      }
      
      return value && value.toString().toLowerCase().includes(lowercaseSearch);
    });
  });
};

export const paginateArray = (array, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: array.length,
      totalPages: Math.ceil(array.length / limit),
      hasNext: endIndex < array.length,
      hasPrev: page > 1,
    },
  };
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackErr) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export default {
  formatCurrency,
  formatDate,
  formatDateShort,
  getOrderStatusColor,
  getInventoryStatusColor,
  getInventoryStatusText,
  truncateText,
  generateSKU,
  calculatePercentageChange,
  formatPercentage,
  sortByField,
  filterBySearch,
  paginateArray,
  debounce,
  downloadCSV,
  copyToClipboard,
};