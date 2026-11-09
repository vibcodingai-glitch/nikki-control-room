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
        fade("celebration-music", 0.7, 0, 4000);
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
        particleCount: 45,
        spread: 70,
        origin: { y: 0.7, x: 0.5 },
        colors: ["#3FA66E", "#FFFFFF", "#22D3EE", "#2D8254"],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden px-4 md:px-8 py-6 select-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Dynamic radial green radiant background */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(63, 166, 110, 0.28) 0%, rgba(6, 17, 20, 0.95) 75%)",
        }}
        animate={{ 
          opacity: [0.7, 0.95, 0.7],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="z-10 flex flex-col items-center w-full max-w-6xl mx-auto text-center gap-4">
        
        {/* Top Tag: INCIDENT RESOLVED — VIP ACCESS GRANTED */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-mono text-xs md:text-sm uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)]"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>✓ {visitorCopy.reveal.incidentResolved}</span>
        </motion.div>

        {/* Centerpiece: Motion-Drawing Banner (Zero Facial Distortion) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full"
        >
          <MotionDrawingBanner 
            speedMultiplier={fastMode ? 0.65 : 1.0}
            onFormComplete={handleBannerComplete}
          />
        </motion.div>

        {/* Bottom Status & Climax Resolution Section */}
        <div className="flex flex-col items-center gap-2 min-h-[70px]">
          {/* Status Line */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: bannerFormed ? 1 : 0.4, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-sm md:text-lg text-emerald-300 font-bold tracking-wider drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]"
          >
            {visitorCopy.reveal.statusLine}
          </motion.div>

          {/* Subtext and Host Briefing Notice (Scene Finale) */}
          {showSubtext && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: bannerFormed ? 1 : 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="font-mono text-base md:text-xl font-bold tracking-widest text-white/95">
                {visitorCopy.reveal.subtext1}
              </div>

              <div className="font-mono text-xs md:text-sm text-emerald-200/70 tracking-wider">
                {visitorCopy.reveal.subtext2}
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </motion.div>
  );
};
