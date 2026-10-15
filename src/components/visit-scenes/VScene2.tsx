"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, NetworkPulse, TypingLog } from "@/components/TechEffects";
import { useVisitSyncState } from "@/lib/useVisitSyncState";
import { getTierCopy, visitorCopy } from "@/lib/visitorCopy";
import { useAudio } from "@/components/AudioSystem";

// Pre-calculated deterministic blip positions (angles & distances from center) for up to 12 entities
const PRESET_BLIPS = [
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

const getBlipForIndex = (idx: number) => {
  if (idx < PRESET_BLIPS.length) return PRESET_BLIPS[idx];
  const angle = (idx * 137.5) % 360; // Golden angle distribution
  const radius = 25 + ((idx * 19) % 60);
  return {
    angle,
    radius,
    id: `ENT-${String(idx + 1).padStart(2, "0")}`,
  };
};

export const VScene2 = () => {
  const { play, isReady } = useAudio();
  const playAudioRef = useRef(play);
  playAudioRef.current = play;

  const { state } = useVisitSyncState("display");
  const guestCount = Math.max(1, state.guestCount || 1);

  // Ticking count for current display
  const [displayTick, setDisplayTick] = useState(1);
  const [isCounting, setIsCounting] = useState(false);
  const [hasEscalated, setHasEscalated] = useState(false);

  useEffect(() => {
    // Single guest case: stable, low-threat, no escalation
    if (guestCount <= 1) {
      setDisplayTick(1);
      setIsCounting(false);
      setHasEscalated(false);
      return;
    }

    // Multiple guests case (> 1):
    // Stage 1: Initial detection of 1 entity
    setDisplayTick(1);
    setIsCounting(false);
    setHasEscalated(false);

    // Stage 2: Trigger escalation warning & count up the entities
    let activeInterval: NodeJS.Timeout | null = null;
    const triggerTimer = setTimeout(() => {
      setHasEscalated(true);
      setIsCounting(true);
      if (isReady) {
        playAudioRef.current("flip-click");
      }

      let current = 1;
      const target = guestCount;
      // Step duration: give viewers enough time to watch digits tick and meter escalate
      const stepDuration = target <= 3 ? 550 : target <= 6 ? 380 : target <= 12 ? 220 : 120;

      activeInterval = setInterval(() => {
        current++;
        setDisplayTick(current);
        if (isReady) {
          playAudioRef.current("flip-click");
        }

        if (current >= target) {
          if (activeInterval) clearInterval(activeInterval);
          setIsCounting(false);
        }
      }, stepDuration);
    }, 750);

    return () => {
      clearTimeout(triggerTimer);
      if (activeInterval) clearInterval(activeInterval);
    };
  }, [guestCount, isReady]);

  // Real-time tier evaluation based on current tick
  const currentTierInfo = useMemo(() => getTierCopy(displayTick), [displayTick]);
  const finalTierInfo = useMemo(() => getTierCopy(guestCount), [guestCount]);

  // Generate blips for all entities up to guestCount (capped at 24 for clean radar display)
  const maxPlotCount = Math.min(24, guestCount);
  const allBlips = useMemo(() => {
    return Array.from({ length: maxPlotCount }, (_, i) => {
      const config = getBlipForIndex(i);
      const rad = (config.angle * Math.PI) / 180;
      const x = 50 + (config.radius * 0.45) * Math.cos(rad);
      const y = 50 + (config.radius * 0.45) * Math.sin(rad);
      return { ...config, x, y };
    });
  }, [maxPlotCount]);

  // Visible blips count up in lockstep with displayTick
  const visibleBlips = useMemo(() => {
    return allBlips.slice(0, Math.min(displayTick, allBlips.length));
  }, [allBlips, displayTick]);

  const headcountTelemetry = useMemo(() => {
    const lines = [
      `Optical gate: ${guestCount} ${guestCount === 1 ? "entity" : "entities"} in perimeter buffer`,
      `Biometric centroid tracking: ACTIVE`,
      `Velocity vector: INBOUND (0.8 m/s)`,
    ];
    if (guestCount > 1) {
      lines.push(`THRESHOLD TRIGGER: GUESTS > 1 DETECTED`);
      lines.push(`THREAT ASSESSMENT MATRIX: ESCALATING IN REAL TIME`);
      lines.push(`STATUS: ${finalTierInfo.tier.toUpperCase()} ESCALATION PROTOCOL APPLIED`);
    } else {
      lines.push(`Single entity buffer lock: STABLE`);
      lines.push(`Threat assessment matrix: BASELINE (LOW)`);
    }
    return lines;
  }, [guestCount, finalTierInfo]);

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center px-[6%] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Background ambient gradient dynamically tied to current threat level */}
      <motion.div 
        className="absolute inset-0 z-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at center, ${currentTierInfo.threatColor}22 0%, transparent 65%)`
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
        <div className="lg:col-span-7 flex flex-col gap-4 text-left">
          
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 bg-red-600/20 border border-red-500/40 text-red-400 font-mono text-xs uppercase tracking-widest rounded-sm animate-pulse">
              {visitorCopy.headcount.liveBadge}
            </span>
            <span className="font-mono text-xs text-gray-500 tracking-wider">
              {visitorCopy.headcount.incursionVector}
            </span>
          </div>

          {/* Escalation Warning Banner (shown when guestCount > 1) */}
          <AnimatePresence>
            {hasEscalated && guestCount > 1 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <div 
                  className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded border font-mono text-xs md:text-sm tracking-wide ${
                    isCounting
                      ? "bg-amber-950/40 border-amber-500/70 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-pulse"
                      : "bg-red-950/40 border-red-500/70 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-amber-400 text-sm md:text-base animate-bounce">⚠</span>
                    <span className="font-bold tracking-wider uppercase">
                      {isCounting
                        ? visitorCopy.headcount.escalatingAlert
                        : visitorCopy.headcount.escalationCompleteBadge(guestCount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span>{isCounting ? "ESCALATING" : "CONFIRMED"}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Big Number Tick & Subline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-4 flex-wrap">
              <SplitFlap 
                text={displayTick.toString().padStart(2, "0")} 
                fontSize="text-6xl md:text-8xl lg:text-9xl font-black" 
                color="text-white text-glow-white" 
                className="justify-start"
                mode="flap"
                flipSpeedMs={45}
              />
              <div className="flex flex-col">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                  {isCounting 
                    ? "INGRESS IN PROGRESS — COUNTING GUESTS" 
                    : guestCount > 1 && !hasEscalated 
                      ? "INITIAL TARGET IDENTIFIED" 
                      : "CONFIRMED HEADCOUNT"}
                </span>
                <span 
                  className="font-mono text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-300"
                  style={{ color: currentTierInfo.threatColor }}
                >
                  {isCounting 
                    ? `COUNTING: ${displayTick} OF ${guestCount} DETECTED`
                    : currentTierInfo.countLabel}
                </span>
              </div>
            </div>

            {/* Tactical Appraisal Box */}
            <motion.div 
              key={`${currentTierInfo.assessment}-${isCounting}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-lg border bg-black/40 backdrop-blur-sm transition-colors duration-500"
              style={{ borderColor: `${currentTierInfo.threatColor}60` }}
            >
              <div className="flex items-center justify-between font-mono text-xs text-gray-400 uppercase tracking-widest mb-1">
                <span>TACTICAL APPRAISAL</span>
                {isCounting && (
                  <span className="text-amber-400 animate-pulse text-[11px] font-bold">
                    ● ESCALATING IN REAL TIME
                  </span>
                )}
              </div>
              <div 
                className="font-mono text-lg md:text-2xl font-black tracking-wide transition-colors duration-300"
                style={{ color: currentTierInfo.threatColor }}
              >
                {isCounting 
                  ? `ESCALATING: ${currentTierInfo.assessment}` 
                  : currentTierInfo.assessment}
              </div>
            </motion.div>
          </div>

          {/* Threat Meter Bar */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="text-gray-400 tracking-wider">THREAT LEVEL METER:</span>
              <span 
                className="font-bold tracking-widest transition-colors duration-300"
                style={{ color: currentTierInfo.threatColor }}
              >
                {currentTierInfo.threatLevelText} ({currentTierInfo.threatMeterPercent}%)
              </span>
            </div>

            {/* Gauge Bar */}
            <div className="w-full h-4 bg-gray-900 border border-gray-700/60 rounded-sm overflow-hidden p-[2px] relative shadow-inner">
              {/* Background gradient zones */}
              <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600" />
              
              <motion.div 
                className="h-full rounded-sm relative transition-colors duration-500"
                style={{ backgroundColor: currentTierInfo.threatColor }}
                animate={{ width: `${currentTierInfo.threatMeterPercent}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
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
            <NetworkPulse color={currentTierInfo.threatColor} size={340} />

            {/* Blip entities plotted on radar */}
            <AnimatePresence>
              {visibleBlips.map((blip, idx) => (
                <motion.div
                  key={blip.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
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
                    style={{ backgroundColor: currentTierInfo.threatColor }}
                  />
                  {/* Blip Identifier Tag */}
                  <span className="absolute -top-4 -left-2 font-mono text-[8px] text-white/80 bg-black/80 px-1 rounded whitespace-nowrap border border-white/20">
                    {blip.id}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Center target crosshair / blip count */}
            <div className="absolute font-mono text-[9px] text-gray-400 bottom-2 right-2 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
              RADAR BLIPS: {displayTick} / {guestCount}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
