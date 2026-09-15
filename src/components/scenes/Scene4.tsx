"use client";

import React, { useEffect, useRef, useState } from "react";
import { SplitFlap } from "@/components/SplitFlap";
import { useAudio } from "@/components/AudioSystem";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface SceneProps {
  showSubtext?: boolean;
}

const FloatingCelebration = () => {
  const [items, setItems] = useState<{ id: number; char: string; left: string; duration: number; size: number; drift: number }[]>([]);

  useEffect(() => {
    let idCounter = 0;
    const interval = setInterval(() => {
      const chars = ["🎂", "🎈", "🎉", "✨", "🎁"];
      const char = chars[Math.floor(Math.random() * chars.length)];
      
      setItems(prev => {
        const next = [...prev, {
          id: idCounter++,
          char,
          left: Math.random() * 90 + 5 + "%",
          duration: Math.random() * 4 + 4,
          size: Math.random() * 2 + 2,
          drift: (Math.random() - 0.5) * 100
        }];
        if (next.length > 40) return next.slice(next.length - 40);
        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: "110vh", x: 0, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: "-10vh", 
              x: item.drift,
              rotate: item.drift > 0 ? 180 : -180 
            }}
            transition={{ duration: item.duration, ease: "easeOut" }}
            className="absolute bottom-0 drop-shadow-lg"
            style={{ left: item.left, fontSize: `${item.size}rem` }}
          >
            {item.char}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const Scene4: React.FC<SceneProps> = ({ showSubtext = false }) => {
  const { play, stop, isReady } = useAudio();
  const confettiTriggered = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isReady && !confettiTriggered.current) {
      confettiTriggered.current = true;
      
      // Stop alerts
      stop("alert-beep");
      
      // Play celebration audio
      play("celebration-horn");
      setTimeout(() => {
        play("celebration-music");
      }, 1500);

      const defaults = { 
        colors: ["#E8604C", "#3FA66E", "#FFFFFF", "#F2E9DD", "#FFD700", "#FF69B4"],
        zIndex: 100 
      };

      let customShapes: any[] = [];
      try {
        if (typeof (confetti as any).shapeFromText === 'function') {
           customShapes = [
             (confetti as any).shapeFromText({ text: '🎂', scalar: 3 }),
             (confetti as any).shapeFromText({ text: '🎈', scalar: 3 }),
             (confetti as any).shapeFromText({ text: '🎁', scalar: 3 }),
             (confetti as any).shapeFromText({ text: '✨', scalar: 3 })
           ];
        }
      } catch (e) {}

      // Initial big burst
      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.6, x: 0.5 },
        colors: defaults.colors,
        shapes: customShapes.length > 0 ? ['circle', 'square', ...customShapes] : ['circle', 'square']
      });

      // Continuous random bursts
      intervalRef.current = setInterval(() => {
        // Random origin across the bottom
        const originX = Math.random();
        const originY = Math.random() * 0.2 + 0.8;
        
        // Sometimes shoot standard confetti, sometimes emojis
        const useEmojis = Math.random() > 0.6 && customShapes.length > 0;
        
        confetti({
          ...defaults,
          particleCount: useEmojis ? 12 : 50,
          spread: Math.random() * 60 + 50,
          origin: { x: originX, y: originY },
          startVelocity: Math.random() * 20 + 35,
          shapes: useEmojis ? customShapes : ['circle', 'square'],
          ticks: 300,
          gravity: 0.8
        });
      }, 700); // Fire every 700ms
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isReady, play, stop]);

  return (
    <motion.div 
      className="w-full h-screen flex flex-col justify-center items-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <FloatingCelebration />
      
      {/* Warm animated gradient blending Dark Teal and Coral */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(circle at 50% 120%, var(--color-brand-coral) 0%, var(--background) 70%)",
          opacity: 0.3,
        }}
        animate={{ 
          background: [
            "radial-gradient(circle at 30% 100%, var(--color-brand-coral) 0%, var(--background) 80%)",
            "radial-gradient(circle at 70% 100%, var(--color-brand-coral) 0%, var(--background) 80%)",
            "radial-gradient(circle at 30% 100%, var(--color-brand-coral) 0%, var(--background) 80%)"
          ] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      <div className="z-10 flex flex-col items-center w-full px-[5%]">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-12"
        >
          <SplitFlap 
            text="INCIDENT RESOLVED" 
            color="text-[var(--color-brand-green)]" 
            fontSize="text-lg md:text-xl font-bold" 
            className="justify-center"
          />
        </motion.div>

        <div className="flex flex-col items-center gap-12 mt-12 w-full">
          <SplitFlap 
            text="HAPPY BIRTHDAY NIKKI! 🎉" 
            color="text-[var(--color-brand-coral)]" 
            fontSize="text-5xl md:text-7xl lg:text-8xl font-bold" 
            className="justify-center"
            staggerDelayMs={60}
          />

          {showSubtext && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-6 mt-8"
            >
              <SplitFlap 
                text="NEW STATUS: HONORARY FELLOW OPERATOR" 
                color="text-white" 
                fontSize="text-2xl md:text-4xl font-bold" 
                className="justify-center"
              />
              <SplitFlap 
                text="GLOBAL NETWORK OF PEOPLE WHO REFUSE TO LET THINGS GO TO WASTE" 
                color="text-white/70" 
                fontSize="text-lg md:text-2xl" 
                className="justify-center"
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
