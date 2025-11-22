// components/Newsletter.jsx
import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup logic here
    // TODO: Implement newsletter signup API call
    setEmail('');
  };

  return (
    <section className="py-16 bg-rose-600 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
          Join Our World
        </h2>
        <p className="text-rose-100 mb-8 max-w-2xl mx-auto text-lg">
          Join our mailing list for exclusive arrangements, early access to new collections, and special offers on your first order.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2"
            required
          />
          <button 
            type="submit"
            className="bg-white text-rose-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Sign Up
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;