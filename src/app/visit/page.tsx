"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { useAudio } from "@/components/AudioSystem";
import { VScene0 } from "@/components/visit-scenes/VScene0";
import { VScene1 } from "@/components/visit-scenes/VScene1";
import { VScene2 } from "@/components/visit-scenes/VScene2";
import { VScene3 } from "@/components/visit-scenes/VScene3";
import { VScene3b } from "@/components/visit-scenes/VScene3b";
import { VScene4 } from "@/components/visit-scenes/VScene4";
import { VScene5 } from "@/components/visit-scenes/VScene5";
import { HUDFrame } from "@/components/HUDFrame";
import { useVisitSyncState } from "@/lib/useVisitSyncState";

export default function VisitorDisplayPage() {
  const { isReady, stop } = useAudio();
  const { state, updateState, events } = useVisitSyncState("display");
  const [isGlitching, setIsGlitching] = useState(false);
  const prevScene = useRef(0);
  const { sceneIndex, autoTriggerConfig, timeConfig, transitionTimings, fastMode } = state;

  useEffect(() => {
    // Listen for skip_audio event
    const handleSkipAudio = () => {
      stop("ambient-hum");
      stop("alert-detected-voice");
      stop("alert-beep");
      stop("whoosh-transition");
      stop("celebration-horn");
      stop("celebration-music");
      stop("access-granted");
    };
    
    events?.addEventListener("skip_audio", handleSkipAudio);
    return () => events?.removeEventListener("skip_audio", handleSkipAudio);
  }, [events, stop]);

  const advanceScene = useCallback(() => {
    // 0: VScene0, 1: VScene1, 2: VScene2, 3: VScene3, 4: VScene3b, 5: VScene4, 6: VScene4(subtext), 7: VScene5
    if (sceneIndex < 7 && sceneIndex !== 4) {
      updateState({ sceneIndex: sceneIndex + 1 });
    }
  }, [sceneIndex, updateState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        advanceScene();
      } else if (e.code === "Escape" || e.code === "Backspace") {
        e.preventDefault();
        updateState({ sceneIndex: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [advanceScene, updateState]);

  useEffect(() => {
    // Glitch transitions between early scenes
    const shouldGlitch = 
      (prevScene.current === 0 && sceneIndex === 1) ||
      (prevScene.current === 1 && sceneIndex === 2) ||
      (prevScene.current === 2 && sceneIndex === 3);

    if (shouldGlitch) {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), transitionTimings.glitchCutMs);
    }

    prevScene.current = sceneIndex;
  }, [sceneIndex, transitionTimings.glitchCutMs]);

  // Auto-trigger logic (for scheduled launches)
  useEffect(() => {
    if (!autoTriggerConfig.enabled || sceneIndex !== 0) return;

    const interval = setInterval(() => {
      if (timeConfig.useRealTime) {
        const now = new Date();
        const currentSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        
        const [tH, tM, tS] = autoTriggerConfig.triggerTime.split(':').map(Number);
        const triggerSecs = tH * 3600 + tM * 60 + (tS || 0);

        if (currentSecs >= triggerSecs && currentSecs <= triggerSecs + 10) {
          updateState((prev) => ({ 
            ...prev,
            sceneIndex: 1, 
            autoTriggerConfig: { ...prev.autoTriggerConfig, enabled: false } 
          }));
        }
      } else {
        if (timeConfig.simulatedTime === autoTriggerConfig.triggerTime) {
          updateState((prev) => ({ 
            ...prev,
            sceneIndex: 1, 
            autoTriggerConfig: { ...prev.autoTriggerConfig, enabled: false } 
          }));
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [autoTriggerConfig, sceneIndex, timeConfig, updateState]);

  // Automatic Scene Progression with optional Fast Mode (~35% shorter)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const speedMultiplier = fastMode ? 0.65 : 1.0;

    if (sceneIndex === 1) {
      // Perimeter alert: 6s
      timeout = setTimeout(() => updateState({ sceneIndex: 2 }), Math.round(6000 * speedMultiplier));
    } else if (sceneIndex === 2) {
      // Self-running Escalation: 12s
      timeout = setTimeout(() => updateState({ sceneIndex: 3 }), Math.round(12000 * speedMultiplier));
    } else if (sceneIndex === 3) {
      // Identity scan: 10s
      timeout = setTimeout(() => updateState({ sceneIndex: 4 }), Math.round(10000 * speedMultiplier));
    } else if (sceneIndex === 5) {
      // Welcome reveal: 5s
      timeout = setTimeout(() => updateState({ sceneIndex: 6 }), Math.round(5000 * speedMultiplier));
    } else if (sceneIndex === 6) {
      // Subtext: 6s
      timeout = setTimeout(() => updateState({ sceneIndex: 7 }), Math.round(6000 * speedMultiplier));
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [sceneIndex, updateState, fastMode]);

  if (!isReady) return null;

  return (
    <main 
      className="w-full h-screen overflow-hidden bg-[var(--background)] text-white relative cursor-pointer selection:bg-transparent"
      onClick={() => {
        if (sceneIndex >= 0 && sceneIndex !== 4) advanceScene();
      }}
    >
      <HUDFrame sceneIndex={sceneIndex} mode="visitor">
        {/* Glitch Cut Overlay */}
        {isGlitching && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="glitch-transition-out" />
            <div className="absolute inset-0 glitch-layer-1 bg-white" />
            <div className="absolute inset-0 glitch-layer-2 bg-black" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isGlitching && sceneIndex === 0 && <VScene0 key="vscene0" />}
          {!isGlitching && sceneIndex === 1 && <VScene1 key="vscene1" />}
          {!isGlitching && sceneIndex === 2 && <VScene2 key="vscene2" />}
          {!isGlitching && sceneIndex === 3 && <VScene3 key="vscene3" />}
          {!isGlitching && sceneIndex === 4 && (
            <VScene3b key="vscene3b" onAutoAdvance={() => updateState({ sceneIndex: 5 })} />
          )}
          {!isGlitching && sceneIndex === 5 && <VScene4 key="vscene4a" showSubtext={false} />}
          {!isGlitching && sceneIndex === 6 && <VScene4 key="vscene4b" showSubtext={true} />}
          {!isGlitching && sceneIndex === 7 && <VScene5 key="vscene5" />}
        </AnimatePresence>
      </HUDFrame>
    </main>
  );
}
