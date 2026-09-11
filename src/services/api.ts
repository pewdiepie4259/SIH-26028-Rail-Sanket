const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

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