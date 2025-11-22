// components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ className = "" }) => {
  // Function to scroll to top when clicking footer links
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return (
    <footer className={`bg-gradient-to-br from-neutral-800 to-neutral-900 text-white py-12 px-4 mt-16 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <h3 className="text-display text-2xl font-semibold mb-4">
              <span className="text-primary-400">Apna</span>
              <span className="text-script text-3xl ml-1">Flar</span>
            </h3>
            <p className="text-body text-neutral-300 max-w-md mb-6">
              India's trusted online florist delivering fresh flowers across 25,000+ PIN codes. 
              Same day delivery, 100% satisfaction guarantee, and 24/7 customer support.
            </p>
            
            {/* Social Media */}
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-all duration-300 hover-glow p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-all duration-300 hover-glow p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-all duration-300 hover-glow p-2 rounded-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Explore Section */}
          <div>
            <h3 className="text-heading font-semibold mb-4 text-lg text-primary-300">Explore</h3>
            <ul className="space-y-3 text-body text-neutral-300">
              <li><Link to="/" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Home</Link></li>
              <li><Link to="/products" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Shop All</Link></li>
              <li><Link to="/collections" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Collections</Link></li>
              <li><Link to="/about" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Our Story</Link></li>
              <li><Link to="/contact" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Contact</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-heading font-semibold mb-4 text-lg text-primary-300">Support</h3>
            <ul className="space-y-3 text-body text-neutral-300">
              <li><Link to="/contact" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Contact Us</Link></li>
              <li><Link to="/faqs" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">FAQs</Link></li>
              <li><Link to="/shipping" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Shipping Policy</Link></li>
              <li><Link to="/refunds" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Refunds & Returns</Link></li>
              <li><Link to="/care" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Flower Care</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-gray-400 text-sm">
                <p>&copy; 2024 Apna Flar Private Limited. All Rights Reserved.</p>
                <p className="mt-1">CIN: U74999HR2024PTC123456 | GSTIN: 06ABCDE1234F1Z5</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-neutral-400">
              <Link to="/privacy" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Privacy Policy</Link>
              <Link to="/shipping" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Shipping Policy</Link>
              <Link to="/refunds" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Refunds</Link>
              <Link to="/terms" onClick={scrollToTop} className="hover:text-primary-300 transition-all duration-300">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;