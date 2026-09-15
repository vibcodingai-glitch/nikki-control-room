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

type SyncMessage = 
  | { type: "STATE_UPDATE"; payload: GlobalState }
  | { type: "PING"; from: "admin" | "display" }
  | { type: "PONG"; from: "admin" | "display" }
  | { type: "SKIP_AUDIO" };

export function useSyncState(role: "admin" | "display") {
  const [state, setState] = useState<GlobalState>(DEFAULT_STATE);
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<BroadcastChannel | null>(null);
  const lastPongRef = useRef<number>(Date.now());
  const eventsRef = useRef(typeof EventTarget !== "undefined" ? new EventTarget() : null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initialize state from localStorage
    const saved = localStorage.getItem("control-room-state");
    if (saved) {
      try {
        setState(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
    }

    // 2. Setup BroadcastChannel
    const channel = new BroadcastChannel("control-room-sync");
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const msg = event.data;
      if (msg.type === "STATE_UPDATE") {
        setState(msg.payload);
        localStorage.setItem("control-room-state", JSON.stringify(msg.payload));
      } else if (msg.type === "PING") {
        if (msg.from !== role) {
          lastPongRef.current = Date.now();
          setIsConnected(true);
          channel.postMessage({ type: "PONG", from: role });
        }
      } else if (msg.type === "PONG") {
        if (msg.from !== role) {
          lastPongRef.current = Date.now();
          setIsConnected(true);
        }
      } else if (msg.type === "SKIP_AUDIO" && role === "display") {
        eventsRef.current?.dispatchEvent(new Event("skip_audio"));
      }
    };

    // 3. Fallback sync via localStorage for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "control-room-state" && e.newValue) {
        try {
          setState(prev => ({ ...prev, ...JSON.parse(e.newValue!) }));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Heartbeat mechanism
    const pingInterval = setInterval(() => {
      channel.postMessage({ type: "PING", from: role });
    }, 1000);

    const checkInterval = setInterval(() => {
      if (Date.now() - lastPongRef.current > 2500) {
        setIsConnected(false);
      }
    }, 1000);

    return () => {
      channel.close();
      window.removeEventListener("storage", handleStorage);
      clearInterval(pingInterval);
      clearInterval(checkInterval);
    };
  }, [role]);

  const updateState = useCallback((updater: Partial<GlobalState> | ((prev: GlobalState) => GlobalState)) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem("control-room-state", JSON.stringify(next));
      if (channelRef.current) {
        channelRef.current.postMessage({ type: "STATE_UPDATE", payload: next });
      }
      return next;
    });
  }, []);

  const triggerSkipAudio = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.postMessage({ type: "SKIP_AUDIO" });
    }
  }, []);

  return { state, updateState, isConnected, triggerSkipAudio, events: eventsRef.current };
}
