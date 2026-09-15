"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAudio } from "@/components/AudioSystem";
import { Scene0 } from "@/components/scenes/Scene0";
import { Scene1 } from "@/components/scenes/Scene1";
import { Scene2 } from "@/components/scenes/Scene2";
import { Scene3 } from "@/components/scenes/Scene3";
import { Scene3b } from "@/components/scenes/Scene3b";
import { Scene4 } from "@/components/scenes/Scene4";
import { Scene5 } from "@/components/scenes/Scene5";
import { HUDFrame } from "@/components/HUDFrame";
import { useSyncState } from "@/lib/useSyncState";

export default function Home() {
  const { isReady, play, stop } = useAudio();
  const { state, updateState, events } = useSyncState("display");
  const [isGlitching, setIsGlitching] = useState(false);
  const prevScene = useRef(0);
  const { sceneIndex, autoTriggerConfig, timeConfig, transitionTimings } = state;

  useEffect(() => {
    // Listen for skip_audio event
    const handleSkipAudio = () => {
      // Very naive skip logic - could be expanded based on what is playing
      stop("ambient-hum");
      stop("alert-detected-voice");
      stop("alert-beep");
      stop("whoosh-transition");
      stop("celebration-horn");
      stop("celebration-music");
    };
    
    events?.addEventListener("skip_audio", handleSkipAudio);
    return () => events?.removeEventListener("skip_audio", handleSkipAudio);
  }, [events, stop]);

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
  }, [sceneIndex, updateState]);

  const advanceScene = () => {
    // 0: Scene 0, 1: Scene 1, 2: Scene 2, 3: Scene 3, 4: Scene 3b, 5: Scene 4(reveal), 6: Scene 4(subtext), 7: Scene 5
    if (sceneIndex < 7 && sceneIndex !== 4) {
      updateState({ sceneIndex: sceneIndex + 1 });
    }
  };

  useEffect(() => {
    // Check if we need a glitch transition
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

  // Auto-trigger logic
  useEffect(() => {
    if (!autoTriggerConfig.enabled || sceneIndex !== 0) return;

    const interval = setInterval(() => {
      if (timeConfig.useRealTime) {
        const now = new Date();
        const currentSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        
        const [tH, tM, tS] = autoTriggerConfig.triggerTime.split(':').map(Number);
        const triggerSecs = tH * 3600 + tM * 60 + (tS || 0);

        // Fire if we are at or up to 10 seconds past the trigger time
        // (This prevents missing the exact second if the browser throttled the tab)
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

  // Automatic Scene Progression (Cinematic Sequence)
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (sceneIndex === 1) {
      timeout = setTimeout(() => updateState({ sceneIndex: 2 }), 6000);
    } else if (sceneIndex === 2) {
      timeout = setTimeout(() => updateState({ sceneIndex: 3 }), 8000);
    } else if (sceneIndex === 3) {
      timeout = setTimeout(() => updateState({ sceneIndex: 4 }), 10000);
    } else if (sceneIndex === 5) {
      timeout = setTimeout(() => updateState({ sceneIndex: 6 }), 5000);
    } else if (sceneIndex === 6) {
      timeout = setTimeout(() => updateState({ sceneIndex: 7 }), 6000);
    }

    // Cleanup timeout if scene changes manually before timeout fires
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [sceneIndex, updateState]);

  if (!isReady) return null;

  return (
    <main 
      className="w-full h-screen overflow-hidden bg-[var(--background)] text-white relative cursor-pointer selection:bg-transparent"
      onClick={() => {
        // Scene 0 is silent, audio begins at Scene 1 (Anomaly Detected)

        if (sceneIndex >= 0 && sceneIndex !== 4) advanceScene();
      }}
    >
      <HUDFrame sceneIndex={sceneIndex}>
        {/* Glitch Cut Overlay */}
        {isGlitching && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="glitch-transition-out" />
            <div className="absolute inset-0 glitch-layer-1 bg-white" />
            <div className="absolute inset-0 glitch-layer-2 bg-black" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isGlitching && sceneIndex === 0 && <Scene0 key="scene0" />}
          {!isGlitching && sceneIndex === 1 && <Scene1 key="scene1" />}
          {!isGlitching && sceneIndex === 2 && <Scene2 key="scene2" />}
          {!isGlitching && sceneIndex === 3 && <Scene3 key="scene3" />}
          {!isGlitching && sceneIndex === 4 && <Scene3b key="scene3b" onAutoAdvance={() => updateState({ sceneIndex: 5 })} />}
          {!isGlitching && sceneIndex === 5 && <Scene4 key="scene4a" showSubtext={false} />}
          {!isGlitching && sceneIndex === 6 && <Scene4 key="scene4b" showSubtext={true} />}
          {!isGlitching && sceneIndex === 7 && <Scene5 key="scene5" />}
        </AnimatePresence>
      </HUDFrame>
    </main>
  );
}
