// components/PageHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({ 
  title, 
  subtitle, 
  breadcrumbs = [], 
  actions = null,
  className = "",
  backgroundGradient = "from-gray-50 to-gray-100"
}) => {
  return (
    <div className={`bg-gradient-to-br ${backgroundGradient} py-12 md:py-16 lg:py-20 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <Link to={crumb.href} className="hover:text-rose-600 transition duration-300">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-800 font-medium">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Header Content */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-800 mb-4 md:mb-6">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 md:mb-8">
              {subtitle}
            </p>
          )}
          {actions && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;