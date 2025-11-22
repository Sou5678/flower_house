// components/Container.jsx
import React from 'react';

const Container = ({ 
  children, 
  size = 'default',
  className = "",
  padding = true,
  ...props 
}) => {
  const sizeClasses = {
    sm: 'max-w-4xl',
    default: 'max-w-7xl',
    lg: 'max-w-8xl',
    full: 'max-w-full'
  };

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div 
      className={`${sizeClasses[size]} mx-auto ${paddingClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;