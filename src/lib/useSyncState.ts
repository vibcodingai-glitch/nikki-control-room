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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;
try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http")) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.warn("Failed to initialize Supabase client. Check your URL in Vercel settings.", e);
}

export function useSyncState(role: "admin" | "display") {
  const [state, setState] = useState<GlobalState>(DEFAULT_STATE);
  const [isConnected, setIsConnected] = useState(false);
  const [channelStatus, setChannelStatus] = useState<string>("connecting");
  
  const localChannelRef = useRef<BroadcastChannel | null>(null);
  const eventsRef = useRef(typeof EventTarget !== "undefined" ? new EventTarget() : null);
  const lastPongRef = useRef<number>(Date.now());
  const isWritingRef = useRef(false); // Prevent echo loops

  // ─── Read initial state from Supabase DB ───
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Read localStorage first for instant render
    const saved = localStorage.getItem("control-room-state");
    if (saved) {
      try { setState(prev => ({ ...prev, ...JSON.parse(saved) })); } catch (e) {}
    }

    if (!supabase) {
      setChannelStatus("local-only");
      return;
    }

    // Fetch latest state from the database
    supabase
      .from("control_room_state")
      .select("state")
      .eq("id", "singleton")
      .single()
      .then(({ data, error }: { data: any, error: any }) => {
        if (error) {
          console.error("Failed to read state from Supabase:", error.message);
          return;
        }
        if (data?.state) {
          const dbState = { ...DEFAULT_STATE, ...data.state } as GlobalState;
          setState(dbState);
          localStorage.setItem("control-room-state", JSON.stringify(dbState));
          console.log(`[${role}] Loaded state from DB:`, dbState.sceneIndex);
        }
      });
  }, [role]);

  // ─── Subscribe to Realtime changes on the DB row ───
  useEffect(() => {
    if (typeof window === "undefined" || !supabase) return;

    console.log(`[${role}] Subscribing to Realtime postgres_changes...`);
    setChannelStatus("connecting");

    const channel = supabase
      .channel("db-state-sync")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "control_room_state",
          filter: "id=eq.singleton",
        },
        (payload: any) => {
          // Don't process our own writes
          if (isWritingRef.current) {
            isWritingRef.current = false;
            return;
          }

          const newState = payload.new as { state: GlobalState };
          if (newState?.state) {
            const merged = { ...DEFAULT_STATE, ...newState.state };
            setState(merged);
            localStorage.setItem("control-room-state", JSON.stringify(merged));
            console.log(`[${role}] Received DB update: scene`, merged.sceneIndex);
          }
        }
      )
      .subscribe((status: string) => {
        console.log(`[${role}] Realtime status:`, status);
        setChannelStatus(status);
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          console.log(`[${role}] ✅ Connected to Supabase Realtime DB!`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role]);

  // ─── Local BroadcastChannel for same-browser tabs ───
  useEffect(() => {
    if (typeof window === "undefined") return;

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
        // Only check local pong if we don't have Supabase
        if (!supabase && Date.now() - lastPongRef.current > 4000) {
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

  // ─── Update state: writes to DB + broadcasts locally ───
  const updateState = useCallback((updater: Partial<GlobalState> | ((prev: GlobalState) => GlobalState)) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem("control-room-state", JSON.stringify(next));

      // Broadcast locally (same browser)
      if (localChannelRef.current) {
        try { localChannelRef.current.postMessage({ type: "STATE_UPDATE", payload: next }); } catch(e) {}
      }

      // Write to Supabase DB (cross-device)
      if (supabase) {
        isWritingRef.current = true;
        supabase
          .from("control_room_state")
          .update({ state: next, updated_at: new Date().toISOString() })
          .eq("id", "singleton")
          .then(({ error }: { error: any }) => {
            if (error) {
              console.error("Failed to write state to Supabase:", error.message);
              isWritingRef.current = false;
            } else {
              console.log(`[updateState] Wrote scene ${next.sceneIndex} to DB`);
            }
          });
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
