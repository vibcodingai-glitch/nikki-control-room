"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useVisitSyncState } from "@/lib/useVisitSyncState";

export const VScene0 = () => {
  const { state } = useVisitSyncState("display");
  const { timeConfig } = state;
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeConfig.useRealTime) {
        setTime(new Date());
      } else {
        const [hours, minutes, seconds] = (timeConfig.simulatedTime || "00:00:00")
          .split(":")
          .map(Number);
        const simDate = new Date();
        simDate.setHours(hours || 0, minutes || 0, seconds || 0);
        setTime(simDate);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeConfig]);

  const formatTime = (date: Date, offsetHours: number) => {
    const d = new Date(date.getTime() + offsetHours * 3600 * 1000);
    return d.toISOString().substring(11, 19);
  };

  return (
    <motion.div 
      className="w-full h-screen relative overflow-hidden select-none bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Full-Screen Welcome Banner Artwork (Edge-to-Edge, Zero Distortion) */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url('/visitor/guest-banner.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Subtle Holographic Grid Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(63, 166, 110, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(63, 166, 110, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Top-Right Telemetry Bar: Live & Time Widget */}
      <div className="absolute top-4 right-6 z-20 flex items-center gap-5 font-mono bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-gray-800/80 shadow-xl">
        {/* WAT Clock */}
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">WAT</span>
          <span className="text-sm font-medium text-white tabular-nums">{formatTime(time, 1)}</span>
        </div>

        {/* GMT Clock */}
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">GMT</span>
          <span className="text-sm font-medium text-white tabular-nums">{formatTime(time, 0)}</span>
        </div>

        {/* ● LIVE Green Pulsing Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.85, 1.15, 0.85] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-emerald-400" 
          />
          <span className="uppercase text-xs tracking-widest font-bold">LIVE</span>
        </div>

        {/* Small Control Room Signal Indicator */}
        <div className="w-6 h-6 rounded-full border border-gray-700/60 flex items-center justify-center bg-gray-900/80 text-gray-400">
          <div className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" style={{ animationDuration: "3s" }} />
        </div>
      </div>

      {/* Top-Left Discreet System Tag */}
      <div className="absolute top-4 left-6 z-20 hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-800/80 font-mono text-[10px] text-gray-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="tracking-widest uppercase">CWAR CONTROL ROOM · NODE 7.4.1</span>
      </div>
    </motion.div>
  );
};
