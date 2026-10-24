import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, MessageSquare, ArrowRight, Heart } from "lucide-react";
import { PenguPixelAvatar } from "./PenguLogo";

const PENGU_TIPS = [
  {
    mood: "wave",
    message: "Hi there! I'm Pengu, a desktop pet that learns alongside you for coding interviews! 👋",
    action: "See The Idea",
    href: "#the-idea"
  },
  {
    mood: "smile",
    message: "“Are you sure that’s the right way to loop here?” I ask questions to build intuition without spoiling the answer! 💡",
    action: "How It Feels",
    href: "#how-it-feels"
  },
  {
    mood: "jump",
    message: "Choose your operating system and complete checkout to download Pengu Learn!",
    action: "Get Pengu Learn",
    href: "#download"
  },
  {
    mood: "blush",
    message: "I remember repeat mistakes! If you made the same error last week, I'll flag it so you don't fail your interview rounds. 🧠",
    action: "See Mistake Tracking",
    href: "#the-idea"
  },
  {
    mood: "step",
    message: "You can talk to me anytime by typing or voice. I answer briefly like a friend, not a lecture! 🎙️",
    action: "Download Desktop App",
    href: "#download"
  }
];

export const PenguBuddy = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isWiggling, setIsWiggling] = useState(false);

  // Automatically pop up a friendly welcome speech bubble after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsOpen(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [hasInteracted]);

  const currentTip = PENGU_TIPS[tipIndex];

  const handleNextTip = () => {
    setHasInteracted(true);
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);
    setTipIndex((prev) => (prev + 1) % PENGU_TIPS.length);
    if (!isOpen) setIsOpen(true);
  };

  const handleActionClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
      window.history.pushState(null, "", href);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999990] flex flex-col items-end pointer-events-auto select-none">
      {/* Speech Bubble */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-3 w-72 sm:w-80 p-4 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-sky-400/30 text-white shadow-[0_10px_35px_rgba(0,0,0,0.5)] relative"
          >
            {/* Close speech bubble button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2.5 right-2.5 p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Close message"
            >
              <X size={14} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1.5">
              <Sparkles size={13} />
              <span>Pengu Companion</span>
            </div>

            {/* Message */}
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
              {currentTip.message}
            </p>

            {/* Actions Bar */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
              <a
                href={currentTip.href}
                onClick={(e) => handleActionClick(e, currentTip.href)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <span>{currentTip.action}</span>
                <ArrowRight size={12} />
              </a>

              <button
                onClick={handleNextTip}
                className="text-[11px] font-mono text-neutral-400 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
              >
                Next Tip 🐾
              </button>
            </div>

            {/* Bubble Tail Pointing Down */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-neutral-900 border-r border-b border-sky-400/30 rotate-45 transform" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Mascot Floating Button */}
      <motion.button
        onClick={handleNextTip}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isWiggling ? { rotate: [0, -12, 12, -8, 8, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="relative group p-2.5 rounded-full bg-gradient-to-br from-sky-500/25 via-neutral-900 to-indigo-600/30 border border-sky-400/40 shadow-[0_8px_25px_rgba(56,189,248,0.3)] backdrop-blur-md cursor-pointer flex items-center justify-center"
        aria-label="Talk with Pengu"
        title="Click to talk with Pengu!"
      >
        {/* Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-sky-400/20 animate-ping opacity-75 pointer-events-none" />

        {/* Dynamic Sprite Avatar */}
        <PenguPixelAvatar
          size={42}
          className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-md"
          mood={currentTip.mood}
        />

        {/* Small Active Badge */}
        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </span>
      </motion.button>
    </div>
  );
};

export default PenguBuddy;
