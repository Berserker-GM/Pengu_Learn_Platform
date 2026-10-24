import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, Sparkles } from "lucide-react";
import "./Events.css";
import { ModuleCardPlaceholder } from "../Pengu/Placeholders";

const PenguModulesScroll = () => {
  const [filter, setFilter] = useState("ALL");

  const modules = [
    {
      slug: "interactive-labs",
      displayName: "Visual Concept Labs",
      description: "Interactive sandboxes that render algorithms, data flow, mathematics, and systems in real-time. Adjust variables and immediately see mathematical outcomes take shape.",
      shortDescription: "Real-time visual sandboxes with immediate feedback.",
      badge: "LIVE LABS",
      category: "Visual Labs",
      isFlagship: true
    },
    {
      slug: "adaptive-quests",
      displayName: "Adaptive Quests",
      description: "Gamified progression tracks that dynamically calibrate challenge complexity to your personal mastery curve. Gain XP, unlock achievements, and eliminate learning blind spots.",
      shortDescription: "Personalized challenge algorithms that scale with your progress.",
      badge: "ADAPTIVE",
      category: "Quests",
      isFlagship: true
    },
    {
      slug: "offline-suite",
      displayName: "Offline Desktop Core",
      description: "A lightweight, distraction-free desktop application engineered for pure focus. Works 100% offline without mandatory account syncs, telemetry overhead, or web lag.",
      shortDescription: "Native desktop runtime with zero cloud dependencies.",
      badge: "OFFLINE READY",
      category: "Desktop Suite",
      isFlagship: false
    },
    {
      slug: "pengu-companion",
      displayName: "Contextual Guidance",
      description: "Intelligent Socratic prompts and step-by-step conceptual hints designed to stimulate active thinking rather than simply spoiling the final answer.",
      shortDescription: "Smart hints and problem-solving coaching built right in.",
      badge: "SMART HINTS",
      category: "Companion",
      isFlagship: false
    },
  ];

  const filteredModules = modules.filter((m) => {
    if (filter === "ALL") return true;
    if (filter === "CORE LABS") return m.isFlagship;
    if (filter === "PRO MODULES") return !m.isFlagship;
    return true;
  });

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
      id="features"
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
            <span>MODULE SHOWCASE</span>
          </div>

          <h2 
            className="event-primary-text font-bold tracking-tighter max-w-[420px]"
            style={{ fontSize: "clamp(32px, 4vw, 56px)", lineHeight: "1.15", wordSpacing: "0.2em" }}
          >
            How Pengu <br /> Accelerates You
          </h2>

          <p 
            className="event-subtext text-[15px] md:text-[17px] leading-[1.6] max-w-[420px] font-normal mt-1"
            style={{ fontFamily: "var(--font-body)" }}
          >
            A cohesive suite of visual laboratories, interactive algorithmic sandboxes, and adaptive learning tracks engineered to turn complex theory into second nature.
          </p>

          {/* Filter Pills */}
          <div className="event-card-border flex items-center mt-4 border rounded-[6px] w-fit p-[5px] bg-transparent">
            {["ALL", "CORE LABS", "PRO MODULES"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 md:px-5 py-[6px] text-[11px] md:text-[12px] font-semibold tracking-wide transition-colors rounded-[4px] cursor-pointer ${
                  filter === f
                    ? "event-btn-active bg-white text-black"
                    : "event-btn-inactive bg-transparent text-neutral-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <a
            href="#download"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 hover:text-sky-300 mt-4 group"
          >
            <span>Unlock All Modules in Desktop Suite</span>
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
              {filteredModules.map((item) => (
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
                        GET IN SUITE
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
            
            {filteredModules.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="col-span-1 md:col-span-2 py-12 event-subtext text-lg font-medium border border-dashed event-card-border rounded-lg flex items-center justify-center"
              >
                No modules found for this category.
              </motion.div>
            )}
          </motion.div>
        </div>
      
      </div>
    </div>
  );
};

export default PenguModulesScroll;
