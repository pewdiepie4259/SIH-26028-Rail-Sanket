export type OperationalStatus =
  | "NORMAL"
  | "CAUTION"
  | "RESTRICTED"
  | "CRITICAL"

export interface ControllerTrain {
  trainNumber: string
  name: string
  priority: number
  currentBlock: string
  nextStation: string
  speedKmh: number
  signal: string
  delayMinutes: number
  predictedArrival: string
  cascadeRisk: number
}

export interface OperationalAlert {
  id: string
  severity: OperationalStatus
  time: string
  location: string
  trainNumber?: string
  message: string
  acknowledged: boolean
}

export interface JunctionMovement {
  trainNumber: string
  junction: string
  eta: string
  direction: string
  priority: string
}

export interface Junction {
  id: string
  name: string
  status: OperationalStatus
  route: string
  occupancy: number
}

export interface WeatherCondition {
  section: string
  condition: string
  rainfallMmPerHour: number
  visibilityKm: number
  windKmh: number
  impact: OperationalStatus
  affectedTrains: string[]
}

export interface CascadeEvent {
  id: string
  sourceTrain: string
  sourceDelayMinutes: number
  junction?: string
  affectedTrains: string[]
  affectedStations: string[]
  estimatedImpactTrainMinutes: number
  risk: OperationalStatus
}

// Telemetry & Forecast data structures
export interface TelemetryData {
  lat: number
  lon: number
  speed_kmh: number
  signal: string
}

export interface ForecastItem {
  station: string
  station_name: string
  distance_remaining_km: number
  baseline_static_eta: string
  dynamic_gnn_eta: string
  predicted_delay_min: number
  cascade_risk: number
}

export interface LiveTrain {
  trainNumber: string
  name: string
  priority: number
  currentBlock: string
  telemetry: TelemetryData
  forecasts: ForecastItem[]
  updatedAt: string
}

export interface AuditActionItem {
  id: string
  time: string
  actor: string
  action: string
  targetId: string
  status: "Recorded" | "Approved" | "Recommended" | "Completed"
  location?: string
}
