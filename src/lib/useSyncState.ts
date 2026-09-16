"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function useSyncState(role: "admin" | "display") {
  const [state, setState] = useState<GlobalState>(DEFAULT_STATE);
  const [isConnected, setIsConnected] = useState(false);
  const [channelStatus, setChannelStatus] = useState<string>("connecting");
  
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null);
  const localChannelRef = useRef<BroadcastChannel | null>(null);
  const lastPongRef = useRef<number>(Date.now());
  const isSubscribedRef = useRef(false);
  const eventsRef = useRef(typeof EventTarget !== "undefined" ? new EventTarget() : null);

  // Broadcast a message via whatever channel is active
  const broadcast = useCallback((msg: SyncMessage) => {
    // Try Supabase first
    if (supabaseChannelRef.current && isSubscribedRef.current) {
      supabaseChannelRef.current.send({ 
        type: "broadcast", 
        event: "SYNC", 
        payload: msg 
      }).then((result) => {
        if (result !== "ok") {
          console.warn("Supabase broadcast returned:", result);
        }
      }).catch((err) => {
        console.error("Supabase broadcast error:", err);
      });
    }
    // Also try local channel as fallback (for same-browser tabs)
    if (localChannelRef.current) {
      try {
        localChannelRef.current.postMessage(msg);
      } catch (e) {}
    }
  }, []);

  const handleIncomingMessage = useCallback((msg: SyncMessage) => {
    if (msg.type === "STATE_UPDATE") {
      setState(msg.payload);
      localStorage.setItem("control-room-state", JSON.stringify(msg.payload));
    } else if (msg.type === "PING") {
      if (msg.from !== role) {
        lastPongRef.current = Date.now();
        setIsConnected(true);
        // Reply with PONG
        if (supabaseChannelRef.current && isSubscribedRef.current) {
          supabaseChannelRef.current.send({ 
            type: "broadcast", event: "SYNC", 
            payload: { type: "PONG", from: role } 
          }).catch(() => {});
        }
        if (localChannelRef.current) {
          try { localChannelRef.current.postMessage({ type: "PONG", from: role }); } catch(e) {}
        }
      }
    } else if (msg.type === "PONG") {
      if (msg.from !== role) {
        lastPongRef.current = Date.now();
        setIsConnected(true);
      }
    } else if (msg.type === "SKIP_AUDIO" && role === "display") {
      eventsRef.current?.dispatchEvent(new Event("skip_audio"));
    }
  }, [role]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Initialize state from localStorage (fastest initial load)
    const saved = localStorage.getItem("control-room-state");
    if (saved) {
      try {
        setState(prev => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
    }

    // 2a. Always setup local BroadcastChannel (works for same-browser tabs)
    try {
      const localChannel = new BroadcastChannel("control-room-sync");
      localChannelRef.current = localChannel;
      localChannel.onmessage = (event: MessageEvent<SyncMessage>) => {
        handleIncomingMessage(event.data);
      };
    } catch (e) {
      console.warn("BroadcastChannel not supported");
    }

    // 2b. Setup Supabase Realtime (works across devices over internet)
    if (supabase) {
      console.log(`[${role}] Initializing Supabase Realtime...`);
      setChannelStatus("connecting");

      const realtimeChannel = supabase.channel("control-room-sync", {
        config: { broadcast: { self: false } }
      });

      supabaseChannelRef.current = realtimeChannel;

      realtimeChannel
        .on("broadcast", { event: "SYNC" }, ({ payload }) => {
          handleIncomingMessage(payload as SyncMessage);
        })
        .subscribe((status) => {
          console.log(`[${role}] Supabase channel status:`, status);
          setChannelStatus(status);
          if (status === "SUBSCRIBED") {
            isSubscribedRef.current = true;
            console.log(`[${role}] ✅ Connected to Supabase Realtime!`);
          } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
            isSubscribedRef.current = false;
            console.error(`[${role}] ❌ Supabase channel error:`, status);
          }
        });
    } else {
      console.log("No Supabase credentials found, using local sync only");
      setChannelStatus("local-only");
    }

    // 3. Fallback sync via localStorage storage event
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "control-room-state" && e.newValue) {
        try {
          setState(prev => ({ ...prev, ...JSON.parse(e.newValue!) }));
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Heartbeat
    const pingInterval = setInterval(() => {
      const pingMsg: SyncMessage = { type: "PING", from: role };
      if (supabaseChannelRef.current && isSubscribedRef.current) {
        supabaseChannelRef.current.send({ 
          type: "broadcast", event: "SYNC", payload: pingMsg 
        }).catch(() => {});
      }
      if (localChannelRef.current) {
        try { localChannelRef.current.postMessage(pingMsg); } catch(e) {}
      }
    }, 1500);

    const checkInterval = setInterval(() => {
      if (Date.now() - lastPongRef.current > 4000) {
        setIsConnected(false);
      }
    }, 1500);

    return () => {
      if (supabaseChannelRef.current) {
        supabase?.removeChannel(supabaseChannelRef.current);
        isSubscribedRef.current = false;
      }
      if (localChannelRef.current) {
        localChannelRef.current.close();
      }
      window.removeEventListener("storage", handleStorage);
      clearInterval(pingInterval);
      clearInterval(checkInterval);
    };
  }, [role, handleIncomingMessage]);

  const updateState = useCallback((updater: Partial<GlobalState> | ((prev: GlobalState) => GlobalState)) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem("control-room-state", JSON.stringify(next));
      return next;
    });

    // Broadcast OUTSIDE of setState (side effects should not be in setState)
    // Use a microtask to ensure state is committed first
    queueMicrotask(() => {
      const currentState = JSON.parse(localStorage.getItem("control-room-state") || "{}");
      broadcast({ type: "STATE_UPDATE", payload: currentState });
    });
  }, [broadcast]);

  const triggerSkipAudio = useCallback(() => {
    broadcast({ type: "SKIP_AUDIO" } as SyncMessage);
  }, [broadcast]);

  return { state, updateState, isConnected, channelStatus, triggerSkipAudio, events: eventsRef.current };
}
