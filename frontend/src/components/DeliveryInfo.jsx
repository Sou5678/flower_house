// components/DeliveryInfo.jsx
import React from 'react';
import { useLocation } from '../contexts/LocationContext';

const DeliveryInfo = ({ className = '' }) => {
  const { 
    location, 
    isServiceable, 
    hasLocation, 
    isLocationServiceable,
    getLocationDisplayText 
  } = useLocation();

  if (!hasLocation) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Select your location to check delivery availability
            </p>
            <p className="text-xs text-amber-600">
              Click on the location icon in the navbar
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLocationServiceable) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800">
              Delivery not available in {getLocationDisplayText()}
            </p>
            <p className="text-xs text-red-600">
              {isServiceable?.message || 'We are working to expand our delivery network'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <p className="text-sm font-medium text-green-800">
            Delivery available in {getLocationDisplayText()}
          </p>
          <p className="text-xs text-green-600">
            {isServiceable?.message} • Estimated delivery: {isServiceable?.estimatedDeliveryTime}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInfo;