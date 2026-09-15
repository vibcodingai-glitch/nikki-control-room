"use client";

import React, { useEffect, useState } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { motion } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, NetworkPulse, HackProgress } from "@/components/TechEffects";

export const Scene3 = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timings = [
      1000, // COMPARING MISSION PARAMETERS...
      3000, // OUR ROOM
      5000, // HER ROOM
      8000, // MATCH: 98%
    ];

    const timers = timings.map((time, index) => 
      setTimeout(() => setStep(index + 1), time)
    );

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-start px-[10%] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <TerminalScanBackground color="text-[var(--color-brand-green)]" opacity="opacity-10" intervalMs={150} />

      {/* Hex dump — left edge */}
      <HexDumpStream side="left" color="text-emerald-500/10" speed={90} lines={45} />

      {/* Network pulse — background */}
      <div className="absolute top-1/2 right-[15%] -translate-y-1/2 z-[1] opacity-15">
        <NetworkPulse color="#3FA66E" size={350} />
      </div>

      {/* Comparison progress bar */}
      <div className="absolute top-16 left-[10%] right-[10%] z-20 pointer-events-none">
        <HackProgress label="PATTERN COMPARISON" duration={8} color="#3FA66E" loop={false} />
      </div>
      
      <div className="z-10 flex flex-col gap-8 text-left max-w-5xl">
        {step >= 1 && (
          <SplitFlap text="COMPARING MISSION PARAMETERS..." fontSize="text-xl md:text-3xl" color="text-white/60 text-glow-white" className="justify-start" mode="decrypt" />
        )}
        
        <div className="flex flex-col gap-4 mt-4">
          {step >= 2 && (
            <div className="flex flex-col">
              <span className="text-[var(--color-brand-coral)] font-mono mb-2">OUR ROOM</span>
              <SplitFlap text="Real-time visibility. Fewer losses. Faster decisions." fontSize="text-lg md:text-2xl" color="text-white text-glow-white" className="justify-start" mode="decrypt" />
            </div>
          )}
          
          {step >= 3 && (
            <div className="flex flex-col mt-4">
              <span className="text-[var(--color-brand-green)] font-mono mb-2">HER ROOM</span>
              <SplitFlap text="Real-time forecasting. Fewer losses. Stronger farmers." fontSize="text-lg md:text-2xl" color="text-white text-glow-white" className="justify-start" mode="decrypt" />
            </div>
          )}
        </div>

        {step >= 4 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 border-2 border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 rounded"
          >
            <SplitFlap text="MATCH: 98%" fontSize="text-4xl md:text-6xl font-bold" color="text-[var(--color-brand-green)] text-glow-green" className="justify-start" mode="decrypt" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
