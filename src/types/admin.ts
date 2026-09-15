// ============================================================================
// RailDrishti Platform - Unified Admin Domain Types
// ============================================================================

export type SystemStatus = "Operational" | "Degraded" | "Offline" | "Unknown" | "Unavailable"

export interface AdminUser {
  id: string
  fullName: string
  email: string
  employeeId: string
  role: "System Administrator" | "Controller" | "Employee"
  department: string
  status: "Active" | "Pending" | "Suspended"
  lastActive: string | null
  createdAt: string
  permissions: string[]
}

export type Role = "System Administrator" | "Controller" | "Employee"

export interface Permission {
  id: string
  code: string
  name: string
  category: "Access" | "Operations" | "Configuration" | "Security"
  description: string
}

export type AuditEventType = "Administrative" | "Configuration" | "Authentication" | "Security" | "System"

export type AuditSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL"

export interface AuditLog {
  id: string
  timestamp: string
  user: string
  userRole: Role | string
  event: string
  eventType: AuditEventType
  resource: string
  action: string
  source: string
  status: "SUCCESS" | "FAILURE" | "DENIED" | "PENDING"
  severity: AuditSeverity
  previousValue?: string | null
  newValue?: string | null
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}

export interface ModelConfiguration {
  id: string
  activeModelName: string
  modelType: string
  version: string
  status: "Production" | "Staging" | "Archived" | "Testing"
  lastUpdated: string
  environment: string
  predictionHorizonMin: number
  refreshIntervalSec: number
  delayWarningThresholdMin: number
  criticalDelayThresholdMin: number
  minConfidenceThreshold: number
  enableCascadeAnalysis: boolean
  propagationHorizonHours: number
  minDelayForCascadeMin: number
  cascadeRiskThreshold: number
  recalculationIntervalSec: number
  enableExplanation: boolean
  explanationDetail: "Summary" | "Feature Contribution" | "Full Trace"
  lowConfidenceHandling: "Fallback to Schedule" | "Flag for Review" | "Reject Prediction"
  baselineType: "Scheduled/static ETA" | "Dynamic historical ETA"
  changedBy: string
  lastModified: string
}

export interface WeatherConfiguration {
  provider: string
  status: SystemStatus
  lastUpdate: string | null
  nextRefresh: string | null
  apiStatus: string
  forecastHorizonHours: number
  updateIntervalMinutes: number
  units: "Metric" | "Imperial"
  rainfallWarningMm: number
  rainfallCriticalMm: number
  visibilityWarningM: number
  visibilityCriticalM: number
  windWarningKmph: number
  windCriticalKmph: number
  impactRules: {
    etaAdjustment: boolean
    speedRestriction: boolean
    delayAlerts: boolean
    cascadeAnalysis: boolean
    controllerNotifications: boolean
  }
}

export interface Integration {
  id: string
  name: string
  type: string
  status: "Connected" | "Degraded" | "Unavailable" | "Not Configured"
  source: string
  lastCheck: string | null
  lastSync: string | null
  endpoint: string
  authStatus: "Authenticated" | "Unauthenticated" | "Pending" | "Configured Securely"
  dataDirection: "Inbound" | "Outbound" | "Bidirectional"
  description: string
}

export interface AlertRule {
  id: string
  name: string
  category: "Delay" | "ETA" | "Signal" | "Junction" | "Weather" | "Cascade" | "Telemetry" | "System"
  trigger: string
  severity: "INFO" | "WARNING" | "CRITICAL"
  enabled: boolean
  threshold: string
  affectedScope: string
  lastModified: string
  conditionField: string
  conditionOperator: string
  conditionValue: string
  channels: ("In-app" | "Email" | "SMS" | "Push")[]
  escalationDelayMin: number
  repeatIntervalMin: number
}

export interface ServiceHealth {
  id: string
  name: string
  status: SystemStatus
  availability: string
  responseTimeMs: number | null
  lastCheck: string | null
  version: string
  description?: string
}

export interface SystemEvent {
  id: string
  timestamp: string
  service: string
  event: string
  severity: "INFO" | "WARNING" | "CRITICAL"
  status: "Resolved" | "Investigating" | "Monitoring"
}

export interface BackgroundJob {
  id: string
  name: string
  status: "Running" | "Idle" | "Failed" | "Queued"
  lastRun: string | null
  nextRun: string | null
  durationMs: number | null
  processedRecords: number | null
}

export interface AdminSettings {
  profile: {
    fullName: string
    email: string
    employeeId: string
    role: string
    department: string
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeoutMinutes: number
    loginNotifications: boolean
    failedLoginProtection: boolean
    reAuthForSensitiveActions: boolean
  }
  notifications: {
    criticalAlerts: boolean
    integrationFailures: boolean
    securityEvents: boolean
    configurationChanges: boolean
    maintenanceNotifications: boolean
  }
  display: {
    language: string
    timezone: string
    dateFormat: string
    use24HourTime: boolean
    compactTables: boolean
  }
  system: {
    autoStatusRefresh: boolean
    refreshIntervalSeconds: number
    offlineMode: boolean
    maintenanceNotifications: boolean
  }
  dataManagement: {
    auditRetentionDays: number
    eventRetentionDays: number
    autoArchival: boolean
    backupStatus: string
    lastBackup: string | null
  }
}
