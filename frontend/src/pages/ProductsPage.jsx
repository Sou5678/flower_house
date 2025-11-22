// pages/ProductsPage.jsx
import React, { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
// Import simple debounce hook
import { useDebounce } from '../hooks/useDebounce';
// Import existing components
import ProductCard from '../components/ProductCard';

// Lazy load components
const Footer = lazy(() => import('../components/Footer'));
const EmptyState = lazy(() => import('../components/EmptyState'));
const PageHeader = lazy(() => import('../components/PageHeader'));
const Container = lazy(() => import('../components/Container'));
const Section = lazy(() => import('../components/Section'));

// Loading component
const ComponentLoader = memo(() => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
  </div>
));

ComponentLoader.displayName = 'ComponentLoader';

const ProductsPage = memo(() => {
  const location = useLocation();
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [selectedFlowerType, setSelectedFlowerType] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle search from navigation
  useEffect(() => {
    if (location.state?.fromSearch && location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
      // Clear the state to avoid repeated searches on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Memoize filter options to prevent re-renders
  const filterOptions = useMemo(() => ({
    occasions: ['All', 'Birthday', 'Anniversary', 'Wedding', 'Sympathy', 'Congratulations'],
    flowerTypes: ['All', 'Roses', 'Lilies', 'Tulips', 'Orchids', 'Mixed'],
    colors: ['All', 'Red', 'Pink', 'White', 'Yellow', 'Purple', 'Mixed']
  }), []);

  const products = [
    {
      id: 1,
      name: 'Blushing Sunrise Bouquet',
      price: 85.00,
      image: '/api/placeholder/300/300',
      occasion: 'Birthday',
      flowerType: 'Mixed',
      color: 'Pink',
      popular: true,
      description: 'A beautiful blend of pink roses and seasonal flowers that capture the morning sunrise.'
    },
    {
      id: 2,
      name: 'Midnight Garden',
      price: 95.00,
      image: '/api/placeholder/300/300',
      occasion: 'Anniversary',
      flowerType: 'Roses',
      color: 'Red',
      popular: true,
      description: 'Deep red roses arranged to create a romantic and dramatic statement.'
    },
    {
      id: 3,
      name: 'Golden Hour Roses',
      price: 110.00,
      image: '/api/placeholder/300/300',
      occasion: 'Anniversary',
      flowerType: 'Roses',
      color: 'Yellow',
      popular: true,
      description: 'Premium yellow roses that glow like the golden hour of sunset.'
    },
    {
      id: 4,
      name: 'Pastel Dream',
      price: 75.00,
      image: '/api/placeholder/300/300',
      occasion: 'Wedding',
      flowerType: 'Mixed',
      color: 'Mixed',
      popular: true,
      description: 'Soft pastel flowers perfect for weddings and romantic occasions.'
    },
    {
      id: 5,
      name: 'Crimson Kiss',
      price: 120.00,
      image: '/api/placeholder/300/300',
      occasion: 'Anniversary',
      flowerType: 'Roses',
      color: 'Red',
      popular: false,
      description: 'Luxurious deep crimson roses for the most special occasions.'
    },
    {
      id: 6,
      name: 'Serene Lilies',
      price: 80.00,
      image: '/api/placeholder/300/300',
      occasion: 'Sympathy',
      flowerType: 'Lilies',
      color: 'White',
      popular: false,
      description: 'Elegant white lilies that convey peace and serenity.'
    },
    {
      id: 7,
      name: 'Wildflower Melody',
      price: 70.00,
      image: '/api/placeholder/300/300',
      occasion: 'Birthday',
      flowerType: 'Mixed',
      color: 'Mixed',
      popular: false,
      description: 'A cheerful mix of wildflowers that bring natural beauty indoors.'
    },
    {
      id: 8,
      name: 'Ivory Elegance',
      price: 150.00,
      image: '/api/placeholder/300/300',
      occasion: 'Wedding',
      flowerType: 'Orchids',
      color: 'White',
      popular: false,
      description: 'Sophisticated white orchids for the most elegant celebrations.'
    }
  ];

  // Memoize filtered products for better performance
  const filteredProducts = useMemo(() => {
    // PerformanceMonitor.startMeasure('product-filtering');
    
    const filtered = products.filter(product => {
      const matchesFilters = (selectedOccasion === 'All' || product.occasion === selectedOccasion) &&
             (selectedFlowerType === 'All' || product.flowerType === selectedFlowerType) &&
             (selectedColor === 'All' || product.color === selectedColor);
      
      const matchesSearch = debouncedSearchQuery === '' || 
        product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.flowerType.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.occasion.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      return matchesFilters && matchesSearch;
    });
    
    // PerformanceMonitor.endMeasure('product-filtering');
    return filtered;
  }, [products, selectedOccasion, selectedFlowerType, selectedColor, debouncedSearchQuery]);

  // Memoize sorted products
  const sortedProducts = useMemo(() => {
    // PerformanceMonitor.startMeasure('product-sorting');
    
    const sorted = [...filteredProducts].sort((a, b) => {
      if (sortBy === 'popularity') {
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      } else if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      return 0;
    });
    
    // PerformanceMonitor.endMeasure('product-sorting');
    return sorted;
  }, [filteredProducts, sortBy]);

  // Memoized handlers for better performance
  const handleAddToCart = useCallback((product) => {
    // PerformanceMonitor.startMeasure('add-to-cart');
    
    // Add to cart logic
    const cartItem = {
      product: product.name,
      productId: product.id,
      price: product.price,
      quantity: 1
    };
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('amourFloralsCart') || '[]');
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(item => 
      item.productId === cartItem.productId
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
    
    // PerformanceMonitor.endMeasure('add-to-cart');
    alert(`${product.name} added to cart!`);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedOccasion('All');
    setSelectedFlowerType('All');
    setSelectedColor('All');
    setSearchQuery('');
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  const handleOccasionChange = useCallback((occasion) => {
    setSelectedOccasion(occasion);
  }, []);

  const handleFlowerTypeChange = useCallback((type) => {
    setSelectedFlowerType(type);
  }, []);

  const handleColorChange = useCallback((color) => {
    setSelectedColor(color);
  }, []);

  // Memoized Search Header Component
  const SearchHeader = memo(() => {
    if (!searchQuery) return null;
    
    return (
      <div className="bg-rose-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-800">
              Search Results for "{searchQuery}"
            </h3>
            <p className="text-gray-600 text-sm">
              Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="text-rose-600 hover:text-rose-700 font-medium transition duration-300"
          >
            Clear Search
          </button>
        </div>
      </div>
    );
  });

  SearchHeader.displayName = 'SearchHeader';

  // Memoized Filter Button Component
  const FilterButton = memo(({ value, selectedValue, onChange, children }) => (
    <button
      onClick={() => onChange(value)}
      className={`block w-full text-left px-3 py-2 rounded-lg transition duration-300 ${
        selectedValue === value
          ? 'bg-purple-100 text-purple-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  ));

  FilterButton.displayName = 'FilterButton';

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <Suspense fallback={<ComponentLoader />}>
        <PageHeader
          title="Artfully Crafted Bouquets for Every Moment"
          subtitle="The moments of the sparkle helps our listeners create unforgettable memories."
          backgroundGradient="from-purple-50 to-pink-50"
        />
      </Suspense>

      {/* Main Content */}
      <Suspense fallback={<ComponentLoader />}>
        <Section padding="default">
            {/* Page Title */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light text-gray-800 mb-4">Explore Our Collections</h2>
            </div>

            {/* Search Header */}
            <SearchHeader />

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className="lg:w-1/4">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                  {/* Search Box in Sidebar */}
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-800 mb-3">Search Products</h3>
                    <div className="flex">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Type to search..."
                        className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleSearch('')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-r-lg transition duration-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Occasion Filter */}
                  <div className="mb-8">
                    <h3 className="font-medium text-gray-800 mb-4 text-lg">Occasion</h3>
                    <div className="space-y-2">
                      {filterOptions.occasions.map((occasion) => (
                        <FilterButton
                          key={occasion}
                          value={occasion}
                          selectedValue={selectedOccasion}
                          onChange={handleOccasionChange}
                        >
                          {occasion}
                        </FilterButton>
                      ))}
                    </div>
                  </div>

                  {/* Flower Type Filter */}
                  <div className="mb-8">
                    <h3 className="font-medium text-gray-800 mb-4 text-lg">Flower Type</h3>
                    <div className="space-y-2">
                      {filterOptions.flowerTypes.map((type) => (
                        <FilterButton
                          key={type}
                          value={type}
                          selectedValue={selectedFlowerType}
                          onChange={handleFlowerTypeChange}
                        >
                          {type}
                        </FilterButton>
                      ))}
                    </div>
                  </div>

                  {/* Color Filter */}
                  <div className="mb-8">
                    <h3 className="font-medium text-gray-800 mb-4 text-lg">Color</h3>
                    <div className="space-y-2">
                      {filterOptions.colors.map((color) => (
                        <FilterButton
                          key={color}
                          value={color}
                          selectedValue={selectedColor}
                          onChange={handleColorChange}
                        >
                          {color}
                        </FilterButton>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <button
                    onClick={handleClearFilters}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition duration-300"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Products Grid */}
              <div className="lg:w-3/4">
                {/* Sort Header */}
                <div className="flex justify-between items-center mb-8">
                  <p className="text-gray-600">
                    Showing {sortedProducts.length} product{sortedProducts.length !== 1 ? 's' : ''}
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={handleSortChange}
                      className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="popularity">Popularity</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* No Results Message */}
                {sortedProducts.length === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                    </svg>
                    <p className="text-gray-500 text-lg mb-4">
                      {searchQuery 
                        ? `No products found for "${searchQuery}". Try different keywords.`
                        : 'No products found matching your filters.'
                      }
                    </p>
                    <button
                      onClick={handleClearFilters}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition duration-300"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
        </Section>
      </Suspense>

      <Suspense fallback={<ComponentLoader />}>
        <Footer />
      </Suspense>
    </div>
  );
});

ProductsPage.displayName = 'ProductsPage';

export default ProductsPage;