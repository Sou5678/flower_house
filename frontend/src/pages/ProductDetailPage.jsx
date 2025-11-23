// pages/ProductDetailPage.jsx
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import DeliveryInfo from '../components/DeliveryInfo';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('standard');
  const [selectedVase, setSelectedVase] = useState('default');
  const [personalNote, setPersonalNote] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  // Mock product data - in real app, you'd fetch this based on productId
  const product = {
    id: productId,
    name: 'The Versailles Blush',
    description: 'A poetic arrangement of blush peonies, ivory roses, and delicate eucalyptus, capturing the timeless romance of a Parisian garden.',
    price: 125.00,
    rating: 4,
    reviewCount: 128,
    images: [
      '/api/placeholder/600/600',
      '/api/placeholder/600/600',
      '/api/placeholder/600/600'
    ],
    sizes: [
      { id: 'standard', name: 'Standard', price: 0 },
      { id: 'deluxe', name: 'Deluxe', price: 25 },
      { id: 'grand', name: 'Grand', price: 50 }
    ],
    vases: [
      { id: 'default', name: 'Standard Glass Vase', price: 0 },
      { id: 'premium', name: 'Premium Ceramic Vase', price: 15 },
      { id: 'luxury', name: 'Luxury Crystal Vase', price: 35 }
    ]
  };

  const currentPrice = product.price + 
    product.sizes.find(size => size.id === selectedSize).price +
    product.vases.find(vase => vase.id === selectedVase).price;

  const handleAddToCart = () => {
    // Add to cart logic here
    const cartItem = {
      product: product.name,
      productId: product.id,
      size: selectedSize,
      vase: selectedVase,
      personalNote,
      price: currentPrice,
      quantity: 1
    };
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('amourFloralsCart') || '[]');
    
    // Check if item already exists in cart
    const existingItemIndex = existingCart.findIndex(item => 
      item.productId === cartItem.productId && 
      item.size === cartItem.size && 
      item.vase === cartItem.vase
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
    
    // Update cart count in navbar (you might want to use context or state management for this)
    window.dispatchEvent(new Event('cartUpdated'));
    
    toast.success('Added to cart successfully!', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const handleBuyNow = () => {
    handleAddToCart(); // Add to cart first
    navigate('/cart'); // Then navigate to cart page
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-xl ${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Product Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="bg-gray-100 rounded-2xl h-96 lg:h-[500px] mb-4 flex items-center justify-center">
                <span className="text-gray-400">Product Image</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((img, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg h-24 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition duration-300">
                    <span className="text-gray-400 text-sm">Image {index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h1 className="text-4xl font-light text-gray-800 mb-4">
                {product.name}
              </h1>
              
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                  {renderStars(product.rating)}
                </div>
                <span className="text-gray-600">
                  ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="text-3xl font-light text-rose-600 mb-8">
                ₹{currentPrice.toFixed(2)}
              </div>

              {/* Size Selection */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-800 mb-4">CHOOSE A SIZE</h3>
                <div className="grid grid-cols-3 gap-4">
                  {product.sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.id)}
                      className={`border-2 rounded-lg p-4 text-center transition duration-300 ${
                        selectedSize === size.id
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-gray-300 text-gray-700 hover:border-rose-400'
                      }`}
                    >
                      <div className="font-medium">{size.name}</div>
                      {size.price > 0 && (
                        <div className="text-sm text-rose-600 mt-1">
                          +₹{size.price}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vase Selection */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-800 mb-4">SELECT A VASE</h3>
                <div className="space-y-3">
                  {product.vases.map((vase) => (
                    <button
                      key={vase.id}
                      onClick={() => setSelectedVase(vase.id)}
                      className={`w-full border-2 rounded-lg p-4 text-left transition duration-300 ${
                        selectedVase === vase.id
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-gray-300 text-gray-700 hover:border-rose-400'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{vase.name}</span>
                        {vase.price > 0 && (
                          <span className="text-rose-600">+₹{vase.price}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Note */}
              <div className="mb-8">
                <h3 className="font-medium text-gray-800 mb-4">ADD A PERSONAL NOTE</h3>
                <textarea
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  placeholder="Write your personal message here..."
                  className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                  rows="4"
                />
              </div>

              {/* Delivery Information */}
              <DeliveryInfo className="mb-6" />

              {/* Add to Cart and Buy Now Buttons */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-lg font-medium text-lg transition duration-300"
                >
                  Add to Cart - ₹{currentPrice.toFixed(2)}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-white border-2 border-rose-600 text-rose-600 hover:bg-rose-50 py-4 rounded-lg font-medium text-lg transition duration-300"
                >
                  Buy Now
                </button>
              </div>

              {/* Additional Information Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <div className="flex space-x-8">
                  {['details', 'care', 'delivery'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-4 px-2 font-medium transition duration-300 ${
                        activeTab === tab
                          ? 'text-rose-600 border-b-2 border-rose-600'
                          : 'text-gray-600 hover:text-rose-600'
                      }`}
                    >
                      {tab === 'details' && 'ARRANGEMENT DETAILS'}
                      {tab === 'care' && 'CARE INSTRUCTIONS'}
                      {tab === 'delivery' && 'DELIVERY INFORMATION'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="text-gray-600 leading-relaxed">
                {activeTab === 'details' && (
                  <div>
                    <p className="mb-4">This exquisite arrangement features:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Fresh blush peonies from local gardens</li>
                      <li>Premium ivory roses</li>
                      <li>Delicate eucalyptus foliage</li>
                      <li>Seasonal filler flowers</li>
                      <li>Hand-tied and arranged by our master florists</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'care' && (
                  <div>
                    <p className="mb-4">To ensure your arrangement lasts:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Keep in a cool area away from direct sunlight</li>
                      <li>Change water every 2 days</li>
                      <li>Trim stems at an angle every 3 days</li>
                      <li>Remove any wilting flowers promptly</li>
                      <li>Use provided flower food as directed</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'delivery' && (
                  <div>
                    <p className="mb-4">Delivery information:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Free delivery within city limits</li>
                      <li>Same-day delivery for orders before 2 PM</li>
                      <li>Next-day delivery available</li>
                      <li>Contact-free delivery option</li>
                      <li>Delivery tracking provided</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;