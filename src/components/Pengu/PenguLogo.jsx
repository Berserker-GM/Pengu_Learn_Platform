import React from "react";

export const PenguPixelAvatar = ({ className = "w-7 h-7", size = 28, mood = "wave" }) => {
  const spriteMap = {
    stand: "/pengu/pengu-stand.png",
    blush: "/pengu/pengu-blush.png",
    smile: "/pengu/pengu-smile.png",
    step: "/pengu/pengu-step.png",
    wave: "/pengu/pengu-wave.png",
    jump: "/pengu/pengu-jump.png",
  };

  const src = spriteMap[mood] || spriteMap.wave;

  return (
    <img
      src={src}
      alt="Pengu Mascot"
      width={size}
      height={size}
      className={`object-contain select-none drop-shadow-md pixelated ${className}`}
      style={{ imageRendering: "pixelated" }}
      loading="eager"
    />
  );
};

export const PenguIcon = ({ className = "w-8 h-8", size = 32 }) => (
  <PenguPixelAvatar size={size} className={className} mood="wave" />
);

export const PenguLogo = ({ className = "", showText = true, textClassName = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <div className="relative flex items-center justify-center p-1 rounded-xl bg-gradient-to-br from-sky-400/20 via-sky-500/10 to-indigo-500/20 border border-sky-400/30 shadow-sm backdrop-blur-sm">
      <PenguPixelAvatar size={30} className="w-7 h-7 sm:w-8 sm:h-8" mood="wave" />
    </div>
    {showText && (
      <div className="flex flex-col text-left">
        <span
          className={`font-bold tracking-tight text-white leading-none ${textClassName || "text-base sm:text-lg"}`}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Pengu<span className="text-sky-400 ml-0.5">Learn</span>
        </span>
        <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
          Interactive Platform
        </span>
      </div>
    )}
  </div>
);

export default PenguLogo;
