// src/pages/HomePage.jsx
import React, { lazy, Suspense, memo } from 'react';

// Lazy load components for better performance
const HeroSection = lazy(() => import('../components/HeroSection'));
const FeaturedCollections = lazy(() => import('../components/FeaturedCollections'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const Newsletter = lazy(() => import('../components/Newsletter'));
const Footer = lazy(() => import('../components/Footer'));

// Loading component for sections
const SectionLoader = memo(() => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
  </div>
));

SectionLoader.displayName = 'SectionLoader';

const HomePage = memo(() => {
  return (
    <div className="min-h-screen bg-white pt-20 font-body">
      <Suspense fallback={<SectionLoader />}>
        <HeroSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <FeaturedCollections />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <Testimonials />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <Newsletter />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <Footer />
      </Suspense>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;