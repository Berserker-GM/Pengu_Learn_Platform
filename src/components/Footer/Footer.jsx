import React, { useRef, useEffect } from 'react';
import { Mail, ArrowUpRight, Github, Twitter, Disc as Discord } from 'lucide-react';
import { PenguIcon } from '../Pengu/PenguLogo';
import './Footer.css';

// ─── Desktop Footer Component ──────────────────────────────────────────────────
const DesktopFooter = () => {
  return (
    <footer className="w-full bg-black text-white hidden md:flex flex-col transition-all duration-300" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Top Section */}
      <div className="flex w-full min-h-[380px] border-b border-[#222]">

        {/* ── Left Column ── */}
        <div className="w-[32%] flex flex-col justify-between border-r border-[#1f1f1f]" style={{ padding: '40px 48px 32px 48px' }}>
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center p-2 backdrop-blur-md">
                <PenguIcon size={32} className="text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-white text-[20px] lg:text-[22px] tracking-[-0.02em] leading-[1.15] uppercase font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  PENGU LEARN
                </h3>
                <p className="text-sky-400 text-[12px] tracking-[0.2em] font-mono font-medium uppercase mt-0.5">
                  DESKTOP CODING PET
                </p>
              </div>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
              The desktop pet that learns alongside you. Quietly watches as you practice, asks mentor questions, and remembers recurring mistake patterns for interview prep.
            </p>
          </div>

          {/* Bottom: Contact & Support */}
          <div className="flex flex-col gap-2 pt-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">Contact & Support</span>
            <a href="mailto:support@pengulearn.com" className="text-white text-[16px] leading-[1.5] hover:text-sky-400 transition-colors underline-hover-ltr flex items-center gap-2">
              <Mail size={16} /> support@pengulearn.com
            </a>
            <div className="flex gap-[16px] mt-2">
              <a href="https://github.com/Vansh-Baranwal/Pengu_Learn_Platform" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-neutral-400 hover:text-white transition-all">
                <Discord className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ── Middle Column: Nav Links ── */}
        <div className="w-[34%] flex flex-col border-r border-[#1f1f1f]">
          {[
            { name: 'THE IDEA', href: '#the-idea', hoverColor: '#38bdf8' },
            { name: 'HOW IT WORKS', href: '#how-it-feels', hoverColor: '#38bdf8' },
            { name: 'DOWNLOAD PRODUCT', href: '#download', hoverColor: '#38bdf8' },
            { name: 'REDEEM VOUCHER', href: '#download', hoverColor: '#f59e0b' },
          ].map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="group flex items-center justify-between border-b border-[#1f1f1f] text-white transition-colors duration-250 footer-nav-link"
              style={{ padding: '34px 44px', '--link-hover-color': link.hoverColor }}
            >
              <div className="flex items-center gap-[10px]">
                <span className="text-[14px] font-semibold uppercase tracking-[0.05em]">
                  {link.name}
                </span>
                <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={2} />
              </div>
            </a>
          ))}
          <div className="flex-1 bg-black" />
        </div>

        {/* ── Right Column: Statement ── */}
        <div className="w-[34%] flex items-center justify-center text-center bg-gradient-to-br from-neutral-950 to-black" style={{ padding: '40px 48px 32px 48px' }}>
          <h2
            className="text-[40px] lg:text-[48px] xl:text-[56px] font-black text-white/95 tracking-tighter leading-[0.98]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            ASKS.
            <br />
            <span className="text-sky-400">NOT TELLS.</span>
            <br />
            <span className="text-white/60">REMEMBERS.</span>
          </h2>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full px-12 py-5 flex items-center justify-between text-xs text-neutral-500 border-t border-[#1a1a1a]">
        <span>© 2026 Pengu Learn. Built for AI Builders Day (Polaris).</span>
        <span>Version 2.4.1 (Stable Release)</span>
      </div>
    </footer>
  );
};

