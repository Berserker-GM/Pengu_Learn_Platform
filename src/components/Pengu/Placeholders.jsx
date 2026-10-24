import React from "react";
import { 
  Sparkles, 
  Terminal, 
  Cpu, 
  Zap, 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Activity, 
  WifiOff, 
  Award, 
  Compass, 
  ShieldCheck, 
  Play
} from "lucide-react";
import { PenguPixelAvatar } from "./PenguLogo";

// ── 1. Hero Rotating Cards Placeholder ──────────────────────────────
export const HeroCardPlaceholder = ({ card }) => {
  const isCard1 = card.id === 1;
  const isCard2 = card.id === 2;
  const isCard3 = card.id === 3;

  return (
    <div className="w-full h-full p-5 sm:p-6 flex flex-col justify-between text-white select-none relative overflow-hidden">
      {/* Background Subtle Pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "20px 20px"
        }}
      />

      {/* Top Bar with Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
          <span className="text-sm">{card.emoji}</span>
          <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">
            {isCard1 ? "LABS" : isCard2 ? "ADAPTIVE" : "OFFLINE"}
          </span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Center Visual Mockup */}
      <div className="relative z-10 my-auto py-2">
        {isCard1 && (
          <div className="flex flex-col gap-2.5 p-3 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-[11px] font-mono text-white/80 flex items-center gap-1.5">
                <Terminal size={12} className="text-sky-300" /> ~/interactive-lab.pengu
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">LIVE</span>
            </div>
            <div className="space-y-1.5 font-mono text-[10px] sm:text-[11px] text-white/90">
              <div className="flex items-center gap-2">
                <span className="text-yellow-300">const</span>
                <span className="text-sky-300">concept</span> = <span className="text-emerald-300">"NeuralNodes"</span>;
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-300">await</span> Pengu.simulate(concept);
              </div>
            </div>
            {/* Visual simulation bar */}
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden mt-1">
              <div className="bg-gradient-to-r from-sky-400 to-indigo-300 h-full w-4/5 rounded-full" />
            </div>
          </div>
        )}

        {isCard2 && (
          <div className="flex flex-col gap-2.5 p-3 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenguPixelAvatar size={24} mood="jump" className="w-6 h-6" />
                <span className="text-[11px] font-semibold text-white/90">Quest: Logic Trees</span>
              </div>
              <span className="text-[10px] font-bold text-amber-300">+250 XP</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {["Basic", "Branching", "Pruning"].map((stage, i) => (
                <div 
                  key={stage} 
                  className={`py-1.5 px-1 rounded-lg text-center text-[9px] sm:text-[10px] font-medium border ${
                    i < 2 
                      ? "bg-purple-500/30 border-purple-400/40 text-purple-200" 
                      : "bg-white/5 border-white/10 text-white/50"
                  }`}
                >
                  {stage}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-white/70 pt-1">
              <span>Adaptive Difficulty</span>
              <span className="text-emerald-300 font-semibold">Tier 4 Active</span>
            </div>
          </div>
        )}

        {isCard3 && (
          <div className="flex flex-col gap-2.5 p-3 sm:p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenguPixelAvatar size={24} mood="stand" className="w-6 h-6" />
                <span className="text-[11px] font-semibold text-white/90">Zero-Cloud Desktop</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-200 font-mono">OFFLINE</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-orange-300" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold">Native Latency</span>
                  <span className="text-[9px] text-white/60">0ms local runtime</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 font-mono">144 FPS</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Text */}
      <div className="relative z-10">
        <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-0.5">
          {card.title}
        </h4>
        <p className="text-xs sm:text-sm text-white/80 font-medium">
          {card.subtitle}
        </p>
      </div>
    </div>
  );
};

// ── 2. About Section Left Workspace Mockup ──────────────────────────
export const AboutWorkspacePlaceholder = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0c1222] via-[#0b101b] to-[#050811] flex flex-col justify-between p-5 sm:p-6 text-white border border-white/10 select-none">
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
          <PenguPixelAvatar size={18} mood="smile" className="w-4 h-4" />
          <span>Pengu Learn Desktop Studio</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
          v2.4
        </span>
      </div>

      {/* Center Simulated Workspace */}
      <div className="my-auto py-4 space-y-3.5">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
          <span className="flex items-center gap-2 text-white">
            <BookOpen size={14} className="text-sky-400" /> Active Simulation
          </span>
          <span className="text-sky-400 font-mono">Chapter 04 • Algorithms</span>
        </div>

        {/* Mock Code / Interactive Node Board */}
        <div className="rounded-xl bg-black/60 p-4 border border-white/10 font-mono text-xs space-y-2">
          <div className="text-neutral-500">// Interactive sandbox running locally</div>
          <div className="text-sky-300 flex items-center gap-1.5">
            <span className="text-purple-400">pengu</span>.solveGraph({`{`}
          </div>
          <div className="pl-4 text-emerald-300">
            nodes: <span className="text-amber-300">128</span>,
          </div>
          <div className="pl-4 text-emerald-300">
            speed: <span className="text-amber-300">"60fps"</span>,
          </div>
          <div className="pl-4 text-emerald-300">
            visualizer: <span className="text-sky-400">true</span>
          </div>
          <div className="text-sky-300">{`}`});</div>
        </div>

        {/* Visual Progress Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Concept Retention</div>
            <div className="text-xl font-bold text-sky-400 mt-1">94.8%</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Interactive Drills</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">42 / 42</div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-white/10 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 size={12} /> Ready for Offline Learning
        </span>
        <span>Local Memory: 48MB</span>
      </div>
    </div>
  );
};

// ── 3. About Section Right Dashboard Mockup ──────────────────────────
export const AboutDashboardPlaceholder = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#121829] via-[#0d121f] to-[#070b14] p-6 sm:p-8 flex flex-col justify-between text-white border border-white/10 select-none">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] text-sky-400 uppercase tracking-widest font-bold">PENGU ARCHITECTURE</span>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
            Designed for Active Mastery
          </h3>
        </div>
        <div className="p-1.5 rounded-xl bg-sky-500/15 border border-sky-400/30">
          <PenguPixelAvatar size={28} mood="smile" className="w-7 h-7" />
        </div>
      </div>

      {/* Visual Roadmap / Metric Pillars */}
      <div className="grid grid-cols-3 gap-3 my-auto py-4">
        {[
          { label: "Visual Models", metric: "120+", icon: Layers, color: "text-sky-400" },
          { label: "Hands-on Labs", metric: "350+", icon: Activity, color: "text-emerald-400" },
          { label: "Zero Distractions", metric: "100%", icon: ShieldCheck, color: "text-amber-400" },
        ].map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
            <item.icon className={`w-5 h-5 ${item.color} mb-1.5`} />
            <span className="text-lg sm:text-xl font-bold text-white tracking-tight">{item.metric}</span>
            <span className="text-[10px] text-neutral-400 font-medium mt-0.5">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Feature Bullet Strip */}
      <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-400/20 flex items-center justify-between text-xs text-neutral-300">
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400" />
          Adaptive feedback adapts dynamically to each learner's mistakes.
        </span>
      </div>
    </div>
  );
};

// ── 4. Module Card Placeholder with Pengu Mascot Avatars ─────────────
export const ModuleCardPlaceholder = ({ slug, title, category }) => {
  const getTheme = () => {
    switch (slug) {
      case "interactive-labs":
        return {
          mood: "step",
          gradient: "from-sky-900/60 via-slate-900 to-black",
          accent: "text-sky-400",
          border: "border-sky-500/30",
          tag: "VISUAL EXPERIMENTS"
        };
      case "adaptive-quests":
        return {
          mood: "jump",
          gradient: "from-purple-900/60 via-slate-900 to-black",
          accent: "text-purple-400",
          border: "border-purple-500/30",
          tag: "PROGRESS ENGINE"
        };
      case "offline-suite":
        return {
          mood: "stand",
          gradient: "from-amber-900/60 via-slate-900 to-black",
          accent: "text-amber-400",
          border: "border-amber-500/30",
          tag: "ZERO INTERNET NEEDED"
        };
      case "pengu-companion":
      default:
        return {
          mood: "wave",
          gradient: "from-emerald-900/60 via-slate-900 to-black",
          accent: "text-emerald-400",
          border: "border-emerald-500/30",
          tag: "CONTEXTUAL GUIDANCE"
        };
    }
  };

  const theme = getTheme();

  return (
    <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} p-6 flex flex-col justify-between border-b ${theme.border} select-none relative overflow-hidden`}>
      {/* Background Grid Accent */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
      />

      {/* Top Tag & Avatar */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/10">
          {theme.tag}
        </span>
        <div className="p-1.5 rounded-xl bg-white/10 backdrop-blur-md">
          <PenguPixelAvatar size={24} mood={theme.mood} className="w-6 h-6" />
        </div>
      </div>

      {/* Center Mascot Artwork */}
      <div className="relative z-10 flex items-center justify-center py-2">
        <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl">
          <PenguPixelAvatar size={64} mood={theme.mood} className="w-16 h-16 drop-shadow-lg" />
        </div>
      </div>

      {/* Bottom Category Info */}
      <div className="relative z-10 flex items-center justify-between text-xs text-neutral-400">
        <span className="font-mono">Module Specification</span>
        <span className={`font-semibold ${theme.accent}`}>{category || "Core Platform"}</span>
      </div>
    </div>
  );
};
