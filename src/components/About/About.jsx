import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { AboutDashboardPlaceholder } from '../Pengu/Placeholders';
import { PenguPixelAvatar } from '../Pengu/PenguLogo';
import { Sparkles, MessageSquareQuote, AlertTriangle, HelpCircle } from 'lucide-react';

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
    <div id="the-idea" className="bg-black text-white font-sora relative border-y-0 -mt-[1px] md:mt-0">
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

      {/* 1. The Problem: Full-height Scroll-reveal Section */}
      <section className="flex flex-col items-center justify-center px-6 md:px-12 pt-12 md:pt-24 pb-8 md:pb-16 max-w-6xl mx-auto">
        <div className="w-full text-left mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
            <AlertTriangle size={14} /> THE PROBLEM WE ARE SOLVING
          </span>
        </div>
        <div className="w-full text-left" style={{ fontFamily: 'var(--font-body)' }}>
          <ScrollRevealText
            text="Learning to code for interviews is lonely and passive. You grind problems, get stuck, and nobody notices. Tutorials give answers, not understanding. When you finally fail an interview round, you don’t know why, because no one tracked the same mistakes you keep making."
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-4xl font-semibold tracking-wide leading-[1.35] md:leading-[1.3] text-neutral-200"
          />
        </div>
      </section>

      {/* 2. The Idea: Media Showcase + Socratic Mentor Preview */}
      <section className="pt-6 pb-12 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-stretch">

        {/* Left Column: Heading + Video Frame */}
        <div className="md:col-span-5 flex flex-col justify-between pt-2 pb-8">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold flex items-center gap-1.5">
              <Sparkles size={14} /> THE IDEA
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              A Little Pet That Lives on Your Desktop.
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              While you practice coding, Pengu quietly watches, notices where you slip, and asks you the kind of question a good mentor would: <strong className="text-sky-300">“Are you sure that’s the right way to loop here?”</strong>
            </p>
            <p className="text-neutral-400 text-sm leading-relaxed">
              It never hands you the answer. It nudges you to find it yourself. Because it’s a character on your screen rather than another tab or tool, it feels like someone is sitting next to you, not like homework.
            </p>
          </div>

          {/* Left Video Frame with Pengu Wave Animation */}
          <div className="relative w-full max-w-[450px] mx-auto md:max-w-none md:w-full mt-8 md:mt-auto">
            <motion.div
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              whileInView={{ clipPath: 'inset(0 0 0 0)' }}
              viewport={{ once: true, margin: "0px" }}
              transition={{ duration: 1.4, ease: "anticipate" }}
              className="aspect-[4/5] md:aspect-[3/4] bg-neutral-900 w-full overflow-hidden rounded-2xl z-0 relative shadow-2xl border border-white/10 flex flex-col justify-between"
            >
              {/* Header Bar */}
              <div className="relative z-10 p-3.5 bg-black/70 backdrop-blur-md border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-mono">
                  <span>pengu-desktop.live</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/30">
                  OBSERVING CODE
                </span>
              </div>

              {/* Looping Pengu Video */}
              <div className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center">
                <video
                  src="/pengu/pengu-wave.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Bottom Socratic Mentor Speech Bubble */}
              <div className="relative z-10 p-3.5 bg-black/85 backdrop-blur-md border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <PenguPixelAvatar size={24} mood="smile" className="w-6 h-6 flex-shrink-0" />
                  <span className="text-xs text-sky-200 font-medium">
                    "Are you sure that’s the right way to loop here?"
                  </span>
                </div>
                <HelpCircle size={14} className="text-sky-400 flex-shrink-0" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Column: Mistake Patterns Dashboard + Story */}
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
                text="Because it’s a character on your screen rather than another tab or tool, it feels like someone is sitting next to you, not like homework."
                className=""
              />
            </p>
            <p className="text-base md:text-xl font-medium text-neutral-400 leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
              <ScrollRevealText
                text="Built for students and job seekers preparing for coding interviews who study alone and want personal guidance without paying $100+/hr for human tutoring."
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
