"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";
import { Download, Shield, Wifi, Fingerprint } from "lucide-react";

// Animated scanline effect for the badge background
const BadgeScanlines = () => (
  <div
    className="absolute inset-0 pointer-events-none z-[1] opacity-[0.04]"
    style={{
      backgroundImage:
        "repeating-linear-gradient(transparent 0px, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
    }}
  />
);

// Animated radar ring for the badge
const RadarRing = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none"
  >
    {[0, 1, 2].map((i) => (
      <circle
        key={i}
        cx="60"
        cy="60"
        r={20 + i * 18}
        fill="none"
        stroke="#E8604C"
        strokeWidth="0.5"
        strokeDasharray="4 4"
      />
    ))}
    <line x1="60" y1="0" x2="60" y2="120" stroke="#E8604C" strokeWidth="0.3" />
    <line x1="0" y1="60" x2="120" y2="120" stroke="#E8604C" strokeWidth="0.3" />
  </svg>
);

// Fake circuit trace SVG pattern
const CircuitTrace = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 200 40"
    className={`opacity-[0.08] pointer-events-none ${className}`}
    fill="none"
    stroke="#E8604C"
    strokeWidth="0.8"
  >
    <path d="M0 20 H40 L50 10 H80 L90 20 H120 L130 30 H160 L170 20 H200" />
    <circle cx="50" cy="10" r="2" fill="#E8604C" />
    <circle cx="90" cy="20" r="2" fill="#E8604C" />
    <circle cx="130" cy="30" r="2" fill="#E8604C" />
    <circle cx="170" cy="20" r="2" fill="#E8604C" />
  </svg>
);

// Hexagonal badge icon
const HexBadge = () => (
  <svg width="72" height="80" viewBox="0 0 72 80" fill="none">
    <path
      d="M36 2L68 20V60L36 78L4 60V20L36 2Z"
      stroke="#E8604C"
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M36 10L60 24V56L36 70L12 56V24L36 10Z"
      stroke="#E8604C"
      strokeWidth="0.5"
      strokeDasharray="3 3"
      fill="none"
      opacity="0.4"
    />
    <text
      x="36"
      y="38"
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#E8604C"
      fontSize="10"
      fontFamily="monospace"
      fontWeight="bold"
    >
      CWAR
    </text>
    <text
      x="36"
      y="50"
      textAnchor="middle"
      dominantBaseline="middle"
      fill="white"
      fontSize="6"
      fontFamily="monospace"
      opacity="0.5"
    >
      OPERATOR
    </text>
  </svg>
);