// ─── Spring Wave Canvas (Mobile) ─────────────────────────────────────────────────────────
const SpringWaveCanvas = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(false);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const COLS = 50;
    const ROWS = 16;
    const points = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        points.push({
          x: (c / (COLS - 1)) * width,
          y: (r / (ROWS - 1)) * height,
          baseX: (c / (COLS - 1)),
          baseY: (r / (ROWS - 1)),
          vx: 0, vy: 0,
          dx: 0, dy: 0,
        });
      }
    }

    const obs = new IntersectionObserver(([e]) => {
      isVisibleRef.current = e.isIntersecting;
    }, { threshold: 0.05 });
    obs.observe(canvas);

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', handleMouse);

    let time = 0;
    const SPRING = 0.015;
    const DAMPING = 0.92;
    const MOUSE_RADIUS = 180;
    const MOUSE_STRENGTH = 12;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (!isVisibleRef.current) return;

      time += 0.008;
      resize();

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const targetX = p.baseX * width;
        const targetY = p.baseY * height;

        const wave1 = Math.sin(p.baseX * 4 + time * 1.2) * Math.cos(p.baseY * 3 + time * 0.8) * 6;
        const wave2 = Math.cos(p.baseX * 2.5 - time * 0.9) * Math.sin(p.baseY * 5 + time * 1.1) * 4;
        const wave3 = Math.sin((p.baseX + p.baseY) * 3 + time * 0.6) * 3;

        p.dx = wave1 + wave2;
        p.dy = wave3 + wave1 * 0.5;

        const ddx = targetX + p.dx - mx;
        const ddy = targetY + p.dy - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
          p.dx += (ddx / dist) * force;
          p.dy += (ddy / dist) * force;
        }

        p.vx += (p.dx - (p.x - targetX)) * SPRING;
        p.vy += (p.dy - (p.y - targetY)) * SPRING;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x = targetX + (p.x - targetX) + p.vx;
        p.y = targetY + (p.y - targetY) + p.vy;
      }

      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#000000');
      bgGrad.addColorStop(1, '#050b14');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      for (let r = 0; r < ROWS - 1; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          const i = r * COLS + c;
          const p0 = points[i];
          const p1 = points[i + 1];
          const p2 = points[i + COLS];
          const p3 = points[i + COLS + 1];

          const brightness = 0.03 + Math.sin(p0.baseX * 6 + time) * 0.015;
          ctx.fillStyle = `rgba(56, 189, 248, ${brightness})`;
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.closePath();
          ctx.fill();

          if (r % 3 === 0) {
            ctx.strokeStyle = `rgba(255, 255, 255, 0.06)`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
        }
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      obs.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

// ─── Mobile Footer Component ───────────────────────────────────────────────────
const MobileFooter = () => {
  const navLinks = [
    { name: 'The Idea', href: '#the-idea' },
    { name: 'How It Works', href: '#how-it-feels' },
    { name: 'Download Product ($19)', href: '#download' },
    { name: 'Redeem Voucher', href: '#download' },
  ];

  return (
    <footer className="relative overflow-hidden bg-black" style={{ fontFamily: 'var(--font-heading)' }}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <SpringWaveCanvas />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Big Statement */}
        <div className="px-6 sm:px-10 lg:px-16 pt-16 pb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white/95 tracking-tighter leading-[0.98] max-w-4xl mx-auto text-center">
            ASKS.
            <br />
            <span className="text-sky-400">NOT TELLS.</span>
            <br />
            <span className="text-white/60">REMEMBERS.</span>
          </h2>
        </div>

        {/* Divider */}
        <div className="mx-6 sm:mx-10 lg:mx-16 h-px bg-white/15" />

        {/* Main Grid */}
        <div className="px-6 sm:px-10 py-10 space-y-8">
          {/* Brand */}
          <div className="flex items-center gap-3 justify-center">
            <PenguIcon size={28} className="text-white" />
            <div>
              <h3 className="text-white font-bold text-lg tracking-tight leading-none">PENGU LEARN</h3>
              <p className="text-sky-400 text-[10px] font-mono tracking-[0.2em] uppercase">v2.4 DESKTOP</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col items-center gap-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-white/80 hover:text-white text-sm font-semibold tracking-wide flex items-center gap-1.5"
              >
                <span>{link.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </a>
            ))}
          </div>

          {/* Contact */}
          <div className="flex justify-center">
            <a
              href="mailto:support@pengulearn.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/90 text-xs font-mono transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              support@pengulearn.com
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mx-6 h-px bg-white/10" />
        <div className="px-6 py-6 text-center">
          <p className="text-white/40 text-xs">
            © 2026 Pengu Learn • AI Builders Day (Polaris)
          </p>
        </div>
      </div>
    </footer>
  );
};

// ─── Main Footer ───────────────────────────────────────────────────────────────
const Footer = () => {
  return (
    <div id="footer">
      <div className="dark-mode-footer-divider" aria-hidden="true" />
      <div className="hidden md:block">
        <DesktopFooter />
      </div>
      <div className="block md:hidden">
        <MobileFooter />
      </div>
    </div>
  );
};

export default Footer;
