// src/services/telemetryEngine.ts
import type { LiveTrain } from "../types/controller";

export interface JunctionTelemetry {
  name: string;
  code: string;
  load: number;
  approaching: number;
  activeRoutes: number;
  status: "Normal" | "Busy" | "Congested";
}

export interface ConflictTelemetry {
  id: string;
  location: string;
  secondsRemaining: number;
  timeToConflict: string;
  severity: "Critical" | "High" | "Moderate";
  trainA: string;
  trainB: string;
  impact: string;
  recommendation: string;
}

export interface NetworkHealthMetrics {
  activeTrains: number;
  networkStatus: "Normal" | "Caution" | "Congested";
  networkStatusDetail: string;
  junctionLoad: "Normal" | "Moderate" | "Heavy" | "Congested";
  junctionLoadDetail: string;
  criticalAlerts: number;
  criticalAlertsDetail: string;
}

export interface EnrichedAlert {
  id: string;
  type: string;
  severity: "CRITICAL" | "HIGH" | "CAUTION" | "WARNING" | "INFO";
  message: string;
  trainNumber?: string;
  delayed_train?: string;
  delayed_train_name?: string;
  bottleneck_station?: string;
  location: string;
  timestamp: string;
  createdAtMs: number;
  [key: string]: unknown;
}

// Station reference coordinates in Bengaluru Section
const STATIONS_COORDS = [
  { code: "SBC", name: "KSR Bengaluru", lat: 12.9775, lon: 77.5713 },
  { code: "BNC", name: "Bengaluru Cantonment", lat: 12.9913, lon: 77.5987 },
  { code: "BYPL", name: "Baiyappanahalli", lat: 13.0285, lon: 77.6325 },
  { code: "KJM", name: "Krishnarajapuram", lat: 13.0005, lon: 77.6784 },
  { code: "WFD", name: "Whitefield", lat: 12.9934, lon: 77.7219 },
];

// Initial Simulated Trains Pool
interface InternalTrainState {
  trainNumber: string;
  name: string;
  priority: number;
  currentSegment: number; // 0: SBC-BNC, 1: BNC-BYPL, 2: BYPL-KJM, 3: KJM-WFD
  progress: number; // 0 to 1
  direction: 1 | -1; // 1 = Down (SBC to WFD), -1 = Up (WFD to SBC)
  speedKmh: number;
  signal: "GREEN" | "YELLOW" | "DOUBLE_YELLOW" | "RED";
  delayMin: number;
  cascadeRisk: number;
}

const INITIAL_TRAINS: InternalTrainState[] = [
  {
    trainNumber: "12628",
    name: "Karnataka Express (Down)",
    priority: 1,
    currentSegment: 0,
    progress: 0.35,
    direction: 1,
    speedKmh: 64.5,
    signal: "GREEN",
    delayMin: 6,
    cascadeRisk: 0.42,
  },
  {
    trainNumber: "16589",
    name: "Rani Chennamma Express",
    priority: 2,
    currentSegment: 2,
    progress: 0.70,
    direction: -1,
    speedKmh: 72.0,
    signal: "YELLOW",
    delayMin: 8,
    cascadeRisk: 0.35,
  },
  {
    trainNumber: "16526",
    name: "Kanyakumari Express",
    priority: 2,
    currentSegment: 1,
    progress: 0.45,
    direction: 1,
    speedKmh: 52.4,
    signal: "YELLOW",
    delayMin: 5,
    cascadeRisk: 0.28,
  },
  {
    trainNumber: "12627",
    name: "Karnataka Express (UP)",
    priority: 1,
    currentSegment: 3,
    progress: 0.20,
    direction: -1,
    speedKmh: 58.6,
    signal: "DOUBLE_YELLOW",
    delayMin: 11,
    cascadeRisk: 0.68,
  },
  {
    trainNumber: "12079",
    name: "Jan Shatabdi Express",
    priority: 1,
    currentSegment: 0,
    progress: 0.85,
    direction: 1,
    speedKmh: 68.2,
    signal: "GREEN",
    delayMin: 3,
    cascadeRisk: 0.15,
  },
  {
    trainNumber: "16591",
    name: "Hampi Express",
    priority: 2,
    currentSegment: 2,
    progress: 0.15,
    direction: 1,
    speedKmh: 60.0,
    signal: "GREEN",
    delayMin: 7,
    cascadeRisk: 0.38,
  },
  {
    trainNumber: "12639",
    name: "Brindavan Express",
    priority: 1,
    currentSegment: 1,
    progress: 0.90,
    direction: -1,
    speedKmh: 76.5,
    signal: "GREEN",
    delayMin: 2,
    cascadeRisk: 0.12,
  },
];

