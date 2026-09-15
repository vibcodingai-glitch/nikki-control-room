"use client";

import React, { useEffect, useState } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useAudio } from "@/components/AudioSystem";
import { motion } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, NetworkPulse, TypingLog } from "@/components/TechEffects";

export const Scene1 = () => {
  const { play, stop, isReady } = useAudio();
  const [showSubText, setShowSubText] = useState(false);

  useEffect(() => {
    if (isReady) {
      play("alert-beep");

      // Voice cuts in slightly after to avoid muddiness
      const voiceTimer = setTimeout(() => {
        play("alert-detected-voice");
      }, 250);

      // Wait a bit before showing the scanning text to pace the scene
      const textTimer = setTimeout(() => {
        setShowSubText(true);
      }, 2000);

      return () => {
        clearTimeout(voiceTimer);
        clearTimeout(textTimer);
        stop("alert-detected-voice"); // We don't stop alert-beep here as it continues to scene 2/3
      };
    }
  }, [isReady, play, stop]);

  const terminalMessages = [
    "ALERT: Anomalous signal detected in sector 7G",
    "Triangulating source... 3 nodes responding",
    "Signal strength: CRITICAL — exceeds baseline by 340%",
    "Cross-referencing known patterns...",
    "WARNING: Pattern match found in classified database",
    "Initiating deep scan protocol DELTA-9...",
    "Requesting additional node authentication...",
    "Bypassing standard clearance — priority override active",
  ];

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
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <TerminalScanBackground color="text-[var(--color-brand-red)]" opacity="opacity-30" />

      {/* Hex dumps on edges */}
      <HexDumpStream side="left" color="text-red-500/15" speed={60} lines={40} />
      <HexDumpStream side="right" color="text-red-500/15" speed={80} lines={40} />

      {/* Network Pulse behind the main text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] opacity-20">
        <NetworkPulse color="#D63C2C" size={500} />
      </div>

      {/* Typing log in bottom left */}
      <div className="absolute bottom-12 left-6 z-20 w-[350px] pointer-events-none">
        <TypingLog messages={terminalMessages} color="text-red-400/50" typingSpeed={25} lineDelay={600} />
      </div>

      {/* Massive centered status badge */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-8">
          <motion.div 
            animate={{ opacity: [1, 0.5, 1], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-12 h-12 rounded-full bg-[var(--color-brand-red)] shadow-[0_0_40px_var(--color-brand-red)]"
          />
          <SplitFlap 
            text="ANOMALY DETECTED" 
            color="text-[var(--color-brand-red)] text-glow-red" 
            fontSize="text-4xl md:text-6xl lg:text-8xl font-bold" 
            className="justify-center"
            mode="decrypt"
          />
          {showSubText && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <SplitFlap 
                text="SCANNING ZONE..." 
                color="text-white/70 text-glow-white" 
                fontSize="text-xl md:text-2xl" 
                className="justify-center"
                mode="decrypt"
              />
            </motion.div>
          )}
        </div>
      </div>

    </motion.div>
  );
};
