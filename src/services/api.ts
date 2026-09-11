export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export interface Station {
    id: number;
    station_code: string;
    station_name: string;
    platforms: number;
    is_junction: boolean;
    is_terminal: boolean;
    latitude: number;
    longitude: number;
}

export interface Train {
    id: number;
    train_number: string;
    train_name: string;
    train_type: string;
    priority_level: number;
    origin: string;
    destination: string;
}

export interface ETAPredictionResponse {
    prediction_id: number;
    train_number: string;
    scheduled_eta: string;
    predicted_eta: string;
    predicted_delay_minutes: number;
    confidence_score: number;
    features_snapshot: Record<string, any>;
}

export interface CopilotExplanationResponse {
    eta_prediction_id: number;
    train_number: string;
    explanation: string;
    recommendation: string;
    provider: string;
    latency_ms: number;
    raw_context: Record<string, any>;
}

export interface CorridorNode {
    id: string;
    name: string;
    lat: number;
    lon: number;
    visibility_m?: number;
    platforms?: number;
    is_junction?: boolean;
}

export interface CorridorLink {
    source: string;
    target: string;
    distance_km: number;
    max_speed_kmh: number;
}

export interface CorridorTopologyResponse {
    corridor?: string;
    nodes: CorridorNode[];
    links: CorridorLink[];
}

export interface CorridorGNNResponse {
    status: string;
    model: string;
    corridor: string;
    train_number: string;
    cascading_delays: Record<string, number>;
    forecasts?: Array<{
        station: string;
        distance_remaining_km?: number;
        dynamic_eta?: string;
        predicted_delay_min: number;
        cascade_risk: number;
    }>;
    graph_congestion_index: number;
    bottleneck_node: string;
}

export interface CopilotBottleneckAlert {
    bottleneck_station: string;
    delayed_train: string;
    predicted_delay_min: number;
    downstream_cascade_risk: number;
    affected_trains: string[];
    recommendation?: string;
}

export interface GPSUpdateResponse {
    status: string;
    train_number: string;
    train_name: string;
    nearest_station: string;
    station_code: string;
    distance_to_station_km: number;
    tracking_status: string;
    speed_kmh: number;
    updated_at: string;
}

// ----------------------------------------------------------------------
// Core API Calls
// ----------------------------------------------------------------------

export const fetchStations = async (): Promise<Station[]> => {
    const res = await fetch(`${API_BASE_URL}/stations`);
    if (!res.ok) throw new Error(`Failed to fetch stations: ${res.statusText}`);
    return res.json();
};

export const fetchTrains = async (): Promise<Train[]> => {
    const res = await fetch(`${API_BASE_URL}/trains`);
    if (!res.ok) throw new Error(`Failed to fetch trains: ${res.statusText}`);
    return res.json();
};

export const calculateETA = async (
    trainNumber: string,
    fromStation: string,
    toStation: string,
    delayMinutes: number
): Promise<ETAPredictionResponse> => {
    const params = new URLSearchParams({
        train_number: trainNumber,
        from_station: fromStation,
        to_station: toStation,
        delay_minutes: delayMinutes.toString(),
    });
    const res = await fetch(`${API_BASE_URL}/predictions/calculate?${params.toString()}`, {
        method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to calculate ETA: ${res.statusText}`);
    return res.json();
};

export const fetchCopilotExplanation = async (
    predictionId: number
): Promise<CopilotExplanationResponse> => {
    const res = await fetch(`${API_BASE_URL}/predictions/${predictionId}/copilot-explanation`);
    if (!res.ok) throw new Error(`Failed to fetch copilot explanation: ${res.statusText}`);
    return res.json();
};

export const fetchCorridorTopology = async (): Promise<CorridorTopologyResponse> => {
    const res = await fetch(`${API_BASE_URL}/corridors/bengaluru/topology`);
    if (!res.ok) throw new Error(`Failed to fetch corridor topology: ${res.statusText}`);
    return res.json();
};

export const predictCorridorGNN = async (
    trainNumber: string,
    activeDelays: Record<string, number> = {},
    speedKmh = 68.0,
    signal = 'GREEN'
): Promise<CorridorGNNResponse> => {
    const res = await fetch(`${API_BASE_URL}/gnn/predict-corridor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            train_number: trainNumber,
            active_station_delays: activeDelays,
            speed_kmh: speedKmh,
            signal: signal,
        }),
    });
    if (!res.ok) throw new Error(`Failed to predict corridor delays: ${res.statusText}`);
    return res.json();
};

export const fetchActiveCopilotAlerts = async (): Promise<{
    active_bottlenecks_count: number;
    bottlenecks: CopilotBottleneckAlert[];
}> => {
    const res = await fetch(`${API_BASE_URL}/copilot/active-alerts`);
    if (!res.ok) throw new Error(`Failed to fetch copilot alerts: ${res.statusText}`);
    return res.json();
};

export const updateTrainGPS = async (
    trainNumber: string,
    latitude: number,
    longitude: number,
    speedKmh: number
): Promise<GPSUpdateResponse> => {
    const res = await fetch(`${API_BASE_URL}/gps/update-location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            train_number: trainNumber,
            latitude,
            longitude,
            speed_kmh: speedKmh,
        }),
    });
    if (!res.ok) throw new Error(`Failed to update train GPS: ${res.statusText}`);
    return res.json();
};

export const queryWhatsAppBot = async (message: string): Promise<string> => {
    // Try JSON query endpoint first
    try {
        const res = await fetch(`${API_BASE_URL}/whatsapp/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message }),
        });
        if (res.ok) {
            const data = await res.json();
            return data.reply;
        }
    } catch {
        // Fallback to webhook Form POST
    }

    const formData = new FormData();
    formData.append('Body', message);
    formData.append('From', 'whatsapp:+919876543210');
    const webhookRes = await fetch(`${API_BASE_URL}/whatsapp/webhook`, {
        method: 'POST',
        body: formData,
    });
    const rawXml = await webhookRes.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rawXml, 'text/xml');
    return xmlDoc.getElementsByTagName('Body')[0]?.textContent ||
        'Received telemetry update from RailDrishti Core.';
};

export const getTelemetryWebSocketUrl = (): string => {
    const wsBase = API_BASE_URL.replace(/^http/, 'ws').replace(/\/api\/v1$/, '');
    return `${wsBase}/ws/telemetry`;
};