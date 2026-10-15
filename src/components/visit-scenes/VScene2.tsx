"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, NetworkPulse, TypingLog } from "@/components/TechEffects";
import { useVisitSyncState } from "@/lib/useVisitSyncState";
import { ESCALATION_STAGES, EscalationStageConfig, visitorCopy } from "@/lib/visitorCopy";
import { useAudio } from "@/components/AudioSystem";

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

const ALL_BLIPS = BLIP_CONFIGS.map((b) => {
  const rad = (b.angle * Math.PI) / 180;
  const x = 50 + b.radius * 0.45 * Math.cos(rad);
  const y = 50 + b.radius * 0.45 * Math.sin(rad);
  return { ...b, x, y };
});

export const VScene2 = () => {
  const { play, setBeepGap, volume, isReady } = useAudio();
  const { state } = useVisitSyncState("display");
  const fastMode = state.fastMode;

  // Track current stage: 0 = A, 1 = B, 2 = C, 3 = D, 4 = E
  const [stageIndex, setStageIndex] = useState(0);
  const currentStage: EscalationStageConfig = ESCALATION_STAGES[stageIndex] || ESCALATION_STAGES[0];

  // Visual effects
  const [counterDisplay, setCounterDisplay] = useState("01");
  const [activeBlipCount, setActiveBlipCount] = useState(1);
  const [isGlitching, setIsGlitching] = useState(false);
  const [screenShake, setScreenShake] = useState(false);

  // Audio helpers via refs to avoid stale closures
  const playRef = useRef(play);
  playRef.current = play;
  const setBeepGapRef = useRef(setBeepGap);
  setBeepGapRef.current = setBeepGap;
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  // Timings scale for fast mode
  const scale = fastMode ? 0.65 : 1.0;

  // Main Self-Running Escalation Timeline (12s total; ~7.8s in Fast Mode)
  useEffect(() => {
    // Stage A starts immediately
    setStageIndex(0);
    setCounterDisplay("01");
    setActiveBlipCount(1);
    setBeepGapRef.current(ESCALATION_STAGES[0].beepGap);
    volumeRef.current("alert-beep", ESCALATION_STAGES[0].beepVolume);

    const durA = ESCALATION_STAGES[0].durationMs * scale;
    const durB = ESCALATION_STAGES[1].durationMs * scale;
    const durC = ESCALATION_STAGES[2].durationMs * scale;
    const durD = ESCALATION_STAGES[3].durationMs * scale;

    const tAtoB = durA;
    const tBtoC = tAtoB + durB;
    const tCtoD = tBtoC + durC;
    const tDtoE = tCtoD + durD;

    const timeouts: NodeJS.Timeout[] = [];
    const intervals: NodeJS.Timeout[] = [];

    // Trigger glitch + flip-click utility
    const triggerStageTransition = (nextIndex: number) => {
      setStageIndex(nextIndex);
      const stage = ESCALATION_STAGES[nextIndex];
      setBeepGapRef.current(stage.beepGap);
      volumeRef.current("alert-beep", stage.beepVolume);

      setIsGlitching(true);
      const glitchTimeout = setTimeout(() => setIsGlitching(false), 140);
      timeouts.push(glitchTimeout);

      if (isReady) {
        playRef.current("flip-click");
      }
    };

    // Transition to Stage B (2s)
    timeouts.push(
      setTimeout(() => {
        triggerStageTransition(1);
        setCounterDisplay("02");
        setActiveBlipCount(2);
      }, tAtoB)
    );

    // Transition to Stage C (4s)
    timeouts.push(
      setTimeout(() => {
        triggerStageTransition(2);
        setCounterDisplay("03");
        setActiveBlipCount(4);
      }, tBtoC)
    );

    // Transition to Stage D (6s): counter races 04..09 faster and faster, blips keep spawning
    timeouts.push(
      setTimeout(() => {
        triggerStageTransition(3);

        const raceSteps = [
          { text: "04", blips: 5, delay: 0 },
          { text: "05", blips: 6, delay: 420 * scale },
          { text: "06", blips: 8, delay: 780 * scale },
          { text: "07", blips: 9, delay: 1080 * scale },
          { text: "08", blips: 11, delay: 1320 * scale },
          { text: "09", blips: 12, delay: 1520 * scale },
          { text: "11", blips: 12, delay: 1700 * scale },
          { text: "??", blips: 12, delay: 1850 * scale },
          { text: "09", blips: 12, delay: 1980 * scale },
          { text: "??", blips: 12, delay: 2100 * scale },
        ];

        raceSteps.forEach(({ text, blips, delay }) => {
          timeouts.push(
            setTimeout(() => {
              setCounterDisplay(text);
              setActiveBlipCount(blips);
              if (isReady) {
                playRef.current("flip-click");
              }
            }, delay)
          );
        });
      }, tCtoD)
    );

    // Transition to Stage E (9s): glitches into "??" and holds, dense blips, screen shake
    timeouts.push(
      setTimeout(() => {
        triggerStageTransition(4);
        setCounterDisplay("??");
        setActiveBlipCount(12);

        // Screen shake + glitch flash
        setScreenShake(true);
        timeouts.push(setTimeout(() => setScreenShake(false), 500));
      }, tDtoE)
    );

    return () => {
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [scale, isReady]);

  // Active blips plotted on radar
  const visibleBlips = useMemo(() => {
    return ALL_BLIPS.slice(0, Math.min(activeBlipCount, ALL_BLIPS.length));
  }, [activeBlipCount]);

  const telemetryLines = useMemo(() => [
    "Perimeter optical scan: ACTIVE",
    "Biometric centroid tracking: MULTIPLE SIGNALS DETECTED",
    "Velocity vector: INBOUND (1.2 m/s)",
    "Headcount resolution: UNSTABLE — INGRESS ACCELERATING",
    "Threat assessment matrix: CRITICAL ESCALATION PROTOCOL",
    "Telemetry stream: ARCHIVING EVENT LOG #VISIT-001",
  ], []);

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center px-[6%] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={screenShake ? { 
        opacity: 1,
        x: [-12, 12, -8, 8, -4, 4, -2, 2, 0],
        y: [-5, 5, -3, 3, 0],
      } : { opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: screenShake ? 0.45 : 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Glitch Flash Overlay */}
      {isGlitching && (
        <div className="absolute inset-0 pointer-events-none z-50 bg-white/20 mix-blend-screen" />
      )}

      {/* Background ambient gradient dynamically tied to current stage threat color */}
      <motion.div 
        className="absolute inset-0 z-0 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at center, ${currentStage.meterColor}28 0%, transparent 68%)`
        }}
        animate={{ opacity: currentStage.id === "D" || currentStage.id === "E" ? [0.25, 0.55, 0.25] : [0.15, 0.35, 0.15] }}
        transition={{ duration: currentStage.id === "E" ? 1.2 : 2, repeat: Infinity, ease: "easeInOut" }}
      />

      <TerminalScanBackground color="text-[var(--color-brand-red)]" opacity="opacity-20" intervalMs={100} />

      {/* Hex dumps on right edge */}
      <HexDumpStream side="right" color="text-red-500/10" speed={100} lines={50} />

      {/* Typing telemetry — bottom left */}
      <div className="absolute bottom-10 left-8 z-20 w-[380px] pointer-events-none">
        <TypingLog 
          messages={telemetryLines} 
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

          {/* Self-Running Stage Indicator Banner */}
          <div className={`flex items-center justify-between gap-3 px-4 py-2 rounded border font-mono text-xs md:text-sm tracking-wide transition-colors duration-500 ${
            currentStage.id === "E"
              ? "bg-red-950/60 border-red-500 text-red-300 shadow-[0_0_25px_rgba(239,68,68,0.35)]"
              : currentStage.id === "D"
              ? "bg-amber-950/50 border-amber-500 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse"
              : currentStage.id === "C"
              ? "bg-orange-950/40 border-orange-500/60 text-orange-300"
              : "bg-emerald-950/30 border-emerald-500/50 text-emerald-300"
          }`}>
            <div className="flex items-center gap-2.5">
              <span className={`text-base ${currentStage.id === "E" ? "text-red-400 animate-bounce" : "text-amber-400"}`}>
                ⚠
              </span>
              <span className="font-bold tracking-wider uppercase">
                {currentStage.id === "A" && "PERIMETER LOCK: INITIAL CONTACT"}
                {currentStage.id === "B" && "GUEST COUNT ESCALATING: ADDITIONAL SIGNAL DETECTED"}
                {currentStage.id === "C" && "ESCALATING THREAT ASSESSMENT: MULTIPLE GUESTS (>2)"}
                {currentStage.id === "D" && "RAPID INGRESS DETECTED: COUNT UNRELIABLE"}
                {currentStage.id === "E" && "MAXIMUM ALERT: GROUP-SIZE INCURSION CONFIRMED"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-300">
              <span className={`w-2 h-2 rounded-full ${currentStage.id === "E" ? "bg-red-500 animate-ping" : "bg-amber-500 animate-pulse"}`} />
              <span>{currentStage.id === "E" ? "CRITICAL" : "LIVE SCAN"}</span>
            </div>
          </div>

          {/* Big Number Tick & Subline */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-4 flex-wrap">
              <SplitFlap 
                text={counterDisplay} 
                fontSize="text-6xl md:text-8xl lg:text-9xl font-black" 
                color="text-white text-glow-white" 
                className="justify-start"
                mode="flap"
                flipSpeedMs={35}
              />
              <div className="flex flex-col">
                <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
                  {currentStage.headcountLabel}
                </span>
                <span 
                  className="font-mono text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-400"
                  style={{ color: currentStage.meterColor }}
                >
                  {currentStage.headline}
                </span>
              </div>
            </div>

            {/* Tactical Appraisal Box */}
            <motion.div 
              key={currentStage.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-lg border bg-black/40 backdrop-blur-sm transition-colors duration-500"
              style={{ borderColor: `${currentStage.meterColor}70` }}
            >
              <div className="flex items-center justify-between font-mono text-xs text-gray-400 uppercase tracking-widest mb-1">
                <span>TACTICAL APPRAISAL</span>
                <span 
                  className="font-bold text-[11px] animate-pulse"
                  style={{ color: currentStage.meterColor }}
                >
                  ● STAGE {currentStage.id}
                </span>
              </div>
              <div 
                className="font-mono text-lg md:text-2xl font-black tracking-wide transition-colors duration-300"
                style={{ color: currentStage.meterColor }}
              >
                {currentStage.appraisal}
              </div>
            </motion.div>
          </div>

          {/* Threat Meter Bar */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center font-mono text-xs">
              <span className="text-gray-400 tracking-wider">THREAT LEVEL METER:</span>
              <span 
                className="font-bold tracking-widest transition-colors duration-300"
                style={{ color: currentStage.meterColor }}
              >
                {currentStage.id === "A" && "LOW (20%)"}
                {currentStage.id === "B" && "MODERATE (40%)"}
                {currentStage.id === "C" && "ELEVATED (65%)"}
                {currentStage.id === "D" && "HIGH — PULSING (85%)"}
                {currentStage.id === "E" && "CRITICAL (100%)"}
              </span>
            </div>

            {/* Gauge Bar */}
            <div className="w-full h-4 bg-gray-900 border border-gray-700/60 rounded-sm overflow-hidden p-[2px] relative shadow-inner">
              {/* Background gradient zones */}
              <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600" />
              
              <motion.div 
                className="h-full rounded-sm relative transition-colors duration-400"
                style={{ backgroundColor: currentStage.meterColor }}
                animate={{ 
                  width: `${currentStage.meterPercent}%`,
                  opacity: currentStage.id === "D" ? [0.75, 1, 0.75] : 1
                }}
                transition={{ 
                  width: { duration: 0.35, ease: "easeOut" },
                  opacity: { repeat: Infinity, duration: 0.5 }
                }}
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
            <NetworkPulse color={currentStage.meterColor} size={340} />

            {/* Blip entities plotted on radar */}
            <AnimatePresence>
              {visibleBlips.map((blip, idx) => (
                <motion.div
                  key={blip.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
                >
                  {/* Blip Ping Ring */}
                  <motion.div
                    className="absolute -inset-3 rounded-full border"
                    style={{ borderColor: currentStage.meterColor }}
                    animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
                    transition={{ repeat: Infinity, duration: currentStage.id === "E" ? 0.9 : 1.5, delay: (idx % 4) * 0.25 }}
                  />
                  {/* Blip Core Dot */}
                  <div 
                    className="w-3.5 h-3.5 rounded-full shadow-[0_0_12px_#EF4444] border border-white"
                    style={{ backgroundColor: currentStage.meterColor }}
                  />
                  {/* Blip Identifier Tag */}
                  <span className="absolute -top-4 -left-2 font-mono text-[8px] text-white/80 bg-black/80 px-1 rounded whitespace-nowrap border border-white/20">
                    {blip.id}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Center target crosshair / blip count */}
            <div className="absolute font-mono text-[9px] text-gray-400 bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded border border-white/10 font-bold">
              {currentStage.radarLabel || `RADAR BLIPS: ${visibleBlips.length}`}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
