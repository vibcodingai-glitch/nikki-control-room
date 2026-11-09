"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

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
  const completedRef = useRef(false);

  useEffect(() => {
    const durationMs = 2600 * speedMultiplier;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / durationMs) * 100);
      setScanProgress(progress);

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
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center select-none">
      
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

      {/* The Full-Screen Photographic Banner: Edge-to-Edge, 100% Unwarped, Zero Facial Distortion */}
      <div
        className="w-full h-full z-10"
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

      {/* Sweeping Full-Height Laser Beam with Cyan/Emerald Edge Bloom */}
      {!isLocked && scanProgress < 100 && (
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{
            left: `${scanProgress}%`,
            transform: "translateX(-50%)",
          }}
        >
          {/* Core Razor Laser Line */}
          <div className="w-[3px] h-full bg-cyan-200 shadow-[0_0_15px_#22d3ee,0_0_30px_#34d399,0_0_50px_rgba(63,166,110,0.9)]" />

          {/* Glowing Laser Halo */}
          <div className="absolute top-0 bottom-0 -left-8 w-16 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent blur-md" />

          {/* Top and Bottom Target Guides on Laser Beam */}
          <div className="absolute top-2 -left-2 w-5 h-2.5 border-t-2 border-x border-cyan-300 font-mono text-[9px] text-cyan-300 flex items-center justify-center">
            ▼
          </div>
          <div className="absolute bottom-2 -left-2 w-5 h-2.5 border-b-2 border-x border-cyan-300 font-mono text-[9px] text-cyan-300 flex items-center justify-center">
            ▲
          </div>
        </div>
      )}

      {/* Tactical HUD Header Overlays (discreet in corners, zero obstruction of faces/text) */}
      <div className="absolute top-3 left-4 md:left-8 z-30 font-mono text-[10px] md:text-xs text-emerald-400/90 tracking-widest flex items-center gap-2 pointer-events-none bg-black/60 px-3 py-1 rounded border border-emerald-500/30 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>CWAR CONTROL ROOM // OPTICAL RECONSTRUCTION</span>
      </div>

      <div className="absolute top-3 right-4 md:right-8 z-30 font-mono text-[10px] md:text-xs tracking-widest pointer-events-none bg-black/60 px-3 py-1 rounded border border-emerald-500/30 backdrop-blur-sm">
        {isLocked ? (
          <span className="text-emerald-400 font-bold">✓ 4 VIPs IDENTIFIED</span>
        ) : (
          <span className="text-cyan-300">SYNTHESIS: {Math.round(scanProgress)}%</span>
        )}
      </div>

      {/* Subtle Ambient Scanline Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.015] to-transparent pointer-events-none z-20" />
    </div>
  );
};
