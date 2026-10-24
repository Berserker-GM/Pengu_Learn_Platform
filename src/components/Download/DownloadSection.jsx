import React, { useCallback, useEffect, useState } from "react";
import { Apple, CheckCircle2, Clock3, Download, Laptop, LockKeyhole, QrCode, ShieldCheck, Terminal } from "lucide-react";

const API = "/api/access";
const QR = import.meta.env.VITE_PAYMENT_QR_URL || "/payment-qr.jpeg";
const TOKEN_KEY = "pengu_download_access_token";
const EMAIL_KEY = "pengu_download_email";
const PLATFORMS = [
  { id: "windows", name: "Windows", detail: "Windows 10 / 11 (64-bit)", extension: ".exe", Icon: Laptop },
  { id: "macos", name: "macOS", detail: "Apple Silicon & Intel", extension: ".dmg", Icon: Apple },
  { id: "linux", name: "Linux", detail: "Ubuntu, Debian, Fedora", extension: ".AppImage", Icon: Terminal },
];

export default function DownloadSection() {
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) || "");
  const [access, setAccess] = useState(null);
  const [promo, setPromo] = useState("");
  const [reference, setReference] = useState("");
  const [seconds, setSeconds] = useState(600);
  const [timerStarted, setTimerStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const token = () => localStorage.getItem(TOKEN_KEY);

  const refresh = useCallback(async () => {
    if (!token()) return;
    try {
      const r = await fetch(`${API}/status`, { headers: { Authorization: `Bearer ${token()}` } });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Could not load access status.");
      setAccess(j.access || null);
    } catch (e) { setNotice(e.message); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!timerStarted || seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [timerStarted, seconds]);
  useEffect(() => {
    if (access?.status !== "pending") return;
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, [access?.status, refresh]);

  const save = j => {
    if (j.accessToken) localStorage.setItem(TOKEN_KEY, j.accessToken);
    if (j.access?.email) { localStorage.setItem(EMAIL_KEY, j.access.email); setEmail(j.access.email); }
    setAccess(j.access || null);
  };
  const applyPromo = async e => {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      const r = await fetch(`${API}/promo`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), code: promo.trim() }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Could not apply promo code.");
      save(j); setPromo(""); setNotice("Promo applied. Free download access is active.");
    } catch (e) { setNotice(e.message); } finally { setBusy(false); }
  };
  const submitPayment = async e => {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      const r = await fetch(`${API}/request`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), paymentReference: reference.trim() }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error || "Could not submit payment.");
      save(j); setNotice("Payment reference submitted. We will review it and enable access.");
    } catch (e) { setNotice(e.message); } finally { setBusy(false); }
  };
  const download = async p => {
    setBusy(true); setNotice("");
    try {
      const r = await fetch(`${API}/download/${p.id}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || "Download failed."); }
      const u = URL.createObjectURL(await r.blob()), a = document.createElement("a");
      a.href = u; a.download = p.id === "windows" ? "PenguLearn-Setup-v2.4.1.exe" : p.id === "macos" ? "PenguLearn-v2.4.1.dmg" : "PenguLearn-v2.4.1.AppImage";
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 30000);
    } catch (e) { setNotice(e.message); } finally { setBusy(false); }
  };

  const approved = access?.status === "approved";
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  return <section id="download" className="relative w-full overflow-hidden border-t border-white/10 bg-black text-white idea-section-wrapper"><div className="min-h-screen py-16"><div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 sm:px-6">
    <h1 className="w-full bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text py-2 text-center text-4xl font-semibold tracking-tight text-transparent sm:text-6xl" style={{ fontFamily: "var(--font-heading)" }}>GET PENGU LEARN</h1>
    <p className="mt-3 max-w-2xl text-center text-sm text-neutral-400 sm:text-base">Lifetime desktop access. Enter your email to continue to payment or redeem a promo code.</p>
    <div className="mt-7 w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-900/80 p-5 sm:p-8">
      <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-sky-400">Lifetime access</p>{access?.source === "promo" ? <p className="mt-2 text-3xl font-black">₹0 <span className="text-base font-medium text-emerald-300">FREE with PENGUNEW</span></p> : <p className="mt-2 text-3xl font-black">$10 <span className="text-base font-medium text-neutral-400">/ ₹950 one-time</span></p>}</div><ShieldCheck size={28} className={approved ? "text-emerald-400" : "text-neutral-500"} /></div>
      {approved ? <p className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200"><CheckCircle2 className="mr-2 inline" />Access approved. Downloads are ready below.</p> : <div className="mt-6 space-y-6">
        <label className="block text-sm font-medium">Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2.5 text-sm text-white" /></label>
        <div className="rounded-xl border border-sky-500/20 bg-black/30 p-4"><h2 className="font-semibold">Have a promo code?</h2><form onSubmit={applyPromo} className="mt-3 flex gap-2"><input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Enter promo code" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white" /><button disabled={busy || !promo.trim() || !email.trim()} className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-bold text-black disabled:opacity-40">Apply</button></form><p className="mt-2 text-xs text-neutral-500">PENGUNEW gives free access.</p></div>
        {access?.status === "pending" ? <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">Payment is awaiting manual review. This page checks for approval automatically.</p> : <div className="border-t border-white/10 pt-5"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 font-semibold"><QrCode size={18} />Pay by UPI</h2>{timerStarted && <span className="flex items-center gap-1 font-mono text-amber-300"><Clock3 size={15} />{clock}</span>}</div>
          {!timerStarted ? <button onClick={() => { if (!email.trim()) return setNotice("Enter your email first."); setTimerStarted(true); setSeconds(600); }} className="mt-4 w-full rounded-xl bg-sky-400 px-4 py-3 font-bold text-black">Continue to payment</button> : <><div className="mt-4 rounded-xl bg-white p-3"><img src={QR} alt="UPI payment QR code" className="mx-auto max-h-[420px] w-auto max-w-full object-contain" /></div><p className="mt-3 text-xs text-neutral-400">Scan and pay ₹950. Enter the UTR/reference below. The timer closes this submission session; it does not verify or cancel a bank payment.</p><form onSubmit={submitPayment} className="mt-4 space-y-3"><input value={reference} onChange={e => setReference(e.target.value)} placeholder="UPI transaction reference / UTR" className="w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2.5 text-sm text-white" /><button type={seconds > 0 ? "submit" : "button"} onClick={seconds <= 0 ? () => { setTimerStarted(true); setSeconds(600); } : undefined} disabled={busy || (seconds > 0 && (reference.trim().length < 6 || !email.trim()))} className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-bold text-black disabled:opacity-40">{seconds <= 0 ? "Start new 10-minute session" : busy ? "Submitting..." : "Submit payment for review"}</button></form></>}</div>}
      </div>}
      {notice && <p role="status" className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-neutral-200">{notice}</p>}
    </div>
    {approved && <div className="mt-8 grid w-full grid-cols-1 gap-4 md:grid-cols-3">{PLATFORMS.map(({ Icon, ...p }) => <article key={p.id} className="flex flex-col justify-between rounded-xl border border-white/10 bg-neutral-900/70 p-5"><div><Icon size={25} className="mb-3 text-sky-400" /><h3 className="font-bold">{p.name}</h3><p className="mt-1 text-xs text-neutral-400">{p.detail}</p><p className="mt-2 font-mono text-xs text-neutral-500">Installer: {p.extension}</p></div><button onClick={() => download(p)} disabled={busy} className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-bold text-black"><Download size={16} />Download</button></article>)}</div>}
    {token() && <p className="mt-5 text-xs text-neutral-500"><LockKeyhole size={13} className="mr-1 inline" />Access is linked to {email || "this browser"}.</p>}
  </div></div></section>;
}
