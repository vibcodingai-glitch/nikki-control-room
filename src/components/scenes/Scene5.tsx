"use client";

import React, { useEffect, useState } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useAudio } from "@/components/AudioSystem";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { TypingLog, SignalWaveform, HexDumpStream } from "@/components/TechEffects";

export const Scene5 = () => {
  const { fade, isReady } = useAudio();
  const [step, setStep] = useState(0);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    if (isReady) {
      // Fade music to low volume
      fade("celebration-music", 0.7, 0.2, 2000);
    }
  }, [isReady, fade]);

  useEffect(() => {
    // Generate QR URL based on current window location
    if (typeof window !== "undefined") {
      setQrUrl(`${window.location.origin}/badge`);
    }

    const timings = [
      1000, // INCIDENT
      2000, // STATUS
      3500, // RESOLUTION
      5500, // LOGGED BY
      8000, // QR Code fade in
    ];

    const timers = timings.map((time, index) => 
      setTimeout(() => setStep(index + 1), time)
    );

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const wrapMessages = [
    "Incident #BDAY-001 closed successfully",
    "All systems returning to nominal state...",
    "Generating operator badge certificate...",
    "Archiving mission telemetry...",
    "Thank you for your service, Nikki.",
  ];

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Subtle hex dump — right edge, very faint */}
      <HexDumpStream side="right" color="text-emerald-500/8" speed={150} lines={30} />

      {/* Signal waveform — top */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-20">
        <SignalWaveform bars={48} color="#3FA66E" height={24} />
      </div>

      {/* Typing log — bottom left */}
      <div className="absolute bottom-12 left-8 z-20 w-[300px] pointer-events-none">
        <TypingLog messages={wrapMessages} color="text-emerald-400/30" typingSpeed={35} lineDelay={1200} loop={false} />
      </div>
      <div className="z-10 flex flex-col items-center w-full max-w-4xl px-8">
        
        {/* Terminal Card */}
        <motion.div 
          className="w-full border border-white/20 bg-black/40 p-8 md:p-12 rounded shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col gap-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {step >= 1 && (
            <SplitFlap text="INCIDENT: #BDAY-001" fontSize="text-lg md:text-2xl" color="text-white/70" className="justify-start" />
          )}
          {step >= 2 && (
            <SplitFlap text="STATUS: ✅ RESOLVED" fontSize="text-xl md:text-3xl" color="text-[var(--color-brand-green)] font-bold" className="justify-start" />
          )}
          {step >= 3 && (
            <SplitFlap text="RESOLUTION: One room welcomed another. Happy birthday, Nikki." fontSize="text-lg md:text-2xl" color="text-white" className="justify-start" />
          )}
          {step >= 4 && (
            <SplitFlap text="LOGGED BY: Nestor Finalo & The Control Room Team" fontSize="text-base md:text-xl" color="text-[var(--color-brand-coral)]" className="justify-start mt-4" />
          )}
        </motion.div>

        {/* QR Code Section */}
        {step >= 5 && qrUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mt-12 flex flex-col items-center gap-6"
          >
            <SplitFlap text="SCAN TO RECEIVE YOUR OPERATOR BADGE" fontSize="text-sm md:text-xl font-bold tracking-widest" color="text-[var(--color-brand-coral)]" className="justify-center" />
            
            <div className="bg-white p-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <QRCodeSVG value={qrUrl} size={180} fgColor="#03080A" />
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};
