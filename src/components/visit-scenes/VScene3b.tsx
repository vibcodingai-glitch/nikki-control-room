"use client";

import React, { useEffect, useState } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useAudio } from "@/components/AudioSystem";
import { motion } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, NetworkPulse } from "@/components/TechEffects";
import { useVisitSyncState } from "@/lib/useVisitSyncState";
import { visitorCopy } from "@/lib/visitorCopy";

interface SceneProps {
  onAutoAdvance?: () => void;
}

export const VScene3b: React.FC<SceneProps> = ({ onAutoAdvance }) => {
  const { play, setBeepGap } = useAudio();
  const { state } = useVisitSyncState("display");
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Fast mode reduces initial delay
    const initialDelay = state.fastMode ? 1400 : 2200;
    const t1 = setTimeout(() => {
      setCountdown(3);
    }, initialDelay);

    return () => clearTimeout(t1);
  }, [state.fastMode]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      // Increase tempo of alert-beep as countdown drops
      if (countdown === 3) setBeepGap(600);
      if (countdown === 2) setBeepGap(450);
      if (countdown === 1) {
        setBeepGap(280);
        play("whoosh-transition");
      }

      const stepInterval = state.fastMode ? 650 : 1000;
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, stepInterval);

      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      if (onAutoAdvance) {
        onAutoAdvance();
      }
    }
  }, [countdown, play, setBeepGap, onAutoAdvance, state.fastMode]);

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

      {/* Pulsing network scanner — large, centered */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1] opacity-15">
        <NetworkPulse color="#D63C2C" size={600} />
      </div>

      <div className="flex flex-col items-center gap-12 z-10 px-4 text-center">
        {/* Reclassifying N entities text */}
        <SplitFlap 
          text={reclassifyText} 
          fontSize="text-xl md:text-3xl lg:text-4xl" 
          color="text-[var(--color-brand-red)] text-glow-red" 
          className="justify-center font-bold tracking-wider"
          mode="decrypt"
        />

        {countdown !== null && countdown > 0 && (
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-6"
          >
            <SplitFlap 
              text={countdown.toString()} 
              fontSize="text-8xl md:text-[12rem] font-black" 
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
