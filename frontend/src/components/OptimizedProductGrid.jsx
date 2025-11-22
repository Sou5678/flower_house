import React, { memo, useMemo, useCallback, useState } from 'react';
import ProductCard from './ProductCard';
import VirtualList from './VirtualList';
import { useIntersectionObserver } from '../hooks/usePerformance';

const OptimizedProductGrid = memo(({
  products = [],
  onAddToCart,
  onRemoveFromWishlist,
  showWishlistRemove = false,
  itemsPerRow = 4,
  itemHeight = 400,
  containerHeight = 600,
  useVirtualization = false,
  className = ''
}) => {
  const [loadedImages, setLoadedImages] = useState(new Set());

  // Memoize grid configuration
  const gridConfig = useMemo(() => ({
    itemsPerRow,
    itemHeight,
    containerHeight
  }), [itemsPerRow, itemHeight, containerHeight]);

  // Memoize products in rows for virtual scrolling
  const productRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < products.length; i += itemsPerRow) {
      rows.push(products.slice(i, i + itemsPerRow));
    }
    return rows;
  }, [products, itemsPerRow]);

  // Optimized add to cart handler
  const handleAddToCart = useCallback((product) => {
    onAddToCart?.(product);
  }, [onAddToCart]);

  // Optimized remove from wishlist handler
  const handleRemoveFromWishlist = useCallback((productId) => {
    onRemoveFromWishlist?.(productId);
  }, [onRemoveFromWishlist]);

  // Image load handler for performance tracking
  const handleImageLoad = useCallback((productId) => {
    setLoadedImages(prev => new Set([...prev, productId]));
  }, []);

  // Render a single product with memoization
  const renderProduct = useCallback((product) => (
    <ProductCard
      key={product._id || product.id}
      product={product}
      onAddToCart={handleAddToCart}
      onRemoveFromWishlist={handleRemoveFromWishlist}
      showWishlistRemove={showWishlistRemove}
      onImageLoad={() => handleImageLoad(product._id || product.id)}
      className="h-full"
    />
  ), [handleAddToCart, handleRemoveFromWishlist, showWishlistRemove, handleImageLoad]);

  // Render a row of products for virtual scrolling
  const renderRow = useCallback((row, rowIndex) => (
    <div 
      key={rowIndex}
      className={`grid gap-4 mb-4`}
      style={{ 
        gridTemplateColumns: `repeat(${Math.min(row.length, itemsPerRow)}, 1fr)` 
      }}
    >
      {row.map(product => renderProduct(product))}
    </div>
  ), [renderProduct, itemsPerRow]);

  // Loading state component
  const LoadingGrid = memo(() => (
    <div className={`grid gap-4 ${className}`} 
         style={{ gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)` }}>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
          <div className="bg-gray-200 h-4 rounded mb-2"></div>
          <div className="bg-gray-200 h-4 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  ));

  LoadingGrid.displayName = 'LoadingGrid';

  // Empty state component
  const EmptyGrid = memo(() => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9M16 13h-2m0 0V9a2 2 0 00-2-2H9.414a1 1 0 00-.707.293L6.293 9.707A1 1 0 006 10.414V13h2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
      <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
    </div>
  ));

  EmptyGrid.displayName = 'EmptyGrid';

  // Show loading state
  if (!products) {
    return <LoadingGrid />;
  }

  // Show empty state
  if (products.length === 0) {
    return <EmptyGrid />;
  }

  // Use virtual scrolling for large datasets
  if (useVirtualization && products.length > 20) {
    return (
      <VirtualList
        items={productRows}
        itemHeight={itemHeight}
        containerHeight={containerHeight}
        renderItem={renderRow}
        className={className}
        overscan={2}
      />
    );
  }

  // Regular grid for smaller datasets
  return (
    <div 
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))` }}
    >
      {products.map(product => renderProduct(product))}
    </div>
  );
});

OptimizedProductGrid.displayName = 'OptimizedProductGrid';

export default OptimizedProductGrid;