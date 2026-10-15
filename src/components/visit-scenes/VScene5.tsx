"use client";

import React, { useEffect, useState } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useAudio } from "@/components/AudioSystem";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { TypingLog, SignalWaveform, HexDumpStream } from "@/components/TechEffects";
import { visitorCopy } from "@/lib/visitorCopy";

export const VScene5 = () => {
  const { fade, isReady } = useAudio();
  const [step, setStep] = useState(0);
  const [qrUrl] = useState(() => 
    typeof window !== "undefined" ? `${window.location.origin}/visit/pass` : "/visit/pass"
  );

  useEffect(() => {
    if (isReady) {
      fade("celebration-music", 0.7, 0.2, 2000);
    }
  }, [isReady, fade]);

  useEffect(() => {
    const timings = [
      800,  // INCIDENT
      1600, // STATUS
      2800, // OUTCOME: WELCOMED
      4200, // HOST
      5800, // QR Code fade in
    ];

    const timers = timings.map((time, index) => 
      setTimeout(() => setStep(index + 1), time)
    );

    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      {/* Subtle hex dump — right edge */}
      <HexDumpStream side="right" color="text-emerald-500/8" speed={150} lines={30} />

      {/* Signal waveform — top */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-25">
        <SignalWaveform bars={48} color="#3FA66E" height={24} />
      </div>

      {/* Typing log — bottom left */}
      <div className="absolute bottom-10 left-8 z-20 w-[320px] pointer-events-none">
        <TypingLog 
          messages={visitorCopy.finale.terminalWrapLogs} 
          color="text-emerald-400/30" 
          typingSpeed={35} 
          lineDelay={1200} 
          loop={false} 
        />
      </div>

      <div className="z-10 flex flex-col items-center w-full max-w-4xl px-8">
        
        {/* Terminal Incident Report Card */}
        <motion.div 
          className="w-full border border-emerald-500/30 bg-black/60 p-8 md:p-10 rounded-xl shadow-[0_0_40px_rgba(63,166,110,0.15)] flex flex-col gap-5 backdrop-blur-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">
              OFFICIAL INCIDENT REPORT
            </span>
            <span className="font-mono text-xs text-emerald-400 font-bold">
              SYS-LOG: #VISIT-001
            </span>
          </div>

          {step >= 1 && (
            <SplitFlap 
              text={visitorCopy.finale.incidentTitle} 
              fontSize="text-lg md:text-2xl font-mono font-bold" 
              color="text-white/80" 
              className="justify-start" 
            />
          )}

          {step >= 2 && (
            <SplitFlap 
              text={visitorCopy.finale.statusLine} 
              fontSize="text-xl md:text-3xl font-mono font-bold" 
              color="text-[var(--color-brand-green)] text-glow-green" 
              className="justify-start" 
            />
          )}

          {step >= 3 && (
            <SplitFlap 
              text={visitorCopy.finale.outcomeLine} 
              fontSize="text-xl md:text-3xl font-mono font-bold" 
              color="text-white text-glow-white" 
              className="justify-start" 
            />
          )}

          {step >= 4 && (
            <div className="font-mono text-sm md:text-base text-gray-400 border-t border-gray-800/80 pt-3">
              {visitorCopy.finale.hostedLine}
            </div>
          )}
        </motion.div>

        {/* QR Code Section -> /visit/pass */}
        {step >= 5 && qrUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-8 flex flex-col items-center gap-4"
          >
            <SplitFlap 
              text={visitorCopy.finale.qrPrompt} 
              fontSize="text-xs md:text-lg font-mono font-bold tracking-widest" 
              color="text-[var(--color-brand-green)]" 
              className="justify-center" 
            />
            
            <div className="bg-[#F2E9DD] p-4 rounded-xl shadow-[0_0_30px_rgba(63,166,110,0.25)] border-2 border-emerald-500/40">
              <QRCodeSVG value={qrUrl} size={170} fgColor="#061114" />
            </div>

            <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
              Tap or scan on mobile to download visitor pass
            </span>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
};
