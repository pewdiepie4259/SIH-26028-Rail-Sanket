export type IntegrationStatus =
  | "Connected"
  | "Degraded"
  | "Unavailable"
  | "Not Configured"

export type DataDirection =
  | "External → RailSanket"
  | "RailSanket → External"
  | "External → RailDrishti"
  | "RailDrishti → External"
  | "Bidirectional"
  | "Internal Service"

export type EventSeverity = "INFO" | "WARNING" | "ERROR"

export interface IntegrationHealth {
  status: IntegrationStatus
  latencyMs: number | null
  lastChecked: string
  errorCount: number
  message?: string
}

export interface IntegrationConfigField {
  key: string
  label: string
  type: "text" | "number" | "select" | "multiselect" | "readonly"
  value: string | number | string[]
  options?: string[]
  placeholder?: string
  helperText?: string
  isSecret?: boolean
}

export interface Integration {
  id: string
  name: string
  type: string
  purpose: string
  provider: string
  status: IntegrationStatus
  endpoint: string
  authStatus: string
  dataDirection: DataDirection
  refreshInterval: string
  lastCheck: string
  lastSync: string
  description: string
  isConfigurable: boolean
  health?: IntegrationHealth
  fields: IntegrationConfigField[]
}

export interface SyncRecord {
  id: string
  integrationId: string
  integrationName: string
  lastSync: string
  syncDuration: string
  recordsEvents: string
  status: "SUCCESS" | "PARTIAL" | "FAILED"
}

export interface IntegrationEvent {
  id: string
  timestamp: string
  integrationId: string
  integrationName: string
  event: string
  severity: EventSeverity
  status: "Resolved" | "Investigating" | "Logged"
}
