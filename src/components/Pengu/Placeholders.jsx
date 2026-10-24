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
  AlertTriangle,
  History,
  TrendingUp,
  Code2,
  Mic,
  MessageSquare,
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
            {isCard1 ? "DESKTOP PET" : isCard2 ? "MEMORY ENGINE" : "INTERVIEW PATH"}
          </span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Center Visual Mockup */}
      <div className="relative z-10 my-auto py-2">
        {isCard2 && (
          <div className="flex flex-col gap-2 p-3 sm:p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-purple-300">
                <History size={13} />
                <span>Repeat Pattern Detected</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">TRACKED</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-neutral-200">
              <div className="text-white font-medium flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
                <span>Off-by-one in binary search</span>
              </div>
              <p className="text-[10px] text-neutral-300 leading-snug pl-4 border-l-2 border-purple-400">
                "You made this same error last week. Check your <code className="text-sky-300">high = mid - 1</code> boundary."
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-white/5">
              <span>Occurrence: 3rd time</span>
              <span className="text-purple-300 font-mono font-semibold">Memory Stored</span>
            </div>
          </div>
        )}

        {isCard3 && (
          <div className="flex flex-col gap-2.5 p-3 sm:p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <PenguPixelAvatar size={20} mood="smile" className="w-5 h-5" />
                <span className="text-[11px] font-semibold text-white">Track Selector</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">READY</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-400/40 text-left">
                <div className="text-[9px] uppercase font-mono text-sky-300">Track 01</div>
                <div className="text-xs font-bold text-white mt-0.5">DSA Problems</div>
                <div className="text-[9px] text-sky-200 mt-1">Arrays • Graphs • DP</div>
              </div>
              <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-left">
                <div className="text-[9px] uppercase font-mono text-purple-300">Track 02</div>
                <div className="text-xs font-bold text-white mt-0.5">System Design</div>
                <div className="text-[9px] text-purple-200 mt-1">Sharding • Caching</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-white/70 pt-1">
              <span>Supports Any Language</span>
              <span className="text-emerald-300 font-mono font-semibold">Python • C++ • TS</span>
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
          <span>Pengu • Live Interview Editor</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
          DSA TRACK
        </span>
      </div>

      {/* Center Simulated Workspace */}
      <div className="my-auto py-3 space-y-3">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-medium">
          <span className="flex items-center gap-2 text-white">
            <BookOpen size={14} className="text-sky-400" /> Problem: Longest Substring Without Repeating
          </span>
          <span className="text-emerald-400 font-mono">Sliding Window</span>
        </div>

        {/* Mock Code with Pengu Speech Bubble Overlay */}
        <div className="rounded-xl bg-black/70 p-4 border border-white/10 font-mono text-xs space-y-1.5 relative overflow-hidden">
          <div className="text-neutral-500">// Your editor opens with problems ready</div>
          <div className="text-sky-300">
            <span className="text-purple-400">def</span> lengthOfLongestSubstring(s: str) -&gt; int:
          </div>
          <div className="pl-4 text-neutral-300">
            seen = {`{}`}
          </div>
          <div className="pl-4 text-neutral-300">
            <span className="text-purple-400">for</span> right <span className="text-purple-400">in</span> range(len(s)):
          </div>
          <div className="pl-8 text-neutral-400">
            # writing solution...
          </div>

          {/* Pengu Speech Bubble in code */}
          <div className="mt-3 p-2.5 rounded-lg bg-sky-950/80 border border-sky-400/40 text-[11px] font-sans flex items-start gap-2 text-sky-200">
            <PenguPixelAvatar size={20} mood="wave" className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sky-300 font-mono text-[10px] block">PENGU (MENTOR):</span>
              "Are you sure that’s the right way to loop here? What happens when you see a duplicate character before the left pointer?"
            </div>
          </div>
        </div>

        {/* Progress feedback */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Methodology</div>
            <div className="text-sm font-bold text-sky-300 mt-1">Asks, Never Tells</div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-neutral-400 uppercase tracking-wider">Interview Goal</div>
            <div className="text-sm font-bold text-emerald-300 mt-1">Intuition &gt; Memorization</div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-3 border-t border-white/10 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 size={12} /> Quietly Watching Your Code
        </span>
        <span>Any Language • Offline Native</span>
      </div>
    </div>
  );
};

// ── 3. About Section Right Dashboard Mockup ──────────────────────────
export const AboutDashboardPlaceholder = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#121829] via-[#0d121f] to-[#070b14] p-5 sm:p-7 flex flex-col justify-between text-white border border-white/10 select-none">
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
        <div>
          <span className="text-[11px] text-sky-400 uppercase tracking-widest font-mono font-bold">PROGRESS & PATTERNS PAGE</span>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
            What You Keep Getting Wrong & What's Improved
          </h3>
        </div>
        <div className="p-1.5 rounded-xl bg-sky-500/15 border border-sky-400/30">
          <PenguPixelAvatar size={28} mood="smile" className="w-7 h-7" />
        </div>
      </div>

      {/* Tracked Mistake Patterns Grid */}
      <div className="space-y-2.5 my-auto py-3">
        {/* Repeat Pattern 1 */}
        <div className="p-3 rounded-xl bg-white/5 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
              <AlertTriangle size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Loop & Array Index Off-by-Ones</div>
              <div className="text-[10px] text-amber-200/80">Made same mistake last week • Pengu flagged 3 times</div>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-400/20">
            NEEDS DRILL
          </span>
        </div>

        {/* Improved Pattern 2 */}
        <div className="p-3 rounded-xl bg-white/5 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <TrendingUp size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Recursion Base Cases & Memoization</div>
              <div className="text-[10px] text-emerald-200/80">Zero forgotten base cases over last 14 problems</div>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-400/20">
            +85% MASTERED
          </span>
        </div>

        {/* 3 Overview Pillars */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center">
            <div className="text-[10px] text-neutral-400 font-mono">DSA TRACK</div>
            <div className="text-base font-bold text-sky-300 mt-0.5">42 / 50</div>
            <div className="text-[9px] text-neutral-400">Problems ready</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center">
            <div className="text-[10px] text-neutral-400 font-mono">REPEATS</div>
            <div className="text-base font-bold text-amber-300 mt-0.5">2 Patterns</div>
            <div className="text-[9px] text-neutral-400">Being tracked</div>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-center">
            <div className="text-[10px] text-neutral-400 font-mono">CONFIDENCE</div>
            <div className="text-base font-bold text-emerald-300 mt-0.5">Round Ready</div>
            <div className="text-[9px] text-neutral-400">Interview prep</div>
          </div>
        </div>
      </div>

      {/* Feature Bullet Strip */}
      <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-400/20 flex items-center justify-between text-xs text-neutral-300">
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span><strong>It remembers:</strong> No more failing rounds without knowing what you kept doing wrong.</span>
        </span>
      </div>
    </div>
  );
};