// Active conflicts initial state with countdown timers
let activeConflictStates = [
  {
    id: "CF-021",
    location: "Krishnarajapuram Junction",
    secondsRemaining: 480, // 8 min
    timeToConflict: "08m 00s",
    severity: "Critical" as const,
    trainA: "12627",
    trainB: "16591",
    impact: "Potential 11 min delay",
    recommendation: "Hold 16591 on loop line; clear mainline for 12627",
  },
  {
    id: "CF-018",
    location: "Baiyappanahalli",
    secondsRemaining: 1020, // 17 min
    timeToConflict: "17m 00s",
    severity: "High" as const,
    trainA: "12639",
    trainB: "16526",
    impact: "Potential 6 min delay",
    recommendation: "Enforce double yellow aspect at BYPL home signal",
  },
  {
    id: "CF-014",
    location: "Bengaluru Cantonment",
    secondsRemaining: 1860, // 31 min
    timeToConflict: "31m 00s",
    severity: "Moderate" as const,
    trainA: "12613",
    trainB: "12608",
    impact: "Potential 3 min delay",
    recommendation: "Monitor block clearance speed",
  },
];

// Initial Realistic Alerts with live epoch times
let activeAlertList: EnrichedAlert[] = [
  {
    id: "ALT-KJM-01",
    type: "Junction Precedence Alert",
    severity: "CRITICAL",
    message: "Convergence detected at Krishnarajapuram (KJM): 12627 UP Karnataka Express approaching 16591 Hampi Express on Down Lead.",
    trainNumber: "12627",
    delayed_train: "12627",
    delayed_train_name: "12627 Karnataka Express (UP)",
    bottleneck_station: "KJM",
    location: "KJM Junction Line 2",
    timestamp: "Just now",
    createdAtMs: Date.now() - 15000,
  },
  {
    id: "ALT-BYPL-02",
    type: "Signal Headway Restriction",
    severity: "HIGH",
    message: "Signal caution on Block SBC-BYPL approach: Double Yellow aspect enforced due to track section occupancy.",
    trainNumber: "16526",
    delayed_train: "16526",
    delayed_train_name: "16526 Kanyakumari Express",
    bottleneck_station: "BYPL",
    location: "BYPL Approach Block 3",
    timestamp: "1 min ago",
    createdAtMs: Date.now() - 75000,
  },
  {
    id: "ALT-WFD-03",
    type: "Temporary Speed Restriction",
    severity: "CAUTION",
    message: "TSR 45 km/h enforced between KM 342/10 and KM 343/00 due to S&T relay interlocking inspection.",
    trainNumber: "16589",
    delayed_train: "16589",
    delayed_train_name: "16589 Rani Chennamma Express",
    bottleneck_station: "WFD",
    location: "WFD KM 342",
    timestamp: "2 mins ago",
    createdAtMs: Date.now() - 140000,
  },
  {
    id: "ALT-SBC-04",
    type: "Cascading Delay Risk",
    severity: "WARNING",
    message: "Primary delay on 12627 (+11m) creating 0.68 cascade factor for following rakes on Bengaluru Eastern Chord line.",
    trainNumber: "12627",
    delayed_train: "12627",
    delayed_train_name: "12627 Karnataka Express",
    bottleneck_station: "SBC",
    location: "SBC Division Central",
    timestamp: "4 mins ago",
    createdAtMs: Date.now() - 250000,
  },
];

// Interpolate coordinate along segment
function interpolateCoord(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  t: number
) {
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lon: from.lon + (to.lon - from.lon) * t,
  };
}

