// components/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'rose', 
  text = '', 
  className = '',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    rose: 'border-rose-600',
    blue: 'border-blue-600',
    gray: 'border-gray-600',
    green: 'border-green-600'
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-200 ${colorClasses[color]} border-t-transparent ${sizeClasses[size]}`}></div>
      {text && (
        <p className="mt-4 text-gray-600 text-sm md:text-base">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;