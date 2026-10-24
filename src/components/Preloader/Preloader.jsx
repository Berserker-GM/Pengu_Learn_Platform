import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

export default function Preloader({ onComplete }) {
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = window.setTimeout(() => onCompleteRef.current?.(), 2400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.main
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050b13] px-5 text-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      aria-label="Loading Pengu Learn"
      role="status"
      transition={{ duration: 0.35 }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle, rgba(125,211,252,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050b13]/25 to-[#050b13]" />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
        <motion.div
          className="h-56 w-56 overflow-hidden rounded-[2rem] border border-sky-200/20 bg-slate-900 shadow-[0_20px_90px_rgba(14,165,233,0.2)] sm:h-64 sm:w-64"
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <video
            src="/pengu-preloader.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            aria-label="Pengu Learn animation"
          />
        </motion.div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Pengu Learn</p>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-300">
          <LoaderCircle size={19} className="animate-spin text-sky-300" aria-hidden="true" />
          <span>Getting your workspace ready</span>
        </div>
        <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full origin-left rounded-full bg-sky-300" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 2.2, ease: "easeInOut" }} />
        </div>
      </div>
    </motion.main>
  );
}
