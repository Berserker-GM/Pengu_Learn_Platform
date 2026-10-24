import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, Sparkles } from "lucide-react";
import "./Events.css";
import { ModuleCardPlaceholder } from "../Pengu/Placeholders";

const PenguModulesScroll = () => {
  const modules = [
    {
      slug: "path-selection",
      displayName: "Pick a Path & Open Editor",
      description: "You click Pengu, pick your path (Data Structures & Algorithms, or System Design), and your code editor opens with the problems ready. Pengu quietly watches as you write solutions.",
      shortDescription: "Editor opens with problems ready as you pick your track.",
      badge: "HOW IT FEELS",
      category: "Workflow",
      type: "FEELS",
    },
    {
      slug: "socratic-questions",
      displayName: "Asks Instead of Tells",
      description: "Questions build understanding in a way answers don't. Pengu never hands you the code. It nudges you with mentor speech bubbles: 'Are you sure that’s the right way to loop here?'",
      shortDescription: "Nudges you to find answers yourself without spoiling them.",
      badge: "WHAT'S DIFFERENT",
      category: "Socratic Guidance",
      type: "DIFFERENT",
    },
    {
      slug: "mistake-patterns",
      displayName: "Remembers Your Recurring Slip-Ups",
      description: "It remembers: it knows you made the same error last week and says so. Your dashboard tracks what you keep getting wrong, what you've improved on, and what to work on next.",
      shortDescription: "Memory engine tracks repeat blindspots over time.",
      badge: "WHAT'S DIFFERENT",
      category: "Mistake Memory",
      type: "DIFFERENT",
    },
    {
      slug: "desktop-companion",
      displayName: "Wanders, Naps, & Talks Anytime",
      description: "Lives on your desktop—not another tab or homework tool. It wanders around, naps when you leave, and jumps when hovered. Talk to it anytime by typing or voice, like a friend.",
      shortDescription: "Desktop pet that feels alive, answers like a friend.",
      badge: "HOW IT FEELS",
      category: "Desktop Pet",
      type: "FEELS",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const leftColVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const handleCardClick = () => {
    const downloadEl = document.getElementById("download");
    if (downloadEl) {
      downloadEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      className="preserve-color min-h-screen w-full pb-20 pt-12 md:pt-32 px-5 md:px-12 xl:px-20 transition-colors duration-300"
      style={{ fontFamily: "var(--font-body)" }}
      id="how-it-feels"
    >
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20">
      
        {/* Left Column - Sticky Content */}
        <motion.div 
          variants={leftColVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="w-full lg:w-[450px] flex-shrink-0 lg:sticky lg:top-36 self-start flex flex-col items-start text-left gap-5 md:gap-6"
        >
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-sky-400">
            <Sparkles size={14} />
            <span>HOW IT FEELS & WHAT'S DIFFERENT</span>
          </div>

          <h2 
            className="event-primary-text font-bold tracking-tighter max-w-[420px]"
            style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: "1.15", wordSpacing: "0.2em" }}
          >
            How It Feels <br /> To Use Pengu
          </h2>

          <p 
            className="event-subtext text-[15px] md:text-[17px] leading-[1.6] max-w-[420px] font-normal mt-1 text-neutral-300"
            style={{ fontFamily: "var(--font-body)" }}
          >
            A desktop character that wanders, naps, and jumps when hovered. It opens your editor with interview problems, nudges you when you slip, and remembers repeat mistakes.
          </p>


          <a
            href="#download"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 mt-4 group"
          >
            <span>Get Pengu for Your Desktop</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Right Column - Module Cards */}
        <div className="flex-1 w-full">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {modules.map((item) => (
                <motion.div
                  layout
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  key={item.slug}
                  onClick={handleCardClick}
                  className="event-card group flex flex-col rounded-t-[16px] overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-1 border border-white/10"
                >
                  {/* Image Placeholder Area */}
                  <div className="event-image-bg w-full h-[240px] md:h-[260px] relative overflow-hidden">
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                      <span className="event-badge px-[8px] md:px-[10px] py-[4px] text-[10px] md:text-[11px] font-bold tracking-[0.1em] uppercase rounded-[3px] bg-white text-black" style={{ fontFamily: "var(--font-heading)" }}>
                        {item.badge}
                      </span>
                    </div>
                    
                    {/* Render clean vector placeholder graphic */}
                    <ModuleCardPlaceholder
                      slug={item.slug}
                      title={item.displayName}
                      category={item.category}
                    />
                  </div>

                  {/* Content Area */}
                  <div className="event-content-bg relative z-20 -mt-5 rounded-t-[20px] p-6 md:p-8 flex-1 flex flex-col justify-between text-left bg-neutral-900 border-t border-white/10">
                    <div>
                      <h3 className="event-primary-text text-[22px] md:text-[24px] font-bold leading-tight mb-2.5 tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
                        {item.displayName}
                      </h3>
                      <p className="event-subtext text-[15px] line-clamp-3 leading-[1.6] text-neutral-300" style={{ fontFamily: "var(--font-body)" }}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div className="event-card-border border-t border-white/10 flex items-stretch justify-between transition-colors bg-neutral-950">
                    <div className="flex items-center">
                      <span className="event-primary-text text-[12px] md:text-[13px] font-bold tracking-[0.2em] uppercase px-6 md:px-8 text-neutral-300 group-hover:text-sky-400 transition-colors" style={{ fontFamily: "var(--font-heading)" }}>
                        EXPLORE WORKFLOW
                      </span>
                    </div>
                    <div className="event-card-border border-l border-white/10 p-3 md:p-4 flex items-center justify-center">
                      <div className="event-footer-btn w-5 h-5 flex items-center justify-center rounded-[2px] text-white group-hover:text-sky-400">
                        <Plus size={14} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
          </motion.div>
        </div>
      
      </div>
    </div>
  );
};

export default PenguModulesScroll;
