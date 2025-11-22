// components/ProductCard.jsx
import React, { useState, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import authUtils from '../utils/auth';

const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  onRemoveFromWishlist, 
  showWishlistRemove = false,
  className = "" 
}) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Memoize expensive calculations
  const productId = useMemo(() => product._id || product.id, [product._id, product.id]);
  const inWishlist = useMemo(() => isInWishlist(productId), [isInWishlist, productId]);
  const isAuthenticated = useMemo(() => authUtils.isAuthenticated(), []);
  
  // Memoize discount calculation
  const discountPercentage = useMemo(() => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    }
    return null;
  }, [product.originalPrice, product.price]);

  const handleAddToCart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
  }, [onAddToCart, product]);

  const handleRemoveFromWishlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemoveFromWishlist(productId);
  }, [onRemoveFromWishlist, productId]);

  const handleWishlistToggle = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
      return;
    }

    // Set loading state
    setWishlistLoading(true);
    
    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      // Error is already handled in context with rollback
      console.error('Wishlist operation failed:', error);
    } finally {
      setWishlistLoading(false);
    }
  }, [isAuthenticated, inWishlist, removeFromWishlist, productId, addToWishlist, product]);

  // Memoize star rating component
  const renderStars = useCallback((rating) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) ? 'text-accent-400' : 'text-neutral-300'
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ));
  }, []);

  // Memoize product link
  const productLink = useMemo(() => `/products/${productId}`, [productId]);

  // Memoize wishlist button props
  const wishlistButtonProps = useMemo(() => ({
    disabled: wishlistLoading || !isAuthenticated,
    className: `absolute top-3 right-3 bg-white rounded-full p-2 shadow-soft transition-all duration-300 hover:shadow-elegant ${
      !isAuthenticated
        ? 'text-neutral-300 cursor-not-allowed'
        : wishlistLoading
        ? 'text-neutral-400 cursor-wait'
        : inWishlist 
        ? 'text-primary-500 hover:bg-primary-50' 
        : 'text-neutral-400 hover:bg-primary-50 hover:text-primary-500'
    }`,
    'aria-label': !isAuthenticated 
      ? 'Login to add to wishlist' 
      : inWishlist 
      ? 'Remove from wishlist' 
      : 'Add to wishlist',
    title: !isAuthenticated 
      ? 'Login to add to wishlist' 
      : inWishlist 
      ? 'Remove from wishlist' 
      : 'Add to wishlist'
  }), [wishlistLoading, isAuthenticated, inWishlist]);

  // Memoize product tags
  const productTags = useMemo(() => {
    const tags = [];
    if (product.flowerType) tags.push(product.flowerType);
    if (product.occasion) tags.push(product.occasion);
    if (product.color) tags.push(product.color.toLowerCase());
    return tags;
  }, [product.flowerType, product.occasion, product.color]);

  return (
    <div className={`card-elegant overflow-hidden hover-lift group ${className}`}>
      {/* Product Image */}
      <div className="relative">
        <Link to={productLink}>
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 h-48 md:h-56 lg:h-64 flex items-center justify-center cursor-pointer group-hover:from-primary-100 group-hover:to-secondary-100 transition-all duration-300 relative">
            <span className="text-neutral-400 font-body">Product Image</span>
            <div className="absolute inset-0 bg-primary-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 font-heading font-medium">
                View Details
              </span>
            </div>
          </div>
        </Link>
        
        {/* Wishlist Button */}
        {showWishlistRemove ? (
          <button
            onClick={handleRemoveFromWishlist}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-soft hover:bg-error-50 hover:text-error-500 transition-all duration-300 hover:shadow-elegant"
            aria-label="Remove from wishlist"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleWishlistToggle}
            {...wishlistButtonProps}
          >
            {wishlistLoading ? (
              <svg 
                className="w-5 h-5 animate-spin" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg 
                className="w-5 h-5" 
                fill={inWishlist ? "currentColor" : "none"} 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        )}

        {/* Stock Status */}
        {product.inStock === false && (
          <div className="absolute top-3 left-3 bg-error-500 text-white px-3 py-1 rounded-full text-xs font-heading font-medium shadow-soft">
            Out of Stock
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage && (
          <div className="absolute top-3 left-3 bg-success-500 text-white px-3 py-1 rounded-full text-xs font-heading font-medium shadow-soft">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Popular Badge */}
        {product.popular && (
          <div className="absolute top-3 left-3 bg-warning-500 text-white px-3 py-1 rounded-full text-xs font-heading font-medium shadow-soft">
            Popular
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 md:p-6">
        <Link to={productLink}>
          <h3 className="text-heading text-lg md:text-xl font-semibold text-neutral-800 mb-2 hover:text-primary-500 transition-all duration-300 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-body text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {renderStars(product.rating)}
            </div>
            <span className="text-body text-sm ml-2">({product.rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-display text-xl md:text-2xl font-semibold text-primary-600">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-neutral-500 line-through ml-2 text-sm font-body">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button 
          onClick={handleAddToCart}
          disabled={product.inStock === false}
          className="w-full btn-primary disabled:bg-neutral-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {product.inStock === false ? 'Out of Stock' : 'Add to Cart'}
        </button>

        {/* Product Tags */}
        {productTags.length > 0 && (
          <div className="flex items-center mt-3 text-sm text-body flex-wrap gap-1">
            {productTags.map((tag, index) => (
              <React.Fragment key={tag}>
                <span className="capitalize">{tag}</span>
                {index < productTags.length - 1 && <span>•</span>}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;