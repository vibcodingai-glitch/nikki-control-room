"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSyncState } from "@/lib/useSyncState";
import { Activity, Power, Clock, Settings, AlertTriangle, SkipForward, VolumeX, ShieldAlert, SkipBack, Timer, Play, Square } from "lucide-react";

export default function AdminPage() {
  const { state, updateState, isConnected, triggerSkipAudio } = useSyncState("admin");
  const { sceneIndex, timeConfig, transitionTimings, muted, autoTriggerConfig } = state;

  // Local state for forms
  const [simTimeInput, setSimTimeInput] = useState(timeConfig.simulatedTime);
  const [triggerTimeInput, setTriggerTimeInput] = useState(autoTriggerConfig.triggerTime);
  const [timingsInput, setTimingsInput] = useState(transitionTimings);

  // Countdown timer state
  const [countdownMinutes, setCountdownMinutes] = useState(10);
  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null); // seconds remaining
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimeRef = useRef<number | null>(null);

  // Keep local inputs somewhat in sync if external changes occur (optional, but good)
  useEffect(() => {
    setSimTimeInput(timeConfig.simulatedTime);
  }, [timeConfig.simulatedTime]);

  useEffect(() => {
    setTriggerTimeInput(autoTriggerConfig.triggerTime);
  }, [autoTriggerConfig.triggerTime]);

  useEffect(() => {
    setTimingsInput(transitionTimings);
  }, [transitionTimings]);

  // Handlers
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

  // Countdown timer logic
  const startCountdown = useCallback(() => {
    // Calculate the target wall-clock time
    const targetMs = Date.now() + countdownMinutes * 60 * 1000;
    targetTimeRef.current = targetMs;

    // Also compute the HH:MM:SS the display clock will show at that moment
    const targetDate = new Date(targetMs);
    const triggerHHMMSS = targetDate.toTimeString().substring(0, 8);

    // Arm the auto-trigger with the computed time
    updateState({
      autoTriggerConfig: { enabled: true, triggerTime: triggerHHMMSS },
      timeConfig: { ...timeConfig, useRealTime: true }, // Force real time so clocks match
    });
    setTriggerTimeInput(triggerHHMMSS);

    // Start the visual countdown
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
        
        // Force the transition from the Admin window to ensure it fires reliably
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
    updateState((prev) => ({ ...prev, autoTriggerConfig: { enabled: false, triggerTime: prev.autoTriggerConfig.triggerTime } }));
  }, [updateState]);

  // Cleanup on unmount
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

  const SCENE_NAMES = [
    "0: Dashboard",
    "1: Alert Received",
    "2: Initial Triangulation",
    "3: Deep Scan",
    "4: Investigation Complete",
    "5: Birthday Reveal",
    "6: Honorary Operator",
    "7: Wrap / Finale"
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-mono p-6 selection:bg-emerald-900">
      
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-800 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-emerald-500" size={28} />
            <h1 className="text-2xl font-bold text-white tracking-widest uppercase">CWAR Master Control</h1>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
              process.env.NEXT_PUBLIC_SUPABASE_URL 
                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' 
                : 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
            }`}>
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? '☁️ Cloud Sync' : '💻 Local Only'}
            </div>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${isConnected ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-red-500/50 bg-red-500/10 text-red-400'}`}>
              <Activity size={16} className={isConnected ? "animate-pulse" : ""} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {isConnected ? "Display Connected" : "No Display Detected"}
              </span>
            </div>
          </div>
        </header>

        {/* LAUNCH SEQUENCE - Big prominent button */}
        {sceneIndex === 0 && (
          <section className="relative overflow-hidden rounded-xl border-2 border-red-500/30 bg-gradient-to-r from-red-950/40 via-red-900/20 to-red-950/40">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.15),transparent_70%)]" />
            <div className="relative p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-[10px] text-red-400 uppercase tracking-[0.3em] mb-1">One-Tap Launch</div>
                <div className="text-lg sm:text-xl text-white font-bold">Start the full cinematic experience</div>
                <div className="text-xs text-gray-500 mt-1">Triggers Scene 1 → auto-advances through all scenes</div>
              </div>
              <button
                onClick={() => handleSceneChange(1)}
                className="w-full sm:w-auto px-10 py-5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-black text-xl uppercase tracking-widest rounded-lg shadow-lg shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-200 flex items-center justify-center gap-3 whitespace-nowrap"
              >
                <AlertTriangle size={24} /> LAUNCH
              </button>
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* SCENE CONTROL */}
            <section className="bg-[#0A0E12] border border-gray-800 rounded-lg p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Power size={14} /> Scene Control
              </h2>
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-[10px] text-blue-400 uppercase tracking-widest mb-1">Current Active Scene</div>
                  <div className="text-3xl font-bold text-white">{SCENE_NAMES[sceneIndex] || `Scene ${sceneIndex}`}</div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleSceneChange(sceneIndex - 1)}
                    disabled={sceneIndex === 0}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-900 border border-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                  >
                    <SkipBack size={18} /> Prev
                  </button>
                  <button 
                    onClick={() => handleSceneChange(sceneIndex + 1)}
                    disabled={sceneIndex === 7}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed rounded transition font-bold"
                  >
                    Next <SkipForward size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-gray-500 uppercase tracking-widest">Direct Jump</div>
                <div className="grid grid-cols-4 gap-2">
                  {SCENE_NAMES.map((name, i) => (
                    <button
                      key={i}
                      onClick={() => handleSceneChange(i)}
                      className={`px-3 py-2 text-xs border rounded transition ${
                        sceneIndex === i 
                          ? 'bg-blue-500/20 border-blue-500 text-blue-300' 
                          : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      {name.split(':')[0]}
                    </button>
                  ))}
                </div>
                
                <div className="pt-4 mt-4 border-t border-gray-800 flex justify-end">
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to reset to Scene 0? This will interrupt the live experience.")) {
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

            {/* AUTO TRIGGER */}
            <section className="bg-[#0A0E12] border border-gray-800 rounded-lg p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock size={14} /> Auto-Trigger (Scene 0 → 1)
              </h2>

              {/* Quick Countdown Timer */}
              <div className="mb-5 p-4 bg-gray-900/60 border border-gray-800 rounded">
                <div className="flex items-center gap-2 mb-3">
                  <Timer size={14} className="text-purple-400" />
                  <span className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Start in...</span>
                </div>

                {countdownRemaining === null ? (
                  <>
                    {/* Preset buttons */}
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 5, 10, 15, 30].map((min) => (
                        <button
                          key={min}
                          onClick={() => setCountdownMinutes(min)}
                          className={`px-3 py-1.5 rounded text-xs font-mono border transition ${
                            countdownMinutes === min
                              ? "bg-purple-600/30 border-purple-500 text-purple-300"
                              : "bg-gray-900 border-gray-700 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                          }`}
                        >
                          {min}m
                        </button>
                      ))}
                    </div>

                    {/* Custom input + start */}
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
                  /* Active countdown display */
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-5xl font-mono font-bold text-purple-400 tabular-nums tracking-widest">
                      {formatCountdown(countdownRemaining)}
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(0, (countdownRemaining / (countdownMinutes * 60)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">
                        Fires at <strong className="text-purple-400">{autoTriggerConfig.triggerTime}</strong>
                      </span>
                      <button
                        onClick={cancelCountdown}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-600/30 rounded text-xs uppercase tracking-wider transition"
                      >
                        <Square size={12} /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual exact-time trigger */}
              <div className="border-t border-gray-800 pt-4">
                <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Or set exact clock time</div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoTriggerConfig.enabled}
                      onChange={(e) => {
                        if (!e.target.checked) cancelCountdown();
                        updateState({ autoTriggerConfig: { ...autoTriggerConfig, enabled: e.target.checked }});
                      }}
                      className="w-4 h-4 accent-purple-500 bg-gray-900 border-gray-700 rounded"
                    />
                    <span className={`text-xs ${autoTriggerConfig.enabled ? "text-purple-400 font-bold" : "text-gray-500"}`}>
                      {autoTriggerConfig.enabled ? "ARMED" : "Disarmed"}
                    </span>
                  </label>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <input 
                      type="text" 
                      value={triggerTimeInput}
                      onChange={(e) => setTriggerTimeInput(e.target.value)}
                      disabled={!autoTriggerConfig.enabled}
                      className="bg-gray-900 border border-gray-700 text-white px-3 py-1.5 rounded focus:outline-none focus:border-purple-500 w-28 font-mono text-center text-sm disabled:opacity-50"
                      placeholder="HH:MM:SS"
                    />
                    <button 
                      onClick={() => updateState({ autoTriggerConfig: { ...autoTriggerConfig, triggerTime: triggerTimeInput }})}
                      disabled={!autoTriggerConfig.enabled}
                      className="px-3 py-1.5 bg-purple-600/20 text-purple-400 border border-purple-500/50 hover:bg-purple-600/30 rounded text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>

              {autoTriggerConfig.enabled && countdownRemaining === null && (
                <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded text-purple-300 text-sm flex items-center gap-2">
                  <Activity size={16} className="animate-pulse" />
                  System will automatically cut to Scene 1 when display clock hits <strong>{autoTriggerConfig.triggerTime}</strong>.
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            
            {/* CLOCK CONFIG */}
            <section className="bg-[#0A0E12] border border-gray-800 rounded-lg p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Clock size={14} /> Clock Configuration
              </h2>
              
              <div className="space-y-4">
                <div className="flex bg-gray-900 p-1 rounded border border-gray-800">
                  <button 
                    onClick={() => updateState({ timeConfig: { ...timeConfig, useRealTime: true } })}
                    className={`flex-1 py-2 text-xs font-bold rounded ${timeConfig.useRealTime ? 'bg-emerald-600/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Real Time
                  </button>
                  <button 
                    onClick={() => updateState({ timeConfig: { ...timeConfig, useRealTime: false } })}
                    className={`flex-1 py-2 text-xs font-bold rounded ${!timeConfig.useRealTime ? 'bg-emerald-600/20 text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
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
                      className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:border-emerald-500 w-full font-mono text-center"
                      placeholder="HH:MM:SS"
                    />
                    <button 
                      onClick={handleApplyTime}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs uppercase text-white"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* EMERGENCY */}
            <section className="bg-[#0A0E12] border border-gray-800 rounded-lg p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> Emergency & Audio Overrides
              </h2>
              
              <div className="space-y-4">
                <div className="mb-2">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
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
                  <div className="text-[9px] text-gray-600 mt-1 flex justify-between">
                    <span>Mute</span>
                    <span>Default: 60%</span>
                    <span>Max</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 my-4"></div>

                <button 
                  onClick={() => updateState({ muted: !muted })}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded font-bold border transition ${
                    muted 
                      ? 'bg-red-600/20 border-red-500 text-red-400' 
                      : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <VolumeX size={18} /> {muted ? "UNMUTE AUDIO" : "MUTE ALL AUDIO"}
                </button>
                
                <button 
                  onClick={triggerSkipAudio}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded text-gray-400 transition text-sm"
                >
                  <SkipForward size={16} /> Skip Current Audio
                </button>
              </div>
            </section>

            {/* TIMINGS */}
            <section className="bg-[#0A0E12] border border-gray-800 rounded-lg p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gray-500" />
              <h2 className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Settings size={14} /> Transition Timing (ms)
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Cross-Fade</label>
                  <input 
                    type="number" 
                    value={timingsInput.crossFadeMs}
                    onChange={(e) => setTimingsInput({ ...timingsInput, crossFadeMs: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-900 border border-gray-800 p-2 text-sm rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Glitch Cut</label>
                  <input 
                    type="number" 
                    value={timingsInput.glitchCutMs}
                    onChange={(e) => setTimingsInput({ ...timingsInput, glitchCutMs: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-900 border border-gray-800 p-2 text-sm rounded text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase mb-1 block">Countdown Step</label>
                  <input 
                    type="number" 
                    value={timingsInput.countdownIntervalMs}
                    onChange={(e) => setTimingsInput({ ...timingsInput, countdownIntervalMs: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-900 border border-gray-800 p-2 text-sm rounded text-white font-mono"
                  />
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={handleApplyTimings}
                    className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded text-xs uppercase font-bold text-gray-300"
                  >
                    Apply Timings
                  </button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