export default function BadgePage() {
  const badgeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentTime("16 SEPT 2026");
  }, []);

  const handleDownload = async () => {
    if (!badgeRef.current) return;
    setDownloading(true);

    try {
      const image = await toPng(badgeRef.current, {
        pixelRatio: 3,
        backgroundColor: "#03080A",
      });

      const link = document.createElement("a");
      link.href = image;
      link.download = "nikki-okrah-operator-badge.png";
      link.click();
    } catch (err) {
      console.error("Failed to download badge", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background ambience */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(232,96,76,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center mb-10 z-10"
      >
        <div className="font-mono text-[10px] text-[var(--color-brand-coral)]/60 uppercase tracking-[0.3em] mb-2">
          Certificate of Appointment
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          HONORARY FELLOW OPERATOR
        </h1>
        <div className="mt-2 h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-[var(--color-brand-coral)] to-transparent" />
      </motion.div>

      {/* The Badge */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, rotateX: 15 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ delay: 0.4, duration: 1, type: "spring", damping: 20 }}
        className="z-10 w-full max-w-[380px]"
        style={{ perspective: "1000px" }}
      >
        <div
          ref={badgeRef}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #0D1117 0%, #061114 40%, #0A0E12 100%)",
            boxShadow:
              "0 0 0 1px rgba(232,96,76,0.3), 0 0 60px rgba(232,96,76,0.1), 0 25px 50px -12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
            aspectRatio: "3/4.2",
          }}
        >
          <BadgeScanlines />
          <RadarRing />

          {/* Top edge accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-brand-coral)] to-transparent" />

          <div className="relative z-10 p-7 h-full flex flex-col">
            {/* Header row */}
            <div className="flex justify-between items-start mb-1">
              <HexBadge />
              <div className="text-right space-y-1">
                <div className="flex items-center gap-1.5 justify-end">
                  <Wifi size={10} className="text-[var(--color-brand-green)]" />
                  <span className="font-mono text-[9px] text-[var(--color-brand-green)] uppercase tracking-widest">
                    Active
                  </span>
                </div>
                <div className="font-mono text-[9px] text-white/30">
                  ID: N-0917
                </div>
                <div className="font-mono text-[9px] text-white/20">
                  CLEARANCE: ★★★★★
                </div>
              </div>
            </div>

            {/* Circuit trace decoration */}
            <CircuitTrace className="w-full h-5 my-2" />

            {/* Name block */}
            <div className="mt-2 mb-5">
              <div className="font-mono text-[9px] text-[var(--color-brand-coral)]/70 uppercase tracking-[0.25em] mb-1.5">
                Operator Name
              </div>
              <h2
                className="text-[2rem] font-bold tracking-tight leading-none"
                style={{
                  textShadow: "0 0 20px rgba(232,96,76,0.2)",
                }}
              >
                NIKKI OKRAH
              </h2>
              <div className="mt-2 h-[1px] w-full bg-gradient-to-r from-[var(--color-brand-coral)]/50 to-transparent" />
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 flex-1">
              <div>
                <div className="font-mono text-[8px] text-white/30 uppercase tracking-widest mb-1">
                  Designation
                </div>
                <div className="text-sm font-semibold leading-tight">
                  Founder & CEO
                </div>
                <div className="text-xs text-white/60 mt-0.5">Chaku Foods</div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-white/30 uppercase tracking-widest mb-1">
                  Specialization
                </div>
                <div className="text-sm font-semibold leading-tight">
                  Control Room Ops
                </div>
                <div className="text-xs text-white/60 mt-0.5">
                  Plantain Division 🌱
                </div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-white/30 uppercase tracking-widest mb-1">
                  Field Record
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  40 countries · 3 continents
                  <br />
                  <span className="text-[var(--color-brand-green)]">
                    Does not slow down. Ever.
                  </span>
                </div>
              </div>
              <div>
                <div className="font-mono text-[8px] text-white/30 uppercase tracking-widest mb-1">
                  Network Status
                </div>
                <div className="text-xs text-white/80 leading-relaxed">
                  Global Network of People
                  <br />
                  Who Refuse to Let Things
                  <br />
                  Go to Waste
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="flex justify-between items-end">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Shield
                      size={12}
                      className="text-[var(--color-brand-coral)]"
                    />
                    <span className="font-mono text-[10px] text-[var(--color-brand-coral)] font-bold uppercase tracking-widest">
                      Access: VIP
                    </span>
                  </div>
                  <div className="font-mono text-[9px] text-white/25">
                    ISSUED: {currentTime}
                  </div>
                  <div className="font-mono text-[9px] text-white/25">
                    INCIDENT: #BDAY-001
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <Fingerprint
                      size={14}
                      className="text-[var(--color-brand-coral)]/40"
                    />
                  </div>
                  <div className="font-mono text-[9px] text-white/40">
                    Authorized by
                  </div>
                  <div className="font-mono text-[10px] text-white/60 font-bold">
                    NESTOR FINALO
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom edge accent */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-brand-coral)]/40 to-transparent" />

          {/* Corner notches */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-[var(--color-brand-coral)]/30" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-[var(--color-brand-coral)]/30" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-[var(--color-brand-coral)]/30" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-[var(--color-brand-coral)]/30" />
        </div>
      </motion.div>

      {/* Download Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        onClick={handleDownload}
        disabled={downloading}
        className="mt-10 z-10 group flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-sm uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background:
            "linear-gradient(135deg, rgba(232,96,76,0.9) 0%, rgba(214,60,44,0.9) 100%)",
          boxShadow:
            "0 4px 20px rgba(232,96,76,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        <Download
          size={18}
          className="group-hover:-translate-y-0.5 transition-transform"
        />
        {downloading ? "SAVING..." : "SAVE BADGE TO PHOTOS"}
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="mt-4 text-white/20 font-mono text-[10px] uppercase tracking-widest z-10"
      >
        Hold to save on mobile · Tap to download on desktop
      </motion.p>
    </div>
  );
}
