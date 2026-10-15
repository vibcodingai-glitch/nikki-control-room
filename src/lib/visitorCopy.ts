// All visitor strings, copy, tiers, and styling tokens in one central place

export const ROOM_NAME = "OUR CONTROL ROOM";

export type GuestTier = "single" | "pair" | "group" | "delegation";

export function guestTier(count: number): GuestTier {
  if (count <= 1) return "single";
  if (count === 2) return "pair";
  if (count <= 5) return "group";
  return "delegation";
}

export interface TierCopy {
  tier: GuestTier;
  countLabel: string;
  assessment: string;
  threatLevelText: string;
  threatMeterPercent: number;
  threatColor: string; // hex
}

export function getTierCopy(count: number): TierCopy {
  const tier = guestTier(count);
  switch (tier) {
    case "single":
      return {
        tier,
        countLabel: "1 UNIDENTIFIED GUEST",
        assessment: "ASSESSMENT: LOW THREAT",
        threatLevelText: "LOW",
        threatMeterPercent: 25,
        threatColor: "#3FA66E", // green
      };
    case "pair":
      return {
        tier,
        countLabel: "2 UNIDENTIFIED GUESTS",
        assessment: "PATTERN: COORDINATED ENTRY",
        threatLevelText: "MODERATE",
        threatMeterPercent: 50,
        threatColor: "#EAB308", // amber
      };
    case "group":
      return {
        tier,
        countLabel: `${count} UNIDENTIFIED GUESTS`,
        assessment: "THREAT LEVEL: ELEVATED",
        threatLevelText: "ELEVATED",
        threatMeterPercent: 75,
        threatColor: "#F97316", // orange
      };
    case "delegation":
      return {
        tier,
        countLabel: `${count} UNIDENTIFIED GUESTS`,
        assessment: "⚠ MULTIPLE ENTITIES — DELEGATION-SIZE INCURSION",
        threatLevelText: "CRITICAL",
        threatMeterPercent: 95,
        threatColor: "#EF4444", // red
      };
  }
}

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
    reclassifyHeader: (count: number) =>
      `RECLASSIFYING ${count} ${count === 1 ? "ENTITY" : "ENTITIES"}…`,
  },

  // Scene 4: Reveal & Subtext
  reveal: {
    mainWelcome: "WELCOME TO OUR CONTROL ROOM",
    incidentResolved: "INCIDENT RESOLVED — ACCESS GRANTED",
    statusLine: (count: number) =>
      `ALL ANOMALIES RESOLVED — ${count} ${count === 1 ? "UNKNOWN" : "UNKNOWNS"} RECLASSIFIED AS ${count === 1 ? "COLLEAGUE" : "COLLEAGUES"}`,
    subtext1: "ONE TEAM. MANY SITES.",
    subtext2: "YOUR HOSTS WILL BRIEF YOU SHORTLY",
    visitingCountLine: (count: number) =>
      `VISITING COLLEAGUES: ${count}`,
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