// Format relative time (e.g. "Just now", "24s ago", "2m ago")
export function formatRelativeTime(ms: number): string {
  const diffSec = Math.floor((Date.now() - ms) / 1000);
  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

// Current Simulation State
let trainStates = [...INITIAL_TRAINS];

// Advance simulation tick
export function advanceSimulationStep(): {
  trains: Record<string, LiveTrain>;
  junctions: JunctionTelemetry[];
  conflicts: ConflictTelemetry[];
  networkMetrics: NetworkHealthMetrics;
  alerts: EnrichedAlert[];
} {
  // 1. Advance trains along track segments
  trainStates = trainStates.map((train) => {
    // Progress speed: ~0.003 - 0.007 progress per tick
    const speedVariation = (Math.random() - 0.5) * 1.5;
    const newSpeed = Math.max(38, Math.min(88, train.speedKmh + speedVariation));
    const stepDelta = (newSpeed / 3600) * 0.15; // smooth spatial step

    let newProgress = train.progress + stepDelta;
    let newSegment = train.currentSegment;
    let newDir = train.direction;

    if (newProgress >= 1) {
      if (newSegment < STATIONS_COORDS.length - 2) {
        newSegment += 1;
        newProgress = 0;
      } else {
        // Reverse direction at terminal
        newDir = -1;
        newProgress = 0.99;
      }
    } else if (newProgress <= 0) {
      if (newSegment > 0) {
        newSegment -= 1;
        newProgress = 0.99;
      } else {
        // Reverse direction at terminal
        newDir = 1;
        newProgress = 0.01;
      }
    }

    // Dynamic signal based on progress
    let newSignal: "GREEN" | "YELLOW" | "DOUBLE_YELLOW" | "RED" = "GREEN";
    if (newProgress > 0.85) {
      newSignal = train.delayMin > 8 ? "RED" : "YELLOW";
    } else if (newProgress > 0.6) {
      newSignal = train.delayMin > 5 ? "DOUBLE_YELLOW" : "GREEN";
    }

    // Subtle fluctuating delay
    const delayDelta = (Math.random() - 0.48) * 0.2;
    const newDelay = Math.max(0, Math.round((train.delayMin + delayDelta) * 10) / 10);

    return {
      ...train,
      progress: newProgress,
      currentSegment: newSegment,
      direction: newDir,
      speedKmh: Math.round(newSpeed * 10) / 10,
      signal: newSignal,
      delayMin: newDelay,
    };
  });

  // Convert to LiveTrain format for UI
  const liveTrainsRecord: Record<string, LiveTrain> = {};

  trainStates.forEach((t) => {
    const fromStation = STATIONS_COORDS[t.currentSegment];
    const toStation = STATIONS_COORDS[t.currentSegment + 1];
    const coords = interpolateCoord(fromStation, toStation, t.progress);

    const nextStationCode = t.direction === 1 ? toStation.code : fromStation.code;
    const nextStationName = t.direction === 1 ? toStation.name : fromStation.name;

    liveTrainsRecord[t.trainNumber] = {
      trainNumber: t.trainNumber,
      name: t.name,
      priority: t.priority,
      currentBlock: `${fromStation.code}-${toStation.code} Block ${Math.floor(t.progress * 4) + 1}`,
      telemetry: {
        lat: coords.lat,
        lon: coords.lon,
        speed_kmh: t.speedKmh,
        signal: t.signal,
      },
      forecasts: [
        {
          station: nextStationCode,
          station_name: nextStationName,
          distance_remaining_km: Math.round((1 - t.progress) * 14 * 10) / 10,
          baseline_static_eta: new Date(Date.now() + 15 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          dynamic_gnn_eta: new Date(Date.now() + (15 + t.delayMin) * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          predicted_delay_min: t.delayMin,
          cascade_risk: t.cascadeRisk,
        },
      ],
      updatedAt: "Just now",
    };
  });

  // 2. Compute dynamic junction metrics based on train locations
  const junctions: JunctionTelemetry[] = [
    {
      name: "Krishnarajapuram",
      code: "KJM",
      load: Math.min(96, Math.max(70, Math.round(84 + (Math.sin(Date.now() / 8000) * 8)))),
      approaching: trainStates.filter((t) => t.currentSegment >= 2).length + 2,
      activeRoutes: 4,
      status: "Congested",
    },
    {
      name: "Baiyappanahalli",
      code: "BYPL",
      load: Math.min(88, Math.max(62, Math.round(71 + (Math.cos(Date.now() / 7000) * 7)))),
      approaching: trainStates.filter((t) => t.currentSegment === 1 || t.currentSegment === 2).length + 1,
      activeRoutes: 3,
      status: "Busy",
    },
    {
      name: "Bengaluru Cantonment",
      code: "BNC",
      load: Math.min(65, Math.max(38, Math.round(48 + (Math.sin(Date.now() / 9000) * 6)))),
      approaching: trainStates.filter((t) => t.currentSegment === 0 || t.currentSegment === 1).length,
      activeRoutes: 2,
      status: "Normal",
    },
    {
      name: "KSR Bengaluru City",
      code: "SBC",
      load: Math.min(94, Math.max(76, Math.round(86 + (Math.cos(Date.now() / 8500) * 6)))),
      approaching: trainStates.filter((t) => t.currentSegment === 0).length + 3,
      activeRoutes: 6,
      status: "Congested",
    },
    {
      name: "Whitefield Junction",
      code: "WFD",
      load: Math.min(78, Math.max(42, Math.round(56 + (Math.sin(Date.now() / 7500) * 7)))),
      approaching: trainStates.filter((t) => t.currentSegment === 3).length + 1,
      activeRoutes: 3,
      status: "Normal",
    },
  ];

  // 3. Count down active conflicts
  activeConflictStates = activeConflictStates.map((c) => {
    const nextSec = c.secondsRemaining > 1 ? c.secondsRemaining - 2 : 480; // tick down 2s
    const mins = Math.floor(nextSec / 60);
    const secs = nextSec % 60;
    const timeFormatted = `${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;

    return {
      ...c,
      secondsRemaining: nextSec,
      timeToConflict: timeFormatted,
    };
  });

  // 4. Refresh alert relative timestamps & periodically inject dynamic operational notices
  activeAlertList = activeAlertList.map((a) => ({
    ...a,
    timestamp: formatRelativeTime(a.createdAtMs),
  }));

  // 5. Compute global network metrics
  const avgDelay = Math.round((trainStates.reduce((acc, t) => acc + t.delayMin, 0) / trainStates.length) * 10) / 10;
  const delayedCount = trainStates.filter((t) => t.delayMin > 5).length;
  const networkStatus: "Normal" | "Caution" | "Congested" =
    delayedCount > 3 ? "Congested" : delayedCount > 1 ? "Caution" : "Normal";

  const networkStatusDetail =
    networkStatus === "Normal"
      ? `All sections operational · Avg delay ${avgDelay}m`
      : networkStatus === "Caution"
      ? `${delayedCount} trains with caution headway (+${avgDelay}m avg)`
      : `High congestion across East chord (+${avgDelay}m avg)`;

  const maxJunctionLoad = Math.max(...junctions.map((j) => j.load));
  const junctionLoadTier: "Normal" | "Moderate" | "Heavy" | "Congested" =
    maxJunctionLoad > 85 ? "Heavy" : maxJunctionLoad > 70 ? "Moderate" : "Normal";

  const networkMetrics: NetworkHealthMetrics = {
    activeTrains: 126, // Total monitored section trains
    networkStatus,
    networkStatusDetail,
    junctionLoad: junctionLoadTier,
    junctionLoadDetail: `Peak: ${junctions[0].code} at ${junctions[0].load}% pressure`,
    criticalAlerts: activeAlertList.filter((a) => a.severity === "CRITICAL" || a.severity === "HIGH").length,
    criticalAlertsDetail: `${activeConflictStates.length} active conflict points`,
  };

  return {
    trains: liveTrainsRecord,
    junctions,
    conflicts: activeConflictStates,
    networkMetrics,
    alerts: activeAlertList,
  };
}

// Ingest an incoming WebSocket alert into the active alerts pool
export function ingestWebSocketAlert(rawAlert: any): EnrichedAlert {
  const trainNo =
    rawAlert.delayed_train ||
    rawAlert.train_number ||
    rawAlert.trainNumber ||
    rawAlert.dispatcher_precedence_action?.priority_train?.train_number;

  const station = rawAlert.bottleneck_station || rawAlert.location || "Bengaluru Section";
  const delay = rawAlert.predicted_delay_min || 0;

  // Build high-fidelity railway operational text
  let message = "";
  if (rawAlert.dispatcher_precedence_action?.advisory_directive) {
    message = rawAlert.dispatcher_precedence_action.advisory_directive;
  } else if (rawAlert.message && typeof rawAlert.message === "string") {
    message = rawAlert.message;
  } else if (rawAlert.description && typeof rawAlert.description === "string") {
    message = rawAlert.description;
  } else if (rawAlert.delayed_train) {
    message = `Precedence conflict at ${station}: Train ${rawAlert.delayed_train_name || rawAlert.delayed_train} delayed by +${delay} min creating downstream cascade risk.`;
  } else {
    message = `Operational headway event detected at ${station} affecting track movement.`;
  }

  const alertId = `ALT-${station}-${Date.now().toString().slice(-4)}`;

  const enriched: EnrichedAlert = {
    id: alertId,
    type: delay > 8 ? "Critical Precedence" : "Junction Headway",
    severity: delay > 8 ? "CRITICAL" : "HIGH",
    message,
    trainNumber: trainNo ? String(trainNo) : undefined,
    location: station,
    timestamp: "Just now",
    createdAtMs: Date.now(),
  };

  // Prepend and keep top 6
  activeAlertList = [enriched, ...activeAlertList.slice(0, 5)];
  return enriched;
}
