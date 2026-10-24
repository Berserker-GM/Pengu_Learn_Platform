/**
 * Image Optimization Configuration
 * Use these settings across the app for consistent image handling on slow networks
 */

export const IMAGE_CONFIG = {
  // Lazy loading threshold (pixels before viewport)
  lazyLoadThreshold: '50px',
  
  // Quality presets for different contexts
  QUALITY: {
    thumbnail: 50,    // Small thumbnails
    preview: 70,      // Preview images
    full: 85,         // Full-size images
    hero: 90,         // Hero/critical images
  },

  // Image format optimization
  formats: {
    webp: true,       // Use WebP for modern browsers
    jpg: 80,          // JPEG quality
    png: 8,           // PNG color reduction
  },

  // Responsive image widths
  breakpoints: {
    mobile: 400,
    tablet: 800,
    desktop: 1200,
    ultrawide: 1600,
  },

  // CDN/External service optimization
  cdnParams: {
    unsplash: '?q=70&w=800&fit=crop&auto=format',
    imgix: '?q=70&auto=format&fit=clip',
  },

  // Placeholders
  placeholder: {
    backgroundColor: '#1a1a1a',
    animation: 'pulse',
  },
};

/**
 * Helper: Generate responsive image srcset
 * Usage: srcSet={generateSrcSet('/path/to/image.jpg')}
 */
export function generateSrcSet(imagePath) {
  const basePath = imagePath.split('.').slice(0, -1).join('.');
  const ext = imagePath.split('.').pop();
  
  return `
    ${basePath}-400.${ext} 400w,
    ${basePath}-800.${ext} 800w,
    ${basePath}-1200.${ext} 1200w,
    ${basePath}-1600.${ext} 1600w
  `.trim();
}

/**
 * Helper: Generate responsive image sizes attribute
 */
export function generateSizes() {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw';
}

export default IMAGE_CONFIG;
