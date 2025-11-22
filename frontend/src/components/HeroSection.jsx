// components/HeroSection.jsx
import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-floral py-20 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary-200 rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-20 right-20 w-16 h-16 bg-accent-200 rounded-full opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-secondary-200 rounded-full opacity-25 animate-pulse-soft"></div>
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h1 className="text-display text-5xl md:text-7xl lg:text-8xl font-semibold text-neutral-800 mb-6 leading-tight animate-fade-in">
          Where Flowers Become 
          <span className="text-script text-6xl md:text-8xl lg:text-9xl text-primary-500 block mt-2">
            Art
          </span>
        </h1>
        <p className="text-body text-lg md:text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up">
          Experience the luxury of artfully crafted bouquets, designed to captivate hearts and inspire souls with nature's finest beauty.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in">
          <button className="btn-primary text-lg px-8 py-4">
            Shop The Collection
          </button>
          <button className="btn-outline text-lg px-8 py-4">
            View Gallery
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;