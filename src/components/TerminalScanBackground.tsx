"use client";

import React, { useEffect, useState } from "react";

const CHARS = "0123456789ABCDEF";

export const TerminalScanBackground = ({ 
  color = "text-[var(--color-brand-red)]", 
  opacity = "opacity-10",
  intervalMs = 80
}) => {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const generateLine = () => {
      const hex = (len = 4) => Array(len).fill(0).map(() => CHARS[Math.floor(Math.random() * 16)]).join('');
      const parts = [
        `0x${hex(8)}`,
        `[SCAN]`,
        hex(), hex(), hex(), hex(),
        `SYS.${hex()}`
      ];
      
      let line = parts.join("  ");
      for(let i=0; i < 15; i++) {
        line += " " + hex(Math.random() > 0.5 ? 4 : 8);
      }
      return line;
    };

    // Pre-fill screen with lines
    const lineCount = 50; 
    const initial = Array(lineCount).fill(0).map(generateLine);
    setLines(initial);

    const interval = setInterval(() => {
      setLines(prev => {
        const next = [...prev.slice(1)];
        next.push(generateLine());
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return (
    <div 
      className={`absolute inset-0 z-0 overflow-hidden font-mono text-[10px] sm:text-xs leading-tight flex flex-col justify-start items-start p-4 ${color} ${opacity} pointer-events-none whitespace-pre select-none`}
      style={{
        maskImage: "radial-gradient(circle at center, black 0%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 90%)"
      }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
};
