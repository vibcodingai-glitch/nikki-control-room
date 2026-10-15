"use client";

import React, { useEffect, useRef } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useAudio } from "@/components/AudioSystem";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useVisitSyncState } from "@/lib/useVisitSyncState";
import { visitorCopy } from "@/lib/visitorCopy";

interface SceneProps {
  showSubtext?: boolean;
}

export const VScene4: React.FC<SceneProps> = ({ showSubtext = false }) => {
  const { play, stop, isReady } = useAudio();
  const audioTriggered = useRef(false);

  useEffect(() => {
    if (isReady && !audioTriggered.current) {
      audioTriggered.current = true;

      // 1. Stop alert beeps immediately
      stop("alert-beep");

      // 2. Play access-granted chime (falls back to celebration-horn if needed)
      play("access-granted");

      // 3. Follow with background celebration music
      const musicTimer = setTimeout(() => {
        play("celebration-music");
      }, 1200);

      // 4. One short, toned-down burst of confetti (not repeated)
      try {
        confetti({
          particleCount: 55,
          spread: 80,
          origin: { y: 0.65, x: 0.5 },
          colors: ["#3FA66E", "#FFFFFF", "#F2E9DD", "#2D8254"],
          disableForReducedMotion: true,
        });
      } catch (e) {
        // ignore if not supported
      }

      return () => clearTimeout(musicTimer);
    }
  }, [isReady, play, stop]);

  const statusText = visitorCopy.reveal.statusLine;

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Glitched back to full green background radiance */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 50% 120%, rgba(63, 166, 110, 0.35) 0%, var(--background) 75%)",
          opacity: 0.45,
        }}
        animate={{ 
          background: [
            "radial-gradient(circle at 35% 100%, rgba(63, 166, 110, 0.4) 0%, var(--background) 80%)",
            "radial-gradient(circle at 65% 100%, rgba(63, 166, 110, 0.4) 0%, var(--background) 80%)",
            "radial-gradient(circle at 35% 100%, rgba(63, 166, 110, 0.4) 0%, var(--background) 80%)"
          ] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="z-10 flex flex-col items-center w-full px-[5%] text-center">
        
        {/* Top Tag: INCIDENT RESOLVED */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-12"
        >
          <div className="px-4 py-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold">
            ✓ {visitorCopy.reveal.incidentResolved}
          </div>
        </motion.div>

        {/* Big Reveal SplitFlap in "flap" mode */}
        <div className="flex flex-col items-center gap-10 mt-10 w-full max-w-6xl">
          <SplitFlap 
            text={visitorCopy.reveal.mainWelcome} 
            color="text-[var(--color-brand-green)] text-glow-green" 
            fontSize="text-4xl md:text-6xl lg:text-7xl font-black" 
            className="justify-center"
            mode="flap"
            staggerDelayMs={45}
          />

          {/* Status Line */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="font-mono text-sm md:text-lg text-emerald-300/90 tracking-wider"
          >
            {statusText}
          </motion.div>

          {/* Subtext (Scene 6 phase) */}
          {showSubtext && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center gap-4 mt-4"
            >
              <div className="font-mono text-xl md:text-3xl font-bold tracking-widest text-white">
                {visitorCopy.reveal.subtext1}
              </div>

              <div className="font-mono text-sm md:text-lg text-white/70">
                {visitorCopy.reveal.subtext2}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </motion.div>
  );
};
