export type ServiceStatus = "Operational" | "Degraded" | "Offline" | "Unknown"

export type PipelineStageStatus = "Nominal" | "Delayed" | "Degraded" | "Failed" | "Unknown"

export type JobStatus = "Running" | "Completed" | "Failed" | "Paused" | "Unknown"

export type EventSeverity = "INFO" | "WARNING" | "ERROR"

export type IssueStatus = "Open" | "Investigating" | "Resolved"

export interface ServiceHealth {
  id: string
  name: string
  description: string
  status: ServiceStatus
  availability: string | null
  responseTimeMs: number | null
  lastCheck: string
  version: string | null
  endpoint: string
  dependencies: string[]
  lastError?: string
}

export interface PipelineStage {
  id: string
  name: string
  status: PipelineStageStatus
  lastProcessed: string
  processingDelayMs: number | null
  errorState?: string
}

export interface BackgroundJob {
  id: string
  name: string
  status: JobStatus
  lastRun: string
  nextRun: string
  duration: string
  failures: number
}

export interface SystemEvent {
  id: string
  timestamp: string
  service: string
  event: string
  severity: EventSeverity
  status: string
}

export interface SystemIssue {
  id: string
  issue: string
  service: string
  severity: EventSeverity
  detected: string
  status: IssueStatus
}

export interface ResourceMetric {
  name: string
  current: string
  limit?: string
  status: "Normal" | "Elevated" | "Unknown"
}

export interface TelemetryConnectionState {
  wsStatus: "Connected" | "Disconnected" | "Connecting" | "Unknown"
  connectedClients: number | null
  lastMessageTime: string | null
  messageRateHz: number | null
  connectionErrors: number
}

export interface DatabaseHealthState {
  connectionStatus: "Connected" | "Degraded" | "Disconnected" | "Unknown"
  queryHealth: "Nominal" | "Slow Queries Detected" | "Unknown"
  lastBackupTime: string | null
  storageUsed: string | null
  storageTotal: string | null
  recentErrors: number
}

export interface PredictionEngineState {
  serviceStatus: ServiceStatus
  modelLoaded: boolean | null
  modelCheckpoint: string | null
  lastPredictionTime: string | null
  requestCount24h: number | null
  failedRequestCount: number | null
  processingState: "Idle" | "Batch Inference" | "Offline" | "Unknown"
}
