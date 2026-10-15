"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Download, Truck, CheckCircle2, Building2, MapPin, Hash, Sparkles } from "lucide-react";
import { ROOM_NAME, visitTheme } from "@/lib/visitorCopy";

// Decorative barcode SVG generator based on seed string
const BarcodePattern = ({ code }: { code: string }) => {
  const bars = useMemo(() => {
    // Generate deterministic bar widths based on code
    const pattern: { width: number; space: number }[] = [];
    let sum = 0;
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      pattern.push({ width: (charCode % 3) + 1.5, space: (charCode % 2) + 1 });
      sum += (charCode % 3) + 1.5 + (charCode % 2) + 1;
    }
    // Pad to fill nicely
    while (pattern.length < 24) {
      pattern.push({ width: (pattern.length % 3) + 1.5, space: (pattern.length % 2) + 1.5 });
    }
    return pattern;
  }, [code]);

  return (
    <svg width="100%" height="32" viewBox="0 0 200 32" className="overflow-visible">
      <g fill={visitTheme.textTeal}>
        {bars.reduce<{ elements: React.ReactNode[]; currentX: number }>(
          (acc, bar, i) => {
            acc.elements.push(
              <rect
                key={i}
                x={acc.currentX}
                y="0"
                width={bar.width}
                height="32"
                opacity={0.85}
              />
            );
            acc.currentX += bar.width + bar.space;
            return acc;
          },
          { elements: [], currentX: 2 }
        ).elements}
      </g>
    </svg>
  );
};

