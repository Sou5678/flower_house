// components/EmptyState.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon, 
  title, 
  description, 
  actionText, 
  actionLink, 
  onAction,
  className = "" 
}) => {
  return (
    <div className={`text-center py-12 md:py-16 lg:py-20 ${className}`}>
      <div className="bg-gray-100 rounded-full w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-6">
        {icon || (
          <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
        )}
      </div>
      
      <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-800 mb-4">
        {title}
      </h2>
      
      {description && (
        <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base">
          {description}
        </p>
      )}
      
      {(actionText && (actionLink || onAction)) && (
        <div>
          {actionLink ? (
            <Link 
              to={actionLink}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 md:px-8 py-3 rounded-full font-medium transition duration-300 inline-block text-sm md:text-base"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 md:px-8 py-3 rounded-full font-medium transition duration-300 text-sm md:text-base"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;