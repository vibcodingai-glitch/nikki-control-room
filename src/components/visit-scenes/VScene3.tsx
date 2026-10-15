"use client";

import React, { useEffect, useState } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, NetworkPulse } from "@/components/TechEffects";
import { visitorCopy } from "@/lib/visitorCopy";

interface ScanBarState {
  label: string;
  progress: number;
  completed: boolean;
}

export const VScene3 = () => {
  const [step, setStep] = useState(0);

  // Scan progress bars state
  const [bars, setBars] = useState<ScanBarState[]>([
    { label: "FACIAL MATCH", progress: 0, completed: false },
    { label: "BADGE DATABASE", progress: 0, completed: false },
    { label: "PERSONNEL RECORDS", progress: 0, completed: false },
    { label: "WATCHLIST", progress: 0, completed: false },
  ]);

  // Threat meter drain level: starts at 85% then drains to 0%
  const [threatDrain, setThreatDrain] = useState(85);

  useEffect(() => {
    // 1. Animate the 4 progress bars rapidly
    const start = Date.now();
    const durations = [1200, 1800, 2400, 3000]; // ms to complete each bar

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      setBars((prev) =>
        prev.map((b, idx) => {
          const d = durations[idx];
          const pct = Math.min(100, (elapsed / d) * 100);
          return {
            ...b,
            progress: pct,
            completed: pct >= 100,
          };
        })
      );

      if (elapsed > 3200) {
        clearInterval(progressInterval);
      }
    }, 50);

    // 2. Staged reveal of the Friendly Turn
    const timings = [
      3400, // Step 1: Affiliation
      4500, // Step 2: Location
      5700, // Step 3: Status: COLLEAGUES
      6900, // Step 4: Purpose
      8000, // Step 5: Host
      9000, // Step 6: Friendliness Index 99% + Drain meter
    ];

    const timers = timings.map((time, index) =>
      setTimeout(() => {
        setStep(index + 1);
        if (index === 1) {
          // Threat meter starts draining
          setThreatDrain(45);
        } else if (index === 2) {
          setThreatDrain(15);
        } else if (index >= 4) {
          setThreatDrain(0);
        }
      }, time)
    );

    return () => {
      clearInterval(progressInterval);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-start px-[8%] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Background transitions from slight red to calming green */}
      <motion.div 
        className="absolute inset-0 z-0 transition-colors duration-1000"
        animate={{
          background: step >= 3 
            ? "radial-gradient(circle at center, rgba(63,166,110,0.15) 0%, transparent 70%)"
            : "radial-gradient(circle at center, rgba(239,68,68,0.12) 0%, transparent 70%)",
        }}
        transition={{ duration: 1.5 }}
      />

      <TerminalScanBackground 
        color={step >= 3 ? "text-[var(--color-brand-green)]" : "text-[var(--color-brand-red)]"} 
        opacity="opacity-15" 
        intervalMs={120} 
      />

      {/* Hex dump on left */}
      <HexDumpStream side="left" color={step >= 3 ? "text-emerald-500/10" : "text-red-500/10"} speed={80} lines={50} />

      {/* Network pulse — faint on right */}
      <div className="absolute top-1/2 right-[10%] -translate-y-1/2 z-[1] opacity-15">
        <NetworkPulse color={step >= 3 ? "#3FA66E" : "#D63C2C"} size={420} />
      </div>

      {/* Main Grid: Left side staged reveal lines, Right side scan bars & threat meter */}
      <div className="z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Friendly Turn staged reveal (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 text-left">
          
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">
              SYSTEM QUERY:
            </span>
            <span className="font-mono text-xs font-bold text-white tracking-widest">
              CROSS-NETWORK HEURISTICS
            </span>
          </div>

          {step >= 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <SplitFlap 
                text={visitorCopy.identityScan.revealedLines[0]} 
                fontSize="text-base md:text-xl" 
                color="text-white/80 text-glow-white" 
                className="justify-start font-mono"
                mode="decrypt"
              />
            </motion.div>
          )}

          {step >= 2 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <SplitFlap 
                text={visitorCopy.identityScan.revealedLines[1]} 
                fontSize="text-base md:text-xl" 
                color="text-amber-400 text-glow-amber" 
                className="justify-start font-mono"
                mode="decrypt"
              />
            </motion.div>
          )}

          {step >= 3 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="my-1 p-3 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r"
            >
              <SplitFlap 
                text={visitorCopy.identityScan.revealedLines[2]} 
                fontSize="text-2xl md:text-4xl font-black" 
                color="text-[var(--color-brand-green)] text-glow-green" 
                className="justify-start font-mono"
                mode="decrypt"
              />
            </motion.div>
          )}

          {step >= 4 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <SplitFlap 
                text={visitorCopy.identityScan.revealedLines[3]} 
                fontSize="text-base md:text-xl" 
                color="text-white/90 text-glow-white" 
                className="justify-start font-mono"
                mode="decrypt"
              />
            </motion.div>
          )}

          {step >= 5 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <SplitFlap 
                text={visitorCopy.identityScan.revealedLines[4]} 
                fontSize="text-base md:text-xl" 
                color="text-white/70 text-glow-white" 
                className="justify-start font-mono"
                mode="decrypt"
              />
            </motion.div>
          )}

          {step >= 6 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 inline-flex items-center gap-3 p-3 bg-emerald-600/20 border border-emerald-500/50 rounded-lg shadow-lg shadow-emerald-500/20"
            >
              <span className="text-xl">🤝</span>
              <SplitFlap 
                text={visitorCopy.identityScan.revealedLines[5]} 
                fontSize="text-xl md:text-2xl font-bold" 
                color="text-[var(--color-brand-green)] text-glow-green" 
                className="justify-start font-mono"
                mode="decrypt"
              />
            </motion.div>
          )}

        </div>

        {/* Right Column: Scan Bars (NO MATCH) + Draining Threat Meter (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 bg-black/40 p-6 rounded-lg border border-gray-800/80 backdrop-blur-sm">
          
          <div className="text-[10px] text-gray-500 uppercase font-mono tracking-widest border-b border-gray-800 pb-2">
            DIAGNOSTIC FILTER RESULTS
          </div>

          {/* 4 Scan Progress Bars with NO MATCH on completion */}
          <div className="space-y-4">
            {bars.map((bar, i) => (
              <div key={i} className="font-mono text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">{bar.label}</span>
                  {bar.completed ? (
                    <motion.span 
                      initial={{ scale: 0.8 }} 
                      animate={{ scale: 1 }}
                      className="px-2 py-0.5 bg-red-950/80 border border-red-500/60 text-red-400 font-bold text-[10px] rounded"
                    >
                      {visitorCopy.identityScan.noMatchText}
                    </motion.span>
                  ) : (
                    <span className="text-gray-500 text-[10px]">{Math.round(bar.progress)}%</span>
                  )}
                </div>
                <div className="w-full h-1.5 bg-gray-900 rounded overflow-hidden">
                  <motion.div 
                    className={`h-full rounded ${bar.completed ? "bg-red-500/40" : "bg-red-500"}`}
                    style={{ width: `${bar.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Threat Meter Draining Back to Green */}
          <div className="border-t border-gray-800 pt-4 mt-2">
            <div className="flex justify-between items-center font-mono text-xs mb-2">
              <span className="text-gray-400">THREAT DRAIN MONITOR:</span>
              <span 
                className="font-bold tracking-wider transition-colors duration-700"
                style={{ color: threatDrain === 0 ? "#3FA66E" : threatDrain < 50 ? "#EAB308" : "#EF4444" }}
              >
                {threatDrain === 0 ? "NOMINAL / SAFE (0%)" : `DRAINING (${threatDrain}%)`}
              </span>
            </div>

            <div className="w-full h-3 bg-gray-900 border border-gray-700 rounded-sm overflow-hidden p-[2px]">
              <motion.div 
                className="h-full rounded-sm transition-all duration-700 ease-out"
                style={{ 
                  width: `${threatDrain}%`,
                  backgroundColor: threatDrain === 0 ? "#3FA66E" : threatDrain < 50 ? "#EAB308" : "#EF4444" 
                }}
              />
            </div>
            
            <div className="mt-2 text-[9px] font-mono text-gray-500">
              {threatDrain === 0 
                ? "✓ ALL THREAT METRICS CLEARED — VISITOR IDENTITY CONFIRMED" 
                : "↻ De-escalating security protocols..."}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};
