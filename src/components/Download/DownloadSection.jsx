import React, { useState } from "react";
import { Clock3, QrCode, ShieldCheck, TicketCheck } from "lucide-react";

const API = "/api/access/promo";
const QR = import.meta.env.VITE_PAYMENT_QR_URL || "/payment-qr.jpeg";

export default function DownloadSection() {
  const [promo, setPromo] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const downloadWithPromo = async event => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promo.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Promo code could not be applied.");
      window.location.assign(result.downloadUrl);
    } catch (error) {
      setNotice(error.message);
      setBusy(false);
    }
  };

  return (
    <section id="download" className="relative w-full overflow-hidden border-t border-white/10 bg-black text-white idea-section-wrapper">
      <div className="min-h-screen py-16">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 sm:px-6">
          <h1 className="w-full bg-gradient-to-br from-white via-neutral-200 to-neutral-400 bg-clip-text py-2 text-center text-4xl font-semibold tracking-tight text-transparent sm:text-6xl" style={{ fontFamily: "var(--font-heading)" }}>GET PENGU LEARN</h1>
          <p className="mt-3 max-w-2xl text-center text-sm text-neutral-400 sm:text-base">Scan the QR to pay ₹950, or enter your promo code for a free download.</p>

          <div className="mt-7 w-full max-w-xl rounded-2xl border border-white/10 bg-neutral-900/80 p-5 sm:p-8">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-widest text-sky-400">Lifetime access</p><p className="mt-2 text-3xl font-black">$10 <span className="text-base font-medium text-neutral-400">/ ₹950 one-time</span></p></div>
              <ShieldCheck size={28} className="text-neutral-500" />
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <h2 className="flex items-center gap-2 font-semibold"><QrCode size={18} />Pay by UPI</h2>
              <div className="mt-4 rounded-xl bg-white p-3"><img src={QR} alt="UPI payment QR code" className="mx-auto max-h-[420px] w-auto max-w-full object-contain" /></div>
              <p className="mt-3 text-center text-xs text-neutral-400">Scan with any UPI app to pay. Payment is reviewed manually.</p>
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <h2 className="flex items-center gap-2 font-semibold"><TicketCheck size={18} />Have a promo code?</h2>
              <form onSubmit={downloadWithPromo} className="mt-3 flex gap-2">
                <input aria-label="Promo code" value={promo} onChange={event => setPromo(event.target.value)} placeholder="Enter promo code" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2.5 text-sm text-white" />
                <button type="submit" disabled={busy || !promo.trim()} className="rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-bold text-black disabled:opacity-40">{busy ? "Preparing..." : "Download"}</button>
              </form>
              <p className="mt-2 text-xs text-neutral-500"><Clock3 size={12} className="mr-1 inline" />PENGUNEW starts the download immediately.</p>
            </div>
            {notice && <p role="status" className="mt-4 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">{notice}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
