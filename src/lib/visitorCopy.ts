// All visitor strings, copy, escalation stages, and styling tokens in one central place

export const ROOM_NAME = "OUR CONTROL ROOM";

export interface EscalationStageConfig {
  id: "A" | "B" | "C" | "D" | "E";
  durationMs: number;
  counterDisplay: string;
  headline: string;
  appraisal: string;
  meterPercent: number;
  meterColor: string; // hex
  headcountLabel: string;
  blipCount: number;
  radarLabel: string;
  beepGap: number;
  beepVolume: number;
}

// Self-running 12-second escalation sequence for Scene 2
// Fast Mode scales these durations by ~0.65
export const ESCALATION_STAGES: EscalationStageConfig[] = [
  {
    id: "A",
    durationMs: 2000,
    counterDisplay: "01",
    headline: "1 UNIDENTIFIED GUEST",
    appraisal: "ASSESSMENT: LOW THREAT",
    meterPercent: 20,
    meterColor: "#3FA66E", // green
    headcountLabel: "CONFIRMED HEADCOUNT",
    blipCount: 1,
    radarLabel: "RADAR BLIPS: 1 / 1",
    beepGap: 900,
    beepVolume: 0.35,
  },
  {
    id: "B",
    durationMs: 2000,
    counterDisplay: "02",
    headline: "2 UNIDENTIFIED GUESTS",
    appraisal: "PATTERN: COORDINATED ENTRY",
    meterPercent: 40,
    meterColor: "#84CC16", // yellow-green
    headcountLabel: "CONFIRMED HEADCOUNT",
    blipCount: 2,
    radarLabel: "RADAR BLIPS: 2 / 2",
    beepGap: 700,
    beepVolume: 0.5,
  },
  {
    id: "C",
    durationMs: 2000,
    counterDisplay: "03",
    headline: "MORE THAN 2 UNIDENTIFIED GUESTS",
    appraisal: "THREAT LEVEL: ELEVATED",
    meterPercent: 65,
    meterColor: "#F97316", // amber
    headcountLabel: "ESTIMATED HEADCOUNT",
    blipCount: 4,
    radarLabel: "RADAR BLIPS: 4",
    beepGap: 480,
    beepVolume: 0.65,
  },
  {
    id: "D",
    durationMs: 3000,
    counterDisplay: "04", // dynamic race: 04, 05, 06… 09 faster and faster
    headline: "MULTIPLE ENTITIES — COUNT UNRELIABLE",
    appraisal: "NEW ENTITIES STILL ARRIVING",
    meterPercent: 85,
    meterColor: "#EF4444", // orange/red
    headcountLabel: "HEADCOUNT: UNKNOWN",
    blipCount: 12,
    radarLabel: "RADAR BLIPS: ???",
    beepGap: 300,
    beepVolume: 0.8,
  },
  {
    id: "E",
    durationMs: 3000,
    counterDisplay: "??",
    headline: "MULTIPLE UNIDENTIFIED GUESTS",
    appraisal: "ASSESSMENT: CRITICAL — GROUP-SIZE INCURSION",
    meterPercent: 100,
    meterColor: "#EF4444", // red
    headcountLabel: "HEADCOUNT: UNKNOWN",
    blipCount: 12,
    radarLabel: "RADAR BLIPS: ???",
    beepGap: 180,
    beepVolume: 1.0,
  },
];

export const visitorCopy = {
  roomName: ROOM_NAME,

  // Scene 1: Perimeter Alert
  perimeterAlert: {
    headline: "UNIDENTIFIED PRESENCE DETECTED",
    subtext: "PERIMETER SENSOR LOCK ACTIVE",
    terminalLogs: [
      "motion sensor 04 .... TRIGGERED",
      "badge reader .... NO CREDENTIAL",
      "entry vector .... MAIN DOOR",
      "optical sensor array .... TARGETS IN BOUND",
      "rfid gate .... PASSIVE SCAN IN PROGRESS",
      "logging event .... INCIDENT RECORD CREATED",
      "cross-referencing perimeter nodes .... 3 RESPONDING",
      "notifying duty operator .... STANDBY",
    ],
  },

  // Scene 2: Headcount & Self-Running Escalation
  headcount: {
    liveBadge: "● ENTITY COUNTER LIVE",
    incursionVector: "INCURSION VECTOR: PRIMARY ACCESS",
    stages: ESCALATION_STAGES,
  },

  // Scene 3: Identity Scan
  identityScan: {
    title: "SCANNING VISITOR PROFILE",
    progressBars: [
      { label: "FACIAL MATCH", id: "facial", duration: 2.5 },
      { label: "BADGE DATABASE", id: "badge", duration: 3.5 },
      { label: "PERSONNEL RECORDS", id: "personnel", duration: 4.5 },
      { label: "WATCHLIST", id: "watchlist", duration: 5.5 },
    ],
    noMatchText: "NO MATCH",
    friendlyTurnHeader: "ORGANISATIONAL AFFILIATION DISCOVERED",
    revealedLines: [
      "AFFILIATION: SAME ORGANISATION",
      "LOCATION: OTHER SITE — NOT THIS ONE",
      "STATUS: COLLEAGUES",
      "PURPOSE: CONTROL ROOM VISIT",
      "HOST: SUPPLY CHAIN TEAM",
      "FRIENDLINESS INDEX: 99%",
    ],
  },

  // Scene 3b: Countdown
  countdown: {
    reclassifyHeader: "RECLASSIFYING ALL ENTITIES…",
  },

  // Scene 4: Reveal & Subtext
  reveal: {
    mainWelcome: "WELCOME TO OUR CONTROL ROOM",
    incidentResolved: "INCIDENT RESOLVED — ACCESS GRANTED",
    statusLine: "ALL ANOMALIES RESOLVED — UNKNOWNS RECLASSIFIED AS COLLEAGUES",
    subtext1: "ONE TEAM. MANY SITES.",
    subtext2: "YOUR HOSTS WILL BRIEF YOU SHORTLY",
  },

  // Scene 5 (Scene 7): Finale
  finale: {
    incidentTitle: "INCIDENT: UNIDENTIFIED GUESTS",
    statusLine: "STATUS: RESOLVED",
    outcomeLine: "OUTCOME: WELCOMED",
    hostedLine: "HOSTED BY: The Supply Chain Control Room Team",
    qrPrompt: "SCAN TO RECEIVE YOUR VISITOR PASS",
    terminalWrapLogs: [
      "Incident #VISIT-001 closed successfully",
      "All anomalies cleared from perimeter queue",
      "Visitor passes issued to network registry",
      "Telemetry archived to Supply Chain Central",
      "Welcome to our control room, colleagues.",
    ],
  },
};

export const visitTheme = {
  // Lanyard card styling tokens
  paperBg: "#F2E9DD",
  paperBgDark: "#E5DACB",
  paperBorder: "rgba(6, 17, 20, 0.15)",
  textTeal: "#061114",
  textTealMuted: "rgba(6, 17, 20, 0.6)",
  textTealLight: "rgba(6, 17, 20, 0.4)",
  brandGreen: "#3FA66E",
  brandGreenDark: "#2B7E51",
  brandGreenBg: "rgba(63, 166, 110, 0.12)",
  stampGreen: "#2E8B57",
  cardShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(6, 17, 20, 0.08)",
};
