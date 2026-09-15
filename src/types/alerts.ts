export type AlertRuleStatus = "Enabled" | "Disabled" | "Draft"

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL"

export type AlertCategory =
  | "Delay"
  | "ETA"
  | "Signal"
  | "Junction"
  | "Weather"
  | "Cascade"
  | "Telemetry"
  | "System"

export type AlertScope =
  | "Train"
  | "Station"
  | "Section"
  | "Junction"
  | "Network"
  | "System"

export type ConditionOperator =
  | "Greater than"
  | "Less than"
  | "Equal to"
  | "Above threshold"
  | "Below threshold"
  | "Unavailable"

export interface AlertCondition {
  field: string
  operator: ConditionOperator
  value: string | number
  unit?: string
}

export type AlertRecipient = "Controller" | "System Administrator" | "Operations Team"

export type AlertChannel = "In-app" | "Email" | "SMS" | "Push"

export interface AlertNotificationPolicy {
  primaryRecipient: AlertRecipient
  escalationRecipient: AlertRecipient
  channels: AlertChannel[]
  escalationDelayMinutes: number
  repeatIntervalMinutes: number
}

export interface AlertSuppressionPolicy {
  enabled: boolean
  suppressionWindowMinutes: number
  maxRepeatedNotifications: number
  autoAcknowledgeMinutes: number
}

export interface AlertRule {
  id: string
  name: string
  description: string
  category: AlertCategory
  triggerType: string
  threshold: string
  condition: AlertCondition
  severity: AlertSeverity
  scope: AlertScope
  status: AlertRuleStatus
  notificationPolicy: AlertNotificationPolicy
  suppressionPolicy: AlertSuppressionPolicy
  createdBy: string
  createdAt: string
  lastModified: string
  lastTriggered: string
}

export interface AlertEngineHealth {
  alertEngine: "Operational" | "Degraded" | "Unavailable" | "Not Configured"
  notificationService: "Operational" | "Degraded" | "Unavailable" | "Not Configured"
  escalationEngine: "Operational" | "Degraded" | "Unavailable" | "Not Configured"
  activeRuleCount: number
}
