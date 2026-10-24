import React from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import { PenguIcon } from "../Pengu/PenguLogo";
import "./Footer.css";

const links = [
  { label: "The Idea", href: "#the-idea" },
  { label: "How It Works", href: "#how-it-feels" },
  { label: "Download", href: "#download" },
];

export default function Footer() {
  return (
    <div id="footer" className="footer-shell">
      <footer className="relative isolate overflow-hidden border-t border-white/10 bg-[#07111f] px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-12">
        <div className="pointer-events-none absolute -right-24 -top-40 -z-10 h-[28rem] w-[28rem] rounded-full bg-sky-500/15 blur-[100px]" />
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl border border-sky-300/20 bg-sky-300/10 p-2.5 text-sky-300"><PenguIcon size={30} /></div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.24em] text-sky-300">Pengu Learn</p>
                  <p className="mt-1 text-xs text-slate-400">A thoughtful coding companion</p>
                </div>
              </div>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
                Better questions make <span className="text-sky-300">better developers.</span>
              </h2>
            </div>
            <a href="#download" className="inline-flex w-fit items-center gap-3 rounded-full bg-sky-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-200">
              Get Pengu Learn <ArrowUpRight size={17} />
            </a>
          </div>

          <div className="grid gap-10 py-9 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Explore</h3>
              <nav className="mt-4 flex flex-col items-start gap-3">
                {links.map((link) => <a key={link.href} href={link.href} className="footer-new-link inline-flex items-center gap-2 text-sm text-slate-200">{link.label}<ArrowUpRight size={14} /></a>)}
              </nav>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Get in touch</h3>
              <a href="mailto:support@pengulearn.com" className="footer-new-link mt-4 inline-flex items-center gap-2 text-sm text-slate-200">
                <Mail size={16} /> support@pengulearn.com
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Copyright (c) 2026 Pengu Learn | AI Builders Day (Polaris)</span>
            <span>Version 2.4.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
