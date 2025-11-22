// Admin-specific validation utilities

export const validateProduct = (productData) => {
  const errors = {};

  // Required fields
  if (!productData.name?.trim()) {
    errors.name = 'Product name is required';
  }

  if (!productData.description?.trim()) {
    errors.description = 'Product description is required';
  }

  if (!productData.price || productData.price <= 0) {
    errors.price = 'Valid price is required';
  }

  if (!productData.category) {
    errors.category = 'Category is required';
  }

  // Inventory validation
  if (productData.inventory !== undefined && productData.inventory < 0) {
    errors.inventory = 'Inventory cannot be negative';
  }

  // Image validation
  if (productData.images && productData.images.length === 0) {
    errors.images = 'At least one product image is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCategory = (categoryData) => {
  const errors = {};

  if (!categoryData.name?.trim()) {
    errors.name = 'Category name is required';
  }

  if (!categoryData.description?.trim()) {
    errors.description = 'Category description is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateOrderStatus = (status) => {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  return validStatuses.includes(status);
};

export const validateImageFile = (file) => {
  const errors = [];
  
  // File type validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only JPEG, PNG, and WebP images are allowed');
  }

  // File size validation (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push('Image size must be less than 5MB');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateBulkOperation = (selectedItems, operation) => {
  const errors = [];

  if (!selectedItems || selectedItems.length === 0) {
    errors.push('Please select at least one item');
  }

  if (!operation) {
    errors.push('Please select an operation');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Form validation helpers
export const createFormValidator = (validationRules) => {
  return (formData) => {
    const errors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = formData[field];
      
      rules.forEach(rule => {
        if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
          errors[field] = rule.message || `${field} is required`;
        } else if (rule.min && value && value.length < rule.min) {
          errors[field] = rule.message || `${field} must be at least ${rule.min} characters`;
        } else if (rule.max && value && value.length > rule.max) {
          errors[field] = rule.message || `${field} must be no more than ${rule.max} characters`;
        } else if (rule.pattern && value && !rule.pattern.test(value)) {
          errors[field] = rule.message || `${field} format is invalid`;
        } else if (rule.custom && value && !rule.custom(value)) {
          errors[field] = rule.message || `${field} is invalid`;
        }
      });
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };
};

export default {
  validateProduct,
  validateCategory,
  validateOrderStatus,
  validateImageFile,
  validateBulkOperation,
  createFormValidator,
};