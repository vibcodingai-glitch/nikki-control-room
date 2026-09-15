"use client";

import React, { useEffect, useState } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useAudio } from "@/components/AudioSystem";
import { motion } from "framer-motion";
import { TerminalScanBackground } from "@/components/TerminalScanBackground";
import { HexDumpStream, NetworkPulse } from "@/components/TechEffects";

interface SceneProps {
  onAutoAdvance?: () => void;
}

export const Scene3b: React.FC<SceneProps> = ({ onAutoAdvance }) => {
  const { play, setBeepGap } = useAudio();
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Escalate text appears immediately
    // Countdown starts after 2 seconds
    const t1 = setTimeout(() => {
      setCountdown(3);
    }, 2500);

    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      // Increase tempo of alert-beep as countdown drops (reduce silence gap by ~15-20% per tick)
      if (countdown === 3) setBeepGap(600);
      if (countdown === 2) setBeepGap(450);
      if (countdown === 1) {
        setBeepGap(300);
        play("whoosh-transition");
      }

      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000); // 1 second per tick
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      if (onAutoAdvance) {
        onAutoAdvance();
      }
    }
  }, [countdown, play, setBeepGap, onAutoAdvance]);

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "brightness(2)" }} // flash white transition
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

      <div className="flex flex-col items-center gap-16 z-10">
        <SplitFlap 
          text="ESCALATING TO ALL TEAMS" 
          fontSize="text-2xl md:text-4xl" 
          color="text-[var(--color-brand-red)] text-glow-red" 
          className="justify-center font-bold"
          mode="decrypt"
        />

        {countdown !== null && countdown > 0 && (
          <motion.div
            key={countdown} // Force re-render of SplitFlap to re-animate the character
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-8"
          >
            <SplitFlap 
              text={countdown.toString()} 
              fontSize="text-8xl md:text-[12rem] font-bold" 
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
