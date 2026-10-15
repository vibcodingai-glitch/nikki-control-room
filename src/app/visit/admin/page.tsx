"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useVisitSyncState } from "@/lib/useVisitSyncState";
import { 
  Users, 
  Activity, 
  Power, 
  Clock, 
  Settings, 
  AlertTriangle, 
  SkipForward, 
  VolumeX, 
  ShieldAlert, 
  SkipBack, 
  Timer, 
  Play, 
  Square,
  Zap,
  Plus,
  Minus,
  RotateCcw,
  Camera,
  CameraOff
} from "lucide-react";
import { getTierCopy } from "@/lib/visitorCopy";

const SCENE_NAMES = [
  "0: Dashboard Idle",
  "1: Perimeter Alert",
  "2: Headcount & Escalation",
  "3: Identity Scan",
  "4: Reclassification Countdown",
  "5: Welcome Reveal",
  "6: Subtext & Delegation Count",
  "7: Incident Report / Pass QR"
];

export default function VisitAdminPage() {
  const { state, updateState, isConnected, channelStatus, triggerSkipAudio } = useVisitSyncState("admin");
  const { sceneIndex, guestCount, fastMode, timeConfig, transitionTimings, muted, autoTriggerConfig } = state;

  const [launchFeedback, setLaunchFeedback] = useState<string | null>(null);

  // Local state for forms
  const [simTimeInput, setSimTimeInput] = useState(timeConfig.simulatedTime);
  const [triggerTimeInput, setTriggerTimeInput] = useState(autoTriggerConfig.triggerTime);
  const [timingsInput, setTimingsInput] = useState(transitionTimings);

  // Countdown timer state
  const [countdownMinutes, setCountdownMinutes] = useState(5);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimeRef = useRef<number | null>(null);

  // Optional Camera Face Detection State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraExpanded, setCameraExpanded] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<number | null>(null);
  const [autoSyncCamera, setAutoSyncCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 320 }, height: { ideal: 240 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      if (typeof window !== "undefined" && "FaceDetector" in window) {
        try {
          detectorRef.current = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 25 });
        } catch {}
      }
    } catch (err: any) {
      alert("Camera access unavailable: " + (err?.message || err));
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setDetectedFaces(null);
  };

  useEffect(() => {
    if (!cameraActive) return;

    const interval = setInterval(async () => {
      if (!videoRef.current || !detectorRef.current) return;
      try {
        const faces = await detectorRef.current.detect(videoRef.current);
        const count = faces ? faces.length : 0;
        setDetectedFaces(count);
        if (autoSyncCamera && count > 0) {
          updateState({ guestCount: count });
        }
      } catch {}
    }, 600);

    return () => clearInterval(interval);
  }, [cameraActive, autoSyncCamera, updateState]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    setSimTimeInput(timeConfig.simulatedTime);
  }, [timeConfig.simulatedTime]);

  useEffect(() => {
    setTriggerTimeInput(autoTriggerConfig.triggerTime);
  }, [autoTriggerConfig.triggerTime]);

  useEffect(() => {
    setTimingsInput(transitionTimings);
  }, [transitionTimings]);

  // Scene handlers
  const handleSceneChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex <= 7) {
      updateState({ sceneIndex: newIndex });
    }
  };

  const handleApplyTime = () => {
    updateState({ timeConfig: { ...timeConfig, simulatedTime: simTimeInput } });
  };

  const handleApplyTimings = () => {
    updateState({ transitionTimings: timingsInput });
  };

  // Guest Count operations
  const handleCountChange = (delta: number) => {
    const next = Math.max(0, Math.min(99, (guestCount || 0) + delta));
    updateState({ guestCount: next });
  };

  const handleSetExactCount = (val: number) => {
    const next = Math.max(0, Math.min(99, val));
    updateState({ guestCount: next });
  };

  const tierInfo = getTierCopy(guestCount);

  // Countdown logic
  const startCountdown = useCallback(() => {
    const targetMs = Date.now() + countdownMinutes * 60 * 1000;
    targetTimeRef.current = targetMs;

    const targetDate = new Date(targetMs);
    const triggerHHMMSS = targetDate.toTimeString().substring(0, 8);

    updateState({
      autoTriggerConfig: { enabled: true, triggerTime: triggerHHMMSS },
      timeConfig: { ...timeConfig, useRealTime: true },
    });
    setTriggerTimeInput(triggerHHMMSS);

    setCountdownRemaining(countdownMinutes * 60);

    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((targetMs - Date.now()) / 1000));
      setCountdownRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        targetTimeRef.current = null;
        setCountdownRemaining(null);

        updateState((prev) => ({
          ...prev,
          sceneIndex: 1,
          autoTriggerConfig: { enabled: false, triggerTime: prev.autoTriggerConfig.triggerTime }
        }));
      }
    }, 500);
  }, [countdownMinutes, timeConfig, updateState]);

  const cancelCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    targetTimeRef.current = null;
    setCountdownRemaining(null);
    updateState((prev) => ({
      ...prev,
      autoTriggerConfig: { enabled: false, triggerTime: prev.autoTriggerConfig.triggerTime }
    }));
  }, [updateState]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-mono p-6 selection:bg-emerald-900">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-800 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Users className="text-emerald-500" size={28} />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-widest uppercase flex items-center gap-2">
                Visitor Experience Operator
              </h1>
              <p className="text-xs text-gray-500 tracking-wider">
                Supply Chain Control Room · Isolated Channel: visit-sync
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              {channelStatus === "local-only" ? "💻 visit-sync active" : channelStatus}
            </div>

            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${
              isConnected 
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' 
                : 'border-red-500/50 bg-red-500/10 text-red-400'
            }`}>
              <Activity size={16} className={isConnected ? "animate-pulse" : ""} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {isConnected ? "Display Connected (/visit)" : "No Visitor Display Detected"}
              </span>
            </div>
          </div>
        </header>

        {/* TOP ROW: GUEST COUNTER PANEL (Prominent) & QUICK LAUNCH */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* GUEST COUNTER PANEL (7 cols) */}
          <section className="lg:col-span-7 bg-[#0A0E12] border-2 border-emerald-500/40 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase font-bold tracking-widest">
                <Users size={16} /> Guest Counter (Live Sync)
              </div>
              <span 
                className="px-3 py-1 rounded text-xs font-bold tracking-widest uppercase border"
                style={{ 
                  color: tierInfo.threatColor, 
                  borderColor: `${tierInfo.threatColor}60`,
                  backgroundColor: `${tierInfo.threatColor}15`
                }}
              >
                TIER: {tierInfo.tier.toUpperCase()} ({tierInfo.threatLevelText})
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Big Counter Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleCountChange(-1)}
                  disabled={guestCount <= 0}
                  className="w-14 h-14 rounded-lg bg-gray-900 border border-gray-700 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white active:scale-95 transition"
                  title="Minus 1 guest"
                >
                  <Minus size={24} />
                </button>

                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={guestCount}
                    onChange={(e) => handleSetExactCount(parseInt(e.target.value) || 0)}
                    className="w-24 text-center font-black text-5xl bg-black border-2 border-emerald-500/50 rounded-lg py-1 text-emerald-400 focus:outline-none focus:border-emerald-400 tabular-nums shadow-inner"
                  />
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Colleagues</span>
                </div>

                <button
                  onClick={() => handleCountChange(1)}
                  className="w-14 h-14 rounded-lg bg-emerald-600/30 border-2 border-emerald-500 text-emerald-300 hover:bg-emerald-600/40 flex items-center justify-center active:scale-95 transition font-bold shadow-lg shadow-emerald-900/30"
                  title="Plus 1 guest"
                >
                  <Plus size={26} />
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleCountChange(1)}
                    className="px-3 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs rounded text-gray-200 font-bold transition"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => handleCountChange(2)}
                    className="px-3 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs rounded text-gray-200 font-bold transition"
                  >
                    +2
                  </button>
                  <button
                    onClick={() => handleCountChange(5)}
                    className="px-3 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs rounded text-gray-200 font-bold transition"
                  >
                    +5
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSetExactCount(1)}
                    className="px-3 py-1.5 bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-[11px] rounded text-gray-400 transition"
                  >
                    Set to 1
                  </button>
                  <button
                    onClick={() => handleSetExactCount(0)}
                    className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-[11px] rounded text-red-400 transition flex items-center justify-center gap-1"
                  >
                    <RotateCcw size={12} /> Reset 0
                  </button>
                </div>
              </div>

            </div>

            <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span>Display Assessment: <strong className="text-white">{tierInfo.assessment}</strong></span>
              <button
                onClick={() => setCameraExpanded((prev) => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-900 border border-gray-700 hover:border-gray-500 text-[10px] text-gray-300 font-mono transition"
              >
                <Camera size={12} className="text-emerald-400" />
                {cameraExpanded ? "Hide Camera Tool" : "AI Camera Counter (Optional)"}
              </button>
            </div>

            {/* Optional Webcam Face Detection Tray */}
            {cameraExpanded && (
              <div className="mt-3 p-3 bg-black/60 border border-emerald-500/30 rounded-lg text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                    <Camera size={14} /> On-Device Headcount Detection
                  </div>
                  <span className="text-[9px] text-gray-500">100% Local · No frames stored or transmitted</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-40 h-28 bg-gray-950 border border-gray-800 rounded relative overflow-hidden flex items-center justify-center">
                    <video 
                      ref={videoRef} 
                      className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`} 
                      playsInline 
                      muted 
                    />
                    {!cameraActive && (
                      <div className="text-center text-gray-600 p-2 text-[10px]">
                        Camera is currently stopped.
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex gap-2">
                      {!cameraActive ? (
                        <button
                          onClick={startCamera}
                          className="px-3 py-1.5 bg-emerald-600/30 border border-emerald-500 text-emerald-300 rounded font-bold text-xs hover:bg-emerald-600/50 transition flex items-center gap-1.5"
                        >
                          <Camera size={14} /> Start Camera
                        </button>
                      ) : (
                        <button
                          onClick={stopCamera}
                          className="px-3 py-1.5 bg-red-950/40 border border-red-700 text-red-400 rounded text-xs hover:bg-red-900/40 transition flex items-center gap-1.5"
                        >
                          <CameraOff size={14} /> Stop Camera
                        </button>
                      )}

                      {cameraActive && detectedFaces !== null && (
                        <button
                          onClick={() => handleSetExactCount(detectedFaces)}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white rounded text-xs transition"
                        >
                          Apply Count ({detectedFaces})
                        </button>
                      )}
                    </div>

                    {cameraActive && (
                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-emerald-400 font-bold">
                          Detected: {detectedFaces !== null ? `${detectedFaces} face(s)` : "Scanning..."}
                        </span>
                        <label className="flex items-center gap-1.5 text-gray-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoSyncCamera}
                            onChange={(e) => setAutoSyncCamera(e.target.checked)}
                            className="accent-emerald-500 w-3 h-3"
                          />
                          <span className="text-[11px]">Auto-Sync to Counter</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* QUICK LAUNCH & FAST MODE (5 cols) */}
          <section className="lg:col-span-5 bg-gradient-to-br from-red-950/40 via-red-900/20 to-black border-2 border-red-500/40 rounded-xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-red-400 uppercase tracking-[0.25em] font-bold">
                  Cinematic Launch
                </span>
                
                {/* Fast Mode Toggle */}
                <label className="flex items-center gap-2 cursor-pointer bg-black/60 px-2.5 py-1 rounded border border-gray-800 hover:border-gray-700">
                  <Zap size={14} className={fastMode ? "text-amber-400" : "text-gray-500"} />
                  <span className={`text-xs ${fastMode ? "text-amber-400 font-bold" : "text-gray-400"}`}>
                    Fast Mode (~35%)
                  </span>
                  <input
                    type="checkbox"
                    checked={fastMode}
                    onChange={(e) => updateState({ fastMode: e.target.checked })}
                    className="accent-amber-400"
                  />
                </label>
              </div>

              <div className="text-lg text-white font-bold">Launch Visitor Experience</div>
              <p className="text-xs text-gray-400 mt-1">
                Launches Scene 1 with <strong className="text-emerald-400">{guestCount} {guestCount === 1 ? "colleague" : "colleagues"}</strong>, then automatically progresses.
              </p>
            </div>

            <div className="mt-4">
              <button
                onClick={() => {
                  handleSceneChange(1);
                  setLaunchFeedback(`✅ LAUNCHED! Triggered with count ${guestCount}`);
                  setTimeout(() => setLaunchFeedback(null), 3000);
                }}
                className="w-full py-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-lg uppercase tracking-widest rounded-lg shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-3"
              >
                <AlertTriangle size={22} /> LAUNCH NOW
              </button>

              {launchFeedback && (
                <div className="mt-2 text-center text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded animate-pulse">
                  {launchFeedback}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* 2-COLUMN MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT 2 COLS: SCENE CONTROL & AUTO TRIGGER */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* SCENE CONTROL */}
            <section className="bg-[#0A0E12] border border-gray-800 rounded-lg p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Power size={14} /> Scene Control
              </h2>
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-[10px] text-blue-400 uppercase tracking-widest mb-1">Current Active Scene</div>
                  <div className="text-2xl font-bold text-white">{SCENE_NAMES[sceneIndex] || `Scene ${sceneIndex}`}</div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleSceneChange(sceneIndex - 1)}
                    disabled={sceneIndex === 0}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition text-sm"
                  >
                    <SkipBack size={16} /> Prev
                  </button>
                  <button 
                    onClick={() => handleSceneChange(sceneIndex + 1)}
                    disabled={sceneIndex === 7}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed rounded transition font-bold text-sm"
                  >
                    Next <SkipForward size={16} />
                  </button>
                </div>
              </div>

              {/* Direct Jump Buttons */}
              <div className="space-y-3">
                <div className="text-xs text-gray-500 uppercase tracking-widest">Direct Jump</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SCENE_NAMES.map((name, i) => (
                    <button
                      key={i}
                      onClick={() => handleSceneChange(i)}
                      className={`px-3 py-2 text-xs border rounded transition text-left truncate ${
                        sceneIndex === i 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300 font-bold' 
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                
                <div className="pt-3 mt-4 border-t border-gray-800 flex justify-end">
                  <button 
                    onClick={() => {
                      if (confirm("Reset display to Scene 0 (Dashboard Idle)?")) {
                        handleSceneChange(0);
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <AlertTriangle size={14} /> Reset to Scene 0
                  </button>
                </div>
              </div>
            </section>

            {/* AUTO TRIGGER & TIMED START */}
            <section className="bg-[#0A0E12] border border-gray-800 rounded-lg p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock size={14} /> Auto-Trigger (Scene 0 → 1)
              </h2>

              <div className="p-4 bg-gray-900/60 border border-gray-800 rounded mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Timer size={14} className="text-purple-400" />
                  <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Countdown Presets</span>
                </div>

                {countdownRemaining === null ? (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[1, 2, 5, 10, 15].map((min) => (
                        <button
                          key={min}
                          onClick={() => setCountdownMinutes(min)}
                          className={`px-3 py-1.5 rounded text-xs font-mono border transition ${
                            countdownMinutes === min
                              ? "bg-purple-600/30 border-purple-500 text-purple-300 font-bold"
                              : "bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                          }`}
                        >
                          {min}m
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 rounded px-2">
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={countdownMinutes}
                          onChange={(e) => setCountdownMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                          className="bg-transparent text-white w-12 py-2 text-center font-mono focus:outline-none"
                        />
                        <span className="text-gray-500 text-xs">min</span>
                      </div>
                      <button
                        onClick={startCountdown}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/50 hover:bg-purple-600/40 rounded font-bold text-sm uppercase tracking-wider transition"
                      >
                        <Play size={16} /> Start Countdown
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl font-mono font-bold text-purple-400 tabular-nums">
                      {formatCountdown(countdownRemaining)}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">
                        Auto-fires at <strong className="text-purple-400">{autoTriggerConfig.triggerTime}</strong>
                      </span>
                      <button
                        onClick={cancelCountdown}
                        className="flex items-center gap-1 px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/30 rounded text-xs transition"
                      >
                        <Square size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Exact Time Trigger */}
              <div className="border-t border-gray-800 pt-3 flex items-center justify-between flex-wrap gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={autoTriggerConfig.enabled}
                    onChange={(e) => {
                      if (!e.target.checked) cancelCountdown();
                      updateState({ autoTriggerConfig: { ...autoTriggerConfig, enabled: e.target.checked }});
                    }}
                    className="w-4 h-4 accent-purple-500"
                  />
                  <span className={`text-xs ${autoTriggerConfig.enabled ? "text-purple-400 font-bold" : "text-gray-500"}`}>
                    Exact-Time Armed
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={triggerTimeInput}
                    onChange={(e) => setTriggerTimeInput(e.target.value)}
                    disabled={!autoTriggerConfig.enabled}
                    className="bg-gray-900 border border-gray-700 text-white px-3 py-1 rounded w-24 text-center text-xs font-mono disabled:opacity-50"
                    placeholder="HH:MM:SS"
                  />
                  <button 
                    onClick={() => updateState({ autoTriggerConfig: { ...autoTriggerConfig, triggerTime: triggerTimeInput }})}
                    disabled={!autoTriggerConfig.enabled}
                    className="px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/50 rounded text-xs disabled:opacity-50"
                  >
                    Set
                  </button>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: AUDIO, CLOCK, TIMINGS */}
          <div className="space-y-6">
            
            {/* AUDIO & EMERGENCY */}
            <section className="bg-[#0A0E12] border border-gray-800 rounded-lg p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> Audio & Overrides
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 flex justify-between">
                    <span>Alert Beep Volume</span>
                    <span className="text-red-400 font-bold">{Math.round(state.alertBeepVolume * 100)}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" max="1" step="0.05"
                    value={state.alertBeepVolume}
                    onChange={(e) => updateState({ alertBeepVolume: parseFloat(e.target.value) })}
                    className="w-full accent-red-500"
                  />
                </div>

                <button 
                  onClick={() => updateState({ muted: !muted })}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded font-bold border transition text-xs ${
                    muted 
                      ? 'bg-red-600/20 border-red-500 text-red-400' 
                      : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <VolumeX size={16} /> {muted ? "UNMUTE AUDIO" : "MUTE ALL AUDIO"}
                </button>
                
                <button 
                  onClick={triggerSkipAudio}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded text-gray-400 transition text-xs"
                >
                  <SkipForward size={14} /> Skip Current Audio
                </button>
              </div>
            </section>

            {/* CLOCK CONFIG */}
            <section className="bg-[#0A0E12] border border-gray-800 rounded-lg p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock size={14} /> Dashboard Clock
              </h2>
              
              <div className="space-y-3">
                <div className="flex bg-gray-900 p-1 rounded border border-gray-800 text-xs">
                  <button 
                    onClick={() => updateState({ timeConfig: { ...timeConfig, useRealTime: true } })}
                    className={`flex-1 py-1.5 rounded font-bold ${timeConfig.useRealTime ? 'bg-emerald-600/20 text-emerald-400' : 'text-gray-500'}`}
                  >
                    Real Time
                  </button>
                  <button 
                    onClick={() => updateState({ timeConfig: { ...timeConfig, useRealTime: false } })}
                    className={`flex-1 py-1.5 rounded font-bold ${!timeConfig.useRealTime ? 'bg-emerald-600/20 text-emerald-400' : 'text-gray-500'}`}
                  >
                    Simulated
                  </button>
                </div>
                
                {!timeConfig.useRealTime && (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={simTimeInput}
                      onChange={(e) => setSimTimeInput(e.target.value)}
                      className="bg-gray-900 border border-gray-700 text-white px-3 py-1 rounded w-full font-mono text-center text-xs"
                      placeholder="HH:MM:SS"
                    />
                    <button 
                      onClick={handleApplyTime}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-white"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* TIMINGS */}
            <section className="bg-[#0A0E12] border border-gray-800 rounded-lg p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gray-500" />
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Settings size={14} /> Transition Timings (ms)
              </h2>
              
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase block">Glitch Cut</label>
                  <input 
                    type="number" 
                    value={timingsInput.glitchCutMs}
                    onChange={(e) => setTimingsInput({ ...timingsInput, glitchCutMs: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-900 border border-gray-800 p-1.5 rounded text-white font-mono"
                  />
                </div>
                
                <button 
                  onClick={handleApplyTimings}
                  className="w-full mt-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs font-bold text-gray-300 uppercase"
                >
                  Apply Timings
                </button>
              </div>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}
