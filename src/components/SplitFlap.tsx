"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/components/AudioSystem";

interface SplitFlapProps {
  text: string;
  fontSize?: string;
  color?: string;
  flipSpeedMs?: number;
  className?: string;
  staggerDelayMs?: number;
  mode?: "flap" | "decrypt";
}

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()_+{}[]|;:?,./ ";
const HACKER_CHARS = "0123456789!@#$%^&*()_+{}|:<>?~アイウエオカキクケコサシスセソタチツテト";

export const SplitFlap: React.FC<SplitFlapProps> = ({
  text,
  fontSize = "text-xl",
  color = "text-white",
  flipSpeedMs = 50,
  className = "",
  staggerDelayMs = 40,
  mode = "flap"
}) => {
  const { play, isReady } = useAudio();
  const [displayedChars, setDisplayedChars] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const targetTextRef = useRef(text);
  const timerRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    targetTextRef.current = text;
    setIsComplete(false);
    
    setDisplayedChars((prev) => {
      const newArr = [...prev];
      if (newArr.length < text.length) {
        return [...newArr, ...Array(text.length - newArr.length).fill(" ")];
      }
      return newArr.slice(0, text.length);
    });

    timerRefs.current.forEach((t) => clearInterval(t));
    timerRefs.current = [];

    const activeChars = text.split("").map((c, i) => c !== " " ? i : -1).filter(i => i !== -1);
    let settledCount = 0;

    text.split("").forEach((targetChar, index) => {
      if (targetChar === " ") {
        setDisplayedChars((prev) => {
          const next = [...prev];
          next[index] = " ";
          return next;
        });
        return;
      }

      const settleDelay = index * staggerDelayMs + 300;
      const maxFlips = Math.floor(settleDelay / flipSpeedMs);
      let flipCount = 0;

      const charsPool = mode === "decrypt" ? HACKER_CHARS : CHARACTERS;

      const intervalId = setInterval(() => {
        flipCount++;
        if (flipCount >= maxFlips) {
          clearInterval(intervalId);
          setDisplayedChars((prev) => {
            const next = [...prev];
            next[index] = targetChar;
            return next;
          });
          
          settledCount++;
          if (settledCount >= activeChars.length) {
            setIsComplete(true);
          }

          if (isReady && targetChar !== " ") {
            play("flip-click");
          }
        } else {
          setDisplayedChars((prev) => {
            const next = [...prev];
            next[index] = charsPool.charAt(Math.floor(Math.random() * charsPool.length));
            return next;
          });
          if (isReady && flipCount % 2 === 0) {
            play("flip-click");
          }
        }
      }, flipSpeedMs);
      
      timerRefs.current.push(intervalId);
    });

    return () => {
      timerRefs.current.forEach((t) => clearInterval(t));
    };
  }, [text, isReady, flipSpeedMs, staggerDelayMs, play, mode]);

  // Group characters into words to prevent breaking mid-word
  const wordGroups: { char: string; index: number }[][] = [];
  let currentWord: { char: string; index: number }[] = [];
  
  displayedChars.forEach((char, index) => {
    if (text[index] === " ") {
      if (currentWord.length > 0) {
        wordGroups.push([...currentWord]);
      }
      wordGroups.push([{ char: " ", index }]);
      currentWord = [];
    } else {
      currentWord.push({ char, index });
    }
  });
  if (currentWord.length > 0) wordGroups.push(currentWord);

  if (mode === "decrypt") {
    // Render flat text with glowing effect and cursor
    return (
      <div className={`flex flex-wrap justify-center font-mono ${fontSize} ${color} ${className}`}>
        {wordGroups.map((group, groupIdx) => {
          const isSpaceOnly = group.length === 1 && group[0].char === " ";
          if (isSpaceOnly) {
            return <div key={`space-${groupIdx}`} className="w-[0.5em] flex-shrink-0" />;
          }

          return (
            <div key={groupIdx} className="flex flex-nowrap">
              {group.map(({ char, index }) => (
                <span key={index} className="relative z-0">
                  {char}
                </span>
              ))}
            </div>
          );
        })}
        {/* Blinking Cursor at the end */}
        {isComplete && (
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.4, repeat: 3, ease: "linear" }}
            onAnimationComplete={() => {
              // Leave it invisible or visible? Let's just let it finish.
            }}
            className="ml-[0.2em] relative top-[-0.05em]"
          >
            _
          </motion.span>
        )}
        {!isComplete && (
          <span className="ml-[0.2em] relative top-[-0.05em] animate-pulse">
            _
          </span>
        )}
      </div>
    );
  }

  // mode === "flap"
  return (
    <div className={`flex flex-wrap justify-center gap-y-4 gap-x-[2px] ${className}`}>
      {wordGroups.map((group, groupIdx) => {
        const isSpaceOnly = group.length === 1 && text[group[0].index] === " ";
        if (isSpaceOnly) {
          return (
            <div key={`space-${groupIdx}`} className="w-[1.2em] md:w-[1.4em] flex-shrink-0" />
          );
        }

        return (
          <div key={groupIdx} className="flex flex-nowrap gap-[2px]">
            <AnimatePresence mode="popLayout">
              {group.map(({ char, index }) => (
                <div
                  key={index}
                  className={`relative flex items-center justify-center overflow-hidden bg-black/40 rounded-sm font-mono border-t border-b border-black/50 shadow-sm ${fontSize} ${color}`}
                  style={{ minWidth: "1.2em", height: "1.5em", padding: "0 0.1em" }}
                >
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black/80 z-10" />
                  <motion.span
                    key={char + index}
                    initial={{ rotateX: -90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    exit={{ rotateX: 90, opacity: 0 }}
                    transition={{ duration: flipSpeedMs / 1000, ease: "linear" }}
                    className="relative z-0"
                  >
                    {char}
                  </motion.span>
                </div>
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
