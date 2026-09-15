import { useEffect, useState, useRef } from "react";
import type {
  ControllerTrain,
  OperationalAlert,
  TelemetryData,
  ForecastItem,
  LiveTrain,
} from "../types/controller";

export type {
  ControllerTrain,
  OperationalAlert,
  TelemetryData,
  ForecastItem,
  LiveTrain,
};

const WS_URL =
  import.meta.env.VITE_TELEMETRY_WS_URL ||
  "ws://127.0.0.1:8000/ws/telemetry";


export function useLiveTelemetry() {
    const [trains, setTrains] = useState < Record < string, LiveTrain>> ({});
    const [activeAlerts, setActiveAlerts] = useState < any[] > ([]);
    const [isConnected, setIsConnected] = useState < boolean > (false);
    const socketRef = useRef < WebSocket | null > (null);

    useEffect(() => {
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

        function connect() {
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
                                name: data.train_name,
                                priority: data.priority_tier,
                                currentBlock: data.current_block,
                                telemetry: data.telemetry,
                                forecasts: data.forecasts,
                                updatedAt: new Date().toLocaleTimeString(),
                            },
                        }));

                        if (data.copilot_alert) {
                            setActiveAlerts((prev) => [data.copilot_alert, ...prev.slice(0, 4)]);
                        }
                    }
                } catch (err) {
                    console.error("Error parsing WebSocket packet:", err);
                }
            };

            socket.onerror = (err) => {
                console.warn("WebSocket error:", err);
                socket.close();
            };

            socket.onclose = () => {
                setIsConnected(false);
                reconnectTimer = setTimeout(connect, 3000);
            };
        }

        connect();

        return () => {
            if (reconnectTimer) clearTimeout(reconnectTimer);
            if (socketRef.current) socketRef.current.close();
        };
    }, []);

    return { trains, activeAlerts, isConnected };
}