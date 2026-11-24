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
    // When on standby (Scene 0), advancing starts the 15-second cinematic experience
    if (sceneIndex === 0) {
      updateState({ sceneIndex: 1 });
    } else if (sceneIndex >= 5) {
      // If already on the final banner, restart back to standby
      updateState({ sceneIndex: 0 });
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

  // Listen for query params e.g. /visit?mode=full or /visit?mode=fast
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      if (mode === "full" || mode === "standard" || mode === "38s" || mode === "40s" || mode === "slow") {
        updateState({ fastMode: false });
      } else if (mode === "fast" || mode === "15s") {
        updateState({ fastMode: true });
      }
    }
  }, [updateState]);

  // Automatic Scene Progression (calibrated for 15s Fast Mode or 38s Full Cinematic Mode)
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (sceneIndex === 1) {
      // Perimeter alert: 1.8s (Fast) or 5.8s (Full 38s)
      timeout = setTimeout(() => updateState({ sceneIndex: 2 }), fastMode ? 1800 : 5800);
    } else if (sceneIndex === 2) {
      // Self-running Escalation: 3.5s (Fast) or 11.5s (Full 38s)
      timeout = setTimeout(() => updateState({ sceneIndex: 3 }), fastMode ? 3500 : 11500);
    } else if (sceneIndex === 3) {
      // Identity scan: 3.0s (Fast) or 9.5s (Full 38s)
      timeout = setTimeout(() => updateState({ sceneIndex: 4 }), fastMode ? 3000 : 9500);
    } else if (sceneIndex === 4) {
      // Countdown: 2.0s (Fast) or 4.8s (Full 38s)
      timeout = setTimeout(() => updateState({ sceneIndex: 5 }), fastMode ? 2000 : 4800);
    }
    // Scene 5 (VScene4) is the Grand Climax / Final Screen — holds indefinitely with zero distortion banner

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [sceneIndex, updateState, fastMode]);

  if (!isReady) return null;

  return (
    <main 
      className="w-full h-screen overflow-hidden bg-[var(--background)] text-white relative cursor-pointer selection:bg-transparent"
      onClick={() => {
        if (sceneIndex === 0 || sceneIndex >= 5) {
          advanceScene();
        }
      }}
    >
      <HUDFrame sceneIndex={sceneIndex} mode="visitor">
        {/* Standby Mode Switcher (visible on Scene 0 so presenters can pick 15s or 38s before launch) */}
        {sceneIndex === 0 && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="absolute bottom-8 right-8 z-40 flex items-center gap-2 bg-black/80 border border-gray-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-2xl pointer-events-auto"
          >
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mr-1">Experience Mode:</span>
            <button
              onClick={() => updateState({ fastMode: true })}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                fastMode
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm shadow-amber-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>⚡</span> 15s Fast
            </button>
            <button
              onClick={() => updateState({ fastMode: false })}
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                !fastMode
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>🎬</span> 38s Full Cinematic
            </button>
          </div>
        )}

        {/* Glitch Cut Overlay */}
        {isGlitching && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="glitch-transition-out" />
            <div className="absolute inset-0 glitch-layer-1 bg-white" />
            <div className="absolute inset-0 glitch-layer-2 bg-black" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isGlitching && sceneIndex === 0 && <VScene0 key="vscene0" timeConfig={timeConfig} />}
          {!isGlitching && sceneIndex === 1 && <VScene1 key="vscene1" fastMode={fastMode} />}
          {!isGlitching && sceneIndex === 2 && <VScene2 key="vscene2" fastMode={fastMode} />}
          {!isGlitching && sceneIndex === 3 && <VScene3 key="vscene3" fastMode={fastMode} />}
          {!isGlitching && sceneIndex === 4 && (
            <VScene3b 
              key="vscene3b" 
              fastMode={fastMode} 
              onAutoAdvance={() => updateState({ sceneIndex: 5 })} 
            />
          )}
          {!isGlitching && sceneIndex >= 5 && <VScene4 key="vscene4" fastMode={fastMode} showSubtext={true} />}
        </AnimatePresence>
      </HUDFrame>
    </main>
  );
}
