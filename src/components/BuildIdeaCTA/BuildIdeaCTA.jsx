import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { LampContainer } from '../ui/lamp';

const BuildIdeaCTA = () => {
  const buttonRef = React.useRef(null);
  const [buttonWidth, setButtonWidth] = React.useState(null);

  React.useEffect(() => {
    const updateWidth = () => {
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <section className="relative bg-black text-white w-full overflow-hidden border-t border-white/10 idea-section-wrapper">
      <LampContainer 
        className="min-h-[80vh] md:min-h-screen" 
        contentClassName="-translate-y-12 sm:-translate-y-20 md:-translate-y-56 lg:-translate-y-64"
      >
        <div className="w-full flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0.5, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.25rem, 5.2vw, 4.75rem)', fontWeight: 500 }}
            className="w-full min-w-0 px-2 sm:px-4 bg-gradient-to-br from-white to-neutral-400 py-2 bg-clip-text text-center tracking-normal text-transparent opacity-100 build-idea-text font-medium uppercase"
          >
            BUILD YOUR IDEA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-justify [text-align-last:center] text-neutral-400 text-sm sm:text-base font-normal leading-relaxed mt-4 px-0 mx-auto"
            style={{
              fontFamily: 'var(--font-body)',
              width: buttonWidth ? `${buttonWidth}px` : 'auto',
              maxWidth: '92vw',
            }}
          >
            Don't let your breakthrough concept stay just a thought. Submit your idea, gain instant venture critique with our <strong className="text-white font-semibold">AI Counsel</strong>, and unlock direct mentorship from E-Cell BMSIT.
          </motion.p>

          {/* Action Button: Matched to the Events Filter Capsule Design */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 sm:mt-10 inline-flex items-center"
          >
            <div
              ref={buttonRef}
              className="flex flex-col sm:flex-row items-stretch sm:items-center border border-white/70 rounded-[6px] p-[5px] bg-transparent gap-1.5 sm:gap-2 shadow-sm"
            >
              <Link
                to="/build-your-idea"
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-[3px] bg-white text-black font-bold text-xs sm:text-sm uppercase tracking-[0.18em] hover:bg-neutral-200 active:scale-[0.99] transition-all whitespace-nowrap"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <span>CLICK HERE TO SUBMIT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/build-your-idea"
                className="inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-3.5 text-white/90 hover:text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] transition-colors rounded-[3px] hover:bg-white/5 text-center whitespace-nowrap"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                <span>DASHBOARD & AI COUNSEL</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </LampContainer>
    </section>
  );
};

export default BuildIdeaCTA;
