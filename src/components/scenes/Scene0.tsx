"use client";

import React, { useEffect } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useAudio } from "@/components/AudioSystem";
import { motion } from "framer-motion";
import { LiveDashboard } from "@/components/LiveDashboard";
import { HexDumpStream } from "@/components/TechEffects";

export const Scene0 = () => {
  const { isReady } = useAudio();

  // No sound in Scene 0 per user request


  return (
    <motion.div 
      className="w-full h-screen flex flex-col relative overflow-hidden bg-[var(--background)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <HexDumpStream side="left" speed={600} />
        <HexDumpStream side="right" speed={500} />
      </div>
      
      <div className="relative z-10 w-full h-full">
        <LiveDashboard />
      </div>
    </motion.div>
  );
};
