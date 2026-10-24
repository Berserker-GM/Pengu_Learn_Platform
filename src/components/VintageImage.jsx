import React, { useState } from 'react';

const VintageImage = ({ src, alt, className = "", imgClassName = "" }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Image Wrapper */}
      <div className="relative w-full h-full z-0">
        
        {/* Placeholder skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-neutral-800 animate-pulse z-10" />
        )}
        
        {/* Base Image with Color Grading (Sepia, Soft Contrast, Desaturation, Blur) */}
        <img 
          src={src} 
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`block w-full h-full object-cover object-top blur-[0.4px] sepia-[0.35] contrast-[0.9] saturate-[0.8] brightness-[1.05] transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
        
        {/* Subtle Chromatic Aberration Fake (Ghosting color shift) */}
        <img 
          src={src} 
          alt="" 
          aria-hidden="true"
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-top mix-blend-color-burn opacity-[0.15] translate-x-[2px] blur-[1px] sepia-[0.8] hue-rotate-[90deg] transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
        <img 
          src={src} 
          alt="" 
          aria-hidden="true"
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover object-top mix-blend-color-burn opacity-[0.15] -translate-x-[2px] blur-[1px] sepia-[0.8] -hue-rotate-[90deg] transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
        />
      </div>

      {/* Grain/Noise Overlay */}
      <div 
        className="absolute inset-0 z-10 opacity-[0.4] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/stardust.png')" }}
      ></div>

      {/* Paper Texture Feel */}
      <div 
        className="absolute inset-0 z-10 opacity-[0.15] mix-blend-multiply pointer-events-none"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')" }}
      ></div>

      {/* Vignette Overlays */}
      <div className="absolute inset-0 z-20 shadow-[inset_0_0_150px_rgba(40,20,0,0.5)] mix-blend-multiply pointer-events-none"></div>
      
      {/* Radial Darkening for Corners */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(30,20,5,0.4)_120%)]"></div>
    </div>
  );
};

export default VintageImage;
