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
  // Initial state from the telemetry engine
  const initialStep = advanceSimulationStep();

  const [trains, setTrains] = useState<Record<string, LiveTrain>>(initialStep.trains);
  const [activeAlerts, setActiveAlerts] = useState<EnrichedAlert[]>(initialStep.alerts);
  const [junctions, setJunctions] = useState<JunctionTelemetry[]>(initialStep.junctions);
  const [conflicts, setConflicts] = useState<ConflictTelemetry[]>(initialStep.conflicts);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkHealthMetrics>(initialStep.networkMetrics);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);

  // 1. Autonomous Real-Time Physics & Telemetry Heartbeat (Runs every 1.8s)
  useEffect(() => {
    const timer = setInterval(() => {
      const step = advanceSimulationStep();
      setTrains((prev) => ({
        ...prev,
        ...step.trains,
      }));
      setJunctions(step.junctions);
      setConflicts(step.conflicts);
      setNetworkMetrics(step.networkMetrics);
      setActiveAlerts(step.alerts);
    }, 1800);

    return () => clearInterval(timer);
  }, []);

  // 2. WebSocket Telemetry Stream (Listens on port 8000 when active)
  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      try {
        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        socket.onopen = () => {
          setIsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.train_number) {
              setTrains((prev) => ({
                ...prev,
                [data.train_number]: {
                  trainNumber: data.train_number,
                  name: data.train_name || prev[data.train_number]?.name || `Train ${data.train_number}`,
                  priority: data.priority_tier || prev[data.train_number]?.priority || 1,
                  currentBlock: data.current_block || prev[data.train_number]?.currentBlock || "Corridor Section",
                  telemetry: data.telemetry || prev[data.train_number]?.telemetry,
                  forecasts: data.forecasts || prev[data.train_number]?.forecasts,
                  updatedAt: new Date().toLocaleTimeString(),
                },
              }));

              if (data.copilot_alert) {
                const enriched = ingestWebSocketAlert(data.copilot_alert);
                setActiveAlerts((prev) => [enriched, ...prev.slice(0, 5)]);
              }
            }
          } catch (err) {
            console.error("Error parsing WebSocket packet:", err);
          }
        };

        socket.onerror = () => {
          // Graceful fallback to client telemetry simulation
          socket.close();
        };

        socket.onclose = () => {
          setIsConnected(false);
          reconnectTimer = setTimeout(connect, 4000);
        };
      } catch {
        setIsConnected(false);
      }
    }

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socketRef.current) socketRef.current.close();
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