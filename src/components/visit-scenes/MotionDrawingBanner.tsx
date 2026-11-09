"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VipTarget {
  id: string;
  name: string;
  title: string;
  xPct: number; // percentage from left
  yPct: number; // percentage from top (face center)
  triggerPct: number; // when laser passes this X percentage
}

const VIP_TARGETS: VipTarget[] = [
  {
    id: "navratil",
    name: "PHILLIP NAVRATIL",
    title: "C.E.O, NESTLÉ S.A",
    xPct: 18.5,
    yPct: 34,
    triggerPct: 18,
  },
  {
    id: "ejel",
    name: "REMY EJEL",
    title: "ZONE AOA, C.E.O",
    xPct: 40.5,
    yPct: 33,
    triggerPct: 40,
  },
  {
    id: "manz",
    name: "ANNA MANZ",
    title: "CHIEF FINANCIAL OFFICER",
    xPct: 62.5,
    yPct: 32,
    triggerPct: 62,
  },
  {
    id: "royer",
    name: "MAXENCE DE ROYER",
    title: "CHIEF OF STAFF, NESTLÉ S.A",
    xPct: 84.5,
    yPct: 33,
    triggerPct: 84,
  },
];

interface MotionDrawingBannerProps {
  onFormComplete?: () => void;
  speedMultiplier?: number;
}

export const MotionDrawingBanner: React.FC<MotionDrawingBannerProps> = ({
  onFormComplete,
  speedMultiplier = 1.0,
}) => {
  // scanProgress runs from 0 to 100%
  const [scanProgress, setScanProgress] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTargets, setActiveTargets] = useState<Record<string, boolean>>({});
  const completedRef = useRef(false);

  useEffect(() => {
    const durationMs = 2600 * speedMultiplier;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setScanProgress(progress);

      // Trigger target HUD locks as laser sweeps over them
      VIP_TARGETS.forEach((target) => {
        if (progress >= target.triggerPct) {
          setActiveTargets((prev) => (prev[target.id] ? prev : { ...prev, [target.id]: true }));
        }
      });

      if (progress >= 100) {
        clearInterval(interval);
        setIsLocked(true);
        if (!completedRef.current) {
          completedRef.current = true;
          onFormComplete?.();
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [speedMultiplier, onFormComplete]);

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* HUD Chassis Container with 16:9 Aspect Ratio */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-emerald-500/40 bg-black/80 shadow-[0_0_60px_rgba(63,166,110,0.22)] backdrop-blur-md">
        
        {/* Holographic Background Grid & Tech Lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(63, 166, 110, 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(63, 166, 110, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />

        {/* The Photographic Banner: Revealed via Laser Mask Wipe (100% UNWARPED & ZERO FACIAL DISTORTION) */}
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage: `url('/visitor/guest-banner.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitMaskImage: isLocked
              ? "none"
              : `linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${scanProgress}%, rgba(0,0,0,0) ${Math.min(100, scanProgress + 1.8)}%)`,
            maskImage: isLocked
              ? "none"
              : `linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${scanProgress}%, rgba(0,0,0,0) ${Math.min(100, scanProgress + 1.8)}%)`,
          }}
        />

        {/* Sweeping Laser Beam with Cyan/Emerald Edge Bloom */}
        {!isLocked && scanProgress < 100 && (
          <div
            className="absolute top-0 bottom-0 z-20 pointer-events-none"
            style={{
              left: `${scanProgress}%`,
              transform: "translateX(-50%)",
            }}
          >
            {/* Core Razor Laser Line */}
            <div className="w-[3px] h-full bg-cyan-200 shadow-[0_0_12px_#22d3ee,0_0_24px_#34d399,0_0_40px_rgba(63,166,110,0.9)]" />

            {/* Glowing Laser Halo */}
            <div className="absolute top-0 bottom-0 -left-6 w-12 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent blur-sm" />

            {/* Top and Bottom Target Guides on Laser Beam */}
            <div className="absolute top-1 -left-2 w-5 h-2 border-t-2 border-x border-cyan-300 font-mono text-[8px] text-cyan-300 flex items-center justify-center">
              ▼
            </div>
            <div className="absolute bottom-1 -left-2 w-5 h-2 border-b-2 border-x border-cyan-300 font-mono text-[8px] text-cyan-300 flex items-center justify-center">
              ▲
            </div>
          </div>
        )}

        {/* 4x Tactical Facial Recognition HUD Reticles */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {VIP_TARGETS.map((target) => {
            const isActive = activeTargets[target.id];
            if (!isActive) return null;

            return (
              <motion.div
                key={target.id}
                initial={{ opacity: 0, scale: 1.35 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute"
                style={{
                  left: `${target.xPct}%`,
                  top: `${target.yPct}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Facial Bounding HUD Bracket (delicately framing the face without obscuring it) */}
                <div className="relative w-16 h-20 md:w-20 md:h-24">
                  {/* Corner Reticles */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />

                  {/* Micro Tech HUD Label */}
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 border border-emerald-500/60 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-mono text-emerald-300 font-bold tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  >
                    [ + ] VIP CLEARANCE
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tactical HUD Frame Accents */}
        <div className="absolute top-2 left-3 z-30 font-mono text-[9px] md:text-[10px] text-emerald-400/80 tracking-widest flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>CWAR FEED // OPTICAL RECONSTRUCTION</span>
        </div>

        <div className="absolute top-2 right-3 z-30 font-mono text-[9px] md:text-[10px] text-emerald-400/80 tracking-widest pointer-events-none">
          {isLocked ? (
            <span className="text-emerald-400 font-bold">✓ 4 VIPs IDENTIFIED</span>
          ) : (
            <span className="text-cyan-300">SYNTHESIS: {Math.round(scanProgress)}%</span>
          )}
        </div>

        {/* Corner HUD Brackets */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none z-30" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none z-30" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none z-30" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none z-30" />

        {/* Subtle Ambient Scanline Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent pointer-events-none z-20" />
      </div>
    </div>
  );
};
