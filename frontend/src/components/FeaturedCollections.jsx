// components/FeaturedCollections.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const FeaturedCollections = () => {
  const collections = [
    {
      id: 1,
      title: "The Autumn Edit",
      description: "Warm tones and seasonal blooms"
    },
    {
      id: 2,
      title: "The Romance Collection",
      description: "Elegant arrangements for special moments"
    },
    {
      id: 3,
      title: "Designer's Guide",
      description: "Expert curated floral designs"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4">
            Featured Collections
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our curated selections, each telling a unique story through the language of flowers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link 
              key={collection.id}
              to="/collections"
              className="group cursor-pointer transform hover:scale-105 transition duration-300 block"
            >
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-80 rounded-2xl mb-4 flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition duration-300 shadow-md relative overflow-hidden">
                <span className="text-gray-500 text-lg">Collection Image</span>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition duration-300 text-white text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-sm font-medium">View Collection</span>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 text-center group-hover:text-rose-600 transition duration-300">
                {collection.title}
              </h3>
              <p className="text-gray-600 text-center mt-2">
                {collection.description}
              </p>
            </Link>
          ))}
        </div>

        {/* View All Collections Button */}
        <div className="text-center mt-12">
          <Link 
            to="/collections"
            className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3 rounded-full font-medium text-lg transition duration-300 inline-block"
          >
            View All Collections
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;