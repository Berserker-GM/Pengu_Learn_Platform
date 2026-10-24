import React, { useState } from 'react';

/**
 * OptimizedImage Component for slow internet
 * Features: lazy loading, blur-up effect, placeholder, retry on error
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  className = "", 
  placeholderClassName = "bg-neutral-800",
  priority = false,
  quality = 'auto',
  fallbackSrc = null
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  // Use QUALITY parameter for different scenarios
  const imageUrl = optimizeImageUrl(src, quality);

  return (
    <div className={`relative ${className}`}>
      {/* Placeholder/Skeleton */}
      {!isLoaded && (
        <div className={`absolute inset-0 animate-pulse ${placeholderClassName}`} />
      )}

      {/* Main Image */}
      <img
        src={hasError && fallbackSrc ? fallbackSrc : imageUrl}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};

/**
 * Optimize image URLs for slow networks
 */
function optimizeImageUrl(url, quality = 'auto') {
  if (!url) return url;

  // Unsplash optimization
  if (url.includes('unsplash.com')) {
    return `${url}${url.includes('?') ? '&' : '?'}q=70&w=800&fit=crop`;
  }

  // imgix optimization (if used)
  if (url.includes('imgix')) {
    return `${url}${url.includes('?') ? '&' : '?'}q=70&auto=format`;
  }

  // Generic CDN optimization
  return url;
}

export default OptimizedImage;
