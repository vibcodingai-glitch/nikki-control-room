"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAudio } from "@/components/AudioSystem";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useVisitSyncState } from "@/lib/useVisitSyncState";
import { visitorCopy } from "@/lib/visitorCopy";
import { MotionDrawingBanner } from "@/components/visit-scenes/MotionDrawingBanner";

interface SceneProps {
  showSubtext?: boolean;
}

export const VScene4: React.FC<SceneProps> = ({ showSubtext = true }) => {
  const { play, stop, fade, isReady } = useAudio();
  const { state } = useVisitSyncState("display");
  const { fastMode } = state;
  const audioTriggered = useRef(false);
  const [bannerFormed, setBannerFormed] = useState(false);

  useEffect(() => {
    if (isReady && !audioTriggered.current) {
      audioTriggered.current = true;

      // 1. Stop alert beeps immediately
      stop("alert-beep");

      // 2. Play access-granted chime
      play("access-granted");

      // 3. Play background celebration music
      const musicTimer = setTimeout(() => {
        play("celebration-music");
      }, 800);

      // 4. Smoothly fade celebration music down to complete silence by the end
      const fadeTimer = setTimeout(() => {
        fade("celebration-music", 0.35, 0, 4000);
      }, fastMode ? 3000 : 4500);

      // 5. Hard stop on audio once fade is complete to ensure 100% total silence
      const stopAllTimer = setTimeout(() => {
        stop("celebration-music");
        stop("ambient-hum");
      }, fastMode ? 7200 : 9000);

      return () => {
        clearTimeout(musicTimer);
        clearTimeout(fadeTimer);
        clearTimeout(stopAllTimer);
      };
    }
  }, [isReady, play, stop, fade, fastMode]);

  // Handle banner completion: trigger a single subtle confetti shower
  const handleBannerComplete = () => {
    setBannerFormed(true);
    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.8, x: 0.5 },
        colors: ["#3FA66E", "#FFFFFF", "#22D3EE", "#2D8254"],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <motion.div 
      className="w-full h-screen relative overflow-hidden select-none bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Full-Screen Motion-Drawing Photographic Banner (Zero Distortion, Edge-to-Edge) */}
      <MotionDrawingBanner 
        speedMultiplier={fastMode ? 0.55 : 1.0}
        onFormComplete={handleBannerComplete}
      />

      {/* Floating Status Bar in corner: subtle, crystal-clear, zero obstruction of faces or names */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: bannerFormed ? 1 : 0, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute bottom-6 right-8 z-30 pointer-events-none"
      >
        <div className="bg-black/80 border border-emerald-500/50 backdrop-blur-md px-4 py-2 rounded-lg shadow-xl shadow-emerald-500/10 flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="flex flex-col text-right">
            <span className="font-mono text-xs md:text-sm font-bold text-emerald-300 tracking-wider">
              ✓ {visitorCopy.reveal.statusLine}
            </span>
            {showSubtext && (
              <span className="font-mono text-[10px] md:text-xs text-white/70 tracking-widest uppercase">
                {visitorCopy.reveal.subtext1} · {visitorCopy.reveal.subtext2}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
