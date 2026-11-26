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

export const VScene3 = ({ fastMode = true }: { fastMode?: boolean }) => {
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
    // 1. Animate the 4 progress bars
    const start = Date.now();
    const durations = fastMode 
      ? [450, 700, 950, 1200]
      : [1200, 1800, 2400, 3000];

    const maxProgressDuration = fastMode ? 1300 : 3200;

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

      if (elapsed > maxProgressDuration) {
        clearInterval(progressInterval);
      }
    }, 30);

    // 2. Staged reveal of the Friendly Turn (finishes at 3.15s in 5s Fast Mode for +1.85s reading hold; 9.2s in 38s Standard)
    const timings = fastMode
      ? [900, 1300, 1750, 2250, 2700, 3150]
      : [3200, 4400, 5600, 6800, 8000, 9200];

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
  }, [fastMode]);

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

      {/* Network pulse — faint in top-right screen */}
      <div className="absolute top-[26%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-[1] opacity-15 pointer-events-none">
        <NetworkPulse color={step >= 3 ? "#3FA66E" : "#D63C2C"} size={360} />
      </div>

      {/* Main 2x2 Bezel-Safe Grid: Left Half (Screens 1 & 3) | Right Half (Screens 2 & 4) */}
      <div className="absolute inset-0 z-10 w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 px-8 md:px-14">
        
        {/* Left Half: Explicitly split into Top-Left (50%) and Bottom-Left (50%) so horizontal bezel passes through empty gap */}
        <div className="flex flex-col h-full max-w-xl">
          
          {/* Top-Left Screen (0% to 50% Y): System Query, Affiliation, Location */}
          <div className="h-1/2 flex flex-col justify-end pb-7 gap-3 text-left">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-gray-500 uppercase tracking-widest">
                SYSTEM QUERY:
              </span>
              <span className="font-mono text-xs font-bold text-white tracking-widest">
                CROSS-NETWORK HEURISTICS
              </span>
            </div>

            {step >= 1 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="max-w-lg">
                <SplitFlap 
                  text={visitorCopy.identityScan.revealedLines[0]} 
                  fontSize="text-sm sm:text-base md:text-lg lg:text-xl" 
                  color="text-white/80 text-glow-white" 
                  className="justify-start font-mono break-words"
                  mode="decrypt"
                />
              </motion.div>
            )}

            {step >= 2 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="max-w-lg">
                <SplitFlap 
                  text={visitorCopy.identityScan.revealedLines[1]} 
                  fontSize="text-sm sm:text-base md:text-lg lg:text-xl" 
                  color="text-amber-400 text-glow-amber" 
                  className="justify-start font-mono break-words"
                  mode="decrypt"
                />
              </motion.div>
            )}
          </div>

          {/* Bottom-Left Screen (50% to 100% Y): STATUS: VIPs, Purpose, Host, Friendliness */}
          <div className="h-1/2 flex flex-col justify-start pt-7 pb-12 gap-3 text-left">
            {step >= 3 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r max-w-lg"
              >
                <SplitFlap 
                  text={visitorCopy.identityScan.revealedLines[2]} 
                  fontSize="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black" 
                  color="text-[var(--color-brand-green)] text-glow-green" 
                  className="justify-start font-mono break-words"
                  mode="decrypt"
                />
              </motion.div>
            )}

            {step >= 4 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="max-w-lg">
                <SplitFlap 
                  text={visitorCopy.identityScan.revealedLines[3]} 
                  fontSize="text-sm sm:text-base md:text-lg lg:text-xl" 
                  color="text-white/90 text-glow-white" 
                  className="justify-start font-mono break-words"
                  mode="decrypt"
                />
              </motion.div>
            )}

            {step >= 5 && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="max-w-lg">
                <SplitFlap 
                  text={visitorCopy.identityScan.revealedLines[4]} 
                  fontSize="text-sm sm:text-base md:text-lg lg:text-xl" 
                  color="text-white/70 text-glow-white" 
                  className="justify-start font-mono break-words"
                  mode="decrypt"
                />
              </motion.div>
            )}

            {step >= 6 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 inline-flex items-center gap-3 p-3 bg-emerald-600/20 border border-emerald-500/50 rounded-lg shadow-lg shadow-emerald-500/20 max-w-lg"
              >
                <span className="text-xl">🤝</span>
                <SplitFlap 
                  text={visitorCopy.identityScan.revealedLines[5]} 
                  fontSize="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" 
                  color="text-[var(--color-brand-green)] text-glow-green" 
                  className="justify-start font-mono break-words"
                  mode="decrypt"
                />
              </motion.div>
            )}
          </div>

        </div>

        {/* Right Half: Diagnostic Filter Results anchored 100% inside Bottom-Right screen (50% to 100% Y) */}
        <div className="flex flex-col h-full items-center lg:items-start">
          {/* Top-Right Screen (0% to 50% Y): Kept clear above horizontal bezel */}
          <div className="hidden lg:block h-1/2" />

          {/* Bottom-Right Screen (50% to 100% Y): Full Diagnostic Card completely uncut */}
          <div className="h-1/2 w-full flex flex-col justify-center pt-5 pb-12">
            <div className="flex flex-col gap-3.5 bg-black/50 p-5 rounded-lg border border-gray-800/80 backdrop-blur-sm max-w-lg w-full">
              
              <div className="text-[10px] text-gray-500 uppercase font-mono tracking-widest border-b border-gray-800 pb-1.5">
                DIAGNOSTIC FILTER RESULTS
              </div>

              {/* 4 Scan Progress Bars with NO MATCH on completion */}
              <div className="space-y-2.5">
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
              <div className="border-t border-gray-800 pt-3 mt-1">
                <div className="flex justify-between items-center font-mono text-xs mb-1.5">
                  <span className="text-gray-400">THREAT DRAIN MONITOR:</span>
                  <span 
                    className="font-bold tracking-wider transition-colors duration-700"
                    style={{ color: threatDrain === 0 ? "#3FA66E" : threatDrain < 50 ? "#EAB308" : "#EF4444" }}
                  >
                    {threatDrain === 0 ? "NOMINAL / SAFE (0%)" : `DRAINING (${threatDrain}%)`}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-gray-900 border border-gray-700 rounded-sm overflow-hidden p-[2px]">
                  <motion.div 
                    className="h-full rounded-sm transition-all duration-700 ease-out"
                    style={{ 
                      width: `${threatDrain}%`,
                      backgroundColor: threatDrain === 0 ? "#3FA66E" : threatDrain < 50 ? "#EAB308" : "#EF4444" 
                    }}
                  />
                </div>
                
                <div className="mt-1.5 text-[9px] font-mono text-gray-500">
                  {threatDrain === 0 
                    ? "✓ ALL THREAT METRICS CLEARED — VISITOR IDENTITY CONFIRMED" 
                    : "↻ De-escalating security protocols..."}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
