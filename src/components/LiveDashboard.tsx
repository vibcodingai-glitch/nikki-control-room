import React, { useEffect, useState } from "react";
import { useSyncState } from "@/lib/useSyncState";
import { Zap, ArrowRight, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlitchText, TypingLog } from "./TechEffects";

interface DwellData {
  median: string;
  pastTarget: number;
  bars: number[]; 
}

interface OldestItem {
  country: string;
  id: string;
  time: string;
  isRed?: boolean;
}

interface EnteringItem {
  time: string;
  country: string;
  id: string;
  desc: string;
}

interface ColumnData {
  title: string;
  desc: string;
  topColor: string;
  mainNumber: string;
  subNumber: string;
  trend: string;
  dwell: DwellData;
  oldest: OldestItem[];
  entering: EnteringItem[];
}

const INITIAL_DATA: ColumnData[] = [
  {
    title: "CREATED",
    desc: "Delivery exists. No truck assigned yet.",
    topColor: "border-slate-500",
    mainNumber: "295",
    subNumber: "228k cases",
    trend: "0 STEADY",
    dwell: { median: "7h", pastTarget: 50, bars: [30, 20, 10, 30, 80] },
    oldest: [
      { country: "AO", id: "7101406585", time: "14d", isRed: true },
      { country: "NG", id: "7101455722", time: "12.7d", isRed: true },
      { country: "NG", id: "7101457782", time: "12.6d", isRed: true }
    ],
    entering: [
      { time: "22:35", country: "GH", id: "7101795724", desc: "80 cs · Accra" },
      { time: "22:35", country: "GH", id: "7101795723", desc: "35 cs · Accra" },
      { time: "22:36", country: "NG", id: "7101795725", desc: "12 cs · Lagos" },
      { time: "22:37", country: "AO", id: "7101795726", desc: "50 cs · Luanda" }
    ]
  },
  {
    title: "TENDERING",
    desc: "Freight unit created. Awaiting carrier assignment.",
    topColor: "border-orange-500",
    mainNumber: "29",
    subNumber: "48k cases",
    trend: "0 STEADY",
    dwell: { median: "8h", pastTarget: 8, bars: [40, 40, 20, 10, 60] },
    oldest: [
      { country: "NG", id: "7101701663", time: "4.3d", isRed: true },
      { country: "NG", id: "7101751414", time: "2.5d", isRed: true },
      { country: "NG", id: "7101751968", time: "2.4d", isRed: true }
    ],
    entering: [
      { time: "22:01", country: "GH", id: "7101759367", desc: "1,200 cs · Accra" },
      { time: "22:01", country: "GH", id: "7101759366", desc: "200 cs · Accra" },
      { time: "22:03", country: "NG", id: "7101759368", desc: "450 cs · Abuja" },
      { time: "22:05", country: "NG", id: "7101759369", desc: "300 cs · Kano" }
    ]
  },
  {
    title: "LOADING",
    desc: "On the dock. Goods issue not posted.",
    topColor: "border-blue-500",
    mainNumber: "85",
    subNumber: "80k cases",
    trend: "0 STEADY",
    dwell: { median: "12h", pastTarget: 33, bars: [10, 10, 15, 30, 90] },
    oldest: [
      { country: "GH", id: "7101701952", time: "4.2d", isRed: true },
      { country: "GH", id: "7101703768", time: "4.1d", isRed: true },
      { country: "GA", id: "7101735149", time: "3.5d", isRed: true }
    ],
    entering: [
      { time: "22:00", country: "GH", id: "7101759353", desc: "200 cs · Tamale" },
      { time: "22:00", country: "GH", id: "7101759352", desc: "1,094 cs · Tamale" },
      { time: "22:04", country: "GA", id: "7101759355", desc: "500 cs · Libreville" },
      { time: "22:10", country: "NG", id: "7101759356", desc: "800 cs · Lagos" }
    ]
  },
  {
    title: "IN TRANSIT",
    desc: "Goods issued. En route to customer.",
    topColor: "border-teal-500",
    mainNumber: "1,942",
    subNumber: "2,415k cases",
    trend: "0 STEADY",
    dwell: { median: "4d", pastTarget: 1298, bars: [20, 20, 20, 50, 100] },
    oldest: [
      { country: "NG", id: "7101434702", time: "13d", isRed: true },
      { country: "NG", id: "7101431031", time: "13d", isRed: true },
      { country: "NG", id: "7101462765", time: "12d", isRed: true }
    ],
    entering: [
      { time: "23:59", country: "NG", id: "7101582763", desc: "2,150 cs · Nsukka" },
      { time: "23:59", country: "NG", id: "7101594585", desc: "3,565 cs · Maiduguri" },
      { time: "00:05", country: "GH", id: "7101594588", desc: "1,200 cs · Kumasi" },
      { time: "00:15", country: "AO", id: "7101594589", desc: "900 cs · Huambo" }
    ]
  },
  {
    title: "AT CUSTOMER",
    desc: "Arrived at customer. Awaiting offload.",
    topColor: "border-green-500",
    mainNumber: "34",
    subNumber: "12k cases",
    trend: "0 STEADY",
    dwell: { median: "2h", pastTarget: 4, bars: [80, 40, 20, 10, 5] },
    oldest: [
      { country: "NG", id: "7101824702", time: "1.2d", isRed: true },
      { country: "GH", id: "7101831031", time: "0.8d", isRed: false },
      { country: "AO", id: "7101862765", time: "0.5d", isRed: false }
    ],
    entering: [
      { time: "00:15", country: "NG", id: "7101982763", desc: "850 cs · Lagos" },
      { time: "00:30", country: "GH", id: "7101994585", desc: "420 cs · Kumasi" },
      { time: "00:45", country: "NG", id: "7101994586", desc: "150 cs · Abuja" },
      { time: "01:00", country: "AO", id: "7101994587", desc: "300 cs · Luanda" }
    ]
  }
];

