"use client";

import React, { useEffect, useState, useMemo } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, NetworkPulse, TypingLog } from "@/components/TechEffects";
import { useVisitSyncState } from "@/lib/useVisitSyncState";
import { getTierCopy } from "@/lib/visitorCopy";

// Pre-calculated deterministic blip positions (angles & distances from center) for up to 12 entities
const BLIP_CONFIGS = [
  { angle: 45, radius: 45, id: "ENT-01" },
  { angle: 210, radius: 55, id: "ENT-02" },
  { angle: 120, radius: 35, id: "ENT-03" },
  { angle: 300, radius: 65, id: "ENT-04" },
  { angle: 170, radius: 50, id: "ENT-05" },
  { angle: 30, radius: 75, id: "ENT-06" },
  { angle: 250, radius: 40, id: "ENT-07" },
  { angle: 95, radius: 60, id: "ENT-08" },
  { angle: 340, radius: 48, id: "ENT-09" },
  { angle: 190, radius: 70, id: "ENT-10" },
  { angle: 80, radius: 80, id: "ENT-11" },
  { angle: 280, radius: 32, id: "ENT-12" },
];

export const VScene2 = () => {
  const { state } = useVisitSyncState("display");
  const guestCount = Math.max(1, state.guestCount || 1);

  // Ticking count from 0 up to guestCount
  const [currentTick, setCurrentTick] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = guestCount;
    // Tick up dynamically over ~1.2s or 60ms per tick
    const stepDuration = Math.max(40, Math.min(120, 1200 / (target || 1)));
    
    const interval = setInterval(() => {
      start++;
      if (start <= target) {
        setCurrentTick(start);
      } else {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [guestCount]);

  const tierInfo = useMemo(() => getTierCopy(guestCount), [guestCount]);
  const blipCount = Math.min(12, guestCount);

  const activeBlips = useMemo(() => {
    return BLIP_CONFIGS.slice(0, blipCount).map((b) => {
      const rad = (b.angle * Math.PI) / 180;
      const x = 50 + (b.radius * 0.45) * Math.cos(rad);
      const y = 50 + (b.radius * 0.45) * Math.sin(rad);
      return { ...b, x, y };
    });
  }, [blipCount]);

  const headcountTelemetry = [
    `Optical gate: ${guestCount} ${guestCount === 1 ? "entity" : "entities"} in perimeter buffer`,
    `Biometric centroid tracking: ACTIVE`,
    `Velocity vector: INBOUND (0.8 m/s)`,
    `Threat assessment matrix updated: ${tierInfo.threatLevelText}`,
    `Escalation status: ${tierInfo.tier.toUpperCase()}`,
  ];

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center px-[6%] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Background ambient gradient tied to tier threat level */}
      <motion.div 
        className="absolute inset-0 z-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at center, ${tierInfo.threatColor}22 0%, transparent 65%)`
        }}
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      <TerminalScanBackground color="text-[var(--color-brand-red)]" opacity="opacity-20" intervalMs={100} />

      {/* Hex dumps on right edge */}
      <HexDumpStream side="right" color="text-red-500/10" speed={100} lines={50} />

      {/* Typing telemetry — bottom left */}
      <div className="absolute bottom-10 left-8 z-20 w-[380px] pointer-events-none">
        <TypingLog 
          messages={headcountTelemetry} 
          color="text-red-400/50" 
          typingSpeed={20} 
          lineDelay={700} 
        />
      </div>

      {/* Main Grid: Left side metrics & tier copy, Right side Radar with blips */}
      <div className="z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Headcount & Threat Evaluation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-400 font-mono text-xs uppercase tracking-widest rounded-sm animate-pulse">
              ● ENTITY COUNTER LIVE
            </span>
            <span className="font-mono text-xs text-gray-500 tracking-wider">
              INCURSION VECTOR: PRIMARY ACCESS
            </span>
          </div>

          {/* Big Number Tick & Subline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-4 flex-wrap">
              <SplitFlap 
                text={currentTick.toString().padStart(2, "0")} 
                fontSize="text-6xl md:text-8xl lg:text-9xl font-black" 
                color="text-white text-glow-white" 
                className="justify-start"
                mode="flap"
                flipSpeedMs={45}
              />
              <div className="flex flex-col">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                  Confirmed Headcount
                </span>
                <span className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-red-400">
                  {tierInfo.countLabel}
                </span>
              </div>
            </div>

            {/* Tier Assessment Copy */}
            <motion.div 
              key={tierInfo.assessment}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-lg border bg-black/40 backdrop-blur-sm"
              style={{ borderColor: `${tierInfo.threatColor}60` }}
            >
              <div className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-1">
                TACTICAL APPRAISAL
              </div>
              <div 
                className="font-mono text-lg md:text-2xl font-black tracking-wide"
                style={{ color: tierInfo.threatColor }}
              >
                {tierInfo.assessment}
              </div>
            </motion.div>
          </div>

          {/* Threat Meter Bar */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="text-gray-400 tracking-wider">THREAT LEVEL METER:</span>
              <span 
                className="font-bold tracking-widest"
                style={{ color: tierInfo.threatColor }}
              >
                {tierInfo.threatLevelText} ({tierInfo.threatMeterPercent}%)
              </span>
            </div>

            {/* Gauge Bar */}
            <div className="w-full h-4 bg-gray-900 border border-gray-700/60 rounded-sm overflow-hidden p-[2px] relative shadow-inner">
              {/* Background gradient zones */}
              <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600" />
              
              <motion.div 
                className="h-full rounded-sm relative"
                style={{ backgroundColor: tierInfo.threatColor }}
                initial={{ width: 0 }}
                animate={{ width: `${tierInfo.threatMeterPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>

            <div className="flex justify-between font-mono text-[9px] text-gray-600 px-1">
              <span>0% LOW</span>
              <span>50% MODERATE</span>
              <span>75% ELEVATED</span>
              <span>100% CRITICAL</span>
            </div>
          </div>

        </div>

        {/* Right Column: Radar Scan with blips (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative w-[300px] h-[300px] md:w-[360px] md:h-[360px] flex items-center justify-center">
            
            {/* Base Radar Pulse */}
            <NetworkPulse color={tierInfo.threatColor} size={340} />

            {/* Blip entities plotted on radar */}
            <AnimatePresence>
              {activeBlips.map((blip, idx) => (
                <motion.div
                  key={blip.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
                >
                  {/* Blip Ping Ring */}
                  <motion.div
                    className="absolute -inset-3 rounded-full border border-red-500"
                    animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6, delay: (idx % 4) * 0.3 }}
                  />
                  {/* Blip Core Dot */}
                  <div 
                    className="w-3.5 h-3.5 rounded-full shadow-[0_0_12px_#EF4444] border border-white"
                    style={{ backgroundColor: tierInfo.threatColor }}
                  />
                  {/* Blip Identifier Tag */}
                  <span className="absolute -top-4 -left-2 font-mono text-[8px] text-white/80 bg-black/80 px-1 rounded whitespace-nowrap border border-white/20">
                    {blip.id}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Center target crosshair */}
            <div className="absolute font-mono text-[9px] text-gray-500 bottom-2 right-2">
              RADAR BLIPS: {blipCount} / {guestCount}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
