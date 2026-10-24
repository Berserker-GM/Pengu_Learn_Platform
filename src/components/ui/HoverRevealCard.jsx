import React from 'react';

/**
 * HoverRevealCard
 * 
 * A premium card component where the entire image turns a reddish color on hover.
 */
export const HoverRevealCard = ({
  imageSrc,        // renamed for simplicity (no longer need a secondary hover image)
  title,
  subtitle,
  className = '',
  imageClassName = '',
  tintColor = 'rgb(215,2,90)' // Default vibrant pink/red
}) => {
  return (
    <div
      className={`relative flex flex-col bg-white overflow-hidden rounded-[0.375rem] border border-gray-200/60 shadow-sm min-w-0 group cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[6px] hover:shadow-2xl ${className}`}
    >
      {/* Image Container */}
      <div className={`relative w-full aspect-[4/5] bg-black overflow-hidden ${imageClassName}`}>
        
        {/* Base Image */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt={title || "Card Image"}
            className="absolute inset-0 w-full h-full object-cover grayscale-0 group-hover:grayscale transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          />
        )}

        {/* 
          Red Tint Overlay on Hover
          mix-blend-color colorizes the grayscale image beneath it to the exact tint color 
        */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none mix-blend-color"
          style={{ backgroundColor: tintColor }}
        />
        
        {/* Subdued shadow overlay to enhance the red contrast */}
        <div 
          className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"
        />
      </div>

      {/* Card Content */}
      {(title || subtitle) && (
        <div className="flex flex-col p-4 z-20 relative bg-white">
          {title && (
            <h3 className="text-gray-900 font-bold text-lg mb-1 leading-tight tracking-wide group-hover:text-[rgb(215,2,90)] transition-colors duration-300">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HoverRevealCard;
