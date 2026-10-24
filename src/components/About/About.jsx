import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { AboutWorkspacePlaceholder, AboutDashboardPlaceholder } from '../Pengu/Placeholders';

const ScrollRevealWord = ({ word, index, count, progress }) => {
  const reducedMotion = useReducedMotion();
  const start = (index / count) * 0.88;
  const end = Math.min(start + 0.16, 1);
  const opacity = useTransform(progress, [start, end], [0.35, 1]);

  return <motion.span style={{ opacity: reducedMotion ? 1 : opacity }}>{word}</motion.span>;
};

const ScrollRevealText = ({ text, className }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start 85%', 'end 35%'],
  });
  const words = text.split(' ');

  return (
    <span ref={targetRef} className={className}>
      {words.map((word, i) => (
        <span key={i}>
          <ScrollRevealWord word={word} index={i} count={words.length} progress={scrollYProgress} />
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
};

const AboutSection = () => {
  return (
    <div id="about" className="bg-black text-white font-sora relative border-y-0 -mt-[1px] md:mt-0">
      <div
        className="absolute top-1 left-0 w-full h-[40vh] opacity-10 pointer-events-none z-0 mix-blend-overlay"
        style={{
          backgroundImage: `
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(90deg, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
        }}
      />
      {/* 1. Full-height Scroll-reveal Section */}
      <section className="flex items-center justify-center px-6 md:px-12 pt-8 md:pt-20 pb-6 md:pb-12">
        <div className="max-w-6xl text-left" style={{ fontFamily: 'var(--font-body)' }}>
          <ScrollRevealText
            text="At Pengu Learn, we're on a mission to transform how students and creators absorb deep knowledge. From grasping difficult core fundamentals to mastering hands-on practical skills, we make every learning step an empowering discovery."
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-semibold tracking-wide leading-[1.35] md:leading-[1.3]"
          />
        </div>
      </section>

      {/* 2. Unified Content Section */}
      <section className="pt-4 pb-8 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-stretch">

        {/* Left Column: Heading + App Workspace Mockup Frame */}
        <div className="md:col-span-5 flex flex-col justify-between pt-2 pb-8">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">
              THE PENGU WORKSPACE
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Native Performance. Zero Distractions.
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              No endless browser tabs, notifications, or slow load times. Pengu Learn runs as a lightweight native application directly on your machine.
            </p>
          </div>

          {/* Left Video / Workspace Frame Placeholder */}
          <div className="relative w-full max-w-[450px] mx-auto md:max-w-none md:w-full mt-8 md:mt-auto">
            <motion.div
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              whileInView={{ clipPath: 'inset(0 0 0 0)' }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 1.4, ease: "anticipate" }}
              className="aspect-[4/5] md:aspect-[3/4] bg-neutral-900 w-full overflow-hidden rounded-2xl z-0 relative shadow-2xl border border-white/10"
            >
              <AboutWorkspacePlaceholder />
            </motion.div>
          </div>
        </div>

        {/* Right Column: Dashboard Mockup + Paragraphs */}
        <div className="md:col-span-7 md:col-start-6 lg:col-span-7 lg:col-start-6 flex flex-col pt-8 md:pt-0">
          <motion.div
            initial={{ clipPath: 'inset(0 0 0 100%)' }}
            whileInView={{ clipPath: 'inset(0 0 0 0)' }}
            viewport={{ once: true, margin: "0px" }}
            transition={{ duration: 1.4, ease: "anticipate" }}
            className="relative overflow-hidden aspect-[4/3] md:aspect-[16/10] w-full group bg-neutral-900 rounded-2xl mb-10 md:mb-16 border border-white/10 shadow-2xl"
          >
            <AboutDashboardPlaceholder />
          </motion.div>

          {/* Right: Text Content directly below preview */}
          <div className="space-y-8 text-left">
            <p className="text-xl md:text-2xl lg:text-3xl font-semibold leading-[1.4] tracking-wide text-white" style={{ fontFamily: 'var(--font-body)' }}>
              <ScrollRevealText
                text="Built on the conviction that active experimentation beats passive video watching. Pengu Learn gives you interactive playgrounds where concepts respond dynamically to your input."
                className=""
              />
            </p>
            <p className="text-base md:text-xl font-semibold italic text-neutral-400 leading-relaxed md:leading-loose tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
              <ScrollRevealText
                text="Unlock full offline functionality, keep your progress locally encrypted, and learn at your own pace without cloud dependency."
                className=""
              />
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;
