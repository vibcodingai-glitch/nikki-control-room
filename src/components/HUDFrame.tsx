"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CoordinateHUD, SignalWaveform, DataTicker, GlitchText } from "./TechEffects";

const RAIN_CHARS = "0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/アイウエオカキクケコサシスセソタチツテト";

const RainColumn = ({ left, delay, duration, color = "text-emerald-500/20" }: { left: string; delay: number; duration: number; color?: string }) => {
  const [chars, setChars] = useState<string[]>([]);

  useEffect(() => {
    const changeChars = () => {
      setChars(
        Array.from({ length: Math.floor(Math.random() * 8) + 4 }, () =>
          RAIN_CHARS.charAt(Math.floor(Math.random() * RAIN_CHARS.length))
        )
      );
    };
    changeChars();
    const interval = setInterval(changeChars, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={`absolute top-0 text-[10px] font-mono ${color} whitespace-pre leading-tight`}
      style={{ left }}
      initial={{ y: "-10vh", opacity: 0 }}
      animate={{ y: "110vh", opacity: [0, 0.6, 0.6, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    >
      {chars.map((c, i) => (
        <div key={i}>{c}</div>
      ))}
    </motion.div>
  );
};

// Floating status badges in corners
const StatusBadge = ({ text, position, color }: { text: string; position: string; color: string }) => (
  <div className={`absolute ${position} z-40 font-mono text-[8px] tracking-widest uppercase pointer-events-none select-none`} style={{ color }}>
    <GlitchText text={text} className="opacity-30" glitchInterval={5000} />
  </div>
);

export const HUDFrame = ({ children, sceneIndex }: { children: React.ReactNode; sceneIndex: number }) => {
  const isAlertPhase = sceneIndex >= 1 && sceneIndex <= 4;
  const isCelebration = sceneIndex >= 5;
  const bracketColor = isAlertPhase
    ? "border-[var(--color-brand-coral)]"
    : isCelebration
    ? "border-[var(--color-brand-coral)]/40"
    : "border-[var(--color-brand-green)]";
  const rainColor = isAlertPhase ? "text-red-500/15" : "text-emerald-500/15";
  const accentHex = isAlertPhase ? "#D63C2C" : "#3FA66E";

  const [sysTime, setSysTime] = useState("");
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setSysTime(now.toISOString().replace("T", " ").substring(0, 19));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const tickerItems = isAlertPhase
    ? [
        "THREAT LEVEL: ELEVATED",
        "SIGNAL LOCK: ACTIVE",
        "SCAN MODE: DEEP",
        "ENCRYPTION: AES-256",
        "NODE 7.4.1 RESPONSIVE",
        "PACKET LOSS: 0.02%",
        "BANDWIDTH: 94.7 Mbps",
        `SYS TIME: ${sysTime}`,
      ]
    : [
        "SYS STATUS: NOMINAL",
        "ALL NODES: ONLINE",
        "UPLINK: STABLE",
        "ENCRYPTION: AES-256",
        "HEARTBEAT: 72ms",
        "BANDWIDTH: 94.7 Mbps",
        `SYS TIME: ${sysTime}`,
      ];

  return (
    <div className="w-full h-screen relative overflow-hidden hud-grid">
      {/* Corner Brackets — thicker, more tactical */}
      <div className="pointer-events-none absolute inset-0 p-4 md:p-8 z-50 mix-blend-screen opacity-25">
        <div className={`absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 ${bracketColor}`}>
          <div className={`absolute top-1 left-1 w-2 h-2 border-t border-l ${bracketColor} opacity-50`} />
        </div>
        <div className={`absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 ${bracketColor}`}>
          <div className={`absolute top-1 right-1 w-2 h-2 border-t border-r ${bracketColor} opacity-50`} />
        </div>
        <div className={`absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 ${bracketColor}`}>
          <div className={`absolute bottom-1 left-1 w-2 h-2 border-b border-l ${bracketColor} opacity-50`} />
        </div>
        <div className={`absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 ${bracketColor}`}>
          <div className={`absolute bottom-1 right-1 w-2 h-2 border-b border-r ${bracketColor} opacity-50`} />
        </div>
      </div>

      {/* Status badges in corners */}
      <StatusBadge text="SIG.INT" position="top-7 left-24" color={accentHex} />
      <StatusBadge text={`SCN-${sceneIndex}`} position="top-7 right-24" color={accentHex} />
      <StatusBadge text="ENCRYPTED" position="bottom-7 right-24" color={accentHex} />

      {/* Coordinate HUD — bottom left */}
      <div className="absolute bottom-7 left-24 z-40 pointer-events-none">
        <CoordinateHUD />
      </div>

      {/* Signal Waveform — top right area */}
      <div className="absolute top-14 right-8 z-40 pointer-events-none opacity-30">
        <SignalWaveform bars={24} color={accentHex} height={20} />
      </div>

      {/* Denser Data Rain */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden mix-blend-screen">
        <RainColumn left="3%" delay={0} duration={7} color={rainColor} />
        <RainColumn left="8%" delay={4} duration={11} color={rainColor} />
        <RainColumn left="14%" delay={2} duration={9} color={rainColor} />
        <RainColumn left="22%" delay={6} duration={13} color={rainColor} />
        <RainColumn left="35%" delay={1} duration={8} color={rainColor} />
        <RainColumn left="48%" delay={7} duration={14} color={rainColor} />
        <RainColumn left="62%" delay={3} duration={10} color={rainColor} />
        <RainColumn left="75%" delay={5} duration={12} color={rainColor} />
        <RainColumn left="83%" delay={0.5} duration={9} color={rainColor} />
        <RainColumn left="88%" delay={2.5} duration={7} color={rainColor} />
        <RainColumn left="93%" delay={4.5} duration={11} color={rainColor} />
        <RainColumn left="97%" delay={1.5} duration={8} color={rainColor} />
      </div>

      {/* Bottom Data Ticker */}
      <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none border-t border-white/5 bg-black/20 py-1">
        <DataTicker items={tickerItems} speed={50} />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