const PipelineColumn: React.FC<{
  col: ColumnData;
  idx: number;
  visibleEnteringIdx: number;
}> = ({ col, idx, visibleEnteringIdx }) => {
  // Random small offset for live number breathing
  const [liveMainNumber, setLiveMainNumber] = useState(col.mainNumber);

  useEffect(() => {
    const interval = setInterval(() => {
      const num = parseInt(col.mainNumber.replace(/,/g, ''));
      // Random variation between -2 and +3
      const variation = Math.floor(Math.random() * 6) - 2; 
      const newNum = Math.max(0, num + variation);
      setLiveMainNumber(newNum.toLocaleString());
      
      // Hold the fake number for a random short burst before reverting
      setTimeout(() => {
        setLiveMainNumber(col.mainNumber);
      }, 400 + Math.random() * 1500);
      
    }, 1200 + Math.random() * 3000 + (idx * 600)); // Every 1.2 to 4.2 seconds
    
    return () => clearInterval(interval);
  }, [col.mainNumber, idx]);

  return (
    <div className={`min-w-[280px] flex-1 bg-[#0A0E12]/80 backdrop-blur-sm rounded-md border-t-[3px] border-x border-b border-gray-800 ${col.topColor} flex flex-col`}>
      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-6">
          <h2 className="font-bold text-base tracking-wider mb-1 uppercase text-white">
            <GlitchText text={col.title} glitchInterval={4000 + idx * 1000} />
          </h2>
          <p className="text-gray-500 text-[11px] leading-snug">{col.desc}</p>
        </div>

        {/* Main Numbers */}
        <div className="mb-4">
          <div className="text-5xl font-bold mb-1 text-white tabular-nums">{liveMainNumber}</div>
          <div className="text-gray-400 text-sm">{col.subNumber}</div>
        </div>

        {/* Trend */}
        <div className="bg-[#161B22] rounded px-3 py-2 flex items-center justify-between text-gray-400 mb-8 border border-gray-800">
          <div className="flex items-center gap-1">
            <ArrowDown size={14} className="text-gray-500" />
            <span className="font-mono">0 → 0</span>
          </div>
          <span className="text-gray-500 font-mono text-xs">{col.trend}</span>
        </div>

        {/* Dwell section */}
        <div className="mb-8">
          <h3 className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wider">DWELL</h3>
          <div className="flex items-end gap-1 h-12 border-b border-gray-700/50 pb-1 mb-2">
            {col.dwell.bars.map((height, i) => {
              const isRed = (idx === 0 && i >= 3) || (idx > 0 && height > 40);
              const isOrange = !isRed && height > 20;
              const bgColor = isRed ? "#ef4444" : isOrange ? "#f97316" : "#4b5563";
              return (
                <motion.div
                  key={i}
                  className="flex-1 rounded-sm opacity-90 origin-bottom"
                  style={{ backgroundColor: bgColor }}
                  animate={{ height: [`${height}%`, `${height + (Math.random() * 4 - 2)}%`, `${height}%`] }}
                  transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 mb-1 font-mono">
            <span>&lt;4h</span>
            <span>&gt;24h</span>
          </div>
          <div className="text-xs">
            <span className="text-gray-400">median {col.dwell.median} · </span>
            {col.dwell.pastTarget > 0 ? (
              <span className="text-red-400">{col.dwell.pastTarget} past target!</span>
            ) : (
              <span className="text-emerald-400">on target</span>
            )}
          </div>
        </div>

        {/* Oldest Held */}
        <div className="mb-4">
          <h3 className="text-gray-500 text-xs font-semibold mb-3 uppercase tracking-wider">OLDEST HELD</h3>
          <div className="flex flex-col gap-3">
            {col.oldest.map((item, i) => (
              <div key={i} className="flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-3">
                  <span className="bg-white text-black px-1.5 py-0.5 rounded-sm font-bold text-[10px] leading-none">{item.country}</span>
                  <span className="text-gray-300">{item.id}</span>
                </div>
                <span className={item.isRed ? "text-red-400" : "text-gray-400"}>{item.time}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center text-gray-700">
            <ArrowDown size={12} className="inline-block" />
          </div>
        </div>

        {/* Live Telemetry Log (fills remaining space) */}
        <div className="flex-1 flex flex-col justify-end overflow-hidden pb-4 opacity-40">
          <TypingLog 
            messages={[
              `CONNECTING TO NODE 0x${(idx + 1) * 2}F...`,
              "HANDSHAKE: OK",
              "SYNCING FREIGHT MANIFEST...",
              "CHECKSUM: VALID",
              `PING: ${12 + idx * 4}ms`,
              "MONITORING FOR ANOMALIES...",
              "ROUTING METRICS NOMINAL",
              "WAITING FOR UPLINK..."
            ]}
            typingSpeed={15}
            lineDelay={400 + idx * 200}
            className="text-[9px]"
            color={
              idx === 0 ? "text-slate-400" :
              idx === 1 ? "text-orange-400" :
              idx === 2 ? "text-blue-400" :
              idx === 3 ? "text-teal-400" : "text-green-400"
            }
          />
        </div>

        {/* Entering Feed */}
        <div className="pt-4 border-t border-gray-800 overflow-hidden relative h-[120px]">
          <h3 className="text-gray-500 text-[10px] uppercase mb-3 flex items-center gap-1 tracking-wider z-10 relative bg-[#0A0E12]">
            ENTERING · {col.title}
          </h3>
          <div className="relative h-full w-full">
            <AnimatePresence>
              {[
                col.entering[visibleEnteringIdx % col.entering.length],
                col.entering[(visibleEnteringIdx + 1) % col.entering.length]
              ].map((item, i) => (
                <motion.div
                  key={`${item.id}-${i}-${visibleEnteringIdx}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: i * 40 }} // 40px row height approx
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.5 }}
                  className="absolute left-0 right-0 flex gap-3 font-mono text-[10px] text-gray-400"
                >
                  <div className="w-8 text-gray-500">{item.time}</div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{item.country}</span>
                      <span className="text-gray-300">{item.id}</span>
                    </div>
                    <div className="text-gray-500">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LiveDashboard = () => {
  const { state } = useSyncState("display");
  const [time, setTime] = useState(new Date());
  const [visibleEnteringIdx, setVisibleEnteringIdx] = useState(0);

  useEffect(() => {
    // If real time, just use Date.now(). 
    // If simulated time, we can calculate a base offset when it's first set, 
    // and just add elapsed time to it so the clock keeps ticking.
    let baseOffset = 0;
    
    if (!state.timeConfig.useRealTime) {
      const parts = state.timeConfig.simulatedTime.split(':');
      const simDate = new Date();
      simDate.setHours(parseInt(parts[0] || '0'));
      simDate.setMinutes(parseInt(parts[1] || '0'));
      simDate.setSeconds(parseInt(parts[2] || '0'));
      baseOffset = simDate.getTime() - Date.now();
    }

    const timer = setInterval(() => {
      setTime(new Date(Date.now() + baseOffset));
    }, 1000);
    
    // Call immediately once on mount/config change to avoid 1s lag
    setTime(new Date(Date.now() + baseOffset));
    
    return () => clearInterval(timer);
  }, [state.timeConfig]);

  useEffect(() => {
    // Cycle entering feed very rapidly (2.5 seconds) to create busy movement
    const feedTimer = setInterval(() => {
      setVisibleEnteringIdx((prev) => prev + 1);
    }, 2500);
    return () => clearInterval(feedTimer);
  }, []);

  const formatTime = (date: Date, offsetHours: number) => {
    const d = new Date(date.getTime() + offsetHours * 3600 * 1000);
    return d.toISOString().substring(11, 19); 
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0A0E12] text-white font-sans text-xs md:text-sm">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#0D1117] border-b border-gray-800/80 shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-[10px] leading-tight font-bold text-emerald-400 tracking-tighter">
            <span>GROWTH</span>
            <span>SPEED</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-[0.2em] ml-4 text-white uppercase">
            CWAR DELIVERY EVENT SIGNAL BOARD
          </h1>
          <div className="ml-8 flex gap-2">
            <button className="px-3 py-1 bg-[#161B22] rounded text-gray-400 border border-gray-700/50 hover:bg-gray-800 transition flex items-center gap-2">
              ⊞ Dispatch
            </button>
            <button className="px-3 py-1 bg-[#1F2937] rounded text-white border border-gray-600 hover:bg-gray-700 transition flex items-center gap-2 shadow-inner">
              → Flow Board
            </button>
          </div>
        </div>
        <div className="flex items-center gap-6 font-mono">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase">WAT</span>
            <span className="text-sm font-medium">{formatTime(time, 1)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-500 uppercase">GMT</span>
            <span className="text-sm font-medium">{formatTime(time, 0)}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <motion.div 
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-emerald-400" 
            />
            <span className="uppercase text-xs tracking-widest font-semibold">Live</span>
          </div>
          <div className="w-8 h-8 rounded-full border border-gray-700/50 flex items-center justify-center bg-[#161B22] text-gray-400 cursor-pointer hover:bg-gray-800">
            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent" />
          </div>
        </div>
      </div>

      <div className="px-6 py-1.5 border-b border-gray-800/30 bg-[#0A0E12] text-gray-500 text-[10px] uppercase tracking-widest font-mono">
        Pipeline · Net flow · Dwell · Oldest held
      </div>

      {/* Main Board */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col relative z-0">
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {INITIAL_DATA.map((col, idx) => (
            <PipelineColumn 
              key={idx} 
              col={col} 
              idx={idx} 
              visibleEnteringIdx={visibleEnteringIdx} 
            />
          ))}
        </div>
      </div>

      {/* Footer Ticker */}
      <div className="bg-[#0D1117] border-t border-gray-800/80 py-2 overflow-hidden flex text-[11px] font-mono text-emerald-400 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2 px-4 bg-[#0D1117] mr-4 z-20 shadow-[10px_0_10px_#0D1117]">
          <Zap size={14} className="text-emerald-400" />
          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-widest">LIVE FEED</span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <motion.div 
            animate={{ x: [0, -2000] }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-8 whitespace-nowrap absolute"
          >
            <span className="flex items-center gap-1 text-yellow-400">☀ Kano, Nigeria: 23.7°C (Clear sky)</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1 text-yellow-400">☀ Abuja, Nigeria: 23°C (Clear sky)</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1 text-coral-400">⚠ Heavy Rainfall Expected</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1 text-white">☁ Port Harcourt, Nigeria: 26.1°C</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1 text-yellow-400">☀ Accra, Ghana: 28°C</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1 text-white">☁ Lagos, Nigeria: 27.5°C</span>
            
            {/* Duplicate for seamless loop */}
            <span className="flex items-center gap-1 text-yellow-400 ml-8">☀ Kano, Nigeria: 23.7°C (Clear sky)</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1 text-yellow-400">☀ Abuja, Nigeria: 23°C (Clear sky)</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1 text-coral-400">⚠ Heavy Rainfall Expected</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1 text-white">☁ Port Harcourt, Nigeria: 26.1°C</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1 text-yellow-400">☀ Accra, Ghana: 28°C</span>
            <span className="text-gray-500">·</span>
            <span className="flex items-center gap-1 text-white">☁ Lagos, Nigeria: 27.5°C</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
