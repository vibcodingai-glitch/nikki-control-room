"use client";

import React, { useEffect, useState } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useAudio } from "@/components/AudioSystem";
import { motion } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, NetworkPulse, TypingLog } from "@/components/TechEffects";
import { visitorCopy } from "@/lib/visitorCopy";

export const VScene1 = ({ fastMode = true }: { fastMode?: boolean }) => {
  const { play, stop, isReady } = useAudio();
  const [showSubText, setShowSubText] = useState(false);

  useEffect(() => {
    if (isReady) {
      play("alert-beep");

      const voiceTimer = setTimeout(() => {
        play("alert-detected-voice");
      }, 250);

      const textTimer = setTimeout(() => {
        setShowSubText(true);
      }, fastMode ? 1400 : 2500);

      return () => {
        clearTimeout(voiceTimer);
        clearTimeout(textTimer);
        stop("alert-detected-voice");
      };
    }
  }, [isReady, play, stop, fastMode]);

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Background pulsing red gradient */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at center, var(--color-brand-red) 0%, transparent 60%)"
        }}
        animate={{ opacity: [0.15, 0.32, 0.15] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <TerminalScanBackground color="text-[var(--color-brand-red)]" opacity="opacity-30" />

      {/* Hex dumps on edges */}
      <HexDumpStream side="left" color="text-red-500/15" speed={60} lines={40} />
      <HexDumpStream side="right" color="text-red-500/15" speed={80} lines={40} />

      {/* Network Pulses — centered inside Bottom-Left (25%) and Bottom-Right (75%) screens, away from bezels */}
      <div className="absolute top-[74%] left-[25%] -translate-x-1/2 -translate-y-1/2 z-[1] opacity-15 pointer-events-none">
        <NetworkPulse color="#D63C2C" size={380} />
      </div>
      <div className="absolute top-[74%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-[1] opacity-15 pointer-events-none">
        <NetworkPulse color="#D63C2C" size={380} />
      </div>

      {/* Typing log in top-left screen (clear of bottom alert text and bezels) */}
      <div className="absolute top-14 left-8 z-20 w-[360px] pointer-events-none">
        <TypingLog 
          messages={visitorCopy.perimeterAlert.terminalLogs} 
          color="text-red-400/50" 
          typingSpeed={25} 
          lineDelay={600} 
        />
      </div>

      {/* Main Alert: Side-by-side 2-column split in Bottom Screens (top-[55%] to bottom-[8%]) */}
      {/* Left Screen (X: 0-46%): Icon + UNIDENTIFIED / PRESENCE | Right Screen (X: 54-100%): DETECTED + Subtext */}
      <div className="absolute top-[55%] inset-x-0 bottom-[8%] z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center px-8 md:px-14">
        
        {/* Bottom-Left Screen: Alert Icon + UNIDENTIFIED PRESENCE */}
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <motion.div 
            animate={{ opacity: [1, 0.4, 1], scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 0.9 }}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--color-brand-red)] shadow-[0_0_50px_var(--color-brand-red)] flex items-center justify-center font-mono text-sm font-bold text-white tracking-widest mb-1"
          >
            !
          </motion.div>

          <SplitFlap 
            text="UNIDENTIFIED" 
            color="text-[var(--color-brand-red)] text-glow-red" 
            fontSize="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black" 
            className="justify-center text-center"
            mode="decrypt"
          />
          <SplitFlap 
            text="PRESENCE" 
            color="text-[var(--color-brand-red)] text-glow-red" 
            fontSize="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black" 
            className="justify-center text-center"
            mode="decrypt"
          />
        </div>

        {/* Bottom-Right Screen: DETECTED + Perimeter Sensor Subtext */}
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <SplitFlap 
            text={visitorCopy.perimeterAlert.headlineLine2 || "DETECTED"} 
            color="text-[var(--color-brand-red)] text-glow-red" 
            fontSize="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black" 
            className="justify-center text-center"
            mode="decrypt"
          />

          {showSubText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 max-w-md text-center"
            >
              <SplitFlap 
                text={visitorCopy.perimeterAlert.subtext} 
                color="text-white/75 text-glow-white" 
                fontSize="text-sm sm:text-base md:text-xl font-mono" 
                className="justify-center text-center"
                mode="decrypt"
              />
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
};
