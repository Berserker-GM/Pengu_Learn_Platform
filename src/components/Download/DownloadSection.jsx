import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Ticket, 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  Laptop, 
  Apple, 
  Terminal, 
  AlertCircle,
  X,
  PartyPopper
} from "lucide-react";
import { LampContainer } from "../ui/lamp";
import { PenguPixelAvatar } from "../Pengu/PenguLogo";

const VALID_VOUCHERS = [
  "PENGUFREE",
  "POLARIS2026",
  "EARLYBIRD",
  "VIPACCESS",
  "PENGU",
  "BUILDER",
  "FREEPASS",
  "STUDENT100"
];

export const DownloadSection = () => {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem("pengu_license_unlocked") === "true";
  });
  const [licenseKey, setLicenseKey] = useState(() => {
    return localStorage.getItem("pengu_license_key") || "";
  });
  const [copiedKey, setCopiedKey] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState("");

  useEffect(() => {
    if (isUnlocked && !licenseKey) {
      const generated = "PL-VIP-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      setLicenseKey(generated);
      localStorage.setItem("pengu_license_key", generated);
    }
  }, [isUnlocked, licenseKey]);

  // Internal voucher redemption via URL param (e.g. ?voucher=PENGUFREE)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const voucherParam = params.get("voucher");
    if (voucherParam && !isUnlocked) {
      const cleaned = voucherParam.trim().toUpperCase();
      if (VALID_VOUCHERS.includes(cleaned)) {
        const newKey = "PL-" + cleaned + "-" + Math.random().toString(36).substring(2, 7).toUpperCase();
        localStorage.setItem("pengu_license_unlocked", "true");
        localStorage.setItem("pengu_license_key", newKey);
        setIsUnlocked(true);
        setLicenseKey(newKey);
        // Clean the URL
        window.history.replaceState({}, "", window.location.pathname + window.location.hash);
      }
    }
  }, []);

  const handleMockPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const newKey = "PL-PAID-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      localStorage.setItem("pengu_license_unlocked", "true");
      localStorage.setItem("pengu_license_key", newKey);
      setIsUnlocked(true);
      setLicenseKey(newKey);
      setIsProcessingPayment(false);
      setIsPaymentModalOpen(false);
    }, 1200);
  };

  const handleResetAccess = () => {
    localStorage.removeItem("pengu_license_unlocked");
    localStorage.removeItem("pengu_license_key");
    setIsUnlocked(false);
    setLicenseKey("");
    setDownloadSuccessNotice("");
  };

  const copyLicenseToClipboard = () => {
    if (licenseKey) {
      navigator.clipboard.writeText(licenseKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const triggerDownload = (os, filename) => {
    if (!isUnlocked) {
      alert("Please complete payment to unlock the download!");
      return;
    }

    const content = `================================================
PENGU LEARN DESKTOP PET - RELEASE v2.4.1
================================================
Target OS: ${os}
License Key: ${licenseKey || "PL-VERIFIED-LIFETIME"}
Status: Activated & Verified

Thank you for downloading Pengu Learn!
To start your learning journey:
1. Run the installer for ${os}.
2. Enter your personal license key above when prompted.
3. Open your favorite code editor—Pengu will wander, watch quietly, ask Socratic questions, and track your recurring mistake patterns.

Features included:
- Desktop mascot living on screen (wanders, naps, jumps)
- DSA & System Design tracks
- Socratic mentor questions ("Asks, not tells")
- Recurring mistake pattern tracking
- Voice & text chat anytime
- Any language: Python, C++, Java, JS/TS, Go, Rust

Support: support@pengulearn.com
Website: https://github.com/Vansh-Baranwal/Pengu_Learn_Platform
================================================`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessNotice(`Started download for ${os} (${filename})!`);
    setTimeout(() => setDownloadSuccessNotice(""), 6000);
  };

  return (
    <section id="download" className="relative bg-black text-white w-full overflow-hidden border-t border-white/10 idea-section-wrapper">
      <LampContainer 
        className="min-h-screen py-16" 
        contentClassName="-translate-y-8 sm:-translate-y-16 md:-translate-y-48 lg:-translate-y-56"
      >
        <div className="w-full max-w-5xl px-4 sm:px-6 mx-auto flex flex-col items-center">
          
          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0.5, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
            style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 4.25rem)', fontWeight: 600 }}
            className="w-full bg-gradient-to-br from-white via-neutral-200 to-neutral-400 py-2 bg-clip-text text-center tracking-tight text-transparent font-medium uppercase"
          >
            GET PENGU LEARN
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-center text-neutral-400 text-sm sm:text-base max-w-2xl font-normal leading-relaxed mt-2"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            Built for students and job seekers preparing for coding interviews who study alone and want personal guidance without paying $100+/hr for a human tutor.
          </motion.p>

          {/* Status Pill Badge */}
          <div className="mt-6 flex items-center gap-2">
            {isUnlocked ? (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(52,211,153,0.25)] animate-bounce-subtle">
                <PenguPixelAvatar size={20} mood="jump" className="w-5 h-5" />
                <span>Product Unlocked & Verified • Ready to Download!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
                <Lock size={14} className="text-amber-400" />
                <span>Download Locked — Complete Payment Below</span>
              </div>
            )}
          </div>

          {/* Celebration Video Banner when Unlocked */}
          <AnimatePresence>
            {isUnlocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full mt-6 p-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-emerald-950/60 to-black border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  {/* Embedded Looping Jumping Pengu Video */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-emerald-400/40 shadow-md">
                    <video
                      src="/pengu/pengu-jump.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                      <PartyPopper size={14} />
                      <span>Celebration Mode Activated!</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                      Pengu is thrilled to learn with you!
                    </h4>
                    <p className="text-xs text-neutral-300">
                      Your lifetime license has been verified. Choose your OS below to download.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-emerald-400/30 text-center sm:text-right">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Status</div>
                  <div className="text-xs font-mono font-bold text-emerald-400">UNLIMITED ACCESS</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pricing Card */}
          <div className="w-full mt-8 max-w-xl mx-auto">
            
            {/* Payment Card */}
            <div className={`p-6 sm:p-8 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
              isUnlocked 
                ? "bg-neutral-900/60 border-white/10 opacity-75" 
                : "bg-neutral-900/90 border-sky-500/30 shadow-[0_0_30px_rgba(56,189,248,0.1)]"
            }`}>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-widest text-sky-400 font-bold">
                    LIFETIME ACCESS
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-semibold">
                    ONE-TIME
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-4xl sm:text-5xl font-black text-white" style={{ fontFamily: "var(--font-heading)" }}>
                    $19
                  </span>
                  <span className="text-sm text-neutral-400 line-through">$49</span>
                  <span className="text-xs text-emerald-400 font-semibold ml-1">60% OFF</span>
                </div>

                <ul className="mt-6 space-y-2.5 text-xs sm:text-sm text-neutral-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>Desktop pet living on screen (Windows, macOS & Linux)</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>DSA & System Design tracks ready in your editor</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>Socratic mentor prompts: asks instead of tells</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>Tracks recurring mistake patterns across weeks</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>Talk anytime by typing or voice like a friend</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <span>Works with any programming language</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                {isUnlocked ? (
                  <div className="w-full py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-semibold text-center text-sm flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Access Granted
                  </div>
                ) : (
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="w-full py-3.5 px-6 rounded-xl bg-white text-black font-bold text-sm tracking-wide uppercase hover:bg-neutral-200 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    <CreditCard size={16} />
                    <span>Pay $19 & Unlock Product</span>
                  </button>
                )}
              </div>

              {/* License Key Display (If Unlocked) */}
              {isUnlocked && licenseKey && (
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                    <span className="font-medium flex items-center gap-1">
                      <Sparkles size={12} className="text-emerald-400" />
                      <span>Your Activated License Key:</span>
                    </span>
                    <button 
                      onClick={copyLicenseToClipboard}
                      className="text-sky-400 hover:text-sky-300 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedKey ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedKey ? "Copied" : "Copy Key"}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-black/60 border border-emerald-400/30 text-emerald-300 font-mono text-xs sm:text-sm font-bold tracking-wider text-center">
                    {licenseKey}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Download Options Section */}
          <div className="w-full mt-10 p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                  <Download size={20} className={isUnlocked ? "text-emerald-400" : "text-neutral-500"} />
                  <span>Download Pengu Learn Installers</span>
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Official build v2.4.1 • Compatible with 64-bit systems
                </p>
              </div>

              {isUnlocked ? (
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold self-start sm:self-auto flex items-center gap-1.5">
                  <PenguPixelAvatar size={16} mood="jump" className="w-4 h-4" />
                  <span>DOWNLOAD PERMITTED</span>
                </span>
              ) : (
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold self-start sm:self-auto flex items-center gap-1.5">
                  <Lock size={12} /> LOCKED
                </span>
              )}
            </div>

            {/* Notification when download starts */}
            {downloadSuccessNotice && (
              <div className="my-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs sm:text-sm font-medium flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span>{downloadSuccessNotice}</span>
              </div>
            )}

            {/* OS Download Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Windows Card */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                isUnlocked 
                  ? "bg-white/5 border-white/15 hover:border-sky-400/50" 
                  : "bg-black/30 border-white/5 opacity-60"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Laptop size={24} className="text-sky-400" />
                    <PenguPixelAvatar size={22} mood="smile" className="w-5 h-5 opacity-80" />
                  </div>
                  <h4 className="text-base font-bold text-white">Windows</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Windows 10 / 11 (64-bit)</p>
                  <p className="text-[11px] font-mono text-neutral-500 mt-2">Installer: .exe (~84.5 MB)</p>
                </div>
                <button
                  onClick={() => triggerDownload("Windows", "PenguLearn-Setup-v2.4.1.exe")}
                  disabled={!isUnlocked}
                  className={`mt-5 w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isUnlocked
                      ? "bg-sky-500 hover:bg-sky-400 text-black cursor-pointer shadow-md hover:shadow-sky-500/25"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {isUnlocked ? <Download size={14} /> : <Lock size={14} />}
                  <span>{isUnlocked ? "Download .exe" : "Locked"}</span>
                </button>
              </div>

              {/* macOS Card */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                isUnlocked 
                  ? "bg-white/5 border-white/15 hover:border-sky-400/50" 
                  : "bg-black/30 border-white/5 opacity-60"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Apple size={24} className="text-neutral-200" />
                    <PenguPixelAvatar size={22} mood="blush" className="w-5 h-5 opacity-80" />
                  </div>
                  <h4 className="text-base font-bold text-white">macOS</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Apple Silicon & Intel</p>
                  <p className="text-[11px] font-mono text-neutral-500 mt-2">Disk Image: .dmg (~91.2 MB)</p>
                </div>
                <button
                  onClick={() => triggerDownload("macOS", "PenguLearn-v2.4.1.dmg")}
                  disabled={!isUnlocked}
                  className={`mt-5 w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isUnlocked
                      ? "bg-sky-500 hover:bg-sky-400 text-black cursor-pointer shadow-md hover:shadow-sky-500/25"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {isUnlocked ? <Download size={14} /> : <Lock size={14} />}
                  <span>{isUnlocked ? "Download .dmg" : "Locked"}</span>
                </button>
              </div>

              {/* Linux Card */}
              <div className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                isUnlocked 
                  ? "bg-white/5 border-white/15 hover:border-sky-400/50" 
                  : "bg-black/30 border-white/5 opacity-60"
              }`}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Terminal size={24} className="text-amber-400" />
                    <PenguPixelAvatar size={22} mood="step" className="w-5 h-5 opacity-80" />
                  </div>
                  <h4 className="text-base font-bold text-white">Linux</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Ubuntu, Debian, Fedora</p>
                  <p className="text-[11px] font-mono text-neutral-500 mt-2">AppImage: .AppImage (~78.0 MB)</p>
                </div>
                <button
                  onClick={() => triggerDownload("Linux", "PenguLearn-v2.4.1.AppImage")}
                  disabled={!isUnlocked}
                  className={`mt-5 w-full py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isUnlocked
                      ? "bg-sky-500 hover:bg-sky-400 text-black cursor-pointer shadow-md hover:shadow-sky-500/25"
                      : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                  }`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {isUnlocked ? <Download size={14} /> : <Lock size={14} />}
                  <span>{isUnlocked ? "Download .AppImage" : "Locked"}</span>
                </button>
              </div>

            </div>

            {/* Helper link for testing */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 pt-4 border-t border-white/5">
              <span>Checksum SHA-256 available in release notes.</span>
              {isUnlocked && (
                <button
                  onClick={handleResetAccess}
                  className="text-neutral-400 hover:text-white underline cursor-pointer transition-colors"
                >
                  Reset license status (for testing lock state)
                </button>
              )}
            </div>
          </div>

        </div>
      </LampContainer>

      {/* Mock Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-2xl bg-neutral-900 border border-white/20 p-6 sm:p-7 text-white shadow-2xl relative"
            >
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="p-1 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center">
                  <PenguPixelAvatar size={32} mood="wave" className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                    Checkout • Pengu Learn
                  </h3>
                  <p className="text-xs text-neutral-400">Secure simulated payment gateway</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 mb-5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">Lifetime Product License</div>
                  <div className="text-[11px] text-neutral-400">Desktop Suite (Win/Mac/Linux)</div>
                </div>
                <div className="text-xl font-bold text-sky-400 font-mono">$19.00</div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Card Number (Demo)
                  </label>
                  <input
                    type="text"
                    disabled
                    value="•••• •••• •••• 4242"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-300 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                      Expiry
                    </label>
                    <input
                      type="text"
                      disabled
                      value="12 / 28"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      disabled
                      value="•••"
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-neutral-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleMockPayment}
                disabled={isProcessingPayment}
                className="w-full py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-black font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Transaction...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Complete $19.00 Payment</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-neutral-500 mt-3">
                Demo simulation mode. No real charge will occur.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DownloadSection;
