// components/SuggestedProducts.jsx
import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import API from '../utils/api';

const SuggestedProducts = memo(() => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock data for suggested products
  const mockProducts = [
    {
      _id: 'mock-1',
      name: 'Red Rose Bouquet',
      description: 'A classic bouquet of 12 fresh red roses, perfect for expressing love and romance.',
      price: 1299,
      originalPrice: 1599,
      category: { name: 'Bouquets' },
      occasions: ['anniversary', 'birthday'],
      flowerTypes: ['roses'],
      colors: ['red'],
      inventory: { stock: 25, isAvailable: true },
      ratings: { average: 4.8, count: 15 },
      isPopular: true,
      isFeatured: true,
      tags: ['romantic', 'classic', 'bestseller']
    },
    {
      _id: 'mock-2',
      name: 'Mixed Spring Bouquet',
      description: 'A vibrant mix of seasonal spring flowers including tulips, daffodils, and lilies.',
      price: 999,
      originalPrice: 1199,
      category: { name: 'Bouquets' },
      occasions: ['birthday', 'congratulations'],
      flowerTypes: ['tulips', 'lilies', 'mixed'],
      colors: ['mixed', 'yellow', 'pink'],
      inventory: { stock: 18, isAvailable: true },
      ratings: { average: 4.6, count: 12 },
      isPopular: true,
      tags: ['spring', 'colorful', 'fresh']
    },
    {
      _id: 'mock-3',
      name: 'White Lily Elegance',
      description: 'Elegant white lilies arranged with greenery, perfect for sympathy or sophisticated occasions.',
      price: 1499,
      category: { name: 'Arrangements' },
      occasions: ['sympathy', 'wedding'],
      flowerTypes: ['lilies'],
      colors: ['white'],
      inventory: { stock: 12, isAvailable: true },
      ratings: { average: 4.9, count: 8 },
      isFeatured: true,
      tags: ['elegant', 'sympathy', 'pure']
    },
    {
      _id: 'mock-4',
      name: 'Purple Orchid Arrangement',
      description: 'Exotic purple orchids in a modern arrangement, bringing sophistication to any space.',
      price: 2199,
      originalPrice: 2499,
      category: { name: 'Premium' },
      occasions: ['congratulations', 'just-because'],
      flowerTypes: ['orchids'],
      colors: ['purple'],
      inventory: { stock: 8, isAvailable: true },
      ratings: { average: 4.7, count: 6 },
      isPopular: true,
      tags: ['exotic', 'modern', 'luxury']
    },
    {
      _id: 'mock-5',
      name: 'Pink Rose & Baby\'s Breath',
      description: 'Soft pink roses complemented by delicate baby\'s breath for a romantic and gentle touch.',
      price: 1099,
      category: { name: 'Bouquets' },
      occasions: ['anniversary', 'birthday', 'wedding'],
      flowerTypes: ['roses'],
      colors: ['pink'],
      inventory: { stock: 20, isAvailable: true },
      ratings: { average: 4.5, count: 10 },
      tags: ['romantic', 'soft', 'delicate']
    },
    {
      _id: 'mock-6',
      name: 'Sunflower Sunshine Bouquet',
      description: 'Bright and cheerful sunflowers that bring warmth and happiness to any day.',
      price: 899,
      category: { name: 'Seasonal' },
      occasions: ['birthday', 'congratulations', 'just-because'],
      flowerTypes: ['seasonal'],
      colors: ['yellow'],
      inventory: { stock: 15, isAvailable: true },
      ratings: { average: 4.4, count: 9 },
      isPopular: true,
      tags: ['cheerful', 'bright', 'happy']
    },
    {
      _id: 'mock-7',
      name: 'Mixed Color Tulip Bundle',
      description: 'A vibrant collection of tulips in various colors, celebrating the beauty of spring.',
      price: 799,
      originalPrice: 999,
      category: { name: 'Seasonal' },
      occasions: ['birthday', 'just-because'],
      flowerTypes: ['tulips'],
      colors: ['mixed'],
      inventory: { stock: 22, isAvailable: true },
      ratings: { average: 4.3, count: 7 },
      tags: ['spring', 'colorful', 'fresh']
    },
    {
      _id: 'mock-8',
      name: 'Red & White Rose Combo',
      description: 'A striking combination of red and white roses, perfect for making a bold statement.',
      price: 1399,
      category: { name: 'Premium' },
      occasions: ['anniversary', 'wedding', 'congratulations'],
      flowerTypes: ['roses'],
      colors: ['red', 'white'],
      inventory: { stock: 14, isAvailable: true },
      ratings: { average: 4.6, count: 11 },
      isFeatured: true,
      tags: ['bold', 'classic', 'statement']
    }
  ];

  useEffect(() => {
    fetchSuggestedProducts();
  }, []);

  const fetchSuggestedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first, fallback to mock data
      try {
        const response = await API.get('/api/products/suggested');
        if (response.data.status === 'success' && response.data.data.products.length > 0) {
          setProducts(response.data.data.products);
        } else {
          // Use mock data if API returns empty or fails
          setProducts(mockProducts);
        }
      } catch (apiError) {
        console.log('API not available, using mock data');
        // Simulate API delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error fetching suggested products:', error);
      setError('Failed to load suggested products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    try {
      // Get existing cart from localStorage with proper key
      const existingCart = JSON.parse(localStorage.getItem('amourFloralsCart') || '[]');
      
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
      localStorage.setItem('amourFloralsCart', JSON.stringify(existingCart));
      
      // Update cart count in localStorage for navbar
      const totalCount = existingCart.reduce((total, item) => total + item.quantity, 0);
      localStorage.setItem('cartCount', totalCount);
      
      // Dispatch custom event to update cart count in navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      // Show success message with product name
      console.log(`✅ Added ${product.name} to cart (₹${product.price})`);
      
      // Optional: Show a toast notification here
      // showToast(`Added ${product.name} to cart!`, 'success');
      
    } catch (error) {
      console.error('Error adding product to cart:', error);
      // Optional: Show error toast
      // showToast('Failed to add product to cart', 'error');
    }
  };

  if (loading) {
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
          
          {/* Enhanced Loading State */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center space-x-2 bg-white rounded-lg px-6 py-4 shadow-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-rose-200 border-t-rose-600"></div>
              <span className="text-gray-600 font-medium">Loading fresh flowers...</span>
            </div>
            
            {/* Loading Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                  <div className="bg-gray-200 h-48"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3 w-1/2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={fetchSuggestedProducts}
                className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-medium transition duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Products Available</h3>
              <p className="text-gray-600 mb-4">We're currently updating our product catalog. Please check back soon!</p>
              <button 
                onClick={fetchSuggestedProducts}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Refresh Products
              </button>
            </div>
          </div>
        </div>
      </section>
    );
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
          <Link 
            to="/products"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-full font-medium text-lg transition duration-300 inline-block shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            View All Products
            <svg className="w-5 h-5 ml-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
});

SuggestedProducts.displayName = 'SuggestedProducts';

export default SuggestedProducts;