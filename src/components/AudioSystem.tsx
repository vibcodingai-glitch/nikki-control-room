"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";
import { usePathname } from "next/navigation";
import { useSyncState } from "@/lib/useSyncState";
import { useVisitSyncState } from "@/lib/useVisitSyncState";

export type AudioId = 
  | "ambient-hum"
  | "alert-detected-voice"
  | "alert-beep"
  | "flip-click"
  | "whoosh-transition"
  | "celebration-horn"
  | "celebration-music"
  | "access-granted";

interface AudioSystemContextType {
  play: (id: AudioId) => void;
  stop: (id: AudioId) => void;
  fade: (id: AudioId, from: number, to: number, duration: number) => void;
  rate: (id: AudioId, speed: number) => void;
  volume: (id: AudioId, vol: number) => void;
  setBeepGap: (gap: number) => void;
  isReady: boolean;
}

const AudioSystemContext = createContext<AudioSystemContextType | null>(null);

export const useAudio = () => {
  const ctx = useContext(AudioSystemContext);
  if (!ctx) throw new Error("useAudio must be used within AudioSystemProvider");
  return ctx;
};

interface SyncSubProps {
  howlsRef: React.MutableRefObject<Record<string, Howl>>;
  isBeepingRef: React.MutableRefObject<boolean>;
  beepGapRef: React.MutableRefObject<number>;
}

function BirthdayAudioSync({ howlsRef, isBeepingRef, beepGapRef }: SyncSubProps) {
  const { state } = useSyncState("display");

  useEffect(() => {
    Howler.mute(state.muted);
  }, [state.muted]);

  useEffect(() => {
    const beep = howlsRef.current["alert-beep"];
    if (beep) {
      if (state.sceneIndex === 1) {
        beep.volume(state.alertBeepVolume);
        beepGapRef.current = 800;
      } else if (state.sceneIndex === 2) {
        beep.volume(state.alertBeepVolume * 0.6);
        beepGapRef.current = 800;
      } else if (state.sceneIndex === 3) {
        beep.volume(state.alertBeepVolume * 0.7);
      } else if (state.sceneIndex === 4 || state.sceneIndex === 0) {
        isBeepingRef.current = false;
      }
    }
  }, [state.sceneIndex, state.alertBeepVolume, beepGapRef, howlsRef, isBeepingRef]);

  return null;
}

function VisitAudioSync({ howlsRef, isBeepingRef, beepGapRef }: SyncSubProps) {
  const { state } = useVisitSyncState("display");

  useEffect(() => {
    Howler.mute(state.muted);
  }, [state.muted]);

  useEffect(() => {
    const beep = howlsRef.current["alert-beep"];
    if (beep) {
      if (state.sceneIndex === 1) {
        beep.volume(state.alertBeepVolume);
        beepGapRef.current = 800;
      } else if (state.sceneIndex === 2) {
        beep.volume(state.alertBeepVolume * 0.6);
        beepGapRef.current = 800;
      } else if (state.sceneIndex === 3) {
        beep.volume(state.alertBeepVolume * 0.7);
      } else if (state.sceneIndex === 4 || state.sceneIndex === 0) {
        isBeepingRef.current = false;
      }
    }
  }, [state.sceneIndex, state.alertBeepVolume, beepGapRef, howlsRef, isBeepingRef]);

  return null;
}

export const AudioSystemProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const howls = useRef<Record<string, Howl>>({});
  
  // Custom beep loop state
  const isBeeping = useRef(false);
  const beepGapRef = useRef(800);
  const beepTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pathname = usePathname();
  const isVisit = pathname?.startsWith("/visit");

  useEffect(() => {
    // Initialize all audio tracks
    howls.current = {
      "ambient-hum": new Howl({ src: ["/audio/ambient-hum.wav"], loop: true, volume: 0.5 }),
      "alert-detected-voice": new Howl({ src: ["/audio/alert-detected-voice.aiff"], volume: 0.8 }),
      "alert-beep": new Howl({ src: ["/audio/alert-beep.wav"], volume: 0.6 }),
      "flip-click": new Howl({ src: ["/audio/flip-click.wav"], volume: 0.2 }),
      "whoosh-transition": new Howl({ src: ["/audio/whoosh-transition.wav"], volume: 0.9 }),
      "celebration-horn": new Howl({ src: ["/audio/celebration-horn.wav"], volume: 1.0 }),
      "celebration-music": new Howl({ src: ["/audio/celebration-music.wav"], loop: true, volume: 0.7 }),
      "access-granted": new Howl({ 
        src: ["/audio/access-granted.wav"], 
        volume: 0.9,
        onloaderror: () => {
          // Gracefully handled in play() fallback
        }
      }),
    };

    setIsReady(true);

    return () => {
      // Cleanup on unmount
      Object.values(howls.current).forEach((howl) => howl.unload());
      if (beepTimeoutRef.current) clearTimeout(beepTimeoutRef.current);
    };
  }, []);

  const runBeepLoop = () => {
    if (!isBeeping.current) return;
    
    const beep = howls.current["alert-beep"];
    if (beep) beep.play();
    
    beepTimeoutRef.current = setTimeout(runBeepLoop, 150 + beepGapRef.current);
  };

  const play = (id: AudioId) => {
    if (id === "alert-beep") {
      if (!isBeeping.current) {
        isBeeping.current = true;
        runBeepLoop();
      }
      return;
    }

    if (id === "access-granted") {
      const chime = howls.current["access-granted"];
      if (chime && chime.state() === "loaded") {
        chime.play();
        return;
      } else {
        // Fall back to celebration-horn
        howls.current["celebration-horn"]?.play();
        return;
      }
    }

    if (howls.current[id]) {
      // For flip-click, allow overlapping by not stopping previous
      if (id !== "flip-click") {
        if (!howls.current[id].playing()) {
          howls.current[id].play();
        }
      } else {
        howls.current[id].play();
      }
    }
  };

  const stop = (id: AudioId) => {
    if (id === "alert-beep") {
      isBeeping.current = false;
      if (beepTimeoutRef.current) clearTimeout(beepTimeoutRef.current);
      if (howls.current[id]) howls.current[id].stop();
      return;
    }
    if (howls.current[id]) howls.current[id].stop();
  };

  const fade = (id: AudioId, from: number, to: number, duration: number) => {
    if (howls.current[id]) howls.current[id].fade(from, to, duration);
  };

  const rate = (id: AudioId, speed: number) => {
    if (howls.current[id]) howls.current[id].rate(speed);
  };

  const volume = (id: AudioId, vol: number) => {
    if (howls.current[id]) howls.current[id].volume(vol);
  };
  
  const setBeepGap = (gap: number) => {
    beepGapRef.current = gap;
  };

  return (
    <AudioSystemContext.Provider value={{ play, stop, fade, rate, volume, setBeepGap, isReady }}>
      {isVisit ? (
        <VisitAudioSync howlsRef={howls} isBeepingRef={isBeeping} beepGapRef={beepGapRef} />
      ) : (
        <BirthdayAudioSync howlsRef={howls} isBeepingRef={isBeeping} beepGapRef={beepGapRef} />
      )}
      {children}
    </AudioSystemContext.Provider>
  );
};

