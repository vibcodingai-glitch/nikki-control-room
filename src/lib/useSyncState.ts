"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type GlobalState = {
  sceneIndex: number;
  timeConfig: { useRealTime: boolean; simulatedTime: string }; // "HH:MM:SS"
  transitionTimings: { crossFadeMs: number; glitchCutMs: number; countdownIntervalMs: number };
  muted: boolean;
  alertBeepVolume: number;
  autoTriggerConfig: { enabled: boolean; triggerTime: string };
};

export const DEFAULT_STATE: GlobalState = {
  sceneIndex: 0,
  timeConfig: { useRealTime: true, simulatedTime: "12:00:00" },
  transitionTimings: { crossFadeMs: 1000, glitchCutMs: 200, countdownIntervalMs: 1000 },
  muted: false,
  alertBeepVolume: 0.6,
  autoTriggerConfig: { enabled: false, triggerTime: "00:00:00" }
};

export function useSyncState(role: "admin" | "display") {
  const [state, setState] = useState<GlobalState>(DEFAULT_STATE);
  const [isConnected, setIsConnected] = useState(false);
  
  // We'll just use "local-only" since we dropped Supabase
  const channelStatus = "local-only";
  
  const localChannelRef = useRef<BroadcastChannel | null>(null);
  const eventsRef = useRef(typeof EventTarget !== "undefined" ? new EventTarget() : null);
  const lastPongRef = useRef<number>(Date.now());

  // ─── Initialize Local Storage & Channel ───
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Load initial state
    const saved = localStorage.getItem("control-room-state");
    if (saved) {
      try { setState(prev => ({ ...prev, ...JSON.parse(saved) })); } catch (e) {}
    }

    // 2. Setup BroadcastChannel
    try {
      const localChannel = new BroadcastChannel("control-room-sync");
      localChannelRef.current = localChannel;

      localChannel.onmessage = (event: MessageEvent) => {
        const msg = event.data;
        if (msg.type === "STATE_UPDATE") {
          setState(msg.payload);
          localStorage.setItem("control-room-state", JSON.stringify(msg.payload));
        } else if (msg.type === "PING" && msg.from !== role) {
          lastPongRef.current = Date.now();
          setIsConnected(true);
          localChannel.postMessage({ type: "PONG", from: role });
        } else if (msg.type === "PONG" && msg.from !== role) {
          lastPongRef.current = Date.now();
          setIsConnected(true);
        } else if (msg.type === "SKIP_AUDIO" && role === "display") {
          eventsRef.current?.dispatchEvent(new Event("skip_audio"));
        }
      };

      // Heartbeat for local connection detection
      const pingInterval = setInterval(() => {
        try { localChannel.postMessage({ type: "PING", from: role }); } catch(e) {}
      }, 1500);

      const checkInterval = setInterval(() => {
        if (Date.now() - lastPongRef.current > 4000) {
          setIsConnected(false);
        }
      }, 1500);

      return () => {
        localChannel.close();
        clearInterval(pingInterval);
        clearInterval(checkInterval);
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported");
    }
  }, [role]);

  // ─── localStorage fallback for cross-tab ───
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "control-room-state" && e.newValue) {
        try { setState(prev => ({ ...prev, ...JSON.parse(e.newValue!) })); } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ─── Update state ───
  const updateState = useCallback((updater: Partial<GlobalState> | ((prev: GlobalState) => GlobalState)) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem("control-room-state", JSON.stringify(next));

      // Broadcast locally instantly
      if (localChannelRef.current) {
        try { localChannelRef.current.postMessage({ type: "STATE_UPDATE", payload: next }); } catch(e) {}
      }

      return next;
    });
  }, []);

  const triggerSkipAudio = useCallback(() => {
    if (localChannelRef.current) {
      try { localChannelRef.current.postMessage({ type: "SKIP_AUDIO" }); } catch(e) {}
    }
  }, []);

  return { state, updateState, isConnected, channelStatus, triggerSkipAudio, events: eventsRef.current };
}
