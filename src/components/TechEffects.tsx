"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────
// 1. GLITCH TEXT — text that randomly "corrupts" briefly
// ─────────────────────────────────────────────────────────
const GLITCH_CHARS = "!@#$%^&*()_+-={}[]|;:<>?/\\~`█▓▒░▄▀▐▌";

export const GlitchText = ({
  text,
  className = "",
  glitchInterval = 3000,
  glitchDuration = 150,
}: {
  text: string;
  className?: string;
  glitchInterval?: number;
  glitchDuration?: number;
}) => {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const interval = setInterval(() => {
      // Pick 1-3 random positions to corrupt
      const corrupted = text.split("");
      const numCorrupt = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numCorrupt; i++) {
        const pos = Math.floor(Math.random() * text.length);
        corrupted[pos] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
      }
      setDisplay(corrupted.join(""));

      // Restore after glitchDuration
      setTimeout(() => setDisplay(text), glitchDuration);
    }, glitchInterval);

    return () => clearInterval(interval);
  }, [text, glitchInterval, glitchDuration]);

  return <span className={`font-mono ${className}`}>{display}</span>;
};

// ─────────────────────────────────────────────────────────
// 2. HEXDUMP STREAM — scrolling hex data like a memory dump
// ─────────────────────────────────────────────────────────
const randomHex = (len: number) =>
  Array.from({ length: len }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join(" ");

export const HexDumpStream = ({
  lines = 20,
  speed = 120,
  className = "",
  color = "text-emerald-500/20",
  side = "left",
}: {
  lines?: number;
  speed?: number;
  className?: string;
  color?: string;
  side?: "left" | "right";
}) => {
  const [data, setData] = useState<string[]>([]);
  const addr = useRef(0x004000);

  useEffect(() => {
    const initial = Array.from({ length: lines }, () => {
      const line = `${addr.current.toString(16).padStart(8, "0")}  ${randomHex(8)}  ${randomHex(8)}`;
      addr.current += 16;
      return line;
    });
    setData(initial);

    const interval = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1)];
        next.push(
          `${addr.current.toString(16).padStart(8, "0")}  ${randomHex(8)}  ${randomHex(8)}`
        );
        addr.current += 16;
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [lines, speed]);

  return (
    <div
      className={`absolute top-0 ${side === "left" ? "left-0" : "right-0"} h-full overflow-hidden font-mono text-[9px] leading-[14px] ${color} pointer-events-none select-none z-0 ${className}`}
      style={{
        width: "clamp(180px, 18vw, 300px)",
        maskImage:
          side === "left"
            ? "linear-gradient(to right, black 60%, transparent 100%)"
            : "linear-gradient(to left, black 60%, transparent 100%)",
        WebkitMaskImage:
          side === "left"
            ? "linear-gradient(to right, black 60%, transparent 100%)"
            : "linear-gradient(to left, black 60%, transparent 100%)",
      }}
    >
      {data.map((line, i) => (
        <div key={i} className="whitespace-pre">
          {line}
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 3. NETWORK PULSE — animated SVG radar/sonar pulse
// ─────────────────────────────────────────────────────────
export const NetworkPulse = ({
  color = "#3FA66E",
  className = "",
  size = 300,
}: {
  color?: string;
  className?: string;
  size?: number;
}) => {
  return (
    <div className={`pointer-events-none ${className}`}>
      <svg width={size} height={size} viewBox="0 0 200 200">
        {/* Concentric rings pulsing outward */}
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={i}
            cx="100"
            cy="100"
            r="10"
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            initial={{ r: 10, opacity: 0.6 }}
            animate={{ r: 90, opacity: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.75,
              ease: "easeOut",
            }}
          />
        ))}
        {/* Center dot */}
        <motion.circle
          cx="100"
          cy="100"
          r="3"
          fill={color}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Sweep line */}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="20"
          stroke={color}
          strokeWidth="0.5"
          opacity="0.4"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "100px 100px" }}
        />
        {/* Cross-hairs */}
        <line x1="100" y1="5" x2="100" y2="195" stroke={color} strokeWidth="0.3" opacity="0.15" />
        <line x1="5" y1="100" x2="195" y2="100" stroke={color} strokeWidth="0.3" opacity="0.15" />
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 4. TYPING LOG — simulated terminal output that types
// ─────────────────────────────────────────────────────────
export const TypingLog = ({
  messages,
  typingSpeed = 30,
  lineDelay = 800,
  className = "",
  color = "text-emerald-500/60",
  loop = true,
}: {
  messages: string[];
  typingSpeed?: number;
  lineDelay?: number;
  className?: string;
  color?: string;
  loop?: boolean;
}) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    let msgIdx = 0;
    let charIdx = 0;
    let phase: "typing" | "waiting" = "typing";

    const cursorBlink = setInterval(() => setCursor((c) => !c), 500);

    const tick = () => {
      if (phase === "typing") {
        if (charIdx <= messages[msgIdx].length) {
          setCurrentLine(messages[msgIdx].substring(0, charIdx));
          charIdx++;
          return typingSpeed;
        } else {
          // Line done
          setLines((prev) => {
            const next = [...prev, messages[msgIdx]];
            if (next.length > 12) return next.slice(next.length - 12);
            return next;
          });
          setCurrentLine("");
          charIdx = 0;
          msgIdx++;

          if (msgIdx >= messages.length) {
            if (loop) {
              msgIdx = 0;
              setLines([]);
            } else {
              return -1;
            }
          }
          phase = "waiting";
          return lineDelay;
        }
      } else {
        phase = "typing";
        return typingSpeed;
      }
    };

    let timeout: NodeJS.Timeout;
    const run = () => {
      const next = tick();
      if (next > 0) {
        timeout = setTimeout(run, next);
      }
    };
    run();

    return () => {
      clearTimeout(timeout);
      clearInterval(cursorBlink);
    };
  }, [messages, typingSpeed, lineDelay, loop]);

  return (
    <div className={`font-mono text-[10px] leading-[16px] ${color} ${className}`}>
      {lines.map((line, i) => (
        <div key={i} className="opacity-40">
          <span className="text-gray-600">$ </span>
          {line}
        </div>
      ))}
      {currentLine !== undefined && (
        <div>
          <span className="text-gray-600">$ </span>
          {currentLine}
          <span className={cursor ? "opacity-100" : "opacity-0"}>▊</span>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 5. SIGNAL WAVEFORM — animated audio-style waveform bars
// ─────────────────────────────────────────────────────────
export const SignalWaveform = ({
  bars = 32,
  color = "#3FA66E",
  className = "",
  height = 40,
}: {
  bars?: number;
  color?: string;
  className?: string;
  height?: number;
}) => {
  return (
    <div className={`flex items-end gap-[1px] ${className}`} style={{ height }}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[2px] rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            height: [
              Math.random() * height * 0.3 + 2,
              Math.random() * height * 0.8 + 4,
              Math.random() * height * 0.3 + 2,
            ],
          }}
          transition={{
            duration: Math.random() * 0.6 + 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.03,
          }}
        />
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 6. DATA TICKER — scrolling horizontal data bar
// ─────────────────────────────────────────────────────────
export const DataTicker = ({
  items,
  speed = 40,
  className = "",
  color = "text-emerald-500/30",
}: {
  items: string[];
  speed?: number;
  className?: string;
  color?: string;
}) => {
  const content = items.join("  ●  ");
  const doubled = `${content}  ●  ${content}`;

  return (
    <div className={`overflow-hidden whitespace-nowrap font-mono text-[10px] ${color} ${className}`}>
      <motion.div
        animate={{ x: [0, -(content.length * 6)] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="inline-block"
      >
        {doubled}
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 7. COORDINATE HUD — floating coordinate readout
// ─────────────────────────────────────────────────────────
export const CoordinateHUD = ({ className = "" }: { className?: string }) => {
  const [coords, setCoords] = useState({ lat: 5.6037, lng: -0.187, alt: 42 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCoords({
        lat: 5.6037 + (Math.random() - 0.5) * 0.001,
        lng: -0.187 + (Math.random() - 0.5) * 0.001,
        alt: 42 + Math.floor(Math.random() * 3),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`font-mono text-[9px] text-emerald-500/40 flex gap-4 ${className}`}>
      <span>LAT {coords.lat.toFixed(4)}°N</span>
      <span>LNG {Math.abs(coords.lng).toFixed(3)}°W</span>
      <span>ALT {coords.alt}m</span>
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ◉ LOCKED
      </motion.span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// 8. PROGRESS BAR — animated hacking-style progress
// ─────────────────────────────────────────────────────────
export const HackProgress = ({
  label = "DECRYPTING",
  duration = 8,
  color = "#E8604C",
  className = "",
  loop = true,
}: {
  label?: string;
  duration?: number;
  color?: string;
  className?: string;
  loop?: boolean;
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const pct = Math.min(100, (elapsed / duration) * 100);
      
      // Add jitter for realism
      const jitter = Math.random() * 2 - 1;
      setProgress(Math.min(100, pct + jitter));
      
      if (pct >= 100 && loop) {
        // Reset after a brief pause
        setTimeout(() => setProgress(0), 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [duration, loop]);

  return (
    <div className={`font-mono text-[10px] ${className}`}>
      <div className="flex justify-between mb-1">
        <span style={{ color }} className="opacity-60">{label}</span>
        <span className="text-white/30">{progress.toFixed(1)}%</span>
      </div>
      <div className="w-full h-[3px] bg-white/5 rounded overflow-hidden">
        <motion.div
          className="h-full rounded"
          style={{ backgroundColor: color, width: `${progress}%` }}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 0.3, repeat: Infinity }}
        />
      </div>
    </div>
  );
};
