"use client";

import React from "react";
import { motion } from "framer-motion";
import { LiveDashboard } from "@/components/LiveDashboard";
import { HexDumpStream } from "@/components/TechEffects";
import { useVisitSyncState } from "@/lib/useVisitSyncState";

export const VScene0 = () => {
  const { state } = useVisitSyncState("display");

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
        <LiveDashboard timeConfig={state.timeConfig} />
      </div>
    </motion.div>
  );
};
