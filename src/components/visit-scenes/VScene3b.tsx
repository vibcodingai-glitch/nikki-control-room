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

      {/* Pulsing network scanner — positioned in bottom screen behind countdown */}
      <div className="absolute top-[72%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] opacity-15">
        <NetworkPulse color="#D63C2C" size={600} />
      </div>

      {/* Main Container: Positioned at top-[55%] to guarantee it sits 100% in the bottom screen below the horizontal bezel */}
      <div className="absolute top-[55%] inset-x-0 bottom-[6%] z-10 flex flex-col items-center justify-center gap-6 px-4 text-center">
        {/* Reclassifying N entities text — wrapped into 2 lines so it does not cross vertical screen seam */}
        <div className="flex flex-col items-center gap-1.5 max-w-2xl text-center">
          <SplitFlap 
            text={visitorCopy.countdown.reclassifyLine1 || "RECLASSIFYING ALL ENTITIES"} 
            fontSize="text-lg sm:text-2xl md:text-3xl lg:text-4xl" 
            color="text-[var(--color-brand-red)] text-glow-red" 
            className="justify-center font-bold tracking-wider"
            mode="decrypt"
          />
          <SplitFlap 
            text={visitorCopy.countdown.reclassifyLine2 || "AS VIPs…"} 
            fontSize="text-lg sm:text-2xl md:text-3xl lg:text-4xl" 
            color="text-[var(--color-brand-red)] text-glow-red" 
            className="justify-center font-bold tracking-wider"
            mode="decrypt"
          />
        </div>

        {/* Large Countdown Digit: Sits safely in bottom screen area, uncut by horizontal seam */}
        {countdown !== null && countdown > 0 && (
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4"
          >
            <SplitFlap 
              text={countdown.toString()} 
              fontSize="text-7xl sm:text-9xl md:text-[11rem] font-black" 
              color="text-[var(--color-brand-red)] text-glow-red" 
              className="justify-center"
              flipSpeedMs={30}
              mode="decrypt"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
