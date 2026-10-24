import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PenguLogo, PenguPixelAvatar } from '../Pengu/PenguLogo';
import { HeroCardPlaceholder } from '../Pengu/Placeholders';

const cardConfig = [
  {
    id: 1,
    emoji: "🐧",
    title: "DESKTOP PET",
    subtitle: "Lives on screen, learns alongside you",
    gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
    bgColor: "from-sky-600 to-sky-700",
    video: "/pengu/pengu-wave.mp4"
  },
  {
    id: 2,
    emoji: "🧠",
    title: "IT REMEMBERS",
    subtitle: "Catches repeating mistake patterns",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    bgColor: "from-indigo-500 to-purple-600"
  },
  {
    id: 3,
    emoji: "🎯",
    title: "DSA & SYSTEM DESIGN",
    subtitle: "Built specifically for interview rounds",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    bgColor: "from-amber-500 to-orange-600"
  }
];

const PenguHero = () => {
  const animationStage = 3;
  const [cardAnimation, setCardAnimation] = useState(0);

  useEffect(() => {
    const cardTimer = setInterval(() => {
      setCardAnimation(prev => (prev + 1) % 3);
    }, 3400);
    return () => clearInterval(cardTimer);
  }, []);

  const renderCardContent = (card, isMobile) => {
    if (card.id === 1) {
      return (
        <div className="w-full h-full overflow-hidden rounded-3xl relative select-none bg-neutral-900">
          <video
            src="/pengu/pengu-wave.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent p-5 sm:p-6 flex flex-col justify-between pointer-events-none">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                PENGU IS WATCHING 🐾
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            {/* Simulated Speech Bubble from Pengu */}
            <div className="p-3 rounded-2xl bg-black/75 backdrop-blur-md border border-sky-400/30 shadow-lg text-left">
              <div className="text-[10px] font-mono text-sky-400 font-bold uppercase mb-0.5">
                Pengu asks:
              </div>
              <p className="text-xs sm:text-sm text-white font-medium">
                "Are you sure that’s the right way to loop here?"
              </p>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-0.5">
                NOT ANOTHER TOOL
              </h4>
              <p className="text-xs sm:text-sm text-sky-200 font-medium">
                Feels like a coding friend sitting next to you
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full overflow-hidden rounded-3xl">
        <HeroCardPlaceholder card={card} />
      </div>
    );
  };

  const renderCard = (cardIndex, isMobile = false) => {
    const card = cardConfig[cardIndex];
    const roundedClass = isMobile ? 'rounded-2xl' : 'rounded-3xl';
    const shadowClass = isMobile ? 'shadow-xl' : 'shadow-2xl';

    const getAnimationClasses = (position) => {
      const translations = isMobile ?
        ['translate-x-4 translate-y-4', 'translate-x-2 translate-y-2', 'translate-x-0 translate-y-0'] :
        ['translate-x-6 translate-y-6', 'translate-x-3 translate-y-3', 'translate-x-0 translate-y-0'];

      const rotations = ['rotate-12', 'rotate-6', 'rotate-0'];
      const scales = ['scale-95', 'scale-98', 'scale-100'];
      const zIndexes = ['z-10', 'z-20', 'z-30'];

      const currentPosition = (cardAnimation + position) % 3;

      return `${rotations[currentPosition]} ${translations[currentPosition]} ${zIndexes[currentPosition]} ${scales[currentPosition]}`;
    };

    return (
      <div
        key={card.id}
        className={`absolute inset-0 ${roundedClass} ${shadowClass} transition-all duration-1000 ease-out ${getAnimationClasses(cardIndex)}`}
        style={{
          background: card.gradient,
          boxShadow: isMobile ? '0 20px 40px -12px rgba(56,189,248,0.2)' : '0 25px 50px -12px rgba(56,189,248,0.2)'
        }}
      >
        {renderCardContent(card, isMobile)}
      </div>
    );
  };

  return (
    <div id="hero" className="min-h-screen bg-black relative overflow-x-hidden lg:overflow-hidden hero-section">

      {/* Grid Pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.08] md:opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(231, 231, 231, 0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 251, 251, 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Moving gradient accent */}
      <motion.div
        className="absolute inset-0 opacity-[0.35]"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(56,189,248,0.18) 0%, transparent 60%)',
            'radial-gradient(circle at 80% 90%, rgba(99,102,241,0.18) 0%, transparent 60%)',
            'radial-gradient(circle at 40% 70%, rgba(245,158,11,0.12) 0%, transparent 60%)',
            'radial-gradient(circle at 20% 50%, rgba(56,189,248,0.18) 0%, transparent 60%)'
          ]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Top Branding Bar - Clean without badges or extra buttons */}
      <nav className="flex justify-between items-center px-6 md:px-12 pt-6 relative z-50">
        <PenguLogo showText={true} />
      </nav>

      <div className="flex flex-col justify-center min-h-screen relative px-4 pt-4 pb-24 sm:pb-12 md:pb-24 lg:pb-20 z-10">

        {/* Enhanced Initial Animation */}
        <motion.div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-1500 ease-out ${animationStage === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            } ${animationStage >= 2 ? 'opacity-0 pointer-events-none scale-110' : ''}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: animationStage === 1 ? 1 : 0, y: animationStage === 1 ? 0 : -30 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="text-center max-w-6xl mx-auto">
            <motion.h1
              className="font-bold text-white leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl mb-2 sm:mb-4">
                MEET YOUR
              </div>
              <div className="italic font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl mb-2 sm:mb-4 px-2 text-sky-400">
                DESKTOP CODING
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl">
                PET
              </div>
            </motion.h1>
          </div>
        </motion.div>

        {/* Main Layout */}
        <div className={`w-full transition-all duration-2000 ease-out ${animationStage >= 2 ? 'opacity-100' : 'opacity-0'
          } ${animationStage < 2 ? 'pointer-events-none' : ''}`}>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-center gap-16 xl:gap-20 2xl:gap-24">

            {/* Left Text */}
            <div className={`text-right transform transition-all duration-2000 ease-out ${animationStage >= 2 ? 'translate-x-0 opacity-100' : 'translate-x-24 opacity-0'
              }`}>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                DESKTOP<br />
                <span className="italic font-light text-sky-400">CODING</span><br />
                <span className="text-4xl lg:text-5xl xl:text-6xl">PET</span>
              </h1>
            </div>

            {/* Center Cards - Balanced Size */}
            <div className={`relative flex-shrink-0 transform transition-all duration-1500 ease-out ${animationStage >= 2 ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'
              }`} style={{ transitionDelay: '300ms' }}>
              <div className="relative w-72 h-88 xl:w-80 xl:h-96">
                {cardConfig.map((_, index) => renderCard(index, false))}
              </div>
            </div>

            {/* Right Text */}
            <div className={`text-left transform transition-all duration-2000 ease-out ${animationStage >= 2 ? 'translate-x-0 opacity-100' : '-translate-x-24 opacity-0'
              }`}>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className="italic font-bold">ASKS,</span><br />
                <span className="italic font-bold text-sky-400">NOT TELLS.</span><br />
                <span className="italic font-bold">REMEMBERS.</span>
              </h1>
            </div>

          </div>

          {/* Mobile Layout - Centered */}
          <div className="lg:hidden flex flex-col items-center justify-center text-center space-y-4">

            {/* Mobile Text - Centered */}
            <div className={`transform transition-all duration-2000 ease-out ${animationStage >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
              }`}>
              <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight text-center" style={{ fontFamily: 'var(--font-heading)' }}>
                YOUR DESKTOP<br />
                <span className="italic font-light text-sky-400">CODING PET</span>
              </h1>
            </div>

            {/* Mobile Cards - Centered */}
            <div className={`relative flex-shrink-0 transform transition-all duration-1500 ease-out ${animationStage >= 2 ? 'scale-100 opacity-100 rotate-0' : 'scale-75 opacity-0 rotate-12'
              }`} style={{ transitionDelay: '400ms' }}>
              <div className="relative w-52 h-64 sm:w-60 sm:h-72 mx-auto">
                {cardConfig.map((_, index) => renderCard(index, true))}
              </div>
            </div>

          </div>

          {/* Description Text - Centered */}
          <div className={`mt-6 lg:mt-14 mb-12 sm:mb-0 max-w-4xl mx-auto text-center transition-all duration-1500 ease-out ${animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`} style={{ transitionDelay: '800ms' }}>
            <p className="text-gray-300 text-sm sm:text-base lg:text-xl leading-relaxed px-6 sm:px-4 text-center w-full box-border" style={{ fontFamily: 'var(--font-heading)' }}>
              A little pet that lives on your desktop and learns alongside you.{' '}
              <br className="hidden sm:inline" />
              While you practice coding for interviews, it quietly watches, notices where you slip,{' '}
              <br className="hidden sm:inline" />
              and asks you the kind of questions a good mentor would.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#download"
                className="px-6 py-3 rounded-full bg-white text-black font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-neutral-200 transition-all shadow-md flex items-center gap-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <PenguPixelAvatar size={18} mood="wave" className="w-4 h-4" />
                <span>Adopt Pengu ($19)</span>
              </a>
              <a
                href="#the-idea"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider border border-white/15 transition-all"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                The Idea & How It Feels
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Seamless Transition Gradient fading the grid into black */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-40 lg:h-48 bg-gradient-to-b from-transparent via-black/60 to-black pointer-events-none z-10" />
    </div>
  );
};

export default PenguHero;
