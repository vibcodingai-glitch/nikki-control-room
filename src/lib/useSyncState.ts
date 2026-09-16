"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

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

interface SyncChannel {
  postMessage: (msg: SyncMessage) => void;
  close: () => void;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function useSyncState(role: "admin" | "display") {
  const [state, setState] = useState<GlobalState>(DEFAULT_STATE);
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<SyncChannel | null>(null);
  const lastPongRef = useRef<number>(Date.now());
  const eventsRef = useRef(typeof EventTarget !== "undefined" ? new EventTarget() : null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initialize state from localStorage (fastest initial load)
    const saved = localStorage.getItem("control-room-state");
    if (saved) {
      try {
        setState(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
    }

    // 2. Setup Sync Channel (Supabase Realtime OR Local BroadcastChannel)
    if (supabase) {
      console.log("Initializing Supabase Realtime Sync...");
      const realtimeChannel = supabase.channel("control-room-sync", {
        config: { broadcast: { self: false } }
      });

      realtimeChannel
        .on("broadcast", { event: "SYNC" }, ({ payload }) => {
          const msg = payload as SyncMessage;
          if (msg.type === "STATE_UPDATE") {
            setState(msg.payload);
            localStorage.setItem("control-room-state", JSON.stringify(msg.payload));
          } else if (msg.type === "PING") {
            if (msg.from !== role) {
              lastPongRef.current = Date.now();
              setIsConnected(true);
              realtimeChannel.send({ type: "broadcast", event: "SYNC", payload: { type: "PONG", from: role } });
            }
          } else if (msg.type === "PONG") {
            if (msg.from !== role) {
              lastPongRef.current = Date.now();
              setIsConnected(true);
            }
          } else if (msg.type === "SKIP_AUDIO" && role === "display") {
            eventsRef.current?.dispatchEvent(new Event("skip_audio"));
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log("Connected to Supabase Realtime!");
          }
        });

      channelRef.current = {
        postMessage: (msg: SyncMessage) => {
          realtimeChannel.send({ type: "broadcast", event: "SYNC", payload: msg });
        },
        close: () => {
          supabase.removeChannel(realtimeChannel);
        }
      };
    } else {
      // Fallback: Local Browser Memory Sync
      console.log("Using Local BroadcastChannel Sync...");
      const localChannel = new BroadcastChannel("control-room-sync");
      channelRef.current = localChannel;

      localChannel.onmessage = (event: MessageEvent<SyncMessage>) => {
        const msg = event.data;
        if (msg.type === "STATE_UPDATE") {
          setState(msg.payload);
          localStorage.setItem("control-room-state", JSON.stringify(msg.payload));
        } else if (msg.type === "PING") {
          if (msg.from !== role) {
            lastPongRef.current = Date.now();
            setIsConnected(true);
            localChannel.postMessage({ type: "PONG", from: role });
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
    }

    // 3. Fallback sync via localStorage for cross-tab sync (useful even with Supabase if same browser)
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
      if (channelRef.current) {
        channelRef.current.postMessage({ type: "PING", from: role });
      }
    }, 1000);

    const checkInterval = setInterval(() => {
      if (Date.now() - lastPongRef.current > 3500) {
        setIsConnected(false);
      }
    }, 1000);

    return () => {
      channelRef.current?.close();
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
