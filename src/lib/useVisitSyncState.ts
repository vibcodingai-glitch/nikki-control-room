"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type VisitState = {
  sceneIndex: number; // 0..7
  fastMode: boolean; // ~35% shorter timings
  timeConfig: { useRealTime: boolean; simulatedTime: string };
  transitionTimings: { crossFadeMs: number; glitchCutMs: number; countdownIntervalMs: number };
  muted: boolean;
  alertBeepVolume: number; // 0..1
  autoTriggerConfig: { enabled: boolean; triggerTime: string };
};

export const DEFAULT_VISIT_STATE: VisitState = {
  sceneIndex: 0,
  fastMode: false,
  timeConfig: { useRealTime: true, simulatedTime: "12:00:00" },
  transitionTimings: { crossFadeMs: 1000, glitchCutMs: 200, countdownIntervalMs: 1000 },
  muted: false,
  alertBeepVolume: 0.6,
  autoTriggerConfig: { enabled: false, triggerTime: "00:00:00" },
};

const CHANNEL_NAME = "visit-sync";
const STORAGE_KEY = "visit-state";

export function useVisitSyncState(role: "admin" | "display") {
  const [state, setState] = useState<VisitState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (role === "display") {
            parsed.sceneIndex = 0;
          }
          return { ...DEFAULT_VISIT_STATE, ...parsed };
        }
      } catch {
        // fallback to default
      }
    }
    return DEFAULT_VISIT_STATE;
  });

  const [isConnected, setIsConnected] = useState(false);
  const channelStatus = "local-only";

  const localChannelRef = useRef<BroadcastChannel | null>(null);
  const [events] = useState(() => (typeof EventTarget !== "undefined" ? new EventTarget() : null));
  const lastPongRef = useRef<number>(0);

  // ─── Initialize Local Storage & Channel ───
  useEffect(() => {
    if (typeof window === "undefined") return;

    lastPongRef.current = Date.now();

    // Setup BroadcastChannel
    try {
      const localChannel = new BroadcastChannel(CHANNEL_NAME);
      localChannelRef.current = localChannel;

      localChannel.onmessage = (event: MessageEvent) => {
        const msg = event.data;
        if (!msg || typeof msg !== "object") return;

        if (msg.type === "STATE_UPDATE" && msg.payload) {
          setState(msg.payload);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(msg.payload));
        } else if (msg.type === "PING" && msg.from !== role) {
          lastPongRef.current = Date.now();
          setIsConnected(true);
          try {
            localChannel.postMessage({ type: "PONG", from: role });
          } catch {}
        } else if (msg.type === "PONG" && msg.from !== role) {
          lastPongRef.current = Date.now();
          setIsConnected(true);
        } else if (msg.type === "SKIP_AUDIO" && role === "display") {
          events?.dispatchEvent(new Event("skip_audio"));
        }
      };

      // Heartbeat for local connection detection
      const pingInterval = setInterval(() => {
        try {
          localChannel.postMessage({ type: "PING", from: role });
        } catch {}
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
    } catch {
      console.warn("BroadcastChannel not supported for visitor sync");
    }
  }, [role, events]);

  // ─── localStorage fallback for cross-tab ───
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setState((prev) => ({ ...prev, ...JSON.parse(e.newValue!) }));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ─── Update state ───
  const updateState = useCallback(
    (updater: Partial<VisitState> | ((prev: VisitState) => VisitState)) => {
      setState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

        // Broadcast locally instantly
        if (localChannelRef.current) {
          try {
            localChannelRef.current.postMessage({ type: "STATE_UPDATE", payload: next });
          } catch {}
        }

        return next;
      });
    },
    []
  );

  const triggerSkipAudio = useCallback(() => {
    if (localChannelRef.current) {
      try {
        localChannelRef.current.postMessage({ type: "SKIP_AUDIO" });
      } catch {}
    }
  }, []);

  return {
    state,
    updateState,
    isConnected,
    channelStatus,
    triggerSkipAudio,
    events,
  };
}
