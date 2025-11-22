// pages/CollectionsPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const CollectionsPage = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Season', 'Occasion', 'Color Palette'];

  const collections = [
    {
      id: 1,
      title: 'Wild Romance',
      description: 'A celebration of animated beauty and passionate hosts.',
      category: 'Season'
    },
    {
      id: 2,
      title: 'Winter Solstice',
      description: 'Crisp whites and frosted greens to celebrate the quiet season.',
      category: 'Season'
    },
    {
      id: 3,
      title: 'Spring Awakening',
      description: 'A vibrant burst of life and color to welcome the new.',
      category: 'Season'
    },
    {
      id: 4,
      title: 'Pastel Dreams',
      description: 'Soft, gentle haes for moments of quiet beauty.',
      category: 'Color Palette'
    },
    {
      id: 5,
      title: 'Anniversary & Romance',
      description: 'Express your love with classic and timeless arrangements.',
      category: 'Occasion'
    },
    {
      id: 6,
      title: 'Vibrant Tropics',
      description: 'Bold, exotic blooms that bring the heat of the islands.',
      category: 'Season'
    }
  ];

  const filteredCollections = activeFilter === 'All' 
    ? collections 
    : collections.filter(collection => collection.category === activeFilter);

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-6">
            The Autumnal Collection
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover our curated from collections, thoughtfully composed to capture the essence of every season and sentiment.
          </p>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-full font-medium transition duration-300">
            Explore Now
          </button>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-800 mb-8">Our Collections</h2>
            
            {/* Filter Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2 rounded-full border transition duration-300 ${
                    activeFilter === filter
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-amber-600 hover:text-amber-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCollections.map((collection) => (
              <div 
                key={collection.id} 
                className="group cursor-pointer transform hover:-translate-y-2 transition duration-300"
              >
                <div className="bg-gray-100 h-80 rounded-lg mb-4 flex items-center justify-center group-hover:bg-gray-200 transition duration-300 overflow-hidden">
                  <div className="text-center p-6">
                    <span className="text-gray-500 text-sm uppercase tracking-wide">{collection.category}</span>
                    <div className="mt-2 w-16 h-1 bg-amber-500 mx-auto"></div>
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">{collection.title}</h3>
                <p className="text-gray-600">{collection.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CollectionsPage;