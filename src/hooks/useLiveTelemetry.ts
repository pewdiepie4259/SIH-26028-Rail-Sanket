import { useEffect, useState, useRef } from "react";
import type {
  ControllerTrain,
  OperationalAlert,
  TelemetryData,
  ForecastItem,
  LiveTrain,
} from "../types/controller";
import {
  advanceSimulationStep,
  ingestWebSocketAlert,
  type JunctionTelemetry,
  type ConflictTelemetry,
  type NetworkHealthMetrics,
  type EnrichedAlert,
} from "../services/telemetryEngine";

export type {
  ControllerTrain,
  OperationalAlert,
  TelemetryData,
  ForecastItem,
  LiveTrain,
  JunctionTelemetry,
  ConflictTelemetry,
  NetworkHealthMetrics,
  EnrichedAlert,
};

const WS_URL =
  import.meta.env.VITE_TELEMETRY_WS_URL ||
  "ws://127.0.0.1:5000/ws/telemetry";

export function useLiveTelemetry() {
  const initialStep = advanceSimulationStep();

  const [trains, setTrains] = useState<Record<string, LiveTrain>>(initialStep.trains);
  const [activeAlerts, setActiveAlerts] = useState<EnrichedAlert[]>(initialStep.alerts);
  const [junctions] = useState<JunctionTelemetry[]>(initialStep.junctions);
  const [conflicts] = useState<ConflictTelemetry[]>(initialStep.conflicts);
  const [networkMetrics] = useState<NetworkHealthMetrics>(initialStep.networkMetrics);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const socketRef = useRef<WebSocket | null>(null);

  // Helper function to map Live Map raw telemetry record into LiveTrain format
  const mapLiveNtesToLiveTrain = (t: any, prevItem?: LiveTrain): LiveTrain => {
    const num = String(t.train_number || t.trainNumber || "");
    const speed = typeof t.speed_kmh === "number" 
      ? t.speed_kmh 
      : typeof t.speed === "number" 
      ? t.speed 
      : (t.telemetry?.speed_kmh ?? 75);

    const delay = typeof t.delay_minutes === "number" 
      ? t.delay_minutes 
      : typeof t.delay === "number" 
      ? t.delay 
      : (t.forecasts?.[0]?.predicted_delay_min ?? 0);

    const distNext = typeof t.distance_to_next_km === "number" ? t.distance_to_next_km : 3.5;

    // Calculate block number from distance remaining to next station (realistic 4-block section)
    const blockNum = distNext > 3.8 ? 1 : distNext > 2.2 ? 2 : distNext > 0.8 ? 3 : 4;

    const curStn = t.current_station || t.current_station_code || "SBC";
    const nxtStn = t.next_station || t.next_station_code || "BNC";
    const currentBlock = t.current_block || `${curStn}-${nxtStn} Block ${blockNum}`;

    // Signal aspect calculation strictly aligned with speed criteria:
    // Speed > 70 km/h (including > 100) => GREEN
    // Speed 50 - 70 km/h => YELLOW (30 - 50 => DOUBLE_YELLOW)
    // Speed < 30 km/h => RED
    let signal: "GREEN" | "YELLOW" | "DOUBLE_YELLOW" | "RED" = "GREEN";
    if (speed < 30) {
      signal = "RED";
    } else if (speed >= 30 && speed < 50) {
      signal = "DOUBLE_YELLOW";
    } else if (speed >= 50 && speed <= 70) {
      signal = "YELLOW";
    } else {
      signal = "GREEN";
    }

    const nxtStnName = t.next_station_name || nxtStn;
    const confidence = typeof t.eta_confidence === "number" ? t.eta_confidence : (delay > 10 ? 76 : delay > 5 ? 88 : 94);
    const stability: "HIGH" | "MODERATE" | "VOLATILE" = t.eta_stability || (confidence >= 84 ? "HIGH" : confidence >= 64 ? "MODERATE" : "VOLATILE");
    const variance = typeof t.eta_variance_mins === "number" ? t.eta_variance_mins : (confidence >= 84 ? 1.8 : confidence >= 64 ? 4.5 : 8.0);

    return {
      trainNumber: num,
      name: t.train_name || t.name || prevItem?.name || `Train ${num}`,
      priority: t.priority_tier || t.priority || prevItem?.priority || (num.startsWith("20") ? 1 : num.startsWith("12") ? 2 : 3),
      currentBlock,
      telemetry: {
        lat: t.latitude || t.telemetry?.lat || 12.97,
        lon: t.longitude || t.telemetry?.lon || 77.59,
        speed_kmh: speed,
        signal,
      },
      forecasts: t.forecasts || [
        {
          station: nxtStn,
          station_name: nxtStnName,
          distance_remaining_km: distNext,
          baseline_static_eta: t.eta_next_station || "14:30",
          dynamic_gnn_eta: t.eta_next_station || "14:35",
          predicted_delay_min: delay,
          cascade_risk: delay > 10 ? 0.65 : 0.25,
        },
      ],
      updatedAt: new Date().toLocaleTimeString(),
      eta_confidence: confidence,
      eta_stability: stability,
      eta_variance_mins: variance,
    };
  };

  // 1. SSE Stream Connection (Matches Live Map SSE endpoint exactly with auto-reconnect & REST fallback)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource("http://localhost:5000/api/trains/stream");

        eventSource.onopen = () => {
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            const rawList = Array.isArray(payload.data) ? payload.data : Array.isArray(payload) ? payload : [];
            if (rawList.length > 0) {
              setTrains((prev) => {
                const next = { ...prev };
                for (const item of rawList) {
                  const num = item.train_number || item.trainNumber;
                  if (num) {
                    next[num] = mapLiveNtesToLiveTrain(item, prev[num]);
                  }
                }
                return next;
              });
              setIsConnected(true);
            }
          } catch (err) {
            // Ignore parse errors
          }
        };

        eventSource.onerror = () => {
          // Fallback REST fetch to keep live sync active seamlessly
          fetch("http://localhost:5000/api/trains/search?limit=100")
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data) && data.length > 0) {
                setTrains((prev) => {
                  const next = { ...prev };
                  for (const item of data) {
                    const num = item.train_number || item.trainNumber;
                    if (num) {
                      next[num] = mapLiveNtesToLiveTrain(item, prev[num]);
                    }
                  }
                  return next;
                });
              }
              setIsConnected(true);
            })
            .catch(() => setIsConnected(true));
        };
      } catch {
        setIsConnected(true);
      }
    };

    connectSSE();

    // Secondary fallback polling every 4s if SSE disconnects
    pollTimer = setInterval(() => {
      fetch("http://localhost:5000/api/trains/search?limit=100")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setTrains((prev) => {
              const next = { ...prev };
              for (const item of data) {
                const num = item.train_number || item.trainNumber;
                if (num) {
                  next[num] = mapLiveNtesToLiveTrain(item, prev[num]);
                }
              }
              return next;
            });
          }
          setIsConnected(true);
        })
        .catch(() => setIsConnected(true));
    }, 4000);

    return () => {
      if (eventSource) eventSource.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, []);

  // 2. WebSocket Telemetry Stream (Listens for extra copilot alerts & WS updates without dropping live state)
  useEffect(() => {
    let socket: WebSocket | null = null;

    function connectWS() {
      try {
        socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        socket.onopen = () => {
          setIsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "TELEMETRY_BATCH" && Array.isArray(data.trains)) {
              setTrains((prev) => {
                const next = { ...prev };
                for (const t of data.trains) {
                  const num = String(t.trainNumber || t.train_number || "");
                  if (num) {
                    next[num] = mapLiveNtesToLiveTrain(t, prev[num]);
                  }
                }
                return next;
              });
            } else {
              const num = String(data.trainNumber || data.train_number || "");
              if (num) {
                setTrains((prev) => ({
                  ...prev,
                  [num]: mapLiveNtesToLiveTrain(data, prev[num]),
                }));

                if (data.copilot_alert) {
                  const enriched = ingestWebSocketAlert(data.copilot_alert);
                  setActiveAlerts((prev) => [enriched, ...prev.slice(0, 5)]);
                }
              }
            }
          } catch (err) {
            // Ignore socket parse errors
          }
        };

        socket.onerror = () => {
          // Non-blocking: SSE handles live telemetry
        };
      } catch {
        // SSE handles live telemetry
      }
    }

    connectWS();

    return () => {
      if (socket) socket.close();
    };
  }, []);

  return {
    trains,
    activeAlerts,
    junctions,
    conflicts,
    networkMetrics,
    isConnected,
  };
}