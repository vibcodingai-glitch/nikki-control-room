"use client";

import React, { useEffect, useState, useRef } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useAudio } from "@/components/AudioSystem";
import { motion } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, NetworkPulse } from "@/components/TechEffects";
import { visitorCopy } from "@/lib/visitorCopy";

interface SceneProps {
  onAutoAdvance?: () => void;
  fastMode?: boolean;
}

export const VScene3b: React.FC<SceneProps> = ({ onAutoAdvance, fastMode = true }) => {
  const { play, setBeepGap } = useAudio();
  const [countdown, setCountdown] = useState<number | null>(null);

  const onAutoAdvanceRef = useRef(onAutoAdvance);
  onAutoAdvanceRef.current = onAutoAdvance;

  const playRef = useRef(play);
  playRef.current = play;

  const setBeepGapRef = useRef(setBeepGap);
  setBeepGapRef.current = setBeepGap;

  useEffect(() => {
    // Initial delay before countdown starts (0.4s in Fast, 1.6s in Standard)
    const initialDelay = fastMode ? 400 : 1600;
    const t1 = setTimeout(() => {
      setCountdown(3);
    }, initialDelay);

    return () => clearTimeout(t1);
  }, [fastMode]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      // Increase tempo of alert-beep as countdown drops
      if (countdown === 3) setBeepGapRef.current(fastMode ? 450 : 800);
      if (countdown === 2) setBeepGapRef.current(fastMode ? 300 : 500);
      if (countdown === 1) {
        setBeepGapRef.current(fastMode ? 200 : 300);
        playRef.current("whoosh-transition");
      }

      const stepInterval = fastMode ? 450 : 950;
      const timer = setTimeout(() => {
        setCountdown((c) => (c !== null ? c - 1 : null));
      }, stepInterval);

      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onAutoAdvanceRef.current?.();
    }
  }, [countdown, fastMode]);

  const reclassifyText = visitorCopy.countdown.reclassifyHeader;

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "brightness(2)" }} // Flash white glitch cut transition
      transition={{ duration: 0.3, ease: "easeIn" }}
    >
      <TerminalScanBackground color="text-[var(--color-brand-red)]" opacity="opacity-30" intervalMs={50} />

      {/* Intense hex dumps on both sides during countdown */}
      <HexDumpStream side="left" color="text-red-500/20" speed={40} lines={50} />
      <HexDumpStream side="right" color="text-red-500/20" speed={50} lines={50} />

      {/* Pulsing network scanner — centered inside Bottom-Right screen (75% X, 74% Y) behind the countdown digit */}
      <div className="absolute top-[74%] left-[75%] -translate-x-1/2 -translate-y-1/2 z-[1] opacity-20 pointer-events-none">
        <NetworkPulse color="#D63C2C" size={440} />
      </div>

      {/* Main Container: Side-by-side 2-column split in Bottom Screens (top-[55%] to bottom-[8%]) */}
      {/* Bottom-Left Screen: Reclassifying text | Bottom-Right Screen: Giant 3-2-1 Countdown */}
      <div className="absolute top-[55%] inset-x-0 bottom-[8%] z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center px-8 md:px-14">
        
        {/* Bottom-Left Screen: Stacked Reclassifying Message (stays strictly <= 46% width) */}
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <SplitFlap 
            text="RECLASSIFYING" 
            fontSize="text-2xl sm:text-3xl md:text-4xl lg:text-5xl" 
            color="text-[var(--color-brand-red)] text-glow-red" 
            className="justify-center font-black tracking-wider"
            mode="decrypt"
          />
          <SplitFlap 
            text="ALL ENTITIES" 
            fontSize="text-2xl sm:text-3xl md:text-4xl lg:text-5xl" 
            color="text-[var(--color-brand-red)] text-glow-red" 
            className="justify-center font-black tracking-wider"
            mode="decrypt"
          />
          <SplitFlap 
            text={visitorCopy.countdown.reclassifyLine2 || "AS VIPs…"} 
            fontSize="text-2xl sm:text-3xl md:text-4xl lg:text-5xl" 
            color="text-amber-400 text-glow-amber" 
            className="justify-center font-black tracking-wider mt-1"
            mode="decrypt"
          />
        </div>

        {/* Bottom-Right Screen: Large Countdown Digit (stays strictly >= 54% width, 100% below horizontal bezel) */}
        <div className="flex flex-col items-center justify-center text-center">
          {countdown !== null && countdown > 0 && (
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <SplitFlap 
                text={countdown.toString()} 
                fontSize="text-8xl sm:text-9xl md:text-[12rem] font-black" 
                color="text-[var(--color-brand-red)] text-glow-red" 
                className="justify-center"
                flipSpeedMs={30}
                mode="decrypt"
              />
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
};
