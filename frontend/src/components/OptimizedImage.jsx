import { useState, useRef, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholderClassName = '',
  onLoad,
  onError,
  lazy = true,
  aspectRatio = '1:1',
  ...props 
}) => {
  const [imageState, setImageState] = useState('loading');
  const [imageSrc, setImageSrc] = useState(null);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Parse aspect ratio
  const [widthRatio, heightRatio] = aspectRatio.split(':').map(Number);
  const paddingBottom = `${(heightRatio / widthRatio) * 100}%`;

  useEffect(() => {
    if (!lazy) {
      loadImage();
      return;
    }

    // Set up intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadImage();
              observerRef.current?.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px', // Start loading 50px before the image comes into view
          threshold: 0.1
        }
      );

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      loadImage();
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, lazy]);

  const loadImage = () => {
    if (!src) {
      setImageState('error');
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setImageState('loaded');
      onLoad?.();
    };
    
    img.onerror = () => {
      setImageState('error');
      onError?.();
    };
    
    img.src = src;
  };

  const handleImageLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    setImageState('error');
    onError?.();
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ paddingBottom }}
      {...props}
    >
      {/* Placeholder/Loading State */}
      {imageState === 'loading' && (
        <div 
          className={`absolute inset-0 image-placeholder ${placeholderClassName}`}
          aria-label="Loading image..."
        />
      )}

      {/* Error State */}
      {imageState === 'error' && (
        <div 
          className={`absolute inset-0 bg-gray-100 flex items-center justify-center ${placeholderClassName}`}
          aria-label="Failed to load image"
        >
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      )}

      {/* Actual Image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover optimized-image ${
            imageState === 'loaded' ? 'loaded' : 'loading'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}
    </div>
  );
};

export default OptimizedImage;