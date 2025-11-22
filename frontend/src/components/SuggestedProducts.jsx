// components/SuggestedProducts.jsx
import React, { useState, useEffect, memo } from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import API from '../utils/api';

const SuggestedProducts = memo(() => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSuggestedProducts();
  }, []);

  const fetchSuggestedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use suggested products endpoint
      const response = await API.get('/api/products/suggested');
      
      if (response.data.status === 'success') {
        setProducts(response.data.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching suggested products:', error);
      setError('Failed to load suggested products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex(item => item._id === product._id);
    
    if (existingItemIndex > -1) {
      // Update quantity if product exists
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // Add new product to cart
      existingCart.push({
        ...product,
        quantity: 1
      });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Update cart count in localStorage for navbar
    localStorage.setItem('cartCount', existingCart.reduce((total, item) => total + item.quantity, 0));
    
    // Dispatch custom event to update cart count in navbar
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    // Show success message (you can replace this with a toast notification)
    console.log(`Added ${product.name} to cart`);
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
              Suggested Products
            </h2>
          </div>
          <LoadingSpinner />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
              Suggested Products
            </h2>
          </div>
          <div className="text-center text-gray-600">
            <p>{error}</p>
            <button 
              onClick={fetchSuggestedProducts}
              className="mt-4 text-rose-600 hover:text-rose-700 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't render section if no products
  }

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
            Suggested Products
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our most popular arrangements, loved by customers just like you.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
              className="h-full"
            />
          ))}
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-12">
          <a 
            href="/products"
            className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-full font-medium text-lg transition duration-300 inline-block"
          >
            View All Products
          </a>
        </div>
      </div>
    </section>
  );
});

SuggestedProducts.displayName = 'SuggestedProducts';

export default SuggestedProducts;