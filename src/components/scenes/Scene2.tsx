"use client";

import React, { useEffect, useState } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { motion } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, HackProgress, TypingLog } from "@/components/TechEffects";

export const Scene2 = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Reveal lines sequentially
    const timings = [
      1000, // CROSS-REFERENCING...
      2500, // MATCH FOUND
      4000, // NAME block
      7000, // CLASSIFICATION
      9000, // CROSS-REFERENCING GLOBAL...
      11000 // CONCLUSION
    ];

    const timers = timings.map((time, index) => 
      setTimeout(() => setStep(index + 1), time)
    );

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const scanMessages = [
    "Querying personnel database... 2,847 records",
    "Applying biometric filter: MATCH",
    "Decrypting personnel file #NK-0917...",
    "Clearance level: EXECUTIVE — access granted",
    "Loading mission history...",
    "Cross-referencing with global activity log...",
    "40 countries flagged in travel matrix",
    "Athletic data: half marathons on 3 continents",
    "Threat assessment: ZERO — reclassify as ALLY",
  ];

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-start px-[10%] relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Background pulsing red gradient - calmer than scene 1 */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at center, var(--color-brand-red) 0%, transparent 60%)"
        }}
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <TerminalScanBackground color="text-[var(--color-brand-red)]" opacity="opacity-20" intervalMs={120} />

      {/* Hex dumps on the right edge */}
      <HexDumpStream side="right" color="text-red-500/10" speed={100} lines={50} />

      {/* Progress bars — right side panel */}
      <div className="absolute top-1/4 right-8 z-20 w-[200px] pointer-events-none space-y-3">
        <HackProgress label="DECRYPTING" duration={6} color="#D63C2C" />
        <HackProgress label="CROSS-REF" duration={9} color="#E8604C" />
        <HackProgress label="BIOMETRIC" duration={4} color="#3FA66E" />
      </div>

      {/* Typing log — bottom right */}
      <div className="absolute bottom-12 right-8 z-20 w-[320px] pointer-events-none">
        <TypingLog messages={scanMessages} color="text-red-400/40" typingSpeed={20} lineDelay={500} />
      </div>

      <div className="z-10 flex flex-col gap-6 text-left max-w-5xl">
        {step >= 1 && (
          <SplitFlap text="CROSS-REFERENCING PEOPLE IN THE BUILDING DATABASE..." fontSize="text-lg md:text-2xl" color="text-white/60 text-glow-white" className="justify-start" mode="decrypt" />
        )}
        {step >= 2 && (
          <SplitFlap text="MATCH FOUND" fontSize="text-xl md:text-3xl" color="text-[var(--color-brand-green)] text-glow-green" className="justify-start font-bold" mode="decrypt" />
        )}
        {step >= 3 && (
          <div className="flex flex-col gap-2 mt-4 pl-4 border-l-2 border-white/20">
            <SplitFlap text="NAME: NIKKI OKRAH" fontSize="text-lg md:text-2xl" color="text-white text-glow-white" className="justify-start" mode="decrypt" />
            <SplitFlap text="ROLE: FOUNDER & CEO, CHAKU FOODS" fontSize="text-lg md:text-2xl" color="text-white text-glow-white" className="justify-start" mode="decrypt" />
            <SplitFlap text="KNOWN FOR: BUILDING HER OWN CONTROL ROOM (JUST FOR PLANTAINS)" fontSize="text-lg md:text-2xl" color="text-white text-glow-white" className="justify-start" mode="decrypt" />
          </div>
        )}
        {step >= 4 && (
          <SplitFlap text="CLASSIFICATION: NOT A VISITOR. A PEER SYSTEM." fontSize="text-xl md:text-3xl" color="text-[var(--color-brand-coral)] text-glow-coral" className="justify-start font-bold mt-4" mode="decrypt" />
        )}
        {step >= 5 && (
          <SplitFlap text="CROSS-REFERENCING GLOBAL ACTIVITY LOG..." fontSize="text-lg md:text-2xl" color="text-white/60 text-glow-white" className="justify-start mt-8" mode="decrypt" />
        )}
        {step >= 6 && (
          <div className="flex flex-col gap-2 mt-4 pl-4 border-l-2 border-white/20">
            <SplitFlap text="40 COUNTRIES VISITED" fontSize="text-lg md:text-2xl" color="text-white text-glow-white" className="justify-start" mode="decrypt" />
            <SplitFlap text="HALF MARATHONS COMPLETED ON 3 CONTINENTS" fontSize="text-lg md:text-2xl" color="text-white text-glow-white" className="justify-start" mode="decrypt" />
            <SplitFlap text="CONCLUSION: DOES NOT SLOW DOWN. EVER." fontSize="text-xl md:text-3xl" color="text-[var(--color-brand-green)] text-glow-green" className="justify-start font-bold mt-4" mode="decrypt" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