// ── 4. Module Card Placeholder with Pengu Mascot Avatars ─────────────
export const ModuleCardPlaceholder = ({ slug, title, category }) => {
  const getTheme = () => {
    switch (slug) {
      case "path-selection":
        return {
          mood: "step",
          gradient: "from-sky-900/60 via-slate-900 to-black",
          accent: "text-sky-400",
          border: "border-sky-500/30",
          tag: "STEP 1 • PICK PATH",
          label: "DSA & System Design ready in editor"
        };
      case "socratic-questions":
        return {
          mood: "wave",
          gradient: "from-blue-900/60 via-slate-900 to-black",
          accent: "text-blue-400",
          border: "border-blue-500/30",
          tag: "ASKS INSTEAD OF TELLS",
          label: "Nudges you to find answers yourself"
        };
      case "mistake-patterns":
        return {
          mood: "smile",
          gradient: "from-purple-900/60 via-slate-900 to-black",
          accent: "text-purple-400",
          border: "border-purple-500/30",
          tag: "IT REMEMBERS",
          label: "Tracks repeating mistake patterns"
        };
      case "desktop-companion":
      default:
        return {
          mood: "jump",
          gradient: "from-amber-900/60 via-slate-900 to-black",
          accent: "text-amber-400",
          border: "border-amber-500/30",
          tag: "LIVES ON SCREEN",
          label: "Wanders, naps, jumps & talks anytime"
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
        <span className="font-mono">{theme.label}</span>
        <span className={`font-semibold ${theme.accent}`}>{category}</span>
      </div>
    </div>
  );
};