export default function VisitorPassPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Editable guest inputs (live preview on card)
  const [guestName, setGuestName] = useState("COLLEAGUE");
  const [homeSite, setHomeSite] = useState("OTHER SITE");
  
  // Random 3-digit pass number generated on page load (no headcount source)
  const [passNumber] = useState(() => {
    const num = Math.floor(Math.random() * 900) + 100;
    return String(num).padStart(3, "0");
  });

  const [dateStr] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).toUpperCase();
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      const image = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: "#061114",
      });

      const link = document.createElement("a");
      link.href = image;
      link.download = `visitor-pass-${passNumber}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to download visitor pass", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#061114] text-white flex flex-col items-center justify-center p-4 md:p-8 font-sans relative overflow-x-hidden">
      
      {/* Background ambient lighting */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, rgba(63, 166, 110, 0.12) 0%, transparent 70%)"
        }}
      />

      {/* Top Header / Instructions */}
      <div className="text-center mb-6 z-10 max-w-md w-full">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase tracking-widest mb-2 font-bold">
          <Sparkles size={12} /> Inbound Colleague Pass
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase font-sans">
          Supply Chain Control Room
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">
          One Team. Many Sites. Tap fields below to customize before saving.
        </p>
      </div>

      {/* Guest Customization Inputs (outside the card) */}
      <div className="z-10 w-full max-w-[380px] mb-6 p-4 rounded-xl bg-gray-900/80 border border-gray-800 shadow-xl grid grid-cols-2 gap-3 backdrop-blur-sm">
        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 tracking-wider mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={guestName}
            maxLength={22}
            onChange={(e) => setGuestName(e.target.value.toUpperCase())}
            placeholder="COLLEAGUE"
            className="w-full bg-black/60 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-400"
          />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase text-gray-400 tracking-wider mb-1">
            Home Site / DC
          </label>
          <input
            type="text"
            value={homeSite}
            maxLength={18}
            onChange={(e) => setHomeSite(e.target.value.toUpperCase())}
            placeholder="OTHER SITE"
            className="w-full bg-black/60 border border-gray-700 rounded px-2.5 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* The Printable Visitor Pass (Portrait Lanyard Card ~3:4.5) */}
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 120 }}
        className="z-10 w-full max-w-[380px] drop-shadow-2xl"
      >
        <div
          ref={cardRef}
          className="relative rounded-2xl overflow-hidden flex flex-col"
          style={{
            backgroundColor: visitTheme.paperBg,
            color: visitTheme.textTeal,
            aspectRatio: "3/4.6",
            boxShadow: visitTheme.cardShadow,
            border: `1px solid ${visitTheme.paperBorder}`,
          }}
        >
          {/* Punched Lanyard Slot at the Top Center */}
          <div className="w-full pt-3 pb-1 flex justify-center items-center bg-[#E8DEC8]/60 border-b border-black/5">
            <div 
              className="w-14 h-3.5 rounded-full bg-[#061114] shadow-inner border border-black/30 flex items-center justify-center"
              style={{
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.8)"
              }}
            />
          </div>

          {/* Header Band: Dark Teal Band */}
          <div className="bg-[#061114] text-white px-6 py-4 flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
            
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold">
                Official Access
              </div>
              <h2 className="text-xl font-black tracking-tight uppercase leading-tight font-sans">
                VISITOR PASS
              </h2>
              <div className="text-[9px] font-mono text-gray-300 uppercase tracking-widest mt-0.5">
                {ROOM_NAME}
              </div>
            </div>

            {/* Inbound Tag & Pass # */}
            <div className="text-right font-mono">
              <div className="text-[9px] text-gray-400 tracking-wider">TAG No.</div>
              <div className="text-sm font-bold text-emerald-400">
                PASS No. 00{passNumber}
              </div>
              <div className="text-[8px] text-gray-400 uppercase tracking-widest mt-0.5">
                INBOUND // DC
              </div>
            </div>
          </div>

          {/* Main Card Body */}
          <div className="p-6 flex-1 flex flex-col justify-between relative">
            
            {/* Top Block: Colleague Name */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-[9px] text-[#061114]/60 uppercase tracking-[0.2em] font-semibold">
                  Visiting Colleague
                </span>
                <span className="font-mono text-[9px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={10} /> Verified Guest
                </span>
              </div>

              <div className="text-2xl font-black uppercase tracking-tight text-[#061114] border-b-2 border-[#061114]/15 pb-2 font-sans truncate">
                {guestName || "COLLEAGUE"}
              </div>
            </div>

            {/* Route Strip: Boarding-Pass Inbound Shipment Style */}
            <div className="my-3 p-3 rounded-lg bg-[#E5DACB]/80 border border-[#061114]/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[8px] font-mono text-[#061114]/50 uppercase tracking-widest font-bold">
                  FROM (ORIGIN)
                </span>
                <span className="font-mono text-xs font-bold text-[#061114] truncate max-w-[110px]">
                  {homeSite || "OTHER SITE"}
                </span>
              </div>

              {/* Dotted Route Line with Truck */}
              <div className="flex-1 flex items-center justify-center px-2">
                <div className="w-full border-t border-dashed border-[#061114]/30 relative flex items-center justify-center">
                  <div className="p-1 rounded-full bg-[#3FA66E] text-white shadow-sm absolute">
                    <Truck size={12} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col text-right">
                <span className="text-[8px] font-mono text-[#061114]/50 uppercase tracking-widest font-bold">
                  TO (DELIVERED)
                </span>
                <span className="font-mono text-xs font-bold text-emerald-800">
                  CONTROL ROOM
                </span>
              </div>
            </div>

            {/* 2-Column Info Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-xs my-2">
              <div className="border-l-2 border-emerald-600 pl-2">
                <div className="text-[8px] text-[#061114]/50 uppercase tracking-widest">
                  Status
                </div>
                <div className="font-bold text-[#061114]">
                  DELIVERED
                </div>
              </div>

              <div className="border-l-2 border-[#061114]/20 pl-2">
                <div className="text-[8px] text-[#061114]/50 uppercase tracking-widest">
                  Designation
                </div>
                <div className="font-bold text-[#061114] truncate">
                  VISITING COLLEAGUE
                </div>
              </div>

              <div className="border-l-2 border-[#061114]/20 pl-2">
                <div className="text-[8px] text-[#061114]/50 uppercase tracking-widest">
                  Date
                </div>
                <div className="font-bold text-[#061114]">
                  {dateStr || "TODAY"}
                </div>
              </div>

              <div className="border-l-2 border-[#061114]/20 pl-2">
                <div className="text-[8px] text-[#061114]/50 uppercase tracking-widest">
                  Host
                </div>
                <div className="font-bold text-[#061114]">
                  SUPPLY CHAIN TEAM
                </div>
              </div>
            </div>

            {/* Handling Note */}
            <div className="font-mono text-[9px] text-[#061114]/70 bg-white/40 px-2 py-1 rounded border border-[#061114]/5 flex justify-between items-center">
              <span>SPECIAL HANDLING:</span>
              <strong className="text-emerald-800 font-bold uppercase tracking-wider">
                FRIENDLY / ONE TEAM
              </strong>
            </div>

            {/* Lower Area: Barcode & ACCESS GRANTED Stamp */}
            <div className="mt-3 pt-2 border-t border-[#061114]/15 relative">
              
              {/* The Stamp: Lands with small thud animation */}
              <motion.div
                initial={{ scale: 2.2, opacity: 0, rotate: -25 }}
                animate={{ scale: 1, opacity: 0.92, rotate: -14 }}
                transition={{ delay: 0.45, type: "spring", damping: 14, stiffness: 220 }}
                className="absolute right-0 bottom-4 pointer-events-none select-none z-20"
              >
                <div 
                  className="px-3 py-1.5 border-2 rounded font-mono font-black uppercase text-center shadow-sm"
                  style={{
                    borderColor: visitTheme.stampGreen,
                    color: visitTheme.stampGreen,
                    backgroundColor: "rgba(46, 139, 87, 0.08)",
                    letterSpacing: "0.15em",
                  }}
                >
                  <div className="text-[7px] tracking-[0.25em] opacity-80">★ AUTHORIZED ★</div>
                  <div className="text-sm font-black leading-none my-0.5">ACCESS GRANTED</div>
                  <div className="text-[6px] tracking-widest opacity-80">ENTRY VALIDATED</div>
                </div>
              </motion.div>

              {/* Decorative Barcode */}
              <div className="w-full max-w-[200px]">
                <BarcodePattern code={`PASS-${passNumber}-${guestName}`} />
                <div className="text-[8px] font-mono text-[#061114]/50 tracking-[0.25em] uppercase mt-0.5">
                  PASS No. 00{passNumber}
                </div>
              </div>

              {/* Tagline Footer */}
              <div className="text-center font-mono text-[9px] font-bold text-[#061114]/70 uppercase tracking-widest mt-2 border-t border-[#061114]/10 pt-1.5">
                ONE TEAM. MANY SITES.
              </div>

            </div>

          </div>
        </div>
      </motion.div>

      {/* Download Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={handleDownload}
        disabled={downloading}
        className="mt-6 z-10 flex items-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider text-white shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #3FA66E 0%, #2D8254 100%)",
          boxShadow: "0 8px 24px rgba(63, 166, 110, 0.35)",
        }}
      >
        <Download size={18} />
        {downloading ? "GENERATING PASS..." : "SAVE PASS (PNG)"}
      </motion.button>

      <p className="mt-3 text-gray-500 font-mono text-[10px] uppercase tracking-widest z-10 text-center">
        Tap to download 3x high-resolution PNG · Ready for printing or phone storage
      </p>

    </div>
  );
}
